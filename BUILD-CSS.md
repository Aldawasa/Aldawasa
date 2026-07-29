# بناء ملف Tailwind CSS

الموقع يستخدم ملف CSS مبني مسبقًا (`tailwind.css`) بدل تحميل Tailwind من CDN،
وهذا يجعل التحميل أسرع بشكل واضح على الجوال.

## ⚠️ مهم
إذا أضفت **كلاس Tailwind جديد** في `index.html` أو `admin.html`،
لازم تعيد بناء الملف وإلا الكلاس الجديد ما يكون له تنسيق:

```bash
npm install -D tailwindcss@3.4.17
npx tailwindcss -c tailwind.config.js -i src/input.css -o tailwind.css --minify
```

ثم اعمل commit للملف `tailwind.css`.
