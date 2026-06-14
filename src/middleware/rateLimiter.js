const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'تعداد درخواست‌های AI بیش از حد مجاز است.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { rateLimiter, aiRateLimiter };
