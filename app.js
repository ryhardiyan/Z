// Domain fixed seperti di handler WA
const DOMAIN = "survivalmurni.skyes.me:19236";

// Endpoint widget dari mcstatus.io (STATUS_API_URL tidak digunakan, dihapus)
const WIDGET_URL = `https://api.mcstatus.io/v2/widget/bedrock/${DOMAIN}`;

// Ambil elemen DOM dengan validasi
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultCard = document.getElementById("result-card");
const refreshBtn = document.getElementById("refresh-btn");

const imgEl = document.getElementById("status-image");
const overlayMainEl = document.getElementById("status-overlay-main");
const overlaySubEl = document.getElementById("status-overlay-sub");

const statusTextEl = document.getElementById("status-text");
const hostEl = document.getElementById("host-value");
const portEl = document.getElementById("port-value");
const ipEl = document.getElementById("ip-value");
const eulaEl = document.getElementById("eula-value");
const srvEl = document.getElementById("srv-value");
const versionEl = document.getElementById("version-value");
const motdEl = document.getElementById("motd-value");
const playersCountEl = document.getElementById("players-count-value");
const playersListEl = document.getElementById("players-list-value");
const retrievedEl = document.getElementById("retrieved-value");
const expiresEl = document.getElementById("expires-value");
const msgEl = document.getElementById("status-message");

// Validasi DOM elements exist
function validateDOMElements() {
  const elements = {
    loadingEl,
    errorEl,
    resultCard,
    refreshBtn,
    imgEl,
    overlayMainEl,
    overlaySubEl,
    statusTextEl,
    hostEl,
    portEl,
    ipEl,
    eulaEl,
    srvEl,
    versionEl,
    motdEl,
    playersCountEl,
    playersListEl,
    retrievedEl,
    expiresEl,
    msgEl,
  };

  for (const [name, element] of Object.entries(elements)) {
    if (!element) {
      console.warn(`Missing DOM element: ${name}`);
    }
  }
}

function setLoading(isLoading) {
  if (!loadingEl || !errorEl || !refreshBtn) return;

  if (isLoading) {
    loadingEl.classList.remove("hidden");
    refreshBtn.disabled = true;
    errorEl.classList.add("hidden");
    errorEl.textContent = "";
  } else {
    loadingEl.classList.add("hidden");
    refreshBtn.disabled = false;
  }
}

function formatDateToJakarta(isoOrMs) {
  if (!isoOrMs) return "-";
  const d = new Date(isoOrMs);
  if (isNaN(d.getTime())) return String(isoOrMs);
  // Gunakan locale id-ID untuk konsistensi dengan timezone Jakarta
  return d.toLocaleString("id-ID", { 
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

// Porting helper dari bot (tanpa global.loading, dsb)
async function fetchMcStatus(domain) {
  try {
    const res = await fetch(`https://api.mcstatus.io/v2/status/bedrock/${domain}`);
    if (!res.ok) {
      return { success: false, error: "Failed to fetch status from API." };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message || "Unknown error occurred." };
  }
}

// Render hasil ke UI, mirip dengan caption bot tapi versi web
function renderFromData(data) {
  // Validasi data object
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  const srvRecord = data.srv_record
    ? `${data.srv_record.host}:${data.srv_record.port}`
    : "None";

  const retrievedAt = formatDateToJakarta(data.retrieved_at);
  const expiresAt = formatDateToJakarta(data.expires_at);

  const versionClean = data.version?.name_clean || "Unknown";
  const motdClean = data.motd?.clean || "-";

  const playersOnline = data.players?.online ?? 0;
  const playersMax = data.players?.max ?? 0;

  const playerNames = Array.isArray(data.players?.list)
    ? data.players.list
        .map(p => p?.name_clean)
        .filter(Boolean)
    : [];

  const playersLine = playerNames.length > 0
    ? playerNames.join(", ")
    : "No players online.";

  // Tampilkan kartu
  if (resultCard) resultCard.classList.remove("hidden");

  // Gambar widget sama dengan WA
  if (imgEl) {
    imgEl.src = WIDGET_URL;
    imgEl.alt = `Widget server ${DOMAIN}`;
  }

  // Overlay header
  if (overlayMainEl) overlayMainEl.textContent = "MINECRAFT SERVER STATUS";
  if (overlaySubEl) {
    overlaySubEl.textContent = data.online
      ? "Server sedang online"
      : "Server offline atau tidak dapat dijangkau";
  }

  // Field umum
  if (statusTextEl) statusTextEl.textContent = data.online ? "Online" : "Offline";
  if (hostEl) hostEl.textContent = data.host ?? "-";
  if (portEl) portEl.textContent = data.port ?? "-";
  if (ipEl) ipEl.textContent = data.ip_address || "-";
  if (eulaEl) eulaEl.textContent = String(data.eula_blocked);
  if (srvEl) srvEl.textContent = srvRecord;
  if (versionEl) versionEl.textContent = versionClean;
  if (motdEl) motdEl.textContent = motdClean;
  if (playersCountEl) playersCountEl.textContent = `${playersOnline} / ${playersMax}`;
  if (playersListEl) playersListEl.textContent = playersLine;
  if (retrievedEl) retrievedEl.textContent = retrievedAt;
  if (expiresEl) expiresEl.textContent = expiresAt;

  // "Caption" versi web, sejiwa dengan bot
  if (msgEl) {
    if (data.online) {
      msgEl.innerHTML =
        `<span class="online">🟢 MINECRAFT SERVER STATUS (ONLINE)</span><br/>` +
        `Server aktif dan dapat dijangkau. Data di atas mengambil host, port, IP, EULA, version, MOTD, dan player list langsung dari minecraft.`;
    } else {
      msgEl.innerHTML =
        `<span class="offline">🔴 MINECRAFT SERVER STATUS (OFFLINE)</span><br/>` +
        `The server is currently offline or unreachable.`;
    }
  }
}

async function run() {
  setLoading(true);
  if (resultCard) resultCard.classList.add("hidden");

  try {
    const { success, data, error } = await fetchMcStatus(DOMAIN);
    if (!success) {
      throw new Error(error || "Failed to fetch server status.");
    }

    renderFromData(data);
  } catch (e) {
    const errorMessage = "Failed to check server status (web): " + (e?.message || String(e));
    if (errorEl) {
      errorEl.textContent = errorMessage;
      errorEl.classList.remove("hidden");
    }
    console.error(errorMessage);
  } finally {
    setLoading(false);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
  validateDOMElements();
  
  // Auto cek saat halaman dibuka
  run();
  
  // Tombol refresh dengan null check
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function(e) {
      e.preventDefault();
      run();
    });
  } else {
    console.warn("Refresh button not found in DOM");
  }
});