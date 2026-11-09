import { getAppUrl, getEmailTransporterConfig, createNodemailerTransporter } from './transporter';

export async function sendQuoteReviewReminderEmail(params: {
  toEmail: string;
  reviewerName: string;
  pendingQuotes: Array<{
    quoteNumber: string;
    customerName: string;
    preparedBy: string;
    daysPending: number;
  }>;
  appUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { hasSmtp, from } = getEmailTransporterConfig();
  const appUrl = params.appUrl || getAppUrl();

  if (!hasSmtp) {
    console.log(`[Quote Reminder Email Simulated] To: ${params.toEmail}, Quotes: ${params.pendingQuotes.length}`);
    return { success: true };
  }

  try {
    const transporter = createNodemailerTransporter();

    const quotesRows = params.pendingQuotes.map((q) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-weight: 700; color: #0f172a;">#${q.quoteNumber}</td>
        <td style="padding: 12px 8px; color: #334155;">${q.customerName}</td>
        <td style="padding: 12px 8px; color: #64748b;">${q.preparedBy}</td>
        <td style="padding: 12px 8px; color: #e11d48; font-weight: 600;">${q.daysPending} days ago</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 22px; color: #0f172a;">The Window & Door Store</h1>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Quote Review Queue Reminder</p>
          </div>
          <p style="font-size: 15px; color: #1e293b; line-height: 1.5;">Hello <b>${params.reviewerName}</b>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            You have <b>${params.pendingQuotes.length}</b> quote${params.pendingQuotes.length > 1 ? 's' : ''} waiting for your review for 3 or more days:
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; color: #475569; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px;">Quote #</th>
                <th style="padding: 8px;">Customer</th>
                <th style="padding: 8px;">Prepared By</th>
                <th style="padding: 8px;">Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${quotesRows}
            </tbody>
          </table>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${appUrl}/quotes" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
              Open Review Queue &rarr;
            </a>
          </div>
          <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            This is an automated morning reminder sent Monday to Friday.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to: params.toEmail,
      subject: `Reminder: ${params.pendingQuotes.length} Quote${params.pendingQuotes.length > 1 ? 's' : ''} Pending Review (3+ days) - The Window & Door Store`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send quote reminder email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendQuoteApprovedEmail(params: {
  toEmail: string;
  employeeName: string;
  reviewerName: string;
  quoteNumber: string;
  customerName: string;
  status: 'APPROVED' | 'MODIFIED' | 'RETURNED';
  reviewChanges?: string[];
  reviewerNotes?: string;
  appUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { hasSmtp, from } = getEmailTransporterConfig();
  const appUrl = params.appUrl || getAppUrl();

  if (!hasSmtp) {
    console.log(`[Quote Approved Email Simulated] To: ${params.toEmail}, Status: ${params.status}`);
    return { success: true };
  }

  try {
    const transporter = createNodemailerTransporter();

    const isModified = params.status === 'MODIFIED';
    const isReturned = params.status === 'RETURNED';
    const statusLabel = isReturned ? 'Returned for Revision' : isModified ? 'Approved with Modifications' : 'Approved';
    const statusColor = isReturned ? '#e11d48' : isModified ? '#d97706' : '#10b981';

    let changesHtml = '';
    if (params.reviewChanges && params.reviewChanges.length > 0) {
      changesHtml = `
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin: 16px 0;">
          <div style="font-weight: 700; font-size: 13px; color: #b45309; margin-bottom: 6px;">Changes Made by ${params.reviewerName}:</div>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #78350f;">
            ${params.reviewChanges.map((c) => `<li>${c}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    let notesHtml = '';
    if (params.reviewerNotes) {
      notesHtml = `
        <div style="background: #f8fafc; border-left: 3px solid #64748b; padding: 10px 14px; margin: 14px 0; font-size: 13px; color: #334155; font-style: italic;">
          "${params.reviewerNotes}"
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 22px; color: #0f172a;">The Window & Door Store</h1>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Quote Review Update</p>
          </div>
          <p style="font-size: 15px; color: #1e293b;">Hello <b>${params.employeeName}</b>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            <b>${params.reviewerName}</b> has reviewed your quote <b>#${params.quoteNumber}</b> for <b>${params.customerName}</b>.
          </p>
          <div style="text-align: center; margin: 16px 0;">
            <span style="background: ${statusColor}; color: #ffffff; font-weight: 700; font-size: 13px; padding: 6px 16px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${statusLabel}
            </span>
          </div>
          ${changesHtml}
          ${notesHtml}
          <div style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}/quotes" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
              View Quote & Print
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to: params.toEmail,
      subject: `Quote #${params.quoteNumber} (${params.customerName}) is ${statusLabel} - The Window & Door Store`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send quote approval email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendQuoteReviewRequestedEmail(params: {
  toEmail: string;
  reviewerName: string;
  preparerName: string;
  quoteNumber: string;
  customerName: string;
  preparerNotes?: string;
  appUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { hasSmtp, from } = getEmailTransporterConfig();
  const appUrl = params.appUrl || getAppUrl();

  if (!hasSmtp) {
    console.log(`[Quote Review Request Email Simulated] To: ${params.toEmail}, Quote: #${params.quoteNumber}`);
    return { success: true };
  }

  try {
    const transporter = createNodemailerTransporter();

    let notesHtml = '';
    if (params.preparerNotes) {
      notesHtml = `
        <div style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 10px 14px; margin: 14px 0; font-size: 13px; color: #334155;">
          <div style="font-weight: 600; font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 3px;">Preparer Notes:</div>
          "${params.preparerNotes}"
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 22px; color: #0f172a;">The Window & Door Store</h1>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Quote Submitted for Review</p>
          </div>
          <p style="font-size: 15px; color: #1e293b;">Hello <b>${params.reviewerName}</b>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            <b>${params.preparerName}</b> has submitted quote <b>#${params.quoteNumber}</b> for <b>${params.customerName}</b> to you for review and approval.
          </p>
          ${notesHtml}
          <div style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}/quotes" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
              Open Review Queue &rarr;
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to: params.toEmail,
      subject: `New Quote #${params.quoteNumber} (${params.customerName}) Assigned for Review - The Window & Door Store`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send quote review request email:', error);
    return { success: false, error: error.message };
  }
}

