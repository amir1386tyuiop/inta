const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const where = {
      OR: [
        // Events for cases where user is the client
        { case: { clientId: req.user.id } },
        // Events for this lawyer
        ...(lawyerProfile ? [{ lawyerId: lawyerProfile.id }] : []),
      ],
    };

    if (req.query.status) where.status = req.query.status;

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        case: {
          select: { id: true, title: true, caseType: true, status: true, caseNumber: true },
        },
        lawyer: {
          include: { user: { select: { fullName: true } } },
        },
      },
      orderBy: { eventDate: 'asc' },
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function today(req, res, next) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const events = await prisma.calendarEvent.findMany({
      where: {
        eventDate: { gte: todayStart, lt: todayEnd },
        OR: [
          { case: { clientId: req.user.id } },
          ...(lawyerProfile ? [{ lawyerId: lawyerProfile.id }] : []),
        ],
      },
      include: {
        case: {
          include: {
            client: { select: { fullName: true, phone: true } },
            lawyer: { include: { user: { select: { fullName: true } } } },
          },
        },
      },
      orderBy: { eventDate: 'asc' },
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function byRange(req, res, next) {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'پارامترهای from و to الزامی هستند' });
    }

    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const events = await prisma.calendarEvent.findMany({
      where: {
        eventDate: { gte: new Date(from), lte: new Date(to) },
        OR: [
          { case: { clientId: req.user.id } },
          ...(lawyerProfile ? [{ lawyerId: lawyerProfile.id }] : []),
        ],
      },
      include: {
        case: { select: { id: true, title: true, caseType: true, caseNumber: true } },
        lawyer: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { eventDate: 'asc' },
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: req.params.id },
      include: {
        case: {
          include: {
            client: { select: { id: true, fullName: true, email: true, phone: true } },
            lawyer: {
              include: { user: { select: { fullName: true, email: true, phone: true } } },
            },
            documents: { select: { id: true, fileName: true, fileType: true, createdAt: true } },
            verdicts: { select: { id: true, judge: true, court: true, verdictDate: true } },
          },
        },
        lawyer: {
          include: { user: { select: { fullName: true, email: true, phone: true } } },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'رویداد یافت نشد' });
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, eventDate, eventTime, court, branch, caseId } = req.body;

    // Get lawyer profile if user is a lawyer
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        eventTime,
        court,
        branch,
        caseId,
        lawyerId: lawyerProfile?.id,
      },
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { title, description, eventDate, eventTime, court, branch, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (eventDate !== undefined) updateData.eventDate = new Date(eventDate);
    if (eventTime !== undefined) updateData.eventTime = eventTime;
    if (court !== undefined) updateData.court = court;
    if (branch !== undefined) updateData.branch = branch;
    if (status !== undefined) updateData.status = status;

    const event = await prisma.calendarEvent.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.calendarEvent.delete({ where: { id: req.params.id } });
    res.json({ message: 'رویداد با موفقیت حذف شد' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, today, byRange, getById, create, update, remove };
