const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function globalSearch(req, res, next) {
  try {
    const { q, type } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'عبارت جستجو الزامی است' });
    }

    const query = q.toLowerCase();
    const results = {};

    // Search based on type filter or all
    const searchAll = !type;

    if (searchAll || type === 'blogs') {
      results.blogs = await prisma.blogPost.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { category: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        select: { id: true, title: true, slug: true, excerpt: true, category: true },
        take: 10,
      });
    }

    if (searchAll || type === 'lawyers') {
      results.lawyers = await prisma.lawyerProfile.findMany({
        where: {
          isVerified: true,
          OR: [
            { specializations: { contains: query } },
            { city: { contains: query } },
            { province: { contains: query } },
            { bio: { contains: query } },
            { user: { fullName: { contains: query } } },
          ],
        },
        include: { user: { select: { fullName: true } } },
        take: 10,
      });
    }

    if (searchAll || type === 'cases') {
      results.cases = await prisma.case.findMany({
        where: {
          OR: [
            { clientId: req.user.id },
            { lawyer: { userId: req.user.id } },
          ],
          AND: {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
              { caseType: { contains: query } },
              { caseNumber: { contains: query } },
            ],
          },
        },
        select: { id: true, title: true, caseType: true, status: true, caseNumber: true },
        take: 10,
      });
    }

    res.json({ query: q, results });
  } catch (err) {
    next(err);
  }
}

module.exports = { globalSearch };
