/** إعداد Tailwind للإنتاج — يفحص ملفات الموقع ويبني CSS مصغّرًا يحتوي المستخدم فقط */
module.exports = {
  content: ['./index.html', './admin.html'],
  theme: { extend: {} },
  plugins: []
};
