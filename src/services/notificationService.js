const cron = require('node-cron');
const { summarizeCase } = require('./aiService');

let schedulerStarted = false;

function startNotificationScheduler(prisma) {
  if (schedulerStarted) return;
  schedulerStarted = true;

  // Run daily at 7:00 AM
  cron.schedule('0 7 * * *', async () => {
    console.log('Running daily notification check...');
    try {
      await sendDailyCourtReminders(prisma);
    } catch (err) {
      console.error('Notification scheduler error:', err.message);
    }
  });

  console.log('Notification scheduler started (daily at 07:00)');
}

async function sendDailyCourtReminders(prisma) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find today's calendar events
  const events = await prisma.calendarEvent.findMany({
    where: {
      eventDate: { gte: today, lt: tomorrow },
      status: 'scheduled',
    },
    include: {
      case: {
        include: {
          client: { select: { id: true, fullName: true } },
          lawyer: {
            include: { user: { select: { id: true, fullName: true } } },
          },
        },
      },
      lawyer: {
        include: { user: { select: { id: true, fullName: true } } },
      },
    },
  });

  for (const event of events) {
    const recipientIds = new Set();
    let caseSummary = '';

    // Generate AI summary if case exists
    if (event.case) {
      try {
        caseSummary = await summarizeCase(event.case);
      } catch {
        caseSummary = event.case.description || '';
      }

      // Notify client
      if (event.case.clientId) {
        recipientIds.add(event.case.clientId);
      }
      // Notify lawyer user
      if (event.case.lawyer?.user?.id) {
        recipientIds.add(event.case.lawyer.user.id);
      }
    }

    // Also notify event's lawyer
    if (event.lawyer?.user?.id) {
      recipientIds.add(event.lawyer.user.id);
    }

    const metadata = JSON.stringify({
      eventId: event.id,
      caseId: event.caseId,
      court: event.court,
      branch: event.branch,
      eventTime: event.eventTime,
      caseSummary,
      caseTitle: event.case?.title,
      caseType: event.case?.caseType,
      caseStatus: event.case?.status,
      caseDescription: event.case?.description,
      aiAnalysis: event.case?.aiAnalysis,
    });

    for (const userId of recipientIds) {
      await prisma.notification.create({
        data: {
          userId,
          title: `یادآوری جلسه دادگاه: ${event.title}`,
          message: `جلسه دادگاه امروز ساعت ${event.eventTime || 'نامشخص'} - ${event.court || ''} ${event.branch || ''}`,
          type: 'court_reminder',
          calendarEventId: event.id,
          metadata,
        },
      });
    }
  }

  console.log(`Sent reminders for ${events.length} court events`);
}

async function createNotification(prisma, { userId, title, message, type, calendarEventId, metadata }) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type || 'general',
      calendarEventId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

module.exports = {
  startNotificationScheduler,
  sendDailyCourtReminders,
  createNotification,
};
