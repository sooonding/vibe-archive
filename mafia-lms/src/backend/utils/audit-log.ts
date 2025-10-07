import type { SupabaseClient } from '@supabase/supabase-js';

export const createAuditLog = async (
  client: SupabaseClient,
  operatorId: string,
  action: string,
  targetType: string,
  targetId: string,
  reason?: string
): Promise<void> => {
  await client.from('audit_logs').insert({
    operator_id: operatorId,
    action,
    target_type: targetType,
    target_id: targetId,
    reason: reason || null,
  });
};
