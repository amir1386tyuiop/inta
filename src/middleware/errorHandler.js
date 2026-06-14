function errorHandler(err, _req, res, _next) {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({ error: 'دسترسی غیرمجاز' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'این رکورد قبلاً ثبت شده است' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'رکورد مورد نظر یافت نشد' });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production'
      ? 'خطای سرور'
      : err.message,
  });
}

module.exports = { errorHandler };
