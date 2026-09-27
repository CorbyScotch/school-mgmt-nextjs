"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  code: "",
};

export default function SubjectsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSubjects = async () => {
      try {
        const res = await fetch("/api/subjects", { cache: "no-store" });
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

    loadSubjects();

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
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not create subject");
        return;
      }

      setMessage("Subject created successfully");
      setForm(emptyForm);
      loadSubjects();
    } catch (error) {
      setMessage("Unexpected subject creation error");
    }
  };

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Curriculum</p>
          <h1>Subjects</h1>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 24 }}>
        <h3>Add subject</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Subject name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            Subject code
            <input name="code" value={form.code} onChange={handleChange} />
          </label>
          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="primary-button">
              Save subject
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
          <p className="empty-state">No subjects configured yet.</p>
        ) : (
          <div className="table-grid">
            {items.map((item) => (
              <div key={item._id || item.code} className="data-card">
                <h3>{item.name}</h3>
                <div className="inline-meta">
                  <span className="chip">{item.code}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
