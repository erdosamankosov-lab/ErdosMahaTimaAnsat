-- 1. WHERE + ORDER BY + LIMIT: the three longest courses above 30 hours.
SELECT id, title, hours FROM courses WHERE hours > 30 ORDER BY hours DESC LIMIT 3;

-- 2. INNER JOIN: each course and its teacher.
SELECT c.id, c.title, t.full_name AS teacher_name
FROM courses c INNER JOIN teachers t ON t.id = c.teacher_id ORDER BY c.id;

-- 3. LEFT JOIN: courses without enrollments.
SELECT c.id, c.title FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
WHERE e.course_id IS NULL ORDER BY c.id;

-- 4. Three-table JOIN: student, course, grade.
SELECT s.full_name AS student, c.title AS course, e.grade
FROM students s JOIN enrollments e ON e.student_id = s.id
JOIN courses c ON c.id = e.course_id ORDER BY s.id, c.id;

-- 5. GROUP BY + HAVING: courses with average graded score > 70.
SELECT c.id, c.title, ROUND(AVG(e.grade), 2) AS average_grade
FROM courses c JOIN enrollments e ON e.course_id = c.id
WHERE e.grade IS NOT NULL
GROUP BY c.id, c.title HAVING AVG(e.grade) > 70 ORDER BY average_grade DESC;

-- 6. Subquery: students with a grade above the global average.
SELECT DISTINCT s.id, s.full_name FROM students s
JOIN enrollments e ON e.student_id = s.id
WHERE e.grade > (SELECT AVG(grade) FROM enrollments WHERE grade IS NOT NULL)
ORDER BY s.id;

-- 7. Conditional UPDATE; wrapped in a rollback so the sample stays unchanged.
BEGIN;
UPDATE enrollments SET grade = 88 WHERE student_id = 2 AND course_id = 1;
SELECT * FROM enrollments WHERE student_id = 2 AND course_id = 1;
ROLLBACK;

-- 8. Conditional DELETE; rollback keeps the seeded record.
BEGIN;
DELETE FROM enrollments WHERE student_id = 4 AND course_id = 2;
ROLLBACK;

-- 9. Transaction: enroll a student and assign a grade atomically.
-- Choose a student/course pair that is not already enrolled.
BEGIN;
INSERT INTO enrollments (student_id, course_id, enrolled_at, grade)
VALUES (5, 3, CURRENT_DATE, NULL);
UPDATE enrollments SET grade = 90 WHERE student_id = 5 AND course_id = 3;
COMMIT;
-- To test rollback instead, replace COMMIT with ROLLBACK before running.
-- Re-running this example requires removing (5,3) or changing the pair.

-- BONUS: compare query plans before and after adding an index.
-- Small sample tables may still use sequential scans; this is normal.
EXPLAIN ANALYZE SELECT * FROM enrollments WHERE course_id = 2;
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
EXPLAIN ANALYZE SELECT * FROM enrollments WHERE course_id = 2;
