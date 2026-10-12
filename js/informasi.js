import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// [WAJIB] Daftarkan plugin datalabels secara global
Chart.register(ChartDataLabels);

const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.appspot.com",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let myChart = null;
let cacheLabels = [];
let cacheDataPria = [];
let cacheDataWanita = [];
let chartRendered = false;
let animFrameId = null;

async function loadStatistik() {
  try {
    const docRef = doc(db, "statistik", "data_penduduk");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const kelompokUmur = data.kelompokUmur || {};

      let totalPria = 0;
      let totalWanita = 0;
      Object.values(kelompokUmur).forEach((kelompok) => {
        totalPria += kelompok.pria || 0;
        totalWanita += kelompok.wanita || 0;
      });
      const totalPenduduk = totalPria + totalWanita;

      animateValue(document.getElementById("total-penduduk"), 0, totalPenduduk, 2000, " Jiwa");
      animateValue(document.getElementById("kepala-keluarga"), 0, parseInt(data.kepalaKeluarga) || 0, 2000, " Jiwa");
      animateValue(document.getElementById("jumlah-wanita"), 0, totalWanita, 2000, " Jiwa");
      animateValue(document.getElementById("jumlah-pria"), 0, totalPria, 2000, " Jiwa");

      const labels = Object.keys(kelompokUmur).sort(
        (a, b) => parseInt(a.split("-")[0]) - parseInt(b.split("-")[0])
      );
      const dataPria = labels.map((label) => kelompokUmur[label].pria || 0);
      const dataWanita = labels.map((label) => kelompokUmur[label].wanita || 0);

      cacheLabels = labels;
      cacheDataPria = dataPria;
      cacheDataWanita = dataWanita;

      tampilkanAnalisisData(
        labels,
        dataPria,
        dataWanita,
        totalPria,
        totalWanita
      );

      // Inisialisasi IntersectionObserver agar animasi grafik aktif saat digulir ke layar
      initScrollObserver();
    } else {
      console.log("Dokumen statistik tidak ditemukan!");
    }
  } catch (error) {
    console.error("Error mengambil data statistik: ", error);
  }
}

// Inisialisasi pengamatan viewport scroll untuk memulai animasi grafik
function initScrollObserver() {
  const chartContainer = document.querySelector(".chart-container");
  if (!chartContainer) {
    gambarDiagramResponsif(cacheLabels, cacheDataPria, cacheDataWanita);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !chartRendered) {
          chartRendered = true;
          gambarDiagramResponsif(cacheLabels, cacheDataPria, cacheDataWanita);
        }
      });
    },
    { threshold: 0.15 }
  );

  observer.observe(chartContainer);

  // Fallback cadangan jika container sudah berada di layar sejak awal
  setTimeout(() => {
    if (!chartRendered && cacheLabels.length > 0) {
      chartRendered = true;
      gambarDiagramResponsif(cacheLabels, cacheDataPria, cacheDataWanita);
    }
  }, 700);
}

function tampilkanAnalisisData(
  labels,
  dataPria,
  dataWanita,
  totalPria,
  totalWanita
) {
  if (totalPria === 0 || totalWanita === 0 || labels.length === 0) return;

  const maxPria = Math.max(...dataPria);
  const minPria = Math.min(...dataPria.filter((p) => p > 0)) || 0;
  const indexMaxPria = dataPria.indexOf(maxPria);
  const indexMinPria = dataPria.indexOf(minPria);

  const persenMaxPria = ((maxPria / totalPria) * 100).toFixed(2);
  const persenMinPria = ((minPria / totalPria) * 100).toFixed(2);

  const teksAnalisisPria = `
        Untuk jenis kelamin <strong>laki-laki</strong>, kelompok umur <strong>${labels[indexMaxPria]}</strong> adalah kelompok umur tertinggi dengan jumlah <strong>${maxPria} orang</strong> atau <strong>${persenMaxPria}%</strong>. Sedangkan, kelompok umur terendah adalah <strong>${labels[indexMinPria]}</strong> dengan jumlah <strong>${minPria} orang</strong> atau <strong>${persenMinPria}%</strong>.
    `;
  document.getElementById("analisis-pria").innerHTML = teksAnalisisPria;

  const maxWanita = Math.max(...dataWanita);
  const minWanita = Math.min(...dataWanita.filter((w) => w > 0)) || 0;
  const indexMaxWanita = dataWanita.indexOf(maxWanita);
  const indexMinWanita = dataWanita.indexOf(minWanita);

  const persenMaxWanita = ((maxWanita / totalWanita) * 100).toFixed(2);
  const persenMinWanita = ((minWanita / totalWanita) * 100).toFixed(2);

  const teksAnalisisWanita = `
        Untuk jenis kelamin <strong>perempuan</strong>, kelompok umur <strong>${labels[indexMaxWanita]}</strong> adalah kelompok umur tertinggi dengan jumlah <strong>${maxWanita} orang</strong> atau <strong>${persenMaxWanita}%</strong>. Sedangkan, kelompok umur terendah adalah <strong>${labels[indexMinWanita]}</strong> dengan jumlah <strong>${minWanita} orang</strong> atau <strong>${persenMinWanita}%</strong>.
    `;
  document.getElementById("analisis-wanita").innerHTML = teksAnalisisWanita;
}

