export async function analyzeShipment(shipmentId: string, eta: string, slaDeadline: string) {
  const response = await fetch("/api/webhooks/shipment-eta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shipmentId, eta, slaDeadline }),
  });

  return response.json();
}
