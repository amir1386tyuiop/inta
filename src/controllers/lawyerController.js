const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function search(req, res, next) {
  try {
    const {
      specialization, city, province, page: pageStr, limit: limitStr,
    } = req.query;

    const page = parseInt(pageStr) || 1;
    const limit = parseInt(limitStr) || 10;
    const skip = (page - 1) * limit;

    const where = { isVerified: true };
    if (specialization) {
      where.specializations = { contains: specialization };
    }
    if (city) where.city = city;
    if (province) where.province = province;

    const [lawyers, total] = await Promise.all([
      prisma.lawyerProfile.findMany({
        where,
        include: { user: { select: { fullName: true, email: true, phone: true } } },
        orderBy: { rating: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lawyerProfile.count({ where }),
    ]);

    res.json({
      lawyers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { fullName: true, email: true, phone: true } } },
    });

    if (!lawyer) {
      return res.status(404).json({ error: 'وکیل یافت نشد' });
    }

    res.json(lawyer);
  } catch (err) {
    next(err);
  }
}

async function createProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existing = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ error: 'پروفایل وکالت قبلاً ایجاد شده' });
    }

    const { licenseNumber, specializations, city, province, experienceYears, bio } = req.body;

    const profile = await prisma.lawyerProfile.create({
      data: {
        userId: req.user.id,
        licenseNumber,
        specializations,
        city,
        province,
        experienceYears: experienceYears || 0,
        bio,
      },
      include: { user: { select: { fullName: true, email: true } } },
    });

    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { specializations, city, province, experienceYears, bio } = req.body;

    const profile = await prisma.lawyerProfile.update({
      where: { userId: req.user.id },
      data: { specializations, city, province, experienceYears, bio },
      include: { user: { select: { fullName: true, email: true } } },
    });

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    const profile = await prisma.lawyerProfile.update({
      where: { id: req.params.id },
      data: { isVerified: true },
    });

    res.json({ message: 'وکیل با موفقیت تأیید شد', profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { search, getById, createProfile, updateProfile, verify };
