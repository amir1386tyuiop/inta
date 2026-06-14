const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { analyzeCase, summarizeCase } = require('../services/aiService');

const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Show cases belonging to the user (as client or as lawyer)
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const where = {
      OR: [
        { clientId: req.user.id },
        ...(lawyerProfile ? [{ lawyerId: lawyerProfile.id }] : []),
      ],
    };

    if (req.query.status) where.status = req.query.status;
    if (req.query.caseType) where.caseType = req.query.caseType;

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          client: { select: { fullName: true, email: true } },
          lawyer: { include: { user: { select: { fullName: true } } } },
          _count: { select: { documents: true, verdicts: true, calendarEvents: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.case.count({ where }),
    ]);

    res.json({
      cases,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        lawyer: {
          include: { user: { select: { fullName: true, email: true, phone: true } } },
        },
        documents: { orderBy: { createdAt: 'desc' } },
        verdicts: { orderBy: { createdAt: 'desc' } },
        calendarEvents: { orderBy: { eventDate: 'asc' } },
      },
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'پرونده یافت نشد' });
    }

    // Check access
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const hasAccess =
      caseItem.clientId === req.user.id ||
      (lawyerProfile && caseItem.lawyerId === lawyerProfile.id) ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    res.json(caseItem);
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

    const { title, description, caseNumber, caseType } = req.body;

    const caseItem = await prisma.case.create({
      data: {
        title,
        description,
        caseNumber,
        caseType,
        clientId: req.user.id,
      },
    });

    res.status(201).json(caseItem);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { title, description, caseNumber, caseType, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (caseNumber !== undefined) updateData.caseNumber = caseNumber;
    if (caseType !== undefined) updateData.caseType = caseType;
    if (status !== undefined) updateData.status = status;

    const caseItem = await prisma.case.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(caseItem);
  } catch (err) {
    next(err);
  }
}

async function analyze(req, res, next) {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: req.params.id },
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'پرونده یافت نشد' });
    }

    const analysis = await analyzeCase({
      title: caseItem.title,
      caseType: caseItem.caseType,
      description: caseItem.description,
      additionalInfo: req.body.additionalInfo,
    });

    // Save analysis to case
    const updated = await prisma.case.update({
      where: { id: req.params.id },
      data: { aiAnalysis: analysis },
    });

    res.json({ analysis, case: updated });
  } catch (err) {
    next(err);
  }
}

async function summarize(req, res, next) {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: req.params.id },
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'پرونده یافت نشد' });
    }

    const summary = await summarizeCase(caseItem);

    const updated = await prisma.case.update({
      where: { id: req.params.id },
      data: { aiSummary: summary },
    });

    res.json({ summary, case: updated });
  } catch (err) {
    next(err);
  }
}

async function assignLawyer(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lawyerId } = req.body;

    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: lawyerId },
    });
    if (!lawyer) {
      return res.status(404).json({ error: 'وکیل یافت نشد' });
    }

    const caseItem = await prisma.case.update({
      where: { id: req.params.id },
      data: { lawyerId, status: 'in_progress' },
      include: {
        lawyer: { include: { user: { select: { fullName: true } } } },
      },
    });

    res.json(caseItem);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, analyze, summarize, assignLawyer };
