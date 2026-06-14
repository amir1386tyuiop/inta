const { PrismaClient } = require('@prisma/client');
const { analyzeImage } = require('../services/aiService');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایلی آپلود نشده' });
    }

    const { caseId } = req.body;
    if (!caseId) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'شناسه پرونده الزامی است' });
    }

    // Verify case exists
    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'پرونده یافت نشد' });
    }

    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'document';

    const document = await prisma.document.create({
      data: {
        caseId,
        fileName: req.file.originalname,
        filePath: req.file.filename,
        fileType,
      },
    });

    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
}

async function listByCase(req, res, next) {
  try {
    const documents = await prisma.document.findMany({
      where: { caseId: req.params.caseId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'سند یافت نشد' });
    }

    res.json(document);
  } catch (err) {
    next(err);
  }
}

async function analyzeDocument(req, res, next) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'سند یافت نشد' });
    }

    if (document.fileType !== 'image') {
      return res.status(400).json({ error: 'فقط تصاویر قابل تحلیل هستند' });
    }

    // Read file and convert to base64
    const filePath = path.join(__dirname, '..', '..', 'uploads', document.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'فایل یافت نشد' });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');

    // Determine MIME type
    const ext = path.extname(document.filePath).toLowerCase();
    const mimeMap = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
    };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    const context = req.body.context || null;
    const analysis = await analyzeImage(base64, mimeType, context);

    // Save analysis
    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        aiAnalysis: analysis,
        extractedText: analysis, // AI extracts text as part of analysis
      },
    });

    res.json({ analysis, document: updated });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'سند یافت نشد' });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', '..', 'uploads', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.document.delete({ where: { id: req.params.id } });

    res.json({ message: 'سند با موفقیت حذف شد' });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadDocument, listByCase, getById, analyzeDocument, remove };
