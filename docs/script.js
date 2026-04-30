// Configuration
const STORAGE_KEY = 'safepredict-backend-url';
const DEFAULT_BACKEND_URL = 'http://localhost:8000';

// State
let backendUrl = DEFAULT_BACKEND_URL;
let cameraStreamRetries = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard
  loadRiskScore();
  initializeCamera();

  // Refresh risk score every 30 seconds
  setInterval(loadRiskScore, 30000);
  
  // Retry camera connection if failed (check every 5 seconds)
  setInterval(() => {
    const img = document.getElementById('cameraStream');
    const fallback = document.getElementById('cameraFallback');
    // If camera hasn't connected and we have retries left, try again
    if (fallback.style.display !== 'none' && cameraStreamRetries < MAX_RETRIES) {
      initializeCamera();
    }
  }, 5000);
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
  const fallback = document.getElementById('cameraFallback');
  const statusPill = document.getElementById('cameraStatus');

  // Reset state before attempting connection
  img.style.display = 'none';
  img.src = '';
  fallback.style.display = 'block';
  statusPill.textContent = 'Connecting...';
  statusPill.classList.remove('status-pill-error');

  // Try MJPEG stream (native browser support for multipart/x-mixed-replace)
  tryMjpegStream(img, fallback, statusPill);
}

// Try to stream camera via MJPEG (img tag with native browser support)
function tryMjpegStream(img, fallback, statusPill) {
  const cameraUrl = `${backendUrl}/api/camera/stream`;
  
  let hasLoaded = false;
  let loadTimeout;
  const startTime = Date.now();

  console.log('Attempting camera connection:', cameraUrl);

  // Set timeout to detect connection failure
  loadTimeout = setTimeout(() => {
    if (!hasLoaded) {
      img.style.display = 'none';
      img.src = ''; // Clear src to allow retry
      statusPill.textContent = 'Connection timeout';
      statusPill.classList.add('status-pill-error');
      cameraStreamRetries++;
      console.warn(`Camera stream timeout after ${Date.now() - startTime}ms (attempt ${cameraStreamRetries}/${MAX_RETRIES})`);
    }
  }, 5000);

  // Handle successful connection
  img.onload = () => {
    if (!hasLoaded) {
      clearTimeout(loadTimeout);
      hasLoaded = true;
      img.style.display = 'block';
      fallback.style.display = 'none';
      statusPill.textContent = 'Live bridge';
      statusPill.classList.remove('status-pill-error');
      cameraStreamRetries = 0;
      console.log(`Camera stream connected successfully in ${Date.now() - startTime}ms`);
    }
  };

  // Handle connection errors
  img.onerror = (event) => {
    if (!hasLoaded) {
      clearTimeout(loadTimeout);
      img.style.display = 'none';
      img.src = ''; // Clear src to allow retry
      statusPill.textContent = 'Connection failed';
      statusPill.classList.add('status-pill-error');
      cameraStreamRetries++;
      console.warn(`Camera stream error after ${Date.now() - startTime}ms (attempt ${cameraStreamRetries}/${MAX_RETRIES})`, event);
    }
  };

  // Set MJPEG stream source
  // NOTE: Do NOT append timestamps - this breaks the multipart/x-mixed-replace protocol
  // The browser automatically handles the continuous multipart stream
  img.src = cameraUrl;
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

// Handle modal background click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('configModal');
  if (e.target === modal) {
    closeConfigModal();
  }
});
modal && 