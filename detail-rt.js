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

// Fungsi untuk mendapatkan ID RT dari URL
function getRtIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // Contoh: 'rt01'
}

// Fungsi untuk membuat kartu statistik
function createStatCard(label, value, iconClass, colorClass) {
  return `
        <div class="stat-card-small ${colorClass}">
            <i class="fas ${iconClass}"></i>
            <div class="stat-text">
                <p>${label}</p>
                <span>${value}</span>
            </div>
        </div>
    `;
}

async function tampilkanDetailRT() {
  const rtId = getRtIdFromUrl();
  if (!rtId) {
    document.body.innerHTML = "<h1>ID RT tidak ditemukan.</h1>";
    return;
  }

  const rtNumber = rtId.replace("rt", "RT ").toUpperCase();
  document.title = `Struktur ${rtNumber} - RW 16`;
  document.getElementById("rt-sidebar-title").textContent = rtNumber;

  try {
    const docRef = doc(db, "struktur_organisasi", rtId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // --- 1. MEMUAT DATA STATISTIK ---
      const statsContainer = document.getElementById("rt-stats-container");
      statsContainer.innerHTML = ""; // Kosongkan dulu

      const wargaTetap = data.wargaTetap || 0;
      const wargaSementara = data.wargaSementara || 0;
      const lakiLaki = data.lakiLaki || 0;
      const perempuan = data.perempuan || 0;
      const totalKK = data.totalKK || 0;
      const totalJiwa = lakiLaki + perempuan;

      statsContainer.innerHTML += createStatCard(
        "Warga Tetap",
        wargaTetap,
        "fa-user-check",
        "tetap"
      );
      statsContainer.innerHTML += createStatCard(
        "Warga Sementara",
        wargaSementara,
        "fa-user-clock",
        "sementara"
      );
      statsContainer.innerHTML += createStatCard(
        "Laki-laki",
        lakiLaki,
        "fa-mars",
        "laki"
      );
      statsContainer.innerHTML += createStatCard(
        "Perempuan",
        perempuan,
        "fa-venus",
        "perempuan"
      );
      statsContainer.innerHTML += createStatCard(
        "Total KK",
        totalKK,
        "fa-house-user",
        "kk"
      );
      statsContainer.innerHTML += createStatCard(
        "Total Jiwa",
        totalJiwa,
        "fa-users",
        "total"
      );

      // --- 2. MEMUAT STRUKTUR ORGANISASI ---
      const pengurus = data.pengurus || [];
      const desktopContainer = document.getElementById("pengurus-grid-desktop");
      const mobileContainer = document.getElementById("pengurus-slider-mobile");

      if (pengurus.length > 0) {
        desktopContainer.innerHTML = "";
        mobileContainer.innerHTML = "";

        pengurus.forEach((p) => {
          const fotoUrl =
            p.fotoUrl || "https://placehold.co/100x100/eee/ccc?text=Foto";
          // Buat kartu untuk Desktop
          desktopContainer.innerHTML += `
            <div class="org-card">
              <img src="${fotoUrl}" alt="Foto ${p.jabatan}">
              <h3>${p.nama}</h3>
              <p>${p.jabatan}</p>
            </div>
          `;
          // Buat kartu untuk Mobile Slider
          mobileContainer.innerHTML += `
            <div class="swiper-slide">
              <div class="org-card">
                <img src="${fotoUrl}" alt="Foto ${p.jabatan}">
                <h3>${p.nama}</h3>
                <p>${p.jabatan}</p>
              </div>
            </div>
          `;
        });

        // --- 3. INISIALISASI SLIDER SETELAH KARTU DIBUAT ---
        initializeSwiperRT();
      } else {
        desktopContainer.innerHTML = "<p>Data pengurus belum tersedia.</p>";
        mobileContainer.innerHTML = "<p>Data pengurus belum tersedia.</p>";
      }
    } else {
      console.log(`Dokumen untuk ${rtId} tidak ditemukan.`);
      document.getElementById("pengurus-grid-desktop").innerHTML =
        "<p>Data RT tidak ditemukan.</p>";
    }
  } catch (error) {
    console.error("Gagal memuat data RT: ", error);
  }
}

// Fungsi untuk inisialisasi Swiper di halaman detail RT
function initializeSwiperRT() {
  const swiper = new Swiper(".mySwiperRT", {
    slidesPerView: "auto",
    spaceBetween: 15,
    centeredSlides: true,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

document.addEventListener("DOMContentLoaded", tampilkanDetailRT);
