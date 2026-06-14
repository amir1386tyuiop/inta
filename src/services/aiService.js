const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  return key;
}

async function chatCompletion(messages, options = {}) {
  const model = options.model || process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
      'HTTP-Referer': 'https://inta.ir',
      'X-Title': 'Inta Legal Platform',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function analyzeCase(caseData) {
  const systemPrompt = `تو یک وکیل و مشاور حقوقی حرفه‌ای ایرانی هستی. وظیفه تو تحلیل پرونده‌های حقوقی است.
تحلیل خود را به فارسی و به صورت ساختاریافته ارائه بده شامل:
1. خلاصه پرونده
2. نقاط قوت پرونده
3. نقاط ضعف و ریسک‌ها
4. پیشنهادات و راهکارها
5. مواد قانونی مرتبط
6. پیش‌بینی نتیجه`;

  const userMessage = `لطفاً این پرونده را تحلیل کن:
عنوان: ${caseData.title}
نوع: ${caseData.caseType}
شرح: ${caseData.description}
${caseData.additionalInfo ? `اطلاعات تکمیلی: ${caseData.additionalInfo}` : ''}`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);
}

async function summarizeCase(caseData) {
  const systemPrompt = `تو یک وکیل حرفه‌ای ایرانی هستی. وظیفه تو خلاصه‌سازی پرونده‌های حقوقی است.
خلاصه باید مختصر، دقیق و شامل نکات کلیدی باشد.`;

  const userMessage = `لطفاً خلاصه‌ای از این پرونده ارائه بده:
عنوان: ${caseData.title}
نوع: ${caseData.caseType}
شرح: ${caseData.description}
وضعیت: ${caseData.status}
${caseData.aiAnalysis ? `تحلیل قبلی: ${caseData.aiAnalysis}` : ''}`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);
}

async function analyzeVerdict(verdictData) {
  const systemPrompt = `تو یک حقوقدان و تحلیلگر احکام قضایی ایرانی هستی.
تحلیل حکم را به فارسی و شامل موارد زیر ارائه بده:
1. خلاصه حکم
2. مبانی قانونی حکم
3. نقاط قابل اعتراض
4. مقایسه با رویه قضایی
5. پیشنهاد برای مراحل بعدی (تجدیدنظر، فرجام‌خواهی و غیره)`;

  const userMessage = `لطفاً این حکم را تحلیل کن:
متن حکم: ${verdictData.verdictText}
${verdictData.judge ? `قاضی: ${verdictData.judge}` : ''}
${verdictData.court ? `دادگاه: ${verdictData.court}` : ''}
${verdictData.verdictDate ? `تاریخ: ${verdictData.verdictDate}` : ''}`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);
}

async function analyzeImage(imageBase64, mimeType, context) {
  const model = process.env.OPENROUTER_VISION_MODEL || 'google/gemini-2.0-flash-001';

  const systemPrompt = `تو یک دستیار حقوقی هوشمند هستی. وظیفه تو تحلیل تصاویر اسناد حقوقی است.
اگر تصویر شامل متن فارسی یا عربی است، متن را استخراج کن.
سپس تحلیل حقوقی مختصری از محتوای سند ارائه بده.`;

  const userContent = [
    {
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${imageBase64}` },
    },
  ];

  if (context) {
    userContent.unshift({ type: 'text', text: context });
  } else {
    userContent.unshift({ type: 'text', text: 'لطفاً این تصویر سند حقوقی را تحلیل کن و متن آن را استخراج کن.' });
  }

  return chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    { model }
  );
}

async function searchSiteData(query, siteData) {
  const systemPrompt = `تو دستیار هوشمند پلتفرم حقوقی اینتا هستی.
بر اساس داده‌های سایت که در اختیارت قرار می‌گیرد، به سؤال کاربر پاسخ بده.
پاسخ باید دقیق، مرتبط و به فارسی باشد.
اگر اطلاعات کافی در داده‌های سایت نیست، این موضوع را اعلام کن.`;

  const userMessage = `سؤال کاربر: ${query}

داده‌های مرتبط از سایت:
${JSON.stringify(siteData, null, 2)}`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);
}

async function generalChat(messages, siteContext) {
  const systemPrompt = `تو دستیار هوشمند حقوقی پلتفرم اینتا هستی. وظایف تو:
1. پاسخ به سؤالات حقوقی کاربران
2. راهنمایی در مورد مراحل قانونی
3. کمک در پیدا کردن وکیل مناسب
4. توضیح قوانین و مقررات
5. کمک در تحلیل پرونده و حکم

${siteContext ? `اطلاعات سایت برای رفرنس:\n${siteContext}` : ''}

همیشه به فارسی پاسخ بده و تأکید کن که پاسخ‌هایت جایگزین مشاوره حقوقی حرفه‌ای نیست.`;

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  return chatCompletion(chatMessages);
}

module.exports = {
  chatCompletion,
  analyzeCase,
  summarizeCase,
  analyzeVerdict,
  analyzeImage,
  searchSiteData,
  generalChat,
};
