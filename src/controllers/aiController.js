const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { generalChat, searchSiteData } = require('../services/aiService');

const prisma = new PrismaClient();

async function chat(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, sessionId } = req.body;
    const userId = req.user.id;

    // Get or create session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!session) {
        return res.status(404).json({ error: 'جلسه چت یافت نشد' });
      }
    } else {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: message.substring(0, 100),
          messages: { create: [] },
        },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'user', content: message },
    });

    // Gather site context for AI
    const siteContext = await gatherSiteContext(userId);

    // Build message history
    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: 'user', content: message });

    // Get AI response
    const aiResponse = await generalChat(history, siteContext);

    // Save assistant message
    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'assistant', content: aiResponse },
    });

    res.json({
      sessionId: session.id,
      response: aiResponse,
    });
  } catch (err) {
    next(err);
  }
}

async function getSessions(req, res, next) {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });

    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

async function getSessionMessages(req, res, next) {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.sessionId, userId: req.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, role: true, content: true, createdAt: true },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'جلسه چت یافت نشد' });
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
}

async function searchWithAI(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query } = req.body;

    // Gather all site data
    const siteData = await gatherAllSiteData(query);

    // AI-powered search
    const result = await searchSiteData(query, siteData);

    res.json({ query, result });
  } catch (err) {
    next(err);
  }
}

async function gatherSiteContext(userId) {
  try {
    const [userCases, lawyers, recentBlogs] = await Promise.all([
      prisma.case.findMany({
        where: { clientId: userId },
        select: { title: true, caseType: true, status: true },
        take: 5,
      }),
      prisma.lawyerProfile.findMany({
        select: { specializations: true, city: true },
        take: 10,
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { title: true, category: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return JSON.stringify({ userCases, availableLawyers: lawyers, recentBlogs });
  } catch {
    return '';
  }
}

async function gatherAllSiteData(query) {
  const lowerQuery = query.toLowerCase();

  const [blogs, lawyers, cases] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: lowerQuery } },
          { content: { contains: lowerQuery } },
          { category: { contains: lowerQuery } },
        ],
      },
      select: { title: true, excerpt: true, category: true, slug: true },
      take: 10,
    }),
    prisma.lawyerProfile.findMany({
      where: {
        OR: [
          { specializations: { contains: lowerQuery } },
          { city: { contains: lowerQuery } },
        ],
      },
      include: { user: { select: { fullName: true } } },
      take: 10,
    }),
    prisma.case.findMany({
      where: {
        OR: [
          { title: { contains: lowerQuery } },
          { caseType: { contains: lowerQuery } },
        ],
      },
      select: { title: true, caseType: true, status: true },
      take: 10,
    }),
  ]);

  return { blogs, lawyers, cases };
}

module.exports = { chat, getSessions, getSessionMessages, searchWithAI };
