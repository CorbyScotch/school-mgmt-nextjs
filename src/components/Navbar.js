"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/teachers", label: "Teachers" },
  { href: "/classes", label: "Classes" },
  { href: "/subjects", label: "Subjects" },
  { href: "/attendance", label: "Attendance" },
  { href: "/fees", label: "Fees" },
  { href: "/results", label: "Results" },
  { href: "/report-cards", label: "Report Cards" },
  { href: "/settings", label: "Settings" },
  { href: "/setup", label: "Setup" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">S</div>
        <div>
          <p className="brand-name">SchoolFlow</p>
          <span className="brand-subtitle">Ghana Basic School System</span>
        </div>
      </div>

      <nav className="nav-links" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "nav-link active" : "nav-link"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
