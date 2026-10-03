import { createClient } from '@supabase/supabase-js';
import { Shipment, INITIAL_SHIPMENTS } from '../data/shipments';

export const SUPABASE_PROJECT_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bfdmmhvpbyvnhygmvfjd.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// A valid Supabase public anon key for REST queries is a JWT token starting with 'eyJ'
export const isSupabaseConfigured = Boolean(
  SUPABASE_PROJECT_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY.startsWith('eyJ')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Fetch shipments from Supabase table or return null if unconfigured/empty
 */
export async function getRemoteShipments(): Promise<Shipment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }
    return data as Shipment[];
  } catch {
    return null;
  }
}

/**
 * Seed initial Indian fleet data into Supabase if table is created and empty
 */
export async function seedRemoteShipmentsIfEmpty(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error: countErr } = await supabase
      .from('shipments')
      .select('id')
      .limit(1);

    if (countErr) return false;

    if (!data || data.length === 0) {
      await supabase.from('shipments').insert(INITIAL_SHIPMENTS);
      return true;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Update an approved exception recommendation in Supabase
 */
export async function syncExceptionApprovalToSupabase(
  shipmentId: string,
  approvalDetails: {
    status: string;
    approvedAt: string;
    approvedBy: string;
    currentEta: string;
    delayDuration: string;
  }
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('shipments')
      .update({
        status: approvalDetails.status,
        'schedule.currentEta': approvalDetails.currentEta,
        'schedule.delayDuration': approvalDetails.delayDuration,
        'exception.approved': true,
        'exception.approvedAt': approvalDetails.approvedAt,
        'exception.approvedBy': approvalDetails.approvedBy,
      })
      .eq('id', shipmentId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Listen for real-time changes to the shipments table
 */
export function subscribeToShipmentChanges(onUpdate: () => void) {
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}
