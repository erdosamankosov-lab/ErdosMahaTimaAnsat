const express = require('express');
const { UniqueConstraintError, ForeignKeyConstraintError, ValidationError, DatabaseError } = require('sequelize');
const { sequelize, Course, Teacher, Student, Enrollment } = require('./db');

const app = express();
app.use(express.json());
const validId = value => /^[1-9]\d*$/.test(String(value)) && Number.isSafeInteger(Number(value));
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const validHours = value => Number.isInteger(value) && value > 0;
const validGrade = value => value === null || (Number.isInteger(value) && value >= 0 && value <= 100);
const dateValid = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value + 'T00:00:00Z').toISOString().slice(0,10) === value;
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/courses', wrap(async (req, res) => {
  res.json(await Course.findAll({ include: Teacher, order: [['id', 'ASC']] }));
}));

app.get('/courses/:id', wrap(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid course ID' });
  const course = await Course.findByPk(req.params.id, { include: Teacher });
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
}));

app.post('/courses', wrap(async (req, res) => {
  const { title, description, hours, teacherId } = req.body || {};
  if (!nonempty(title) || title.length > 200 || !validHours(hours) || !validId(teacherId) ||
      (description !== undefined && description !== null && typeof description !== 'string')) {
    return res.status(400).json({ error: 'Provide title, positive integer hours and valid teacherId' });
  }
  if (!await Teacher.findByPk(teacherId)) return res.status(404).json({ error: 'Teacher not found' });
  const course = await Course.create({ title: title.trim(), description: description ?? null, hours, teacherId });
  res.status(201).json(course);
}));

app.put('/courses/:id', wrap(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid course ID' });
  const course = await Course.findByPk(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const body = req.body || {};
  const keys = Object.keys(body);
  if (!keys.length || keys.some(k => !['title', 'description', 'hours', 'teacherId'].includes(k)) ||
      ('title' in body && (!nonempty(body.title) || body.title.length > 200)) ||
      ('hours' in body && !validHours(body.hours)) ||
      ('teacherId' in body && !validId(body.teacherId)) ||
      ('description' in body && body.description !== null && typeof body.description !== 'string')) {
    return res.status(400).json({ error: 'Invalid course update' });
  }
  if ('teacherId' in body && !await Teacher.findByPk(body.teacherId)) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  if ('title' in body) body.title = body.title.trim();
  await course.update(body);
  res.json(course);
}));

app.delete('/courses/:id', wrap(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid course ID' });
  const course = await Course.findByPk(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  await course.destroy(); // associated enrollments cascade in PostgreSQL
  res.status(200).json({ message: 'Course deleted', id: Number(req.params.id) });
}));

app.post('/enrollments', wrap(async (req, res) => {
  const { studentId, courseId, grade, enrolledAt } = req.body || {};
  if (!validId(studentId) || !validId(courseId) ||
      (grade !== undefined && !validGrade(grade)) ||
      (enrolledAt !== undefined && !dateValid(enrolledAt))) {
    return res.status(400).json({ error: 'Invalid enrollment data' });
  }
  if (!await Student.findByPk(studentId)) return res.status(404).json({ error: 'Student not found' });
  if (!await Course.findByPk(courseId)) return res.status(404).json({ error: 'Course not found' });
  const exists = await Enrollment.findOne({ where: { studentId, courseId } });
  if (exists) return res.status(409).json({ error: 'Student is already enrolled in this course' });
  const enrollment = await Enrollment.create({ studentId, courseId, grade: grade ?? null, ...(enrolledAt ? { enrolledAt } : {}) });
  res.status(201).json(enrollment);
}));

app.get('/students/:id/courses', wrap(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid student ID' });
  const student = await Student.findByPk(req.params.id, {
    include: [{ model: Course, through: { attributes: ['enrolledAt', 'grade'] } }]
  });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
}));

app.use((err, req, res, next) => {
  if (err instanceof UniqueConstraintError) return res.status(409).json({ error: 'Duplicate value or enrollment' });
  if (err instanceof ForeignKeyConstraintError) return res.status(409).json({ error: 'Foreign key constraint violation' });
  if (err instanceof ValidationError || err instanceof DatabaseError && err.parent?.code === '23514') {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ error: 'Malformed JSON' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT || 3000);
if (require.main === module) {
  sequelize.authenticate().then(() => {
    app.listen(PORT, () => console.log(`API ready: http://localhost:${PORT}/courses`));
  }).catch(err => { console.error('Database connection failed:', err); process.exitCode = 1; });
}
module.exports = app;
