"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  student: "",
  feeType: "tuition",
  amount: "",
  dueDate: "",
  paymentMode: "cash",
  notes: "",
};

export default function FeesPage() {
  const [items, setItems] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const loadFees = async () => {
    try {
      const res = await fetch("/api/fees", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setItems([]);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setStudentOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      setStudentOptions([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await loadFees();
      await loadStudents();
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
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not create fee record");
        return;
      }

      setMessage("Fee record created successfully");
      setForm(emptyForm);
      loadFees();
    } catch (error) {
      setMessage("Unexpected fee creation error");
    }
  };

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Finance</p>
          <h1>Fee management</h1>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 24 }}>
        <h3>Create fee</h3>
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
            Fee type
            <select name="feeType" value={form.feeType} onChange={handleChange}>
              <option value="tuition">Tuition</option>
              <option value="exam">Exam</option>
              <option value="uniform">Uniform</option>
              <option value="library">Library</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </label>
          <label>
            Amount (GHS)
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </label>
          <label>
            Payment mode
            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
            >
              <option value="cash">Cash</option>
              <option value="mobile-money">Mobile money</option>
              <option value="bank-transfer">Bank transfer</option>
              <option value="card">Card</option>
            </select>
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Notes
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </label>
          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="primary-button">
              Save fee
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
          <p className="empty-state">No fee records have been created yet.</p>
        ) : (
          <div className="table-grid">
            {items.map((item) => (
              <div key={item._id} className="data-card">
                <h3>{item.feeType || "Fee"}</h3>
                <div className="inline-meta">
                  <span className="chip">{item.status || "pending"}</span>
                  <span>Balance: GHS {item.balance ?? item.amount ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