// Fungsi utama membuat canvas chart piramida penduduk
function gambarDiagramResponsif(labels, dataPria, dataWanita) {
  const canvasEl = document.getElementById("piramida-penduduk-chart");
  if (!canvasEl) return;
  const ctx = canvasEl.getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // --- KONFIGURASI MOBILE ---
    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Laki-Laki",
            data: labels.map(() => 0), // Mulai dari 0
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 1.5,
            borderRadius: 4,
            hoverBackgroundColor: "rgba(37, 99, 235, 0.95)",
          },
          {
            label: "Perempuan",
            data: labels.map(() => 0), // Mulai dari 0
            backgroundColor: "rgba(244, 63, 94, 0.75)",
            borderColor: "rgba(225, 29, 72, 1)",
            borderWidth: 1.5,
            borderRadius: 4,
            hoverBackgroundColor: "rgba(225, 29, 72, 0.95)",
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 0.5,
        animation: false, // Animasi dikontrol penuh oleh loop requestAnimationFrame kami
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          y: {
            ticks: { autoSkip: false, font: { size: 9.5 } },
            grid: { display: false },
          },
        },
        plugins: {
          datalabels: {
            color: "#ffffff",
            anchor: "center",
            align: "center",
            font: { size: 9.5, weight: "bold", family: "'Poppins', sans-serif" },
            formatter: (value) => {
              const num = Math.abs(value);
              return num > 0 ? num : "";
            },
          },
        },
      },
    });
  } else {
    // --- KONFIGURASI DESKTOP (PIRAMIDA DUA ARAH) ---
    const maxDataVal = Math.max(...dataPria, ...dataWanita, 10);
    const limitX = Math.ceil((maxDataVal * 1.15) / 5) * 5;

    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Laki-Laki",
            data: labels.map(() => 0), // Mulai dari 0
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 1.5,
            borderRadius: {
              topLeft: 4,
              bottomLeft: 4,
              topRight: 0,
              bottomRight: 0,
            },
            hoverBackgroundColor: "rgba(37, 99, 235, 0.95)",
          },
          {
            label: "Perempuan",
            data: labels.map(() => 0), // Mulai dari 0
            backgroundColor: "rgba(244, 63, 94, 0.75)",
            borderColor: "rgba(225, 29, 72, 1)",
            borderWidth: 1.5,
            borderRadius: {
              topRight: 4,
              bottomRight: 4,
              topLeft: 0,
              bottomLeft: 0,
            },
            hoverBackgroundColor: "rgba(225, 29, 72, 0.95)",
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        animation: false, // Animasi dikontrol penuh oleh loop requestAnimationFrame kami
        scales: {
          x: {
            stacked: true,
            min: -limitX,
            max: limitX,
            ticks: {
              stepSize: limitX > 60 ? 10 : 5,
              callback: (value) => Math.abs(value),
              font: { family: "'Poppins', sans-serif" },
            },
            grid: {
              color: (ctx) =>
                ctx.tick && ctx.tick.value === 0
                  ? "rgba(15, 23, 42, 0.45)"
                  : "rgba(0, 0, 0, 0.06)",
              lineWidth: (ctx) => (ctx.tick && ctx.tick.value === 0 ? 2 : 1),
            },
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: {
              font: { weight: "600", family: "'Poppins', sans-serif" },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label || ""}: ${Math.abs(context.raw)} Orang`,
            },
          },
          datalabels: {
            color: "#ffffff",
            anchor: "center",
            align: "center",
            font: { weight: "bold", size: 10.5, family: "'Poppins', sans-serif" },
            formatter: (value) => {
              const num = Math.abs(value);
              return num > 0 ? num : "";
            },
          },
        },
      },
    });
  }

  // Jalankan animasi pertambahan batang dari 0 ke angka tujuan
  animateChartGrowth(dataPria, dataWanita, isMobile);
}

// Fungsi animasi pertambahan batang grafik dan angka secara live dari 0 ke target
function animateChartGrowth(dataPria, dataWanita, isMobile) {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }

  // Durasi animasi: 1800ms (1.8 detik), tidak terlalu cepat sehingga pertumbuhan batang terlihat jelas
  const duration = 1800;
  const staggerMax = 280; // Efek gelombang dari kelompok umur termuda ke tertua
  const startTime = performance.now();
  const len = dataPria.length;

  function frame(now) {
    const elapsed = now - startTime;
    const overallProgress = Math.min(1, elapsed / duration);

    const currentPria = [];
    const currentWanita = [];

    for (let i = 0; i < len; i++) {
      // Delay bertingkat per bar agar tampak mengalir dari atas ke bawah
      const staggerDelay = (i / len) * staggerMax;
      const barElapsed = Math.max(0, elapsed - staggerDelay);
      const barDuration = duration - staggerMax;
      const barProgress = Math.min(1, barElapsed / barDuration);

      // Easing cubic ease-out: mulai dari 0, melesat stabil, lalu melambat halus saat tiba di angka target
      const ease = 1 - Math.pow(1 - barProgress, 3);

      const targetPria = dataPria[i] || 0;
      const targetWanita = dataWanita[i] || 0;

      const valPria = Math.round(targetPria * ease);
      const valWanita = Math.round(targetWanita * ease);

      currentPria.push(valPria);
      currentWanita.push(valWanita);
    }

    if (myChart) {
      if (isMobile) {
        myChart.data.datasets[0].data = currentPria;
        myChart.data.datasets[1].data = currentWanita;
      } else {
        myChart.data.datasets[0].data = currentPria.map((v) => -v);
        myChart.data.datasets[1].data = currentWanita;
      }
      myChart.update("none"); // Update instan frame-by-frame 60 FPS tanpa animasi bentrok
    }

    if (overallProgress < 1) {
      animFrameId = requestAnimationFrame(frame);
    } else {
      // Frame akhir: pastikan 100% tepat angka target akhir
      if (myChart) {
        if (isMobile) {
          myChart.data.datasets[0].data = [...dataPria];
          myChart.data.datasets[1].data = [...dataWanita];
        } else {
          myChart.data.datasets[0].data = dataPria.map((v) => -v);
          myChart.data.datasets[1].data = [...dataWanita];
        }
        myChart.update("none");
      }
      animFrameId = null;
    }
  }

  animFrameId = requestAnimationFrame(frame);
}

document.addEventListener("DOMContentLoaded", () => {
  loadStatistik();

  const replayBtn = document.getElementById("replay-chart-btn");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      const icon = replayBtn.querySelector("i");
      if (icon) {
        icon.classList.add("fa-spin");
        setTimeout(() => icon.classList.remove("fa-spin"), 900);
      }
      if (cacheLabels.length > 0) {
        gambarDiagramResponsif(cacheLabels, cacheDataPria, cacheDataWanita);
      }
    });
  }
});

// Resize handler dengan debouncing agar tetap responsif
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (cacheLabels.length > 0) {
      gambarDiagramResponsif(cacheLabels, cacheDataPria, cacheDataWanita);
    }
  }, 250);
});

// --- FUNGSI ANIMASI ANGKA STAT CARD ---
function animateValue(obj, start, end, duration, suffix = "") {
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}
