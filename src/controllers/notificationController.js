const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (req.query.unread === 'true') where.isRead = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          calendarEvent: {
            select: {
              id: true, title: true, eventDate: true, eventTime: true,
              court: true, branch: true, status: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function unreadCount(req, res, next) {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({ count });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        calendarEvent: {
          include: {
            case: {
              include: {
                client: { select: { id: true, fullName: true, email: true, phone: true } },
                lawyer: {
                  include: { user: { select: { fullName: true, email: true, phone: true } } },
                },
                documents: {
                  select: { id: true, fileName: true, fileType: true, createdAt: true },
                },
                verdicts: {
                  select: { id: true, judge: true, court: true, verdictDate: true, aiAnalysis: true },
                },
                calendarEvents: {
                  select: { id: true, title: true, eventDate: true, eventTime: true, status: true },
                  orderBy: { eventDate: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!notification) {
      return res.status(404).json({ error: 'نوتیفیکیشن یافت نشد' });
    }

    // Auto mark as read
    if (!notification.isRead) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { isRead: true },
      });
    }

    // Parse metadata for case summary
    let metadata = null;
    if (notification.metadata) {
      try {
        metadata = JSON.parse(notification.metadata);
      } catch {
        metadata = null;
      }
    }

    res.json({ ...notification, parsedMetadata: metadata });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });

    res.json({ message: 'خوانده شد' });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'همه نوتیفیکیشن‌ها خوانده شدند' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, unreadCount, getById, markAsRead, markAllAsRead };
