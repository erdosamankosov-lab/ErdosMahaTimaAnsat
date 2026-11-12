require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Copy .env.example to .env and set your Neon URL.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: true } }
});
const opts = (tableName) => ({ tableName, underscored: true, timestamps: false });

const Teacher = sequelize.define('Teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true }
}, opts('teachers'));

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  studentGroup: { type: DataTypes.STRING(50), allowNull: false, field: 'student_group' }
}, opts('students'));

const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  hours: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  teacherId: { type: DataTypes.INTEGER, allowNull: false, field: 'teacher_id' }
}, opts('courses'));

const Enrollment = sequelize.define('Enrollment', {
  studentId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, field: 'student_id' },
  courseId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, field: 'course_id' },
  enrolledAt: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW, field: 'enrolled_at' },
  grade: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 0, max: 100 } }
}, opts('enrollments'));

Teacher.hasMany(Course, { foreignKey: 'teacherId' });
Course.belongsTo(Teacher, { foreignKey: 'teacherId' });
Student.hasMany(Enrollment, { foreignKey: 'studentId' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });
Student.belongsToMany(Course, { through: Enrollment, foreignKey: 'studentId', otherKey: 'courseId' });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: 'courseId', otherKey: 'studentId' });

module.exports = { sequelize, Teacher, Student, Course, Enrollment };
