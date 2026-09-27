import Link from "next/link";
import styles from "./page.module.css";

const overview = [
  {
    title: "Student Records",
    text: "Track enrollment, performance, and family information with one source of truth.",
  },
  {
    title: "Attendance",
    text: "Monitor class attendance by teacher, class, and date in seconds.",
  },
  {
    title: "Academic Reporting",
    text: "Publish grades, promotions, and term reports with consistent workflows.",
  },
  {
    title: "Fee Management",
    text: "Record dues, capture payments, and reconcile balances efficiently.",
  },
];

const stats = [
  { label: "Students", value: "1,200+" },
  { label: "Teachers", value: "84" },
  { label: "Classes", value: "24" },
  { label: "Active Terms", value: "3" },
];

export default function Home() {
  return (
    <div className={styles.heroPage}>
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <span className={styles.kicker}>Modern school operations</span>
          <h1>Manage every student journey from admission to graduation.</h1>
          <p>
            The SchoolFlow platform helps Ghanaian schools manage classes,
            attendance, academic results, fees, and school administration in one
            streamlined system.
          </p>

          <div className={styles.ctaRow}>
            <Link href="/dashboard" className="primary-button">
              Open Dashboard
            </Link>
            <Link href="/login" className="secondary-button">
              Admin Login
            </Link>
          </div>

          <div className={styles.statRow}>
            {stats.map((item) => (
              <div key={item.label} className={styles.statCard}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <span className={styles.previewDot} />
            <span className={styles.previewDot} />
            <span className={styles.previewDot} />
          </div>

          <div className={styles.previewBody}>
            <div className={styles.previewPanel}>
              <p>Enrollment</p>
              <h3>428</h3>
            </div>
            <div className={styles.previewPanel}>
              <p>Attendance</p>
              <h3>94.8%</h3>
            </div>
            <div className={styles.previewPanel}>
              <p>Fees due</p>
              <h3>GHS 52,200</h3>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        {overview.map((item) => (
          <article key={item.title} className={styles.featureCard}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
