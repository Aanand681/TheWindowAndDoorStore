import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkQuoteUpdateSecurity } from '../quote-update-security';
import { buildQuoteUpdatePayload } from '../quote-update-payload';
import Department from '@/models/Department';
import SavedQuote from '@/models/SavedQuote';

vi.mock('@/models/Department', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('@/models/SavedQuote', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

describe('Quote Lifecycle & Security Gate Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkQuoteUpdateSecurity', () => {
    it('allows an employee to update a pending review quote', async () => {
      const res = await checkQuoteUpdateSecurity({
        session: { user: { role: 'EMPLOYEE', department: 'SALES' } },
        existingQuote: { status: 'PENDING_REVIEW' },
        body: { customerName: 'New Name' },
      });

      expect(res.allowed).toBe(true);
    });

    it('blocks an employee without edit permission from modifying an APPROVED quote', async () => {
      vi.mocked(Department.findOne).mockResolvedValueOnce({
        permissions: { canEditApprovedQuote: false },
      } as any);

      const res = await checkQuoteUpdateSecurity({
        session: { user: { role: 'EMPLOYEE', department: 'SALES' } },
        existingQuote: { status: 'APPROVED' },
        body: { quoteNotes: 'Changing spec notes' },
      });

      expect(res.allowed).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.error).toContain('only authorized administrators/reviewers can edit');
    });

    it('blocks an employee without edit permission from modifying a MODIFIED quote', async () => {
      vi.mocked(Department.findOne).mockResolvedValueOnce({
        permissions: { canEditApprovedQuote: false },
      } as any);

      const res = await checkQuoteUpdateSecurity({
        session: { user: { role: 'EMPLOYEE', department: 'SALES' } },
        existingQuote: { status: 'MODIFIED' },
        body: { windows: [] },
      });

      expect(res.allowed).toBe(false);
      expect(res.statusCode).toBe(403);
    });

    it('allows an employee to update Odoo tracking fields on an approved quote', async () => {
      vi.mocked(Department.findOne).mockResolvedValueOnce({
        permissions: { canEditApprovedQuote: false },
      } as any);

      const res = await checkQuoteUpdateSecurity({
        session: { user: { role: 'EMPLOYEE', department: 'SALES' } },
        existingQuote: { status: 'APPROVED' },
        body: { odooStatus: 'PENDING_ENTRY', odooOrderNumber: 'SO-1092' },
      });

      expect(res.allowed).toBe(true);
    });

    it('allows an ADMIN or SUPERADMIN to edit an approved quote', async () => {
      const adminRes = await checkQuoteUpdateSecurity({
        session: { user: { role: 'ADMIN', department: 'MANAGEMENT' } },
        existingQuote: { status: 'APPROVED' },
        body: { quoteNotes: 'Admin approved adjustment' },
      });
      expect(adminRes.allowed).toBe(true);
      expect(adminRes.canEditApprovedQuote).toBe(true);

      const superRes = await checkQuoteUpdateSecurity({
        session: { user: { role: 'SUPERADMIN' } },
        existingQuote: { status: 'APPROVED' },
        body: { quoteNotes: 'Superadmin adjustment' },
      });
      expect(superRes.allowed).toBe(true);
      expect(superRes.canEditApprovedQuote).toBe(true);
    });

    it('allows a manager with custom department permissions to edit an approved quote', async () => {
      vi.mocked(Department.findOne).mockResolvedValueOnce({
        permissions: { canEditApprovedQuote: true },
      } as any);

      const res = await checkQuoteUpdateSecurity({
        session: { user: { role: 'EMPLOYEE', department: 'ESTIMATING_MANAGER' } },
        existingQuote: { status: 'APPROVED' },
        body: { quoteNotes: 'Manager notes' },
      });

      expect(res.allowed).toBe(true);
      expect(res.canEditApprovedQuote).toBe(true);
    });

    it('strictly locks specs for EVERYONE once entered into Odoo (COMPLETED)', async () => {
      const res = await checkQuoteUpdateSecurity({
        session: { user: { role: 'SUPERADMIN' } },
        existingQuote: {
          status: 'APPROVED',
          odooStatus: 'COMPLETED',
          odooOrderNumber: 'SO-9999',
        },
        body: { surchargeRate: 10 },
      });

      expect(res.allowed).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.error).toContain('This quote has been entered into Odoo and is locked');
    });
  });

  describe('buildQuoteUpdatePayload - Validation & Bounds', () => {
    it('rejects an empty customerName on quote update', async () => {
      const res = await buildQuoteUpdatePayload({
        id: '64b1f28b7e21123456789abc',
        body: { customerName: '   ' },
        existingQuote: {},
        reviewerUsername: 'admin',
        userRole: 'ADMIN',
      });

      expect(res.statusCode).toBe(400);
      expect(res.error).toBe('Customer Name cannot be empty');
    });

    it('rejects customerName exceeding 200 characters', async () => {
      const res = await buildQuoteUpdatePayload({
        id: '64b1f28b7e21123456789abc',
        body: { customerName: 'A'.repeat(201) },
        existingQuote: {},
        reviewerUsername: 'admin',
        userRole: 'ADMIN',
      });

      expect(res.statusCode).toBe(400);
      expect(res.error).toBe('Customer Name cannot exceed 200 characters');
    });

    it('rejects quoteNumber exceeding 60 characters', async () => {
      const res = await buildQuoteUpdatePayload({
        id: '64b1f28b7e21123456789abc',
        body: { quoteNumber: 'Q'.repeat(61) },
        existingQuote: {},
        reviewerUsername: 'admin',
        userRole: 'ADMIN',
      });

      expect(res.statusCode).toBe(400);
      expect(res.error).toBe('Quote Number cannot exceed 60 characters');
    });

    it('rejects quote notes exceeding 10,000 characters', async () => {
      const res = await buildQuoteUpdatePayload({
        id: '64b1f28b7e21123456789abc',
        body: { quoteNotes: 'X'.repeat(10001) },
        existingQuote: {},
        reviewerUsername: 'admin',
        userRole: 'ADMIN',
      });

      expect(res.statusCode).toBe(400);
      expect(res.error).toBe('Quote Notes cannot exceed 10,000 characters');
    });

    it('rejects quotes with more than 200 windows', async () => {
      const res = await buildQuoteUpdatePayload({
        id: '64b1f28b7e21123456789abc',
        body: { windows: new Array(201).fill({ id: 'w1' }) },
        existingQuote: {},
        reviewerUsername: 'admin',
        userRole: 'ADMIN',
      });

      expect(res.statusCode).toBe(400);
      expect(res.error).toBe('A quote cannot contain more than 200 window items');
    });

    it('requires an Odoo Sales Order number when completing entry', async () => {
      const res = await buildQuoteUpdatePayload({
        id: '64b1f28b7e21123456789abc',
        body: { odooStatus: 'COMPLETED', odooOrderNumber: '' },
        existingQuote: {},
        reviewerUsername: 'admin',
        userRole: 'ADMIN',
      });

      expect(res.statusCode).toBe(400);
      expect(res.error).toContain('Odoo Sales Order # is required to complete order entry');
    });

    it('rejects a duplicate Odoo Sales Order number from another quote', async () => {
      vi.mocked(SavedQuote.findOne).mockResolvedValueOnce({
        _id: 'other-quote-id',
        quoteNumber: 'Q-100',
      } as any);

      const res = await buildQuoteUpdatePayload({
        id: '64b1f28b7e21123456789abc',
        body: { odooStatus: 'COMPLETED', odooOrderNumber: 'SO-1092' },
        existingQuote: {},
        reviewerUsername: 'admin',
        userRole: 'ADMIN',
      });

      expect(res.statusCode).toBe(400);
      expect(res.error).toContain('already assigned to Quote #Q-100');
    });
  });
});

