// Configuration
const DEFAULT_BACKEND_URL = 'http://localhost:8000';

// State
let backendUrl = DEFAULT_BACKEND_URL;
let activeCameraStream = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard
  loadRiskScore();
  initializeCamera();

  // Refresh risk score every 30 seconds
  setInterval(loadRiskScore, 30000);
});

// Fetch risk score from backend
async function loadRiskScore() {
  try {
    const demoPayload = {
      area_id: "press-line-1",
      shift_name: "night",
      operator_hours: 10,
      days_since_maintenance: 4,
      violation_count_7d: 5,
      near_miss_count_7d: 3,
      shift_date: new Date().toISOString().slice(0, 10),
    };

    const response = await fetch(`${backendUrl}/api/risk/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(demoPayload),
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    updateDashboardWithRiskData(data);
  } catch (error) {
    console.warn('Failed to load risk score:', error);
    // Keep default values if API fails
  }
}

// Update dashboard with risk data
function updateDashboardWithRiskData(riskData) {
  // Update stats
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = `
    <article class="stat-card">
      <span>Current risk score</span>
      <strong>${riskData.risk_score.toFixed(0)}</strong>
    </article>
    <article class="stat-card">
      <span>Risk band</span>
      <strong>${riskData.risk_band}</strong>
    </article>
    <article class="stat-card">
      <span>Primary factor</span>
      <strong>${riskData.top_factors[0] ?? 'n/a'}</strong>
    </article>
  `;

  // Update alerts
  const alertsList = document.getElementById('alertsList');
  const alerts = [
    `Backend score for ${riskData.area_id} is ${riskData.risk_score.toFixed(0)} (${riskData.risk_band}).`,
    ...riskData.top_factors.map(factor => `Contributing factor: ${factor}.`),
  ];
  alertsList.innerHTML = alerts
    .map(alert => `<li>${escapeHtml(alert)}</li>`)
    .join('');

  // Update recommendation
  document.getElementById('recommendationText').textContent = riskData.recommendation;
}

// Initialize camera stream
function initializeCamera() {
  const img = document.getElementById('cameraStream');
  const video = document.getElementById('cameraVideo');
  const fallback = document.getElementById('cameraFallback');
  const statusPill = document.getElementById('cameraStatus');

  // Reset state before attempting connection
  img.style.display = 'none';
  img.src = '';
  video.style.display = 'none';
  video.srcObject = null;
  fallback.style.display = 'block';
  statusPill.textContent = 'Connecting...';
  statusPill.classList.remove('status-pill-error');

  // Stop any existing stream before starting a new one
  if (activeCameraStream) {
    activeCameraStream.getTracks().forEach(track => track.stop());
    activeCameraStream = null;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    statusPill.textContent = 'Camera not supported';
    statusPill.classList.add('status-pill-error');
    fallback.innerHTML =
      '<div style="text-align:center;padding:60px 20px;color:var(--muted)">' +
      '<p>Camera API not supported in this browser.</p>' +
      '<small>Use a modern browser with HTTPS or localhost.</small>' +
      '</div>';
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(stream => {
      activeCameraStream = stream;
      video.srcObject = stream;
      video.setAttribute('playsinline', '');
      video.muted = true;
      return video.play();
    })
    .then(() => {
      video.style.display = 'block';
      fallback.style.display = 'none';
      statusPill.textContent = 'Live';
      statusPill.classList.remove('status-pill-error');
    })
    .catch(error => {
      console.warn('Camera access failed:', error);
      statusPill.textContent = 'Camera blocked';
      statusPill.classList.add('status-pill-error');
      fallback.innerHTML =
        '<div style="text-align:center;padding:60px 20px;color:var(--muted)">' +
        '<p>Camera permission denied or unavailable.</p>' +
        '<small>Allow camera access and reload the page.</small>' +
        '</div>';
    });
}

// Utility function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
} 