export {
  getAppUrl,
  maskEmail,
  getEmailTransporterConfig,
  createNodemailerTransporter,
} from './email/transporter';

export {
  sendOtpEmail,
  type SendOtpResult,
} from './email/otp-email';

export {
  sendQuoteReviewReminderEmail,
  sendQuoteReviewReminderEmail as sendQuoteReminderEmail,
  sendQuoteApprovedEmail,
  sendQuoteReviewRequestedEmail,
} from './email/quote-emails';
