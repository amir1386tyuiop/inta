const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function submit(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, phone, subject, message } = req.body;

    const contact = await prisma.contactMessage.create({
      data: { fullName, email, phone, subject, message },
    });

    res.status(201).json({
      message: 'پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.',
      id: contact.id,
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    res.json({
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function reply(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: {
        reply: req.body.reply,
        status: 'replied',
      },
    });

    res.json(contact);
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, list, reply };
