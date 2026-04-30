type RiskScoreResponse = {
  area_id: string;
  risk_score: number;
  risk_band: string;
  top_factors: string[];
  recommendation: string;
};

const demoPayload = {
  area_id: "press-line-1",
  shift_name: "night",
  operator_hours: 10,
  days_since_maintenance: 4,
  violation_count_7d: 5,
  near_miss_count_7d: 3,
  shift_date: new Date().toISOString().slice(0, 10),
};

async function fetchRiskScore(): Promise<RiskScoreResponse | null> {
  const backendBaseUrl =
    process.env.BACKEND_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ??
    "http://127.0.0.1:8000";

  try {
    const response = await fetch(`${backendBaseUrl}/api/risk/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(demoPayload),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as RiskScoreResponse;
  } catch {
    return null;
  }
}

function CameraFeedPanel() {
  return (
    <article className="panel camera-panel fixed">
      <div className="panel-heading">
        <div>
          <h2>Camera feed</h2>
          <p>Backend bridge streaming webcam laptop via MJPEG.</p>
        </div>
        <span className="status-pill">Live bridge</span>
      </div>

      <div className="camera-frame">
        <img src="/api/camera/stream" alt="Webcam stream" />
        <div className="camera-overlay">
          <span>Webcam bridge</span>
          <strong>Local laptop camera</strong>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const riskSnapshot = await fetchRiskScore();

  const stats = riskSnapshot
    ? [
        { label: "Current risk score", value: `${riskSnapshot.risk_score.toFixed(0)}` },
        { label: "Risk band", value: riskSnapshot.risk_band },
        { label: "Primary factor", value: riskSnapshot.top_factors[0] ?? "n/a" },
      ]
    : [
        { label: "Live areas monitored", value: "12" },
        { label: "High-risk zones", value: "3" },
        { label: "Risk score drop after intervention", value: "28%" },
      ];

  const alerts = riskSnapshot
    ? [
        `Backend score for ${riskSnapshot.area_id} is ${riskSnapshot.risk_score.toFixed(0)} (${riskSnapshot.risk_band}).`,
        ...riskSnapshot.top_factors.map((factor) => `Contributing factor: ${factor}.`),
      ]
    : [
        "Shift malam di press line 1 naik ke risk score 82.",
        "Maintenance mesin tertunda 4 hari pada area welding.",
        "Near-miss tercatat 6 kali dalam 7 hari terakhir.",
      ];

  const recommendation = riskSnapshot
    ? riskSnapshot.recommendation
    : "Rotate operators, inspect machine condition, and increase supervision before the next night shift starts.";

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">SafePredict</div>
        <h1>Predict workplace safety risk before incidents happen.</h1>
        <p>
          A manufacturing safety dashboard that fuses CCTV intelligence,
          operational schedules, and maintenance context into one predictive
          risk view. The dashboard now pulls a live sample risk score from the
          backend API.
        </p>
        <div className="hero-media" aria-hidden="true">
          {/* Simple inline SVG illustration so the hero always shows a visual */}
          <svg width="100%" height="160" viewBox="0 0 600 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="600" height="160" rx="12" fill="rgba(255,255,255,0.02)" />
            <g transform="translate(24,24)">
              <rect x="0" y="0" width="120" height="80" rx="8" fill="#0f1724" stroke="rgba(125,226,197,0.08)" />
              <rect x="144" y="8" width="420" height="20" rx="6" fill="#0f1724" />
              <rect x="144" y="36" width="300" height="14" rx="6" fill="#0f1724" />
              <circle cx="60" cy="110" r="18" fill="#14303b" />
            </g>
          </svg>
        </div>
      </section>

      <section className="stats-grid" aria-label="key metrics">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <h2>Risk feed</h2>
          <ul>
            {alerts.map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>
        </article>

        <article className="panel panel-accent">
          <h2>Action recommendation</h2>
          <p>
            {recommendation}
          </p>
        </article>
      </section>

      <section className="camera-grid" aria-label="camera monitoring">
        <CameraFeedPanel />
        <article className="panel camera-notes">
          <h2>Bridge note</h2>
          <p>
            This setup streams your laptop webcam through the backend so the
            dashboard can consume it without browser camera permissions. If you
            later need true RTSP, we can swap this bridge for an RTSP server.
          </p>
        </article>
      </section>
    </main>
  );
}
