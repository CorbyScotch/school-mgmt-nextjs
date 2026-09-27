"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  user: "",
  teacherId: "",
  hireDate: "",
  status: "active",
};

export default function TeachersPage() {
  const [items, setItems] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const loadTeachers = async () => {
    try {
      const res = await fetch("/api/teachers", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setItems([]);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users?role=teacher", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setUserOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      setUserOptions([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await loadTeachers();
      await loadUsers();
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
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not create teacher profile");
        return;
      }

      setMessage("Teacher profile created");
      setForm(emptyForm);
      loadTeachers();
    } catch (error) {
      setMessage("Unexpected teacher profile error");
    }
  };

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Staff</p>
          <h1>Teacher profiles</h1>
        </div>
      </div>

      <div className="form-card form-panel" style={{ marginBottom: 24 }}>
        <h3>Add teacher</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Teacher account
            <select name="user" value={form.user} onChange={handleChange}>
              <option value="">Select a teacher account</option>
              {userOptions.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </label>
          <label>
            Teacher ID
            <input
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              placeholder="e.g. TCH-2025-001"
            />
          </label>
          <label>
            Hire date
            <input
              type="date"
              name="hireDate"
              value={form.hireDate}
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
              Save teacher
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
          <p className="empty-state">No teacher profiles available yet.</p>
        ) : (
          <div className="table-grid">
            {items.map((item) => (
              <div key={item._id || item.teacherId} className="data-card">
                <h3>{item.teacherId || "Teacher"}</h3>
                <div className="inline-meta">
                  <span className="chip">{item.status || "active"}</span>
                  <span>
                    {item.hireDate
                      ? new Date(item.hireDate).toLocaleDateString()
                      : "No date"}
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
