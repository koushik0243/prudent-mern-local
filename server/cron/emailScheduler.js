import cron from 'node-cron';
import ContactMessages from '../contact_messages/contact_messages.model.js';
import NotificationMessages from '../notification_messages/notification_message.model.js';
import { sendEmail } from '../_helpers/sendEmail.js';

const REMINDER_ACTIVITY_TYPES = ['call', 'meeting', 'email', 'task'];
const SCHEDULE_CRON_MODE = (process.env.SCHEDULE_CRON_MODE || 'before_schedule_59_minutes').trim();
const SCHEDULE_CRON_EXPRESSION = (process.env.SCHEDULE_CRON_EXPRESSION || '').trim();
const REMINDER_LEAD_MINUTES = Number.parseInt(process.env.SCHEDULE_REMINDER_LEAD_MINUTES || '59', 10);
const SCHEDULE_TIMEZONE = (process.env.SCHEDULE_TIMEZONE || 'Asia/Kolkata').trim();
const IST_OFFSET_MINUTES = 330;
const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

const getCronExpression = () => {
  if (SCHEDULE_CRON_EXPRESSION) {
    return SCHEDULE_CRON_EXPRESSION;
  }

  if (SCHEDULE_CRON_MODE === 'every_2_minutes') {
    return '*/2 * * * *';
  }

  if (SCHEDULE_CRON_MODE === 'every_60_minutes') {
    return '0 * * * *';
  }

  if (SCHEDULE_CRON_MODE === 'before_schedule_59_minutes') {
    return '* * * * *';
  }

  return '59 23 * * *';
};

const pad2 = (value) => String(value).padStart(2, '0');

const getIstDayWindow = () => {
  const nowUtc = new Date();
  const nowIst = new Date(nowUtc.getTime() + IST_OFFSET_MS);
  const year = nowIst.getUTCFullYear();
  const month = nowIst.getUTCMonth();
  const date = nowIst.getUTCDate();

  const startOfTodayUtc = new Date(Date.UTC(
    year,
    month,
    date,
    0,
    0,
    0,
    0
  ) - IST_OFFSET_MS);

  const endOfTodayUtc = new Date(Date.UTC(
    year,
    month,
    date,
    23,
    59,
    59,
    999
  ) - IST_OFFSET_MS);

  return {
    nowUtc,
    startOfTodayUtc,
    endOfTodayUtc
  };
};

const getContactDisplayName = (contact) => {
  return `${contact?.fname || ''} ${contact?.mname || ''} ${contact?.lname || ''}`.replace(/\s+/g, ' ').trim() || 'N/A';
};

const getUserDisplayName = (user) => {
  return String(user?.full_name || user?.name || '').trim() || 'User';
};

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) {
    return 'th';
  }

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const parseDueDateUtc = (rawDueDate) => {
  const dueDate = String(rawDueDate || '').trim();
  if (!dueDate) {
    return null;
  }

  const isoDateTimeMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (isoDateTimeMatch) {
    const [, year, month, day, hour, minute, second = '00'] = isoDateTimeMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)) - IST_OFFSET_MS);
  }

  const isoDateOnlyMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnlyMatch) {
    const [, year, month, day] = isoDateOnlyMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0) - IST_OFFSET_MS);
  }

  const dmyDateTimeMatch = dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (dmyDateTimeMatch) {
    const [, day, month, year, hour, minute, second = '00'] = dmyDateTimeMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)) - IST_OFFSET_MS);
  }

  const dmyDateOnlyMatch = dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmyDateOnlyMatch) {
    const [, day, month, year] = dmyDateOnlyMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0) - IST_OFFSET_MS);
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const isReminderDueNow = (dueDateUtc, nowUtc) => {
  if (!dueDateUtc || !nowUtc || Number.isNaN(dueDateUtc.getTime()) || Number.isNaN(nowUtc.getTime())) {
    return false;
  }

  const reminderTimeUtc = new Date(dueDateUtc.getTime() - (REMINDER_LEAD_MINUTES * 60 * 1000));
  const nowMinuteUtc = new Date(nowUtc);
  nowMinuteUtc.setUTCSeconds(0, 0);

  const reminderMinuteUtc = new Date(reminderTimeUtc);
  reminderMinuteUtc.setUTCSeconds(0, 0);

  return nowMinuteUtc.getTime() === reminderMinuteUtc.getTime();
};

const formatDueDateForMail = (rawDueDate) => {
  const parsedDate = parseDueDateUtc(rawDueDate);
  if (!parsedDate) {
    return rawDueDate || 'N/A';
  }

  const localized = new Date(parsedDate.getTime() + IST_OFFSET_MS);
  const day = localized.getUTCDate();
  const month = parsedDate.toLocaleString('en-US', { month: 'long', timeZone: SCHEDULE_TIMEZONE });
  const year = localized.getUTCFullYear();
  const time = parsedDate.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: SCHEDULE_TIMEZONE
  });

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}, ${time} IST`;
};

const toTitleCase = (text) => {
  const value = String(text || '').trim();
  if (!value) {
    return 'N/A';
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const buildMailBody = ({ receiverName, senderName, senderEmail, contactName, contactPhone, contactEmail, activityType, dueDate, message }) => {
  const formattedMessage = String(message || 'N/A').replace(/\n/g, '<br/>');

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 720px; margin: 0 auto; color: #1f2937; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #0f172a; color: #ffffff; padding: 16px 22px;">
        <h2 style="margin: 0; font-size: 20px;">Scheduled Activity Reminder</h2>
      </div>

      <div style="padding: 20px 22px;">
        <p style="margin-top: 0;">Dear ${receiverName},</p>
        <p>
          This is a reminder regarding an activity scheduled for today. Please review the details below and ensure the required follow-up is completed on time.
        </p>

        <h3 style="margin-top: 24px; margin-bottom: 10px; font-size: 16px; color: #111827;">Contact Information</h3>
        <table style="border-collapse: collapse; width: 100%; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
          <tr><td style="padding: 10px 12px; width: 180px; border-bottom: 1px solid #e5e7eb;"><strong>Name</strong></td><td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${contactName}</td></tr>
          <tr><td style="padding: 10px 12px; width: 180px; border-bottom: 1px solid #e5e7eb;"><strong>Phone</strong></td><td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${contactPhone}</td></tr>
          <tr><td style="padding: 10px 12px; width: 180px;"><strong>Email</strong></td><td style="padding: 10px 12px;">${contactEmail}</td></tr>
        </table>

        <h3 style="margin-top: 24px; margin-bottom: 10px; font-size: 16px; color: #111827;">Activity Information</h3>
        <table style="border-collapse: collapse; width: 100%; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
          <tr><td style="padding: 10px 12px; width: 180px; border-bottom: 1px solid #e5e7eb;"><strong>Activity Type</strong></td><td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${toTitleCase(activityType)}</td></tr>
          <tr><td style="padding: 10px 12px; width: 180px; border-bottom: 1px solid #e5e7eb;"><strong>Due Date</strong></td><td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${dueDate}</td></tr>
          <tr><td style="padding: 10px 12px; width: 180px; border-bottom: 1px solid #e5e7eb;"><strong>Sender</strong></td><td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${senderName}</td></tr>
          <tr><td style="padding: 10px 12px; width: 180px; border-bottom: 1px solid #e5e7eb;"><strong>Sender Email</strong></td><td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${senderEmail}</td></tr>
          <tr><td style="padding: 10px 12px; width: 180px;"><strong>Notes</strong></td><td style="padding: 10px 12px;">${formattedMessage}</td></tr>
        </table>

        <p style="margin-top: 20px;">Regards,<br/><strong>Admin</strong></p>
      </div>

      <div style="padding: 12px 22px; background: #f1f5f9; border-top: 1px solid #e5e7eb; color: #475569; font-size: 12px;">
        This is an automated reminder email from KIT CRM.
      </div>
    </div>
  `;
};

