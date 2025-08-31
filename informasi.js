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

// Fungsi utama untuk memuat semua data statistik
async function loadStatistik() {
  try {
    const docRef = doc(db, "statistik", "data_penduduk");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const kelompokUmur = data.kelompokUmur || {};

      // --- PENGHITUNGAN TOTAL OTOMATIS ---
      let totalPria = 0;
      let totalWanita = 0;
      Object.values(kelompokUmur).forEach((kelompok) => {
        totalPria += kelompok.pria || 0;
        totalWanita += kelompok.wanita || 0;
      });
      const totalPenduduk = totalPria + totalWanita;

      // --- UPDATE KARTU RINGKASAN ---
      document.getElementById("total-penduduk").textContent =
        totalPenduduk + " Jiwa";
      document.getElementById("kepala-keluarga").textContent =
        data.kepalaKeluarga + " Jiwa";
      document.getElementById("jumlah-wanita").textContent =
        totalWanita + " Jiwa";
      document.getElementById("jumlah-pria").textContent = totalPria + " Jiwa";

      // --- BUAT PIRAMIDA PENDUDUK ---
      const labels = Object.keys(kelompokUmur).sort(
        (a, b) => parseInt(a.split("-")[0]) - parseInt(b.split("-")[0])
      );
      const dataPria = labels.map((label) => kelompokUmur[label].pria);
      const dataWanita = labels.map((label) => kelompokUmur[label].wanita);
      buatPiramida(labels, dataPria, dataWanita);
    } else {
      console.log("Dokumen statistik tidak ditemukan!");
    }
  } catch (error) {
    console.error("Error mengambil data statistik: ", error);
  }
}

// Fungsi untuk membuat grafik piramida (tidak berubah)
function buatPiramida(labels, dataPria, dataWanita) {
  const ctx = document
    .getElementById("piramida-penduduk-chart")
    .getContext("2d");
  new Chart(ctx, {
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
          barPercentage: 0.9,
          categoryPercentage: 0.8,
        },
        {
          label: "Perempuan",
          data: dataWanita,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.8,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      scales: {
        x: {
          stacked: true,
          min: -100,
          max: 100,
          ticks: { callback: (value) => Math.abs(value) },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            autoSkip: false,
            font: {
              size: 9, // Anda bisa coba angka 8 atau 10 jika perlu
            },
          },
        },
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

document.addEventListener("DOMContentLoaded", loadStatistik);
