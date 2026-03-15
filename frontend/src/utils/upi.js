export function generateUPILink(upiId, name, amount, note = "Trip settlement") {
  const baseUrl = "upi://pay";
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: parseFloat(amount).toFixed(2),
    cu: "INR",
    tn: note
  });
  return `${baseUrl}?${params.toString()}`;
}
