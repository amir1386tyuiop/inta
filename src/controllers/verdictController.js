const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { analyzeVerdict } = require('../services/aiService');

const prisma = new PrismaClient();

async function listByCase(req, res, next) {
  try {
    const verdicts = await prisma.verdict.findMany({
      where: { caseId: req.params.caseId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(verdicts);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const verdict = await prisma.verdict.findUnique({
      where: { id: req.params.id },
      include: {
        case: { select: { title: true, caseType: true, status: true } },
      },
    });

    if (!verdict) {
      return res.status(404).json({ error: 'حکم یافت نشد' });
    }

    res.json(verdict);
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

    const { caseId, verdictText, judge, court, verdictDate } = req.body;

    // Verify case exists
    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return res.status(404).json({ error: 'پرونده یافت نشد' });
    }

    const verdict = await prisma.verdict.create({
      data: {
        caseId,
        verdictText,
        judge,
        court,
        verdictDate: verdictDate ? new Date(verdictDate) : null,
      },
    });

    res.status(201).json(verdict);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { verdictText, judge, court, verdictDate } = req.body;

    const updateData = {};
    if (verdictText !== undefined) updateData.verdictText = verdictText;
    if (judge !== undefined) updateData.judge = judge;
    if (court !== undefined) updateData.court = court;
    if (verdictDate !== undefined) updateData.verdictDate = new Date(verdictDate);

    const verdict = await prisma.verdict.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(verdict);
  } catch (err) {
    next(err);
  }
}

async function analyze(req, res, next) {
  try {
    const verdict = await prisma.verdict.findUnique({
      where: { id: req.params.id },
    });

    if (!verdict) {
      return res.status(404).json({ error: 'حکم یافت نشد' });
    }

    const analysis = await analyzeVerdict({
      verdictText: verdict.verdictText,
      judge: verdict.judge,
      court: verdict.court,
      verdictDate: verdict.verdictDate?.toISOString(),
    });

    const updated = await prisma.verdict.update({
      where: { id: req.params.id },
      data: { aiAnalysis: analysis },
    });

    res.json({ analysis, verdict: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { listByCase, getById, create, update, analyze };
