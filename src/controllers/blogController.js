const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const where = { isPublished: true };
    if (category) {
      where.category = category;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, title: true, slug: true, excerpt: true,
          category: true, tags: true, authorName: true,
          publishedAt: true, createdAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
    });

    if (!post) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }

    res.json(post);
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

    const { title, content, excerpt, category, tags, isPublished } = req.body;
    let slug = slugify(title);

    // Ensure unique slug
    const existingSlug = await prisma.blogPost.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200),
        category,
        tags,
        authorName: req.user.email,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { title, content, excerpt, category, tags, isPublished } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished) updateData.publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ message: 'مقاله با موفقیت حذف شد' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getBySlug, create, update, remove };
