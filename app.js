// GANTI dengan endpoint yang sama yang dipakai bot WA-mu.
// Misal: const API_URL = "https://api.monit.my.id/zeroends";
const API_URL = "https://api.monit.my.id/zeroends";

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultCard = document.getElementById("result-card");
const refreshBtn = document.getElementById("refresh-btn");

const imgEl = document.getElementById("status-image");
const expiresEl = document.getElementById("expires-value");
const statusTextEl = document.getElementById("status-text");
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

function formatExpires(expiresAt) {
  if (!expiresAt) return "-";
  const d = new Date(expiresAt);
  if (isNaN(d.getTime())) return expiresAt;
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderFromApi(data) {
  // SAMAKAN ini dengan struktur data di bot WA
  const isOnline = !!data.online;
  const widgetUrl = data.widgetUrl;
  const expiresAt = data.expiresAt;

  resultCard.classList.remove("hidden");

  imgEl.src =
    widgetUrl || "https://via.placeholder.com/800x300?text=ZeroEnds+Widget";
  imgEl.alt = "Server widget";

  expiresEl.textContent = formatExpires(expiresAt);

  // Versi “caption” bot WA diubah jadi teks web
  if (isOnline) {
    statusTextEl.textContent = "ONLINE";
    msgEl.innerHTML =
      `<span class="online">Server sedang ONLINE.</span> Nikmati permainan seperti biasa.`;
  } else {
    statusTextEl.textContent = "OFFLINE";
    msgEl.innerHTML =
      `<span class="offline">The server is currently offline or unreachable.</span>`;
  }
}

async function fetchStatus() {
  setLoading(true);
  resultCard.classList.add("hidden");

  try {
    const res = await fetch(API_URL, { method: "GET" });

    if (!res.ok) {
      throw new Error("Gagal menghubungi API (" + res.status + ")");
    }

    const data = await res.json();
    renderFromApi(data);
  } catch (err) {
    errorEl.textContent =
      "Gagal mengambil data (scrape) seperti bot WA: " + (err?.message || err);
    errorEl.classList.remove("hidden");
  } finally {
    setLoading(false);
  }
}

window.addEventListener("load", () => {
  fetchStatus();
});

refreshBtn.addEventListener("click", () => {
  fetchStatus();
});
