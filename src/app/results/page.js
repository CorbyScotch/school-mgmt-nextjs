"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  student: "",
  exam: "",
  subject: "",
  score: "",
  grade: "A",
  remark: "",
  status: "pass",
};

export default function ResultsPage() {
  const [items, setItems] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [examOptions, setExamOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setItems([]);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [studentsRes, examsRes, subjectsRes] = await Promise.all([
        fetch("/api/students", { cache: "no-store" }),
        fetch("/api/exams", { cache: "no-store" }),
        fetch("/api/subjects", { cache: "no-store" }),
      ]);

      if (studentsRes.ok) {
        const students = await studentsRes.json();
        setStudentOptions(Array.isArray(students) ? students : []);
      }

      if (examsRes.ok) {
        const exams = await examsRes.json();
        setExamOptions(Array.isArray(exams) ? exams : []);
      }

      if (subjectsRes.ok) {
        const subjects = await subjectsRes.json();
        setSubjectOptions(Array.isArray(subjects) ? subjects : []);
      }
    } catch (error) {
      setStudentOptions([]);
      setExamOptions([]);
      setSubjectOptions([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadResults = async () => {
      await fetchResults();
      await loadReferenceData();
      if (!isMounted) return;
    };

    loadResults();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      score: Number(form.score),
    };

    if (
      !payload.student ||
      !payload.exam ||
      !payload.subject ||
      !payload.score
    ) {
      setMessage("Student, exam, subject, and score are required.");
      return;
    }

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not save result.");
        return;
      }

      setMessage("Result saved successfully.");
      setForm(emptyForm);
      fetchResults();
    } catch (error) {
      setMessage("Something went wrong while saving the result.");
    }
  };

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Academics</p>
          <h1>Assessment results</h1>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 24 }}>
        <h3>Record assessment result</h3>
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
            Exam
            <select name="exam" value={form.exam} onChange={handleChange}>
              <option value="">Select exam</option>
              {examOptions.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.name || "Exam"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <select name="subject" value={form.subject} onChange={handleChange}>
              <option value="">Select subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
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
              name="score"
              value={form.score}
              onChange={handleChange}
            />
          </label>
          <label>
            Grade
            <select name="grade" value={form.grade} onChange={handleChange}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
            </select>
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Teacher remark
            <textarea
              name="remark"
              value={form.remark}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="primary-button">
              Save result
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
          <p className="empty-state">No results entered yet.</p>
        ) : (
          <div className="table-grid">
            {items.map((item) => (
              <div key={item._id} className="data-card">
                <h3>{item.grade || "Grade"}</h3>
                <div className="inline-meta">
                  <span className="chip">{item.status || "pass"}</span>
                  <span>Score: {item.score ?? 0}</span>
                </div>
                {item.remark ? <p>{item.remark}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
