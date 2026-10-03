import { z } from 'zod';

export const webhookPayloadSchema = z.object({
  trackingNumber: z.string().optional(),
  shipmentId: z.string().optional(),
  carrier: z.string().optional(),
  currentEta: z.string().optional(),
  originalEta: z.string().optional(),
  status: z.string().optional(),
  delayReason: z.string().optional(),
  location: z.string().optional(),
  eventDetails: z.record(z.any()).optional(),
});

export const slaExceptionOutputSchema = z.object({
  exceptionType: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  summary: z.string(),
  recommendedAction: z.string(),
  impactAnalysis: z.string().optional(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type SlaExceptionOutput = z.infer<typeof slaExceptionOutputSchema>;
