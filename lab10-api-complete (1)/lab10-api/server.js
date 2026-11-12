const express = require('express');
const cors = require('cors');
const coursesRouter = require('./routes/courses');

const app = express();
app.use(cors());
app.use(express.json());

// Әр сұраныстың әдісін, URL-ін және уақытын журналға шығару.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/courses', coursesRouter);
app.use((req, res) => res.status(404).json({ error: 'Маршрут табылмады' }));
// JSON синтаксисі және басқа күтпеген қателер.
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON форматы қате' });
  }
  return res.status(err.status >= 400 && err.status < 600 ? err.status : 500)
    .json({ error: err.status === 500 || !err.status ? 'Сервердің ішкі қатесі' : err.message });
});

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => console.log(`API: http://localhost:${PORT}/api/courses`));
}
module.exports = app;
