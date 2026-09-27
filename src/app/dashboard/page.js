"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const defaultStats = {
  totals: {
    students: 0,
    teachers: 0,
    users: 0,
    feesTotal: 0,
    feesPaid: 0,
    feesBalance: 0,
  },
  attendance: {
    totalRecords: 0,
    present: 0,
    attendanceRate: 0,
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) {
          if (isMounted) {
            setStats(defaultStats);
          }
          return;
        }

        const data = await res.json();
        if (isMounted) {
          setStats(data);
        }
      } catch (error) {
        if (isMounted) {
          setStats(defaultStats);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const metricCards = [
    { label: "Students", value: stats.totals.students, tone: "primary" },
    { label: "Teachers", value: stats.totals.teachers, tone: "secondary" },
    {
      label: "Fees Balance",
      value: `GHS ${stats.totals.feesBalance}`,
      tone: "warm",
    },
    {
      label: "Attendance",
      value: `${stats.attendance.attendanceRate}%`,
      tone: "accent",
    },
  ];

  const operationalCards = [
    {
      title: "Enrollment",
      value: `${stats.totals.students} active learners`,
      detail: "Across all school levels and class groups.",
    },
    {
      title: "Academic staffing",
      value: `${stats.totals.teachers} active teachers`,
      detail: "Ready for teaching assignments and supervision.",
    },
    {
      title: "Finance health",
      value: `GHS ${stats.totals.feesPaid} collected`,
      detail: `Outstanding balance: GHS ${stats.totals.feesBalance}.`,
    },
    {
      title: "Attendance rate",
      value: `${stats.attendance.attendanceRate}%`,
      detail: `${stats.attendance.present} present of ${stats.attendance.totalRecords} checked records.`,
    },
  ];

  const quickActions = [
    { href: "/students", label: "Student records" },
    { href: "/teachers", label: "Teacher profiles" },
    { href: "/classes", label: "Class management" },
    { href: "/subjects", label: "Curriculum" },
    { href: "/fees", label: "Fee collection" },
    { href: "/settings", label: "School settings" },
  ];

  return (
    <div className="page-section">
      <div className="section-topbar">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>School dashboard</h1>
        </div>
        <Link href="/classes" className="primary-button">
          Manage classes
        </Link>
      </div>

      {loading ? (
        <p className="empty-state">Loading dashboard metrics...</p>
      ) : (
        <>
          <div className="metric-grid">
            {metricCards.map((card) => (
              <article key={card.label} className={`metric-card ${card.tone}`}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </article>
            ))}
          </div>

          <div className="dashboard-grid">
            <div className="panel-card">
              <h3>Operational summary</h3>
              <ul className="summary-list">
                <li>
                  <span>Total fees collected</span>
                  <strong>GHS {stats.totals.feesPaid}</strong>
                </li>
                <li>
                  <span>Total fees expected</span>
                  <strong>GHS {stats.totals.feesTotal}</strong>
                </li>
                <li>
                  <span>Attendance records</span>
                  <strong>{stats.attendance.totalRecords}</strong>
                </li>
                <li>
                  <span>Present students</span>
                  <strong>{stats.attendance.present}</strong>
                </li>
              </ul>
            </div>

            <div className="panel-card">
              <h3>Quick actions</h3>
              <div className="action-stack">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="panel-card" style={{ marginTop: 24 }}>
            <h3>School operations at a glance</h3>
            <div
              className="table-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {operationalCards.map((card) => (
                <article key={card.title} className="data-card">
                  <p className="eyebrow" style={{ marginBottom: 10 }}>
                    {card.title}
                  </p>
                  <h3>{card.value}</h3>
                  <p style={{ marginTop: 8, color: "#4b4f3a" }}>
                    {card.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
