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

let myChart = null;

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
      tampilkanAnalisisData(
        labels,
        dataPria,
        dataWanita,
        totalPria,
        totalWanita
      );

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

function tampilkanAnalisisData(
  labels,
  dataPria,
  dataWanita,
  totalPria,
  totalWanita
) {
  if (totalPria === 0 || totalWanita === 0) return; // Jangan tampilkan jika tidak ada data

  // --- Analisis Data Laki-Laki ---
  const maxPria = Math.max(...dataPria);
  const minPria = Math.min(...dataPria.filter((p) => p > 0));
  const indexMaxPria = dataPria.indexOf(maxPria);
  const indexMinPria = dataPria.indexOf(minPria);

  const persenMaxPria = ((maxPria / totalPria) * 100).toFixed(2);
  const persenMinPria = ((minPria / totalPria) * 100).toFixed(2);

  const teksAnalisisPria = `
        Untuk jenis kelamin <strong>laki-laki</strong>, kelompok umur <strong>${labels[indexMaxPria]}</strong> adalah kelompok umur tertinggi dengan jumlah <strong>${maxPria} orang</strong> atau <strong>${persenMaxPria}%</strong>. Sedangkan, kelompok umur terendah adalah <strong>${labels[indexMinPria]}</strong> dengan jumlah <strong>${minPria} orang</strong> atau <strong>${persenMinPria}%</strong>.
    `;
  document.getElementById("analisis-pria").innerHTML = teksAnalisisPria;

  // --- Analisis Data Perempuan ---
  const maxWanita = Math.max(...dataWanita);
  const minWanita = Math.min(...dataWanita.filter((w) => w > 0));
  const indexMaxWanita = dataWanita.indexOf(maxWanita);
  const indexMinWanita = dataWanita.indexOf(minWanita);

  const persenMaxWanita = ((maxWanita / totalWanita) * 100).toFixed(2);
  const persenMinWanita = ((minWanita / totalWanita) * 100).toFixed(2);

  const teksAnalisisWanita = `
        Untuk jenis kelamin <strong>perempuan</strong>, kelompok umur <strong>${labels[indexMaxWanita]}</strong> adalah kelompok umur tertinggi dengan jumlah <strong>${maxWanita} orang</strong> atau <strong>${persenMaxWanita}%</strong>. Sedangkan, kelompok umur terendah adalah <strong>${labels[indexMinWanita]}</strong> dengan jumlah <strong>${minWanita} orang</strong> atau <strong>${persenMinWanita}%</strong>.
    `;
  document.getElementById("analisis-wanita").innerHTML = teksAnalisisWanita;
}

function gambarDiagramResponsif(labels, dataPria, dataWanita) {
  const ctx = document
    .getElementById("piramida-penduduk-chart")
    .getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
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
          x: { beginAtZero: true },
          y: { ticks: { autoSkip: false, font: { size: 9 } } },
        },
      },
    });
  } else {
    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
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
