const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inta.ir' },
    update: {},
    create: {
      email: 'admin@inta.ir',
      password: adminPassword,
      fullName: 'مدیر سیستم',
      role: 'admin',
    },
  });

  // Create sample lawyer
  const lawyerPassword = await bcrypt.hash('lawyer123', 12);
  const lawyerUser = await prisma.user.upsert({
    where: { email: 'lawyer@inta.ir' },
    update: {},
    create: {
      email: 'lawyer@inta.ir',
      password: lawyerPassword,
      fullName: 'دکتر احمد محمدی',
      phone: '09121234567',
      role: 'lawyer',
    },
  });

  const lawyerProfile = await prisma.lawyerProfile.upsert({
    where: { userId: lawyerUser.id },
    update: {},
    create: {
      userId: lawyerUser.id,
      licenseNumber: '12345',
      specializations: 'کیفری,حقوقی,خانواده',
      city: 'تهران',
      province: 'تهران',
      experienceYears: 15,
      bio: 'وکیل پایه یک دادگستری با ۱۵ سال سابقه',
      isVerified: true,
      rating: 4.8,
    },
  });

  // Create sample client
  const clientPassword = await bcrypt.hash('client123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@inta.ir' },
    update: {},
    create: {
      email: 'client@inta.ir',
      password: clientPassword,
      fullName: 'علی رضایی',
      phone: '09129876543',
      role: 'client',
    },
  });

  // Create sample blog posts
  await prisma.blogPost.upsert({
    where: { slug: 'rights-of-accused' },
    update: {},
    create: {
      title: 'حقوق متهم در قانون آیین دادرسی کیفری',
      slug: 'rights-of-accused',
      content: 'متهم در قانون آیین دادرسی کیفری دارای حقوق متعددی است که شامل حق داشتن وکیل، حق سکوت، حق اطلاع از اتهامات و ...',
      excerpt: 'آشنایی با حقوق متهم در فرآیند دادرسی کیفری',
      category: 'کیفری',
      tags: 'حقوق متهم,دادرسی کیفری,وکیل',
      authorName: 'مدیر سیستم',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: 'divorce-process' },
    update: {},
    create: {
      title: 'مراحل طلاق توافقی در ایران',
      slug: 'divorce-process',
      content: 'طلاق توافقی یکی از انواع طلاق در حقوق ایران است که در آن زوجین با توافق یکدیگر و تعیین تکلیف حقوق مالی اقدام به طلاق می‌کنند...',
      excerpt: 'راهنمای کامل مراحل طلاق توافقی',
      category: 'خانواده',
      tags: 'طلاق,خانواده,توافقی',
      authorName: 'مدیر سیستم',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  // Create sample case
  const sampleCase = await prisma.case.upsert({
    where: { caseNumber: 'CASE-2024-001' },
    update: {},
    create: {
      title: 'دعوای مطالبه خسارت',
      description: 'دعوای مطالبه خسارت ناشی از تصادف رانندگی در تاریخ ۱۴۰۳/۰۱/۱۵',
      caseNumber: 'CASE-2024-001',
      caseType: 'حقوقی',
      status: 'in_progress',
      clientId: client.id,
      lawyerId: lawyerProfile.id,
    },
  });

  // Create sample calendar event
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await prisma.calendarEvent.create({
    data: {
      title: 'جلسه رسیدگی - دعوای مطالبه خسارت',
      description: 'جلسه اول رسیدگی به پرونده',
      eventDate: tomorrow,
      eventTime: '10:00',
      court: 'دادگاه حقوقی تهران',
      branch: 'شعبه ۱۲',
      caseId: sampleCase.id,
      lawyerId: lawyerProfile.id,
    },
  });

  console.log('Seed completed!');
  console.log('Admin: admin@inta.ir / admin123');
  console.log('Lawyer: lawyer@inta.ir / lawyer123');
  console.log('Client: client@inta.ir / client123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
