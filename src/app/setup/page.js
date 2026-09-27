"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const emptyForm = {
  setupKey: "",
  firstName: "",
  lastName: "",
  email: "",
  dob: "",
  gender: "male",
  password: "",
};

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/setup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create the initial administrator.");
        return;
      }

      setMessage("Administrator created successfully.");
      setForm(emptyForm);
      router.push("/login");
    } catch (error) {
      setMessage("Unexpected setup error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-section setup-page">
      <div className="setup-shell">
        <div className="setup-layout">
          <aside className="setup-sidebar">
            <div className="setup-brand">
              <div className="brand-mark">S</div>
              <div>
                <div className="brand-name">SchoolFlow</div>
                <small>School operations platform</small>
              </div>
            </div>

            <div className="setup-side-badge">Initial setup</div>

            <h2>Start the school management system.</h2>

            <ul className="setup-side-list">
              <li>Secure 1-time administrator bootstrap</li>
              <li>Manage staff, classes, attendance, and reports</li>
              <li>Prepare the system for full school operations</li>
            </ul>
          </aside>

          <div className="panel-card setup-card">
            <div className="setup-header">
              <div>
                <p className="eyebrow">Setup</p>
                <h1>Create initial admin</h1>
              </div>
              <span className="chip">Secure</span>
            </div>

            <div className="setup-notice">
              Use this only for the first administrative account in the school
              system. It creates the master login used to manage the
              institution.
            </div>

            <form onSubmit={handleSubmit} className="form-grid setup-form">
              <label className="full-width">
                <span>Setup key</span>
                <input
                  name="setupKey"
                  type="password"
                  value={form.setupKey}
                  onChange={handleChange}
                  placeholder="Enter your secret setup key"
                />
              </label>

              <label>
                <span>First name</span>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Ama"
                />
              </label>

              <label>
                <span>Last name</span>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Mensah"
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@schoolflow.edu"
                />
              </label>

              <label>
                <span>Date of birth</span>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Gender</span>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <label className="full-width">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                />
              </label>

              <div className="form-actions full-width">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating admin..." : "Create admin"}
                </button>
              </div>
            </form>

            {message ? (
              <p className="empty-state setup-message">{message}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
