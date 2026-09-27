# Ghana Basic School Backend Algorithm

This project follows a school-management workflow built around the Ghanaian basic school structure:

1. School setup and academic calendar
   - Create the school profile.
   - Set the active academic year and current term.
   - Maintain a term-based academic calendar so fees, exams, results, and attendance are always tied to a valid school period.

2. User and role lifecycle
   - Admins create and manage the system.
   - Teachers can manage assigned classes, attendance, exams, and results.
   - Students are enrolled to a class and linked to a parent profile.
   - Parents can view a child’s profile, fee records, and class information.

3. Student enrollment workflow
   - Validate the user exists and has a student role.
   - Ensure the student profile is unique.
   - Assign the student to one valid class.
   - Link to one or more parent profiles.
   - Capture admission date and active/inactive status.

4. Teaching and timetable logic
   - Validate the teacher profile exists.
   - Ensure subject and class are valid.
   - Create a unique teaching assignment per teacher/class/subject.
   - Restrict attendance and result entry to assigned classes and subjects.

5. Attendance logic
   - Attendance belongs to teacher, class, subject, and date.
   - Prevent duplicate attendance records for the same teacher/class/subject/date.
   - Validate each student belongs to the same class.
   - Allow only present/absent statuses.

6. Fee management workflow
   - Every student has fee obligations.
   - Fee entries are tied to a type, amount, due date, and status.
   - Keep outstanding amounts, partial payments, and balances updated.
   - Support payment references and modes such as cash, mobile money, bank transfer, and card.

7. Exam and result workflow
   - Exams are created by academic year, term, class, and subject.
   - Results are tied to a student, exam, and subject.
   - Grade is calculated using the configured grading scale from school settings.
   - Results can be published per exam and used for analytics.

8. Reporting and dashboard logic
   - Aggregate counts for active students, teachers, fees due, attendance rates, and exam summaries.
   - Use lean queries, indexes, and page/limit filtering to keep large datasets fast.
   - Return summary metrics by academic year and term for school management decisions.

9. Security and production rules
   - Use role-based access control for all routes.
   - Validate all Mongo IDs before queries.
   - Reject invalid or duplicate data early.
   - Keep database operations in a single, reusable connection layer.
   - Prefer lean reads, indexes, and controlled pagination for scale.

10. Implementation principle

- The system must always work as a real school administration platform, not just a CRUD app.
- Business rules are enforced before writes, and data relationships are valid before records are stored.
