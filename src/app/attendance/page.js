"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  teacherId: "",
  classId: "",
  subjectId: "",
  date: "",
  records: [{ studentId: "", status: "present" }],
};

export default function AttendancePage() {
  const [items, setItems] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setItems([]);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [teachersRes, classesRes, subjectsRes, studentsRes] =
        await Promise.all([
          fetch("/api/teachers", { cache: "no-store" }),
          fetch("/api/classes", { cache: "no-store" }),
          fetch("/api/subjects", { cache: "no-store" }),
          fetch("/api/students", { cache: "no-store" }),
        ]);

      if (teachersRes.ok) {
        const teachers = await teachersRes.json();
        setTeacherOptions(Array.isArray(teachers) ? teachers : []);
      }

      if (classesRes.ok) {
        const classes = await classesRes.json();
        setClassOptions(Array.isArray(classes) ? classes : []);
      }

      if (subjectsRes.ok) {
        const subjects = await subjectsRes.json();
        setSubjectOptions(Array.isArray(subjects) ? subjects : []);
      }

      if (studentsRes.ok) {
        const students = await studentsRes.json();
        setStudentOptions(Array.isArray(students) ? students : []);
      }
    } catch (error) {
      setTeacherOptions([]);
      setClassOptions([]);
      setSubjectOptions([]);
      setStudentOptions([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await fetchAttendance();
      await loadReferenceData();
      if (!isMounted) return;
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateRecord = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      records: prev.records.map((record, recordIndex) =>
        recordIndex === index ? { ...record, [field]: value } : record,
      ),
    }));
  };

  const addRecord = () => {
    setForm((prev) => ({
      ...prev,
      records: [...prev.records, { studentId: "", status: "present" }],
    }));
  };

  const removeRecord = (index) => {
    setForm((prev) => ({
      ...prev,
      records: prev.records.filter((_, recordIndex) => recordIndex !== index),
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
      records: form.records.filter((record) => record.studentId.trim()),
    };

    if (
      !payload.teacherId ||
      !payload.classId ||
      !payload.subjectId ||
      !payload.date ||
      payload.records.length === 0
    ) {
      setMessage("Please complete all attendance fields before saving.");
      return;
    }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not save attendance");
        return;
      }

      setMessage("Attendance saved successfully");
      setForm(emptyForm);
      fetchAttendance();
    } catch (error) {
      setMessage("Unexpected attendance error");
    }
  };

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Monitoring</p>
          <h1>Attendance register</h1>
        </div>
      </div>

      <div className="form-card form-panel" style={{ marginBottom: 24 }}>
        <h3>Submit attendance</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Teacher
            <select
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
            >
              <option value="">Select teacher</option>
              {teacherOptions.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.teacherId || "Teacher"}
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
          <label>
            Subject
            <select
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
            >
              <option value="">Select subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <div
              className="inline-meta"
              style={{ justifyContent: "space-between", marginBottom: 12 }}
            >
              <span className="chip">Student records</span>
              <button
                type="button"
                className="secondary-button"
                onClick={addRecord}
              >
                Add row
              </button>
            </div>

            {form.records.map((record, index) => (
              <div
                key={`record-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr auto",
                  gap: 12,
                  marginBottom: 12,
                  alignItems: "end",
                }}
              >
                <label>
                  Student
                  <select
                    value={record.studentId}
                    onChange={(event) =>
                      updateRecord(index, "studentId", event.target.value)
                    }
                  >
                    <option value="">Select student</option>
                    {studentOptions.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.studentId || "Student"}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Status
                  <select
                    value={record.status}
                    onChange={(event) =>
                      updateRecord(index, "status", event.target.value)
                    }
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => removeRecord(index)}
                  disabled={form.records.length === 1}
                  style={{ minHeight: 44 }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="primary-button">
              Save attendance
            </button>
          </div>
        </form>
        {message ? (
          <p className="empty-state" style={{ marginTop: 12 }}>
            {message}
          </p>
        ) : null}
      </div>

      <div className="panel-card record-panel">
        {items.length === 0 ? (
          <p className="empty-state">No attendance submitted yet.</p>
        ) : (
          <div className="table-grid">
            {items.map((item) => (
              <div key={item._id} className="data-card">
                <h3>
                  {item.date
                    ? new Date(item.date).toLocaleDateString()
                    : "Attendance"}
                </h3>
                <div className="inline-meta">
                  <span className="chip">
                    {item.records?.length || 0} entries
                  </span>
                  <span>{item.classId?.level || "Class"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
