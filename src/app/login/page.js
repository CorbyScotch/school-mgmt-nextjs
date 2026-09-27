"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      setMessage("Login successful");
      router.push("/dashboard");
    } catch (error) {
      setMessage("Unexpected login error");
    }
  };

  return (
    <div className="page-section setup-page">
      <div className="setup-shell">
        <div className="setup-layout auth-layout">
          <aside className="setup-sidebar auth-sidebar">
            <div className="setup-brand">
              <div className="brand-mark">S</div>
              <div>
                <div className="brand-name">SchoolFlow</div>
                <small>Secure school access</small>
              </div>
            </div>

            <div className="setup-side-badge">Welcome back</div>

            <h2>Access your school dashboard.</h2>

            <ul className="setup-side-list">
              <li>Monitor attendance, classes, and exam records</li>
              <li>Manage staff, students, and academic operations</li>
              <li>Keep the entire school system moving securely</li>
            </ul>
          </aside>

          <div className="panel-card setup-card auth-card">
            <div className="setup-header auth-header">
              <div>
                <p className="eyebrow">Access</p>
                <h1>School login</h1>
              </div>
              <span className="chip">Secure</span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="form-grid setup-form auth-form"
            >
              <label className="full-width">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@school.edu"
                />
              </label>

              <label className="full-width">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </label>

              <div className="form-actions full-width auth-actions">
                <button type="submit" className="primary-button auth-button">
                  Sign in
                </button>
              </div>

              <div className="auth-switch full-width">
                <span>Need the first admin setup?</span>
                <a href="/setup">Open Setup</a>
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
