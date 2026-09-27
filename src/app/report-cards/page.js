"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  student: "",
  academicYear: "",
  term: "",
  classId: "",
  subjects: [{ subject: "", score: "", remark: "" }],
  remarks: "",
  status: "published",
};

export default function ReportCardsPage() {
  const [items, setItems] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [termOptions, setTermOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const fetchReportCards = async () => {
    try {
      const res = await fetch("/api/report-cards", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setItems([]);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [studentsRes, yearsRes, termsRes, classesRes, subjectsRes] =
        await Promise.all([
          fetch("/api/students", { cache: "no-store" }),
          fetch("/api/academic-years", { cache: "no-store" }),
          fetch("/api/terms", { cache: "no-store" }),
          fetch("/api/classes", { cache: "no-store" }),
          fetch("/api/subjects", { cache: "no-store" }),
        ]);

      if (studentsRes.ok) {
        const students = await studentsRes.json();
        setStudentOptions(Array.isArray(students) ? students : []);
      }

      if (yearsRes.ok) {
        const years = await yearsRes.json();
        setYearOptions(Array.isArray(years) ? years : []);
      }

      if (termsRes.ok) {
        const terms = await termsRes.json();
        setTermOptions(Array.isArray(terms) ? terms : []);
      }

      if (classesRes.ok) {
        const classes = await classesRes.json();
        setClassOptions(Array.isArray(classes) ? classes : []);
      }

      if (subjectsRes.ok) {
        const subjects = await subjectsRes.json();
        setSubjectOptions(Array.isArray(subjects) ? subjects : []);
      }
    } catch (error) {
      setStudentOptions([]);
      setYearOptions([]);
      setTermOptions([]);
      setClassOptions([]);
      setSubjectOptions([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadReportCards = async () => {
      await fetchReportCards();
      await loadReferenceData();
      if (!isMounted) return;
    };

    loadReportCards();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSubject = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject, subjectIndex) =>
        subjectIndex === index ? { ...subject, [field]: value } : subject,
      ),
    }));
  };

  const addSubject = () => {
    setForm((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { subject: "", score: "", remark: "" }],
    }));
  };

  const removeSubject = (index) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter(
        (_, subjectIndex) => subjectIndex !== index,
      ),
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      subjects: form.subjects
        .filter((subject) => subject.subject)
        .map((subject) => ({
          ...subject,
          score: Number(subject.score),
        })),
    };

    if (
      !payload.student ||
      !payload.academicYear ||
      !payload.term ||
      !payload.classId ||
      payload.subjects.length === 0
    ) {
      setMessage(
        "Student, year, term, class, and subject scores are required.",
      );
      return;
    }

    try {
      const res = await fetch("/api/report-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not generate report card.");
        return;
      }

      setMessage("Report card generated successfully.");
      setForm(emptyForm);
      fetchReportCards();
    } catch (error) {
      setMessage("An error occurred while generating the report card.");
    }
  };

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Academics</p>
          <h1>Report cards</h1>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 24 }}>
        <h3>Generate a report card</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Student
            <select name="student" value={form.student} onChange={handleChange}>
              <option value="">Select student</option>
              {studentOptions.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.studentId || "Student"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Academic year
            <select
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
            >
              <option value="">Select year</option>
              {yearOptions.map((year) => (
                <option key={year._id} value={year._id}>
                  {year.startYear} - {year.endYear}
                </option>
              ))}
            </select>
          </label>
          <label>
            Term
            <select name="term" value={form.term} onChange={handleChange}>
              <option value="">Select term</option>
              {termOptions.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.term} ({term.status || "active"})
                </option>
              ))}
            </select>
          </label>
          <label>
            Class
            <select name="classId" value={form.classId} onChange={handleChange}>
              <option value="">Select class</option>
              {classOptions.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.level} {classItem.section || ""}
                </option>
              ))}
            </select>
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <div
              className="inline-meta"
              style={{ justifyContent: "space-between", marginBottom: 12 }}
            >
              <span className="chip">Subjects</span>
              <button
                type="button"
                className="secondary-button"
                onClick={addSubject}
              >
                Add subject
              </button>
            </div>

            {form.subjects.map((subject, index) => (
              <div
                key={`subject-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 0.8fr 1.2fr auto",
                  gap: 12,
                  marginBottom: 12,
                  alignItems: "end",
                }}
              >
                <label>
                  Subject
                  <select
                    value={subject.subject}
                    onChange={(event) =>
                      updateSubject(index, "subject", event.target.value)
                    }
                  >
                    <option value="">Select subject</option>
                    {subjectOptions.map((option) => (
                      <option key={option._id} value={option._id}>
                        {option.name} ({option.code})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Score
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subject.score}
                    onChange={(event) =>
                      updateSubject(index, "score", event.target.value)
                    }
                  />
                </label>

                <label>
                  Remark
                  <input
                    value={subject.remark}
                    onChange={(event) =>
                      updateSubject(index, "remark", event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => removeSubject(index)}
                  disabled={form.subjects.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <label style={{ gridColumn: "1 / -1" }}>
            Overall remarks
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="primary-button">
              Generate report card
            </button>
          </div>
        </form>

        {message ? (
          <p className="empty-state" style={{ marginTop: 12 }}>
            {message}
          </p>
        ) : null}
      </div>

      <div className="panel-card">
        {items.length === 0 ? (
          <p className="empty-state">
            No report cards have been generated yet.
          </p>
        ) : (
          <div className="table-grid">
            {items.map((item) => (
              <div key={item._id} className="data-card">
                <h3>{item.status || "Published"}</h3>
                <div className="inline-meta">
                  <span className="chip">Avg: {item.averageScore ?? 0}</span>
                  <span>Total: {item.totalScore ?? 0}</span>
                </div>
                <p>{item.remarks || "No remarks added."}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