const sendDailyActivityReminder = async () => {
  try {
    if (!process.env.USER_EMAIL || !process.env.USER_PASSWORD) {
      console.warn('Email scheduler skipped: USER_EMAIL or USER_PASSWORD is missing.');
      return;
    }

    const { nowUtc, startOfTodayUtc, endOfTodayUtc } = getIstDayWindow();

    const messages = await ContactMessages.find({
      msg_type: 'schedule_activity',
      activity_type: { $in: REMINDER_ACTIVITY_TYPES },
      status: 'active',
      deletedAt: null,
      created_by: { $ne: null },
      due_date: { $ne: null }
    })
      .populate('created_by')
      .populate('contact_id')
      .lean();

    const dueTodayMessages = messages.filter((item) => {
      const dueDateUtc = parseDueDateUtc(item?.due_date);
      if (!dueDateUtc) {
        return false;
      }

      const isTodaySchedule = dueDateUtc >= startOfTodayUtc && dueDateUtc <= endOfTodayUtc;
      if (!isTodaySchedule) {
        return false;
      }

      return isReminderDueNow(dueDateUtc, nowUtc);
    });

    let sentCount = 0;
    let skippedCount = 0;

    for (const entry of dueTodayMessages) {
      const isAlreadySent = await NotificationMessages.exists({ cm_id: entry._id });
      if (isAlreadySent) {
        skippedCount += 1;
        continue;
      }

      const receiverEmail = entry?.created_by?.email;
      if (!receiverEmail) {
        skippedCount += 1;
        continue;
      }

      const receiverName = getUserDisplayName(entry?.created_by);
      const contact = entry?.contact_id || {};
      const senderName = process.env.EMAIL_SENDER_NAME || 'KIT CRM Team';
      const senderEmail = process.env.EMAIL_SENDER_ADDRESS;

      const html = buildMailBody({
        receiverName,
        senderName,
        senderEmail,
        contactName: getContactDisplayName(contact),
        contactPhone: contact.phone || contact.alternate_phone || 'N/A',
        contactEmail: contact.email || 'N/A',
        activityType: entry.activity_type || 'N/A',
        dueDate: formatDueDateForMail(entry.due_date),
        message: entry.message || 'N/A'
      });

      try {
        const subject = `Action Required: ${toTitleCase(entry.activity_type)} scheduled for ${formatDueDateForMail(entry.due_date)}`;

        await sendEmail(
          receiverEmail,
          subject,
          html,
          {
            senderName,
            senderEmail
          }
        );

        await NotificationMessages.create({
          cm_id: entry._id,
          sender_name: senderName,
          sender_email: senderEmail,
          receiver_name: receiverName,
          receiver_email: receiverEmail,
          subject,
          mail_body: html,
          status: 'send'
        });

        sentCount += 1;
      } catch (error) {
        console.error(`Email sending failed for contact message ${entry._id}:`, error?.message || error);
      }
    }

    console.log(`Email scheduler completed. Eligible: ${dueTodayMessages.length}, sent: ${sentCount}, skipped: ${skippedCount}, leadMinutes: ${REMINDER_LEAD_MINUTES}.`);
  } catch (error) {
    console.error('Email scheduler failed:', error);
  }
};

const cronExpression = getCronExpression();

// Mode switch from .env:
// - SCHEDULE_CRON_MODE=every_2_minutes
// - SCHEDULE_CRON_MODE=before_schedule_59_minutes
// - SCHEDULE_CRON_MODE=before_schedule_1159pm
// Optional: SCHEDULE_REMINDER_LEAD_MINUTES=59
// Optional: SCHEDULE_TIMEZONE=Asia/Kolkata
// Optional override: SCHEDULE_CRON_EXPRESSION=<cron expression>
cron.schedule(cronExpression, sendDailyActivityReminder, { timezone: SCHEDULE_TIMEZONE });

console.log(`Email scheduler started with mode: ${SCHEDULE_CRON_MODE}, expression: ${cronExpression}`);