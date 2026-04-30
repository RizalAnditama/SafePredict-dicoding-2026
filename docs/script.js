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
  // Load saved backend URL
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    backendUrl = saved;
  }
  updateBackendUrlDisplay();

  // Setup event listeners
  document.getElementById('configButton').addEventListener('click', openConfigModal);
  document.getElementById('saveConfig').addEventListener('click', saveBackendUrl);
  document.getElementById('cancelConfig').addEventListener('click', closeConfigModal);
  document.getElementById('backendUrlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveBackendUrl();
  });

  // Initialize dashboard
  loadRiskScore();
  initializeCamera();

  // Refresh risk score every 30 seconds
  setInterval(loadRiskScore, 30000);
  
  // Retry camera connection if failed
  setInterval(() => {
    const img = document.getElementById('cameraStream');
    const video = document.getElementById('cameraVideo');
    if (!img.src && !video.src && cameraStreamRetries < MAX_RETRIES) {
      initializeCamera();
    }
  }, RETRY_DELAY);
});

// Update displayed backend URL
function updateBackendUrlDisplay() {
  document.getElementById('backendUrl').textContent = backendUrl;
  document.getElementById('backendUrlInput').value = backendUrl;
}

// Open configuration modal
function openConfigModal() {
  document.getElementById('configModal').style.display = 'flex';
  document.getElementById('backendUrlInput').focus();
}

// Close configuration modal
function closeConfigModal() {
  document.getElementById('configModal').style.display = 'none';
}

// Save backend URL
function saveBackendUrl() {
  const newUrl = document.getElementById('backendUrlInput').value.trim();
  
  if (!newUrl) {
    alert('Please enter a valid URL');
    return;
  }

  // Normalize URL
  let url = newUrl;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }

  backendUrl = url;
  localStorage.setItem(STORAGE_KEY, backendUrl);
  updateBackendUrlDisplay();
  closeConfigModal();

  // Reload data with new backend
  loadRiskScore();
  initializeCamera();
}

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

  // Try MJPEG stream first (img tag with repeated requests)
  tryMjpegStream(img, fallback, statusPill);
}

// Try to stream camera via MJPEG (img tag)
function tryMjpegStream(img, fallback, statusPill) {
  const cameraUrl = `${backendUrl}/api/camera/stream`;
  
  // Create a new image element to test
  const testImg = new Image();
  let loadTimeout;

  testImg.onload = () => {
    // Clear previous timeout
    clearTimeout(loadTimeout);
    
    // Success - show the actual image
    img.src = cameraUrl;
    img.style.display = 'block';
    fallback.style.display = 'none';
    statusPill.textContent = 'Live bridge';
    statusPill.classList.remove('status-pill-error');
    cameraStreamRetries = 0;
    
    // Force refresh every 2 seconds for MJPEG streams
    setInterval(() => {
      if (img.src) {
        img.src = cameraUrl + '?t=' + Date.now();
      }
    }, 2000);
  };

  testImg.onerror = () => {
    clearTimeout(loadTimeout);
    cameraStreamRetries++;
    statusPill.textContent = 'Bridge connection failed';
    statusPill.classList.add('status-pill-error');
    console.warn(`Camera stream failed (attempt ${cameraStreamRetries}/${MAX_RETRIES})`);
  };

  // Set timeout for image load
  loadTimeout = setTimeout(() => {
    clearTimeout(loadTimeout);
    cameraStreamRetries++;
    statusPill.textContent = 'Bridge connection timeout';
    statusPill.classList.add('status-pill-error');
    console.warn('Camera stream timeout');
  }, 5000);

  // Trigger the load
  testImg.src = cameraUrl + '?t=' + Date.now();
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
