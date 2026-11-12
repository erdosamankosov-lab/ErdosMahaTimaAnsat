const express = require('express');
const router = express.Router();

// Деректер жедел жадта сақталады, сервер қайта қосылса бастапқы күйге оралады.
let courses = [
  { id: 1, name: 'JavaScript негіздері', teacher: 'Айгүл Нұрланқызы', credits: 3 },
  { id: 2, name: 'Дерекқорлар', teacher: 'Ерлан Серікұлы', credits: 4 },
  { id: 3, name: 'Web бағдарламалау', teacher: 'Дана Болатқызы', credits: 5 }
];
let nextId = 4;

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const validId = (raw) => /^(?:[1-9]\d*)$/.test(raw) && Number.isSafeInteger(Number(raw));

function validateCourse(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'JSON объект жіберіңіз' });
  }
  const allowed = ['name', 'teacher', 'credits'];
  if (Object.keys(body).some(k => !allowed.includes(k))) {
    return res.status(400).json({ error: 'Рұқсат етілген өрістер: name, teacher, credits' });
  }
  if (req.method === 'PUT' || req.method === 'POST') {
    if (allowed.some(k => !has(body, k))) {
      return res.status(400).json({ error: 'name, teacher, credits міндетті' });
    }
  } else if (Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'PATCH үшін кемінде бір өріс керек' });
  }
  if (has(body, 'name') && (typeof body.name !== 'string' || !body.name.trim())) {
    return res.status(400).json({ error: 'name бос емес мәтін болуы керек' });
  }
  if (has(body, 'teacher') && (typeof body.teacher !== 'string' || !body.teacher.trim())) {
    return res.status(400).json({ error: 'teacher бос емес мәтін болуы керек' });
  }
  if (has(body, 'credits') && (!Number.isInteger(body.credits) || body.credits <= 0)) {
    return res.status(400).json({ error: 'credits оң бүтін сан болуы керек' });
  }
  next();
}

router.get('/', (req, res) => {
  let result = courses;
  if (req.query.search !== undefined) {
    if (typeof req.query.search !== 'string') return res.status(400).json({ error: 'search мәтін болуы керек' });
    const term = req.query.search.toLocaleLowerCase();
    result = result.filter(c => c.name.toLocaleLowerCase().includes(term) || c.teacher.toLocaleLowerCase().includes(term));
  }
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ error: 'page >= 1 және 1 <= limit <= 100 болуы керек' });
  }
  // Негізгі GET массив қайтарады; page және limit арқылы беттеуге болады.
  res.json(result.slice((page - 1) * limit, page * limit));
});

router.get('/:id', (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'id оң бүтін сан болуы керек' });
  const course = courses.find(c => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: 'Курс табылмады' });
  res.json(course);
});

router.post('/', validateCourse, (req, res) => {
  const { name, teacher, credits } = req.body;
  const course = { id: nextId++, name: name.trim(), teacher: teacher.trim(), credits };
  courses.push(course);
  res.status(201).json(course);
});

router.put('/:id', validateCourse, (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'id оң бүтін сан болуы керек' });
  const index = courses.findIndex(c => c.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Курс табылмады' });
  const { name, teacher, credits } = req.body;
  courses[index] = { id: courses[index].id, name: name.trim(), teacher: teacher.trim(), credits };
  res.json(courses[index]);
});

router.patch('/:id', validateCourse, (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'id оң бүтін сан болуы керек' });
  const course = courses.find(c => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: 'Курс табылмады' });
  for (const key of ['name', 'teacher', 'credits']) {
    if (has(req.body, key)) course[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
  }
  res.json(course);
});

router.delete('/:id', (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'id оң бүтін сан болуы керек' });
  const index = courses.findIndex(c => c.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Курс табылмады' });
  courses.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
