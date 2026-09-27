"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/school-settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setSettings(data && !data.message ? data : {});
      } catch (error) {
        setSettings({});
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>School settings</h1>
        </div>
      </div>

      <div className="form-card">
        {loading ? (
          <p className="empty-state">Loading school configuration...</p>
        ) : (
          <div className="form-grid">
            <div className="list-card">
              <h3>School profile</h3>
              <p>{settings.schoolName || "School not configured yet"}</p>
              <div className="inline-meta">
                <span className="chip">
                  {settings.schoolType || "Basic School"}
                </span>
                <span>{settings.region || "Region not set"}</span>
              </div>
            </div>

            <div className="list-card">
              <h3>Academic setup</h3>
              <p>
                {settings.currentTerm
                  ? "Term configured"
                  : "No current term configured"}
              </p>
              <div className="inline-meta">
                <span className="chip">
                  {settings.academicYear ? "Academic year set" : "No year"}
                </span>
                <span>{settings.feeSettings?.currency || "GHS"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
