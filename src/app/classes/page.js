"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  stage: "Primary",
  level: "Primary 1",
  section: "A",
  capacity: 40,
};

export default function ClassesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadClasses = async () => {
      try {
        const res = await fetch("/api/classes", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setItems([]);
        }
      }
    };

    loadClasses();

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
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not create class");
        return;
      }

      setMessage("Class created successfully");
      setForm(emptyForm);
      loadClasses();
    } catch (error) {
      setMessage("Unexpected class creation error");
    }
  };

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Academics</p>
          <h1>Classes</h1>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 24 }}>
        <h3>Create class</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Stage
            <select name="stage" value={form.stage} onChange={handleChange}>
              <option value="Primary">Primary</option>
              <option value="JHS">JHS</option>
            </select>
          </label>
          <label>
            Level
            <select name="level" value={form.level} onChange={handleChange}>
              <option value="Primary 1">Primary 1</option>
              <option value="Primary 2">Primary 2</option>
              <option value="Primary 3">Primary 3</option>
              <option value="Primary 4">Primary 4</option>
              <option value="Primary 5">Primary 5</option>
              <option value="Primary 6">Primary 6</option>
              <option value="JHS 1">JHS 1</option>
              <option value="JHS 2">JHS 2</option>
              <option value="JHS 3">JHS 3</option>
            </select>
          </label>
          <label>
            Section
            <input
              name="section"
              value={form.section}
              onChange={handleChange}
            />
          </label>
          <label>
            Capacity
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
            />
          </label>
          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="primary-button">
              Create class
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
          <p className="empty-state">No classes available yet.</p>
        ) : (
          <div className="table-grid">
            {items.map((item) => (
              <div key={item._id} className="data-card">
                <h3>{item.name || `${item.level} ${item.section}`}</h3>
                <div className="inline-meta">
                  <span className="chip">{item.stage || "Primary"}</span>
                  <span>Capacity: {item.capacity || 40}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
