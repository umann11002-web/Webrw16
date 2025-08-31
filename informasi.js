import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// Variabel untuk menyimpan instance diagram agar bisa dihancurkan
let myChart = null;

// Fungsi utama untuk memuat semua data statistik
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

      document.getElementById("total-penduduk").textContent =
        totalPenduduk + " Jiwa";
      document.getElementById("kepala-keluarga").textContent =
        data.kepalaKeluarga + " Jiwa";
      document.getElementById("jumlah-wanita").textContent =
        totalWanita + " Jiwa";
      document.getElementById("jumlah-pria").textContent = totalPria + " Jiwa";

      const labels = Object.keys(kelompokUmur).sort(
        (a, b) => parseInt(a.split("-")[0]) - parseInt(b.split("-")[0])
      );
      const dataPria = labels.map((label) => kelompokUmur[label].pria);
      const dataWanita = labels.map((label) => kelompokUmur[label].wanita);

      gambarDiagramResponsif(labels, dataPria, dataWanita);

      window.addEventListener("resize", () => {
        gambarDiagramResponsif(labels, dataPria, dataWanita);
      });
    } else {
      console.log("Dokumen statistik tidak ditemukan!");
    }
  } catch (error) {
    console.error("Error mengambil data statistik: ", error);
  }
}

// Fungsi pintar untuk menggambar diagram berdasarkan lebar layar
function gambarDiagramResponsif(labels, dataPria, dataWanita) {
  const ctx = document
    .getElementById("piramida-penduduk-chart")
    .getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Jika layar HP, buat diagram batang horizontal biasa
    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Laki-Laki",
            data: dataPria,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Perempuan",
            data: dataWanita,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 0.5,
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            ticks: {
              autoSkip: false,
              font: { size: 9 },
            },
          },
        },
      },
    });
  } else {
    // Jika layar Desktop, buat diagram piramida seperti sebelumnya
    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Laki-Laki",
            data: dataPria.map((num) => -num),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Perempuan",
            data: dataWanita,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        scales: {
          x: {
            stacked: true,
            // [PERBAIKAN] Kembalikan batas min/max agar skala tetap 100
            min: -100,
            max: 100,
            ticks: { callback: (value) => Math.abs(value) },
          },
          y: { stacked: true },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label || ""}: ${Math.abs(context.raw)}`,
            },
          },
        },
      },
    });
  }
}

document.addEventListener("DOMContentLoaded", loadStatistik);
