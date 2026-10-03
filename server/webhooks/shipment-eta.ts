import { Request, Response } from 'express';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { webhookPayloadSchema, slaExceptionOutputSchema } from '../schemas';

// Configure explicit GitHub Models provider using OpenAI compatibility layer
const github = createOpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN || '',
});

export async function handleShipmentEtaWebhook(req: Request, res: Response) {
  try {
    // 1. Validate inbound webhook payload
    const parsedPayload = webhookPayloadSchema.safeParse(req.body);
    if (!parsedPayload.success) {
      return res.status(400).json({
        error: 'Invalid payload schema',
        details: parsedPayload.error.format(),
      });
    }

    const shipment = parsedPayload.data;
    const etaDate = new Date(shipment.eta);
    const slaDate = new Date(shipment.slaDeadline);

    // 2. SLA Check
    const isBreached = etaDate > slaDate;
    if (!isBreached) {
      return res.status(200).json({
        status: 'ON_SCHEDULE',
        shipmentId: shipment.shipmentId,
        message: 'Shipment ETA is within SLA limits.',
      });
    }

    // 3. AI Exception Analysis via GitHub Models (gpt-4o)
    const prompt = `
You are an operational logistics AI managing shipment SLA exceptions.
Shipment ID: ${shipment.shipmentId}
Carrier: ${shipment.carrier}
Origin: ${shipment.origin} -> Destination: ${shipment.destination}
ETA: ${shipment.eta}
SLA Deadline: ${shipment.slaDeadline}
Cargo: ${shipment.cargo}

Analyze why this shipment breached its SLA and return a valid JSON object matching this structure:
{
  "explanation": "Single concise sentence explaining the root cause of the delay.",
  "recommendedAction": "Actionable operational recommendation for human approval.",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "estimatedDelayHours": number
}
Only return valid JSON without markdown formatting.
`;

    const { text } = await generateText({
      model: github('gpt-4o'),
      prompt,
    });

    // 4. Validate AI Output against Zod Schema
    const cleanedJson = text.replace(/```json|```/g, '').trim();
    const aiAnalysis = slaExceptionOutputSchema.parse(JSON.parse(cleanedJson));

    return res.status(200).json({
      status: 'SLA_BREACH_DETECTED',
      shipmentId: shipment.shipmentId,
      analysis: aiAnalysis,
    });
  } catch (error: any) {
    console.error('Webhook Handling Error:', error);
    return res.status(500).json({
      error: 'Failed to process shipment webhook',
      message: error.message || 'Internal server error',
    });
  }
}
