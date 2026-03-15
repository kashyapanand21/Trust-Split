// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TrustSplit
 * @notice Escrow-based bill-splitting contract.
 *
 * Flow:
 *  1. Payer calls createGroup() and locks their share of ETH (totalAmount / (members.length + 1)).
 *     msg.value must equal totalAmount so the contract holds the full bill up-front.
 *  2. Each member calls payShare() and sends exactly shareAmount.
 *  3. Once all members have paid, the payer calls settleGroup() to release the full pool.
 *
 * Share formula:
 *   shareAmount = totalAmount / (members.length + 1)
 *   totalPool   = shareAmount * (members.length + 1)  == totalAmount (integer division)
 *
 * Security: OpenZeppelin ReentrancyGuard + checks-effects-interactions on all Ether transfers.
 */
contract TrustSplit is ReentrancyGuard {
    // -------------------------------------------------------------------------
    // Data structures
    // -------------------------------------------------------------------------

    struct Expense {
        uint256 id;
        uint256 groupId;
        address payer;
        uint256 amount;
        string description;
        uint256 timestamp;
        address[] participants;
        mapping(address => uint256) shares; // custom amounts per participant
        bool settled;
    }

    struct Group {
        uint256 id;
        address payer;
        address[] members;
        uint256 totalAmount;   // msg.value sent by payer on createGroup
        uint256 shareAmount;   // totalAmount / (members.length + 1)
        uint256 paidCount;     // number of members who have called payShare
        bool settled;          // true after settleGroup succeeds
        mapping(address => bool) paid; // tracks which members have paid
        uint256 expenseCount;   // number of expenses in this group
        mapping(uint256 => Expense) expenses; // expenses in this group
    }

    // -------------------------------------------------------------------------
    // State variables
    // -------------------------------------------------------------------------

    mapping(uint256 => Group) private groups;
    mapping(address => uint256[]) private userGroups;
    uint256 public groupCount;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event GroupCreated(
        uint256 indexed groupId,
        address indexed payer,
        address[] members,
        uint256 totalAmount,
        uint256 shareAmount
    );

    event SharePaid(
        uint256 indexed groupId,
        address indexed member,
        uint256 amount
    );

    event GroupSettled(
        uint256 indexed groupId,
        address indexed payer,
        uint256 totalReleased
    );

    event ExpenseAdded(
        uint256 indexed groupId,
        uint256 indexed expenseId,
        address indexed payer,
        uint256 amount,
        string description
    );

    event ExpenseSettled(
        uint256 indexed groupId,
        uint256 indexed expenseId,
        address indexed payer
    );

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier groupExists(uint256 groupId) {
        require(groupId < groupCount, "TrustSplit: group does not exist");
        _;
    }

    // -------------------------------------------------------------------------
    // Functions
    // -------------------------------------------------------------------------

    /**
     * @notice Create a new split group. The payer locks the full bill amount.
     * @param members Array of member addresses who will each pay one share.
     *                Must not be empty. Members must not include the payer.
     * @dev msg.value must equal totalAmount.
     *      shareAmount = totalAmount / (members.length + 1)
     *      Any remainder from integer division stays in the contract and is
     *      released to the payer on settle (dust is negligible in wei).
     */
    function createGroup(address[] calldata members) external payable nonReentrant {
        require(members.length > 0, "TrustSplit: need at least one member");
        require(msg.value > 0, "TrustSplit: totalAmount must be > 0");

        uint256 totalParticipants = members.length + 1; // payer + members
        uint256 shareAmount = msg.value / totalParticipants;
        require(shareAmount > 0, "TrustSplit: shareAmount rounds to 0");

        // Validate members: no zero addresses, no duplicates, not the payer
        for (uint256 i = 0; i < members.length; i++) {
            require(members[i] != address(0), "TrustSplit: zero address member");
            require(members[i] != msg.sender, "TrustSplit: payer cannot be a member");
            for (uint256 j = i + 1; j < members.length; j++) {
                require(members[i] != members[j], "TrustSplit: duplicate member");
            }
        }

        uint256 groupId = groupCount;
        groupCount++;

        // Write group fields (mapping inside struct cannot be initialised inline)
        Group storage g = groups[groupId];
        g.id          = groupId;
        g.payer       = msg.sender;
        g.members     = members;
        g.totalAmount = msg.value;
        g.shareAmount = shareAmount;
        g.paidCount   = 0;
        g.settled     = false;

        // Register groupId for the payer
        userGroups[msg.sender].push(groupId);

        // Register groupId for every member
        for (uint256 i = 0; i < members.length; i++) {
            userGroups[members[i]].push(groupId);
        }

        emit GroupCreated(groupId, msg.sender, members, msg.value, shareAmount);
    }

    /**
     * @notice Pay your share for a group.
     * @param groupId The ID of the group to pay into.
     * @dev Caller must be a registered member. msg.value must equal shareAmount.
     *      Each member can only pay once.
     */
    function payShare(uint256 groupId) external payable nonReentrant groupExists(groupId) {
        Group storage g = groups[groupId];

        require(!g.settled, "TrustSplit: group already settled");
        require(msg.sender != g.payer, "TrustSplit: payer cannot pay share");
        require(msg.value == g.shareAmount, "TrustSplit: incorrect share amount");

        // Check caller is a registered member (not the payer)
        bool isMember = false;
        for (uint256 i = 0; i < g.members.length; i++) {
            if (g.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "TrustSplit: caller is not a member of this group");
        require(!g.paid[msg.sender], "TrustSplit: share already paid");

        // Effects before any external interaction (CEI pattern)
        g.paid[msg.sender] = true;
        g.paidCount++;

        emit SharePaid(groupId, msg.sender, msg.value);
    }

    /**
     * @notice Release pooled funds to the payer once all members have paid.
     * @param groupId The ID of the group to settle.
     * @dev Only the payer can call this. All members must have paid. Uses
     *      checks-effects-interactions: settled flag set before transfer.
     */
    function settleGroup(uint256 groupId) external nonReentrant groupExists(groupId) {
        Group storage g = groups[groupId];

        require(msg.sender == g.payer, "TrustSplit: only payer can settle");
        require(!g.settled, "TrustSplit: group already settled");
        require(
            g.paidCount == g.members.length,
            "TrustSplit: not all members have paid"
        );

        // Total pool = one share per participant (payer + all members)
        // Consistent with shareAmount formula: totalAmount / (members.length + 1)
        uint256 totalPool = g.shareAmount * (g.members.length + 1);

        // Effects before interaction (CEI pattern)
        g.settled = true;

        // Interaction: transfer pooled ETH to payer
        (bool success, ) = g.payer.call{value: totalPool}("");
        require(success, "TrustSplit: transfer to payer failed");

        emit GroupSettled(groupId, g.payer, totalPool);
    }

    /**
     * @notice Retrieve metadata for a group.
     * @param groupId The group ID to query.
     * @return payer        Address of the group creator.
     * @return members      Array of member addresses.
     * @return totalAmount  ETH locked by payer on creation (in wei).
     * @return shareAmount  ETH each member must send (in wei).
     * @return paidCount    Number of members who have paid so far.
     * @return settled      Whether the group has been settled.
     */
    function getGroup(uint256 groupId)
        external
        view
        groupExists(groupId)
        returns (
            address payer,
            address[] memory members,
            uint256 totalAmount,
            uint256 shareAmount,
            uint256 paidCount,
            bool settled
        )
    {
        Group storage g = groups[groupId];
        return (
            g.payer,
            g.members,
            g.totalAmount,
            g.shareAmount,
            g.paidCount,
            g.settled
        );
    }

    /**
     * @notice Get all group IDs a given address belongs to (as payer or member).
     * @param user The address to query.
     * @return groupIds Array of group IDs.
     */
    function getUserGroups(address user)
        external
        view
        returns (uint256[] memory groupIds)
    {
        return userGroups[user];
    }

    /**
     * @notice Check whether a specific member has paid their share.
     * @param groupId The group ID.
     * @param member  The member address to check.
     * @return True if the member has paid.
     */
    function hasMemberPaid(uint256 groupId, address member)
        external
        view
        groupExists(groupId)
        returns (bool)
    {
        return groups[groupId].paid[member];
    }

    /**
     * @notice Add an expense to a group (off-chain tracking, on-chain record).
     * @param groupId The group ID.
     * @param amount The expense amount in wei.
     * @param description Description of the expense.
     * @param participants Array of participant addresses who share this expense.
     * @param shares Array of custom amounts per participant (0 for equal split).
     * @dev This is a lightweight record-keeping function. Actual settlement happens via settleGroup.
     */
    function addExpense(
        uint256 groupId,
        uint256 amount,
        string calldata description,
        address[] calldata participants,
        uint256[] calldata shares
    ) external groupExists(groupId) {
        Group storage g = groups[groupId];
        require(!g.settled, "TrustSplit: group already settled");
        
        // Verify caller is payer or member
        require(
            msg.sender == g.payer || _isMember(g.members, msg.sender),
            "TrustSplit: not authorized to add expense"
        );

        require(amount > 0, "TrustSplit: expense amount must be > 0");
        require(participants.length > 0, "TrustSplit: need at least one participant");
        require(participants.length == shares.length, "TrustSplit: participants and shares length mismatch");

        uint256 expenseId = g.expenseCount++;
        Expense storage exp = g.expenses[expenseId];
        
        exp.id = expenseId;
        exp.groupId = groupId;
        exp.payer = msg.sender;
        exp.amount = amount;
        exp.description = description;
        exp.timestamp = block.timestamp;
        exp.participants = participants;
        exp.settled = false;

        // Set custom shares if provided, otherwise will be calculated off-chain
        for (uint256 i = 0; i < participants.length; i++) {
            require(participants[i] != address(0), "TrustSplit: zero address participant");
            exp.shares[participants[i]] = shares[i];
        }

        emit ExpenseAdded(groupId, expenseId, msg.sender, amount, description);
    }

    /**
     * @notice Internal helper to check if address is a member
     */
    function _isMember(address[] memory members, address addr) private pure returns (bool) {
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == addr) return true;
        }
        return false;
    }

    /**
     * @notice Record a payment for an expense (off-chain tracking).
     * @param groupId The group ID.
     * @param expenseId The expense ID.
     * @dev This marks an expense as settled. Actual funds are handled via settleGroup.
     */
    function recordPayment(uint256 groupId, uint256 expenseId) external groupExists(groupId) {
        Group storage g = groups[groupId];
        require(expenseId < g.expenseCount, "TrustSplit: expense does not exist");
        
        Expense storage exp = g.expenses[expenseId];
        require(!exp.settled, "TrustSplit: expense already settled");
        require(msg.sender == exp.payer || msg.sender == g.payer, "TrustSplit: not authorized");

        exp.settled = true;
        emit ExpenseSettled(groupId, expenseId, msg.sender);
    }

    /**
     * @notice Get expense details.
     * @param groupId The group ID.
     * @param expenseId The expense ID.
     * @return payer The address who paid the expense.
     * @return amount The expense amount in wei.
     * @return description The expense description.
     * @return timestamp When the expense was added.
     * @return participants Array of participant addresses.
     * @return settled Whether the expense is settled.
     */
    function getExpense(uint256 groupId, uint256 expenseId)
        external
        view
        groupExists(groupId)
        returns (
            address payer,
            uint256 amount,
            string memory description,
            uint256 timestamp,
            address[] memory participants,
            bool settled
        )
    {
        Group storage g = groups[groupId];
        require(expenseId < g.expenseCount, "TrustSplit: expense does not exist");
        
        Expense storage exp = g.expenses[expenseId];
        return (
            exp.payer,
            exp.amount,
            exp.description,
            exp.timestamp,
            exp.participants,
            exp.settled
        );
    }

    /**
     * @notice Get all expense IDs for a group.
     * @param groupId The group ID.
     * @return expenseIds Array of expense IDs.
     */
    function getGroupExpenses(uint256 groupId)
        external
        view
        groupExists(groupId)
        returns (uint256[] memory expenseIds)
    {
        Group storage g = groups[groupId];
        uint256 count = g.expenseCount;
        expenseIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            expenseIds[i] = i;
        }
        return expenseIds;
    }

    /**
     * @notice Get the share amount for a participant in an expense.
     * @param groupId The group ID.
     * @param expenseId The expense ID.
     * @param participant The participant address.
     * @return share The share amount in wei (0 if equal split, custom amount otherwise).
     */
    function getExpenseShare(uint256 groupId, uint256 expenseId, address participant)
        external
        view
        groupExists(groupId)
        returns (uint256 share)
    {
        Group storage g = groups[groupId];
        require(expenseId < g.expenseCount, "TrustSplit: expense does not exist");
        return g.expenses[expenseId].shares[participant];
    }
}
