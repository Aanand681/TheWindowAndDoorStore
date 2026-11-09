import SavedQuote from '@/models/SavedQuote';
import { detectQuoteChanges } from '@/lib/quote-diff';

export interface BuildQuoteUpdatePayloadResult {
  error?: string;
  statusCode?: number;
  updateData?: any;
  newStatus?: string;
  isReviewAction?: boolean;
}

export async function buildQuoteUpdatePayload(p: {
  id: string;
  body: any;
  existingQuote: any;
  reviewerUsername: string;
  userRole: string;
}): Promise<BuildQuoteUpdatePayloadResult> {
  const { id, body, existingQuote, reviewerUsername, userRole } = p;

  if (body.customerName !== undefined) {
    if (typeof body.customerName !== 'string' || !body.customerName.trim()) {
      return { error: 'Customer Name cannot be empty', statusCode: 400 };
    }
    if (body.customerName.length > 200) {
      return { error: 'Customer Name cannot exceed 200 characters', statusCode: 400 };
    }
  }

  if (body.quoteNumber !== undefined) {
    if (typeof body.quoteNumber !== 'string' || !body.quoteNumber.trim()) {
      return { error: 'Quote Number cannot be empty', statusCode: 400 };
    }
    if (body.quoteNumber.length > 60) {
      return { error: 'Quote Number cannot exceed 60 characters', statusCode: 400 };
    }
  }

  if (body.quoteNotes !== undefined && typeof body.quoteNotes === 'string' && body.quoteNotes.length > 10000) {
    return { error: 'Quote Notes cannot exceed 10,000 characters', statusCode: 400 };
  }

  if (body.reviewerNotes !== undefined && typeof body.reviewerNotes === 'string' && body.reviewerNotes.length > 10000) {
    return { error: 'Reviewer Notes cannot exceed 10,000 characters', statusCode: 400 };
  }

  if (body.preparerNotes !== undefined && typeof body.preparerNotes === 'string' && body.preparerNotes.length > 10000) {
    return { error: 'Preparer Notes cannot exceed 10,000 characters', statusCode: 400 };
  }

  if (body.windows !== undefined && Array.isArray(body.windows) && body.windows.length > 200) {
    return { error: 'A quote cannot contain more than 200 window items', statusCode: 400 };
  }

  const updateData: any = {};

  const scalarFields = [
    'status', 'reviewerNotes', 'windows', 'taxTotals', 'quoteResult',
    'quoteNotes', 'surchargeRate', 'activePromoId', 'customerName',
    'quoteNumber', 'preparerNotes', 'assignedTo', 'customJC', 'customMisc',
    'customLabour', 'includeJCInPromo', 'includeMiscInPromo', 'includeLabourInPromo',
    'attachedUpgrade', 'attachedSealedUnit', 'attachedDoorQuote', 'wantsUpgrade',
    'isSupplyOnly', 'isServiceOnly', 'quoteSummaryTotal',
  ];

  for (const field of scalarFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  if (Array.isArray(body.reviewChanges)) updateData.reviewChanges = body.reviewChanges;
  if (body.isStarred !== undefined) updateData.isStarred = Boolean(body.isStarred);

  // Odoo Post-Approval Workflow Fields
  if (body.odooAssignedTo !== undefined) {
    updateData.odooAssignedTo = body.odooAssignedTo;
    if (body.odooAssignedTo && !existingQuote.odooStatus) {
      updateData.odooStatus = 'PENDING_ENTRY';
    }
  }
  if (body.odooStatus !== undefined) updateData.odooStatus = body.odooStatus;
  if (body.odooCompletedAt !== undefined) {
    updateData.odooCompletedAt = body.odooCompletedAt ? new Date(body.odooCompletedAt) : null;
  }
  if (body.odooCompletedBy !== undefined) updateData.odooCompletedBy = body.odooCompletedBy;

  if (body.odooStatus === 'COMPLETED') {
    const orderNumber = (body.odooOrderNumber !== undefined ? body.odooOrderNumber : existingQuote.odooOrderNumber || '').trim();
    if (!orderNumber) {
      return { error: 'Odoo Sales Order # is required to complete order entry.', statusCode: 400 };
    }

    const duplicateSo = await SavedQuote.findOne({
      _id: { $ne: id },
      odooOrderNumber: { $regex: new RegExp(`^${orderNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (duplicateSo) {
      return {
        error: `Odoo Sales Order #${orderNumber} is already assigned to Quote #${duplicateSo.quoteNumber} (${duplicateSo.customerName}). Please enter a unique Sales Order #.`,
        statusCode: 400,
      };
    }

    updateData.odooOrderNumber = orderNumber;
    updateData.odooStatus = 'COMPLETED';
    if (existingQuote.odooStatus !== 'COMPLETED') {
      updateData.odooCompletedAt = new Date();
      updateData.odooCompletedBy = reviewerUsername || 'Clerk';
    }
  } else if (body.odooOrderNumber !== undefined) {
    updateData.odooOrderNumber = body.odooOrderNumber;
  }

  // 1. Establish baseline from initialSnapshot or existing quote values
  const baseline = existingQuote.initialSnapshot || {
    windows: existingQuote.windows,
    taxTotals: existingQuote.taxTotals,
    quoteResult: existingQuote.quoteResult,
    quoteNotes: existingQuote.quoteNotes,
    surchargeRate: existingQuote.surchargeRate,
    activePromoId: existingQuote.activePromoId,
    customJC: existingQuote.customJC,
    customMisc: existingQuote.customMisc,
    customLabour: existingQuote.customLabour,
    includeJCInPromo: existingQuote.includeJCInPromo,
    includeMiscInPromo: existingQuote.includeMiscInPromo,
    includeLabourInPromo: existingQuote.includeLabourInPromo,
    quoteSummaryTotal: existingQuote.quoteSummaryTotal,
  };

  if (!existingQuote.initialSnapshot) {
    updateData.initialSnapshot = baseline;
  }

  // 2. Build target state for comparison
  const targetState = {
    ...(typeof existingQuote.toObject === 'function' ? existingQuote.toObject() : existingQuote),
    ...updateData,
  };

  // 3. Automatically detect all changes against baseline
  const autoDetectedChanges = detectQuoteChanges(baseline, targetState);
  const clientChanges = Array.isArray(body.reviewChanges) ? body.reviewChanges : [];
  const mergedChanges = Array.from(new Set([...autoDetectedChanges, ...clientChanges]));

  if (mergedChanges.length > 0) {
    updateData.reviewChanges = mergedChanges;
    if (body.status === 'APPROVED' || body.status === 'MODIFIED' || updateData.status === 'APPROVED') {
      updateData.status = 'MODIFIED';
    }
  } else if (Array.isArray(body.reviewChanges)) {
    updateData.reviewChanges = body.reviewChanges;
  }

  const newStatus = updateData.status || body.status;
  const isApproval = (newStatus === 'APPROVED' || newStatus === 'MODIFIED') && existingQuote.status === 'PENDING_REVIEW';

  if (isApproval) {
    const assignedClerk = (body.odooAssignedTo !== undefined ? body.odooAssignedTo : (updateData.odooAssignedTo || existingQuote.odooAssignedTo || '')).trim();
    if (!assignedClerk) {
      return { error: 'Please select an Odoo clerk before approving the quote.', statusCode: 400 };
    }
    updateData.odooAssignedTo = assignedClerk;
    if (!existingQuote.odooStatus) {
      updateData.odooStatus = 'PENDING_ENTRY';
    }
  }

  const isReviewAction = Boolean(
    body.status &&
    ['APPROVED', 'MODIFIED', 'RETURNED'].includes(body.status) &&
    (existingQuote.status === 'PENDING_REVIEW' || body.status === 'RETURNED' || body.status !== existingQuote.status)
  );

  if (isReviewAction) {
    updateData.reviewedAt = new Date();
    updateData.reviewedBy = reviewerUsername || 'Admin';
    updateData.reviewedByRole = userRole || 'ADMIN';
  }

  return { updateData, newStatus, isReviewAction };
}

