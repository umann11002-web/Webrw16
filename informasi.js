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

// Fungsi utama untuk memuat data statistik
async function loadStatistik() {
  try {
    const docRef = doc(db, "statistik", "data_penduduk");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // 1. Update kartu ringkasan
      document.getElementById("total-penduduk").textContent =
        data.totalPenduduk + " Jiwa";
      document.getElementById("kepala-keluarga").textContent =
        data.kepalaKeluarga + " Jiwa";
      document.getElementById("jumlah-wanita").textContent =
        data.jumlahWanita + " Jiwa";
      document.getElementById("jumlah-pria").textContent =
        data.jumlahPria + " Jiwa";

      // 2. Buat grafik jenis kelamin
      buatGrafikGender(data.jumlahPria, data.jumlahWanita);
    } else {
      console.log("Dokumen statistik tidak ditemukan!");
    }
  } catch (error) {
    console.error("Error mengambil data statistik: ", error);
  }
}

// Fungsi untuk membuat grafik menggunakan Chart.js
function buatGrafikGender(pria, wanita) {
  const ctx = document.getElementById("chart-gender").getContext("2d");
  new Chart(ctx, {
    type: "bar", // Tipe grafik: bar, pie, line, dll.
    data: {
      labels: ["Laki-laki", "Perempuan"],
      datasets: [
        {
          label: "Jumlah Penduduk",
          data: [pria, wanita],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)", // Warna biru untuk pria
            "rgba(255, 99, 132, 0.6)", // Warna pink untuk wanita
          ],
          borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false, // Sembunyikan legenda
        },
      },
    },
  });
}

// Panggil fungsi utama saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadStatistik);
