"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  userId: "",
  studentId: "",
  classId: "",
  admissionDate: "",
  status: "active",
};

export default function StudentsPage() {
  const [items, setItems] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const loadStudents = async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setItems([]);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [studentUsersRes, classesRes] = await Promise.all([
        fetch("/api/users?role=student", { cache: "no-store" }),
        fetch("/api/classes", { cache: "no-store" }),
      ]);

      if (studentUsersRes.ok) {
        const studentUsers = await studentUsersRes.json();
        setUserOptions(Array.isArray(studentUsers) ? studentUsers : []);
      }

      if (classesRes.ok) {
        const classes = await classesRes.json();
        setClassOptions(Array.isArray(classes) ? classes : []);
      }
    } catch (error) {
      setUserOptions([]);
      setClassOptions([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await loadStudents();
      await loadReferenceData();
      if (!isMounted) return;
    };

    loadData();

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

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not create student");
        return;
      }

      setMessage("Student added successfully");
      setForm(emptyForm);
      loadStudents();
    } catch (error) {
      setMessage("Unexpected student creation error");
    }
  };

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Records</p>
          <h1>Student management</h1>
        </div>
      </div>

      <div className="form-card form-panel" style={{ marginBottom: 24 }}>
        <h3>Add student</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Student account
            <select name="userId" value={form.userId} onChange={handleChange}>
              <option value="">Select a student account</option>
              {userOptions.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </label>
          <label>
            Student ID
            <input
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              placeholder="e.g. STU-2025-001"
            />
          </label>
          <label>
            Class
            <select name="classId" value={form.classId} onChange={handleChange}>
              <option value="">Select a class</option>
              {classOptions.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.level} {classItem.section || ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Admission date
            <input
              type="date"
              name="admissionDate"
              value={form.admissionDate}
              onChange={handleChange}
            />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="primary-button">
              Save student
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
          <p className="empty-state">No students found yet.</p>
        ) : (
          <div className="table-grid">
            {items.map((item) => (
              <div key={item._id || item.studentId} className="data-card">
                <h3>{item.studentId || "Student"}</h3>
                <div className="inline-meta">
                  <span className="chip">{item.status || "active"}</span>
                  <span>
                    {classOptions.find(
                      (classItem) => classItem._id === item.classId,
                    )
                      ? `${classOptions.find((classItem) => classItem._id === item.classId).level} ${classOptions.find((classItem) => classItem._id === item.classId).section || ""}`.trim()
                      : item.classId || "No class"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
