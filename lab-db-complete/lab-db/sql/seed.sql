-- Execute after schema.sql. Each table receives at least 4 sample rows.
INSERT INTO teachers (id, full_name, email) VALUES
(1, 'Айгүл Сәрсенова', 'aigul.teacher@example.com'),
(2, 'Ерлан Нұрланов', 'erlan.teacher@example.com'),
(3, 'Дана Омарова', 'dana.teacher@example.com'),
(4, 'Марат Әлиев', 'marat.teacher@example.com');

INSERT INTO students (id, full_name, email, student_group) VALUES
(1, 'Аружан Ермек', 'aruzhan.student@example.com', 'IT-101'),
(2, 'Нұрсұлтан Әділ', 'nursultan.student@example.com', 'IT-101'),
(3, 'Мадина Болат', 'madina.student@example.com', 'IT-102'),
(4, 'Әлихан Руслан', 'alikhan.student@example.com', 'IT-102'),
(5, 'Алина Серік', 'alina.student@example.com', 'IT-103');

INSERT INTO courses (id, title, description, hours, teacher_id) VALUES
(1, 'PostgreSQL негіздері', 'Реляциялық дерекқорлар мен SQL', 48, 1),
(2, 'Node.js және API', 'Express көмегімен REST API', 40, 2),
(3, 'JavaScript', 'JavaScript тіліне кіріспе', 32, 3),
(4, 'Деректерді талдау', 'SQL және аналитика', 24, 1),
(5, 'Python негіздері', 'Python бағдарламалау', 36, 4);

INSERT INTO enrollments (student_id, course_id, enrolled_at, grade) VALUES
(1, 1, '2026-09-01', 95),
(2, 1, '2026-09-02', 80),
(3, 2, '2026-09-03', 75),
(4, 2, '2026-09-04', 65),
(1, 3, '2026-09-05', NULL);

-- Keep identity sequences aligned with explicitly supplied IDs.
SELECT setval(pg_get_serial_sequence('teachers', 'id'), (SELECT MAX(id) FROM teachers));
SELECT setval(pg_get_serial_sequence('students', 'id'), (SELECT MAX(id) FROM students));
SELECT setval(pg_get_serial_sequence('courses', 'id'), (SELECT MAX(id) FROM courses));
