const { sequelize, Teacher, Student, Course, Enrollment } = require('./db');

async function main() {
  await sequelize.authenticate();
  console.log('Database connection OK');

  const courses = await Course.findAll({ include: Teacher, order: [['id', 'ASC']] });
  console.log('Courses with teachers:', JSON.stringify(courses, null, 2));

  const course = await Course.findByPk(1, { include: [{ model: Student, through: { attributes: ['grade', 'enrolledAt'] } }] });
  console.log('Course students with grades:', JSON.stringify(course, null, 2));

  // Safe repeatable demonstration: create, change grade, remove enrollment and student.
  const uniqueEmail = `demo.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
  const student = await Student.create({ fullName: 'Тест Студент', email: uniqueEmail, studentGroup: 'DEMO' });
  try {
    const firstCourse = await Course.findOne({ order: [['id', 'ASC']] });
    if (!firstCourse) throw new Error('No courses. Run schema.sql and seed.sql first.');
    const enrollment = await Enrollment.create({ studentId: student.id, courseId: firstCourse.id, enrolledAt: new Date().toISOString().slice(0, 10) });
    console.log('Created enrollment:', enrollment.toJSON());
    await enrollment.update({ grade: 92 });
    console.log('Updated grade:', enrollment.grade);
    await enrollment.destroy();
    console.log('Enrollment deleted');
  } finally {
    await student.destroy();
    console.log('Demo student deleted');
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; })
  .finally(async () => { await sequelize.close(); });
