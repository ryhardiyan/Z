// Domain fixed seperti di handler WA
const DOMAIN = "play.zeroends.me";

// Endpoint status & widget dari mcstatus.io (sama dengan bot WA)
const STATUS_API_URL = `https://api.mcstatus.io/v2/status/java/${DOMAIN}`;
const WIDGET_URL = `https://api.mcstatus.io/v2/widget/java/${DOMAIN}`;

// Ambil elemen DOM
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

function setLoading(isLoading) {
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
  return d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
}

// Porting helper dari bot (tanpa global.loading, dsb)
async function fetchMcStatus(domain) {
  try {
    const res = await fetch(`https://api.mcstatus.io/v2/status/java/${domain}`);
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

  const playersLine = playerNames.length
    ? playerNames.join(", ")
    : "No players online.";

  // Tampilkan kartu
  resultCard.classList.remove("hidden");

  // Gambar widget sama dengan WA
  imgEl.src = WIDGET_URL;
  imgEl.alt = `Widget server ${DOMAIN}`;

  // Overlay header
  overlayMainEl.textContent = "MINECRAFT SERVER STATUS S3";
  overlaySubEl.textContent = data.online
    ? "Server sedang online"
    : "Server offline atau tidak dapat dijangkau";

  // Field umum
  statusTextEl.textContent = data.online ? "Online" : "Offline";
  hostEl.textContent = data.host ?? "-";
  portEl.textContent = data.port ?? "-";
  ipEl.textContent = data.ip_address || "-";
  eulaEl.textContent = String(data.eula_blocked);
  srvEl.textContent = srvRecord;
  versionEl.textContent = versionClean;
  motdEl.textContent = motdClean;
  playersCountEl.textContent = `${playersOnline} / ${playersMax}`;
  playersListEl.textContent = playersLine;
  retrievedEl.textContent = retrievedAt;
  expiresEl.textContent = expiresAt;

  // “Caption” versi web, sejiwa dengan bot
  if (data.online) {
    msgEl.innerHTML =
      `<span class="online">🟢 MINECRAFT SERVER STATUS S3 (ONLINE)</span>
` +
      `Server aktif dan dapat dijangkau. Data di atas mengambil host, port, IP, EULA, version, MOTD, dan player list langsung dari minecraft.`;
  } else {
    msgEl.innerHTML =
      `<span class="offline">🔴 MINECRAFT SERVER STATUS S3 (OFFLINE)</span>
` +
      `The server is currently offline or unreachable.`;
  }
}

async function run() {
  setLoading(true);
  resultCard.classList.add("hidden");

  try {
    const { success, data, error } = await fetchMcStatus(DOMAIN);
    if (!success) {
      throw new Error(error || "Failed to fetch server status.");
    }

    renderFromData(data);
  } catch (e) {
    errorEl.textContent =
      "Failed to check server status (web): " + (e?.message || e);
    errorEl.classList.remove("hidden");
  } finally {
    setLoading(false);
  }
}

// Auto cek saat halaman dibuka & tombol refresh
window.addEventListener("load", run);
refreshBtn.addEventListener("click", run);
