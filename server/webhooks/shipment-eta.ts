import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { slaExceptionOutputSchema, webhookPayloadSchema } from "../schemas";

// Point @ai-sdk/openai to GitHub Models
const github = createOpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

export async function handleShipmentEta(req, res) {
  try {
    const payload = webhookPayloadSchema.parse(req.body);

    // 1. Is it actually late?
    if (payload.eta <= payload.slaDeadline) {
      return res.json({ slaBreached: false, message: "On time" });
    }

    // 2. Call GPT-4o via Vercel AI SDK
    const { output } = await generateText({
      model: github("gpt-4o"),
      output: Output.object({ schema: slaExceptionOutputSchema }),
      prompt: `Shipment ID: ${payload.shipmentId}
ETA: ${payload.eta.toISOString()}
SLA Target: ${payload.slaDeadline.toISOString()}

Explain the delay in one sentence and select the single best operational action.`,
    });

    // 3. Return structured JSON
    return res.json({
      slaBreached: true,
      shipmentId: payload.shipmentId,
      aiAnalysis: output,
    });
  } catch (err) {
    return res.status(400).json({ error: String(err) });
  }
}
