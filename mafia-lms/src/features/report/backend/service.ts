import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  ReportSchema,
  type Report,
  type ReportQueryParams,
  type UpdateReportStatusRequest,
  type ExecuteActionRequest,
} from './schema';
import { reportErrorCodes, type ReportServiceError } from './error';
import { createAuditLog } from '@/backend/utils/audit-log';

export const getReports = async (
  client: SupabaseClient,
  queryParams?: ReportQueryParams
): Promise<HandlerResult<Report[], ReportServiceError, unknown>> => {
  let query = client.from('reports').select('*').order('created_at', { ascending: false });

  if (queryParams?.status) {
    query = query.eq('status', queryParams.status);
  }

  if (queryParams?.targetType) {
    query = query.eq('target_type', queryParams.targetType);
  }

  const { data: reports, error } = await query;

  if (error) {
    return failure(500, reportErrorCodes.fetchError, error.message);
  }

  if (!reports || reports.length === 0) {
    return success([]);
  }

  const mappedReports: Report[] = reports.map((r) => ({
    id: r.id,
    targetType: r.target_type,
    targetId: r.target_id,
    reporterId: r.reporter_id,
    reason: r.reason,
    content: r.content,
    status: r.status,
    actionTaken: r.action_taken,
    actionReason: r.action_reason,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
  }));

  const validatedReports: Report[] = [];

  for (const report of mappedReports) {
    const parsed = ReportSchema.safeParse(report);
    if (!parsed.success) {
      return failure(
        500,
        reportErrorCodes.validationError,
        'Report validation failed',
        parsed.error.format()
      );
    }
    validatedReports.push(parsed.data);
  }

  return success(validatedReports);
};

export const getReportDetail = async (
  client: SupabaseClient,
  reportId: string
): Promise<HandlerResult<Report, ReportServiceError, unknown>> => {
  const { data: report, error } = await client
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error || !report) {
    return failure(404, reportErrorCodes.reportNotFound, 'Report not found');
  }

  const mapped: Report = {
    id: report.id,
    targetType: report.target_type,
    targetId: report.target_id,
    reporterId: report.reporter_id,
    reason: report.reason,
    content: report.content,
    status: report.status,
    actionTaken: report.action_taken,
    actionReason: report.action_reason,
    createdAt: report.created_at,
    resolvedAt: report.resolved_at,
  };

  const parsed = ReportSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      reportErrorCodes.validationError,
      'Report validation failed',
      parsed.error.format()
    );
  }

  return success(parsed.data);
};

const canTransitionStatus = (
  currentStatus: string,
  newStatus: string
): { allowed: boolean; reason?: string } => {
  if (currentStatus === newStatus) {
    return { allowed: true };
  }

  if (currentStatus === 'resolved') {
    return {
      allowed: false,
      reason: '처리 완료된 신고는 상태 변경이 불가능합니다',
    };
  }

  if (currentStatus === 'received' && newStatus === 'resolved') {
    return {
      allowed: false,
      reason: 'received 상태에서 바로 resolved로 전환할 수 없습니다',
    };
  }

  return { allowed: true };
};

export const updateReportStatus = async (
  client: SupabaseClient,
  reportId: string,
  operatorId: string,
  data: UpdateReportStatusRequest
): Promise<HandlerResult<Report, ReportServiceError, unknown>> => {
  const { data: report, error: fetchError } = await client
    .from('reports')
    .select('status')
    .eq('id', reportId)
    .single();

  if (fetchError || !report) {
    return failure(404, reportErrorCodes.reportNotFound, 'Report not found');
  }

  const transition = canTransitionStatus(report.status, data.status);

  if (!transition.allowed) {
    return failure(
      400,
      reportErrorCodes.invalidStatusTransition,
      transition.reason || 'Invalid status transition'
    );
  }

  const updateData: {
    status: string;
    resolved_at?: string;
  } = {
    status: data.status,
  };

  if (data.status === 'resolved') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { error: updateError } = await client
    .from('reports')
    .update(updateData)
    .eq('id', reportId);

  if (updateError) {
    return failure(500, reportErrorCodes.updateError, updateError.message);
  }

  await createAuditLog(
    client,
    operatorId,
    `update_report_status_to_${data.status}`,
    'report',
    reportId
  );

  return getReportDetail(client, reportId);
};

export const executeAction = async (
  client: SupabaseClient,
  reportId: string,
  operatorId: string,
  data: ExecuteActionRequest
): Promise<HandlerResult<Report, ReportServiceError, unknown>> => {
  const { data: report, error: fetchError } = await client
    .from('reports')
    .select('status, target_type, target_id')
    .eq('id', reportId)
    .single();

  if (fetchError || !report) {
    return failure(404, reportErrorCodes.reportNotFound, 'Report not found');
  }

  if (report.status === 'resolved') {
    return failure(
      400,
      reportErrorCodes.alreadyResolved,
      '이미 처리 완료된 신고입니다'
    );
  }

  let actionResult: { success: boolean; error?: string } = { success: true };

  switch (data.action) {
    case 'invalidate_submission': {
      const { error } = await client
        .from('submissions')
        .select('id')
        .eq('id', report.target_id)
        .single();

      if (error) {
        actionResult = { success: false, error: 'Submission not found' };
      }
      break;
    }

    case 'suspend_user': {
      const { error } = await client
        .from('users')
        .select('id')
        .eq('id', report.target_id)
        .single();

      if (error) {
        actionResult = { success: false, error: 'User not found' };
      }
      break;
    }

    case 'archive_course': {
      const { error } = await client
        .from('courses')
        .update({ status: 'archived' })
        .eq('id', report.target_id);

      if (error) {
        actionResult = { success: false, error: error.message };
      }
      break;
    }

    case 'warn':
      break;

    default:
      return failure(400, reportErrorCodes.actionError, 'Unknown action type');
  }

  if (!actionResult.success) {
    return failure(
      400,
      reportErrorCodes.actionError,
      actionResult.error || 'Action execution failed'
    );
  }

  const { error: updateError } = await client
    .from('reports')
    .update({
      action_taken: data.action,
      action_reason: data.reason,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (updateError) {
    return failure(500, reportErrorCodes.updateError, updateError.message);
  }

  await createAuditLog(
    client,
    operatorId,
    `execute_action_${data.action}`,
    report.target_type,
    report.target_id,
    data.reason
  );

  return getReportDetail(client, reportId);
};
