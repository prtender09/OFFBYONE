import { z } from 'zod';

export const shipmentEtaSchema = z.object({
  trackingNumber: z.string().optional(),
  shipmentId: z.string().optional(),
  carrier: z.string().optional(),
  currentEta: z.string().optional(),
  originalEta: z.string().optional(),
  status: z.string().optional(),
  delayReason: z.string().optional(),
  location: z.string().optional(),
});

export const slaExceptionSchema = z.object({
  exceptionType: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  summary: z.string(),
  recommendedAction: z.string(),
  impactAnalysis: z.string().optional(),
});

export type ShipmentEtaInput = z.infer<typeof shipmentEtaSchema>;
export type SlaExceptionOutput = z.infer<typeof slaExceptionSchema>;
