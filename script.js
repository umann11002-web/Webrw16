// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
// TAMBAHKAN IMPORT UNTUK AUTHENTICATION
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Konfigurasi Firebase-mu (sudah disesuaikan)
const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.firebasestorage.app",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Inisialisasi Authentication

// ===================================================
// === BAGIAN BARU: CEK STATUS LOGIN & UPDATE NAVIGASI ===
// ===================================================
const loginButtonNav = document.getElementById("login-button-nav");
const profilDropdown = document.getElementById("profil-dropdown");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User sedang login
    console.log("User terdeteksi:", user.email);
    loginButtonNav.style.display = "none"; // Sembunyikan tombol Login
    profilDropdown.style.display = "inline-block"; // Tampilkan dropdown Profil
  } else {
    // User tidak login
    console.log("Tidak ada user yang login.");
    loginButtonNav.style.display = "inline-block"; // Tampilkan tombol Login
    profilDropdown.style.display = "none"; // Sembunyikan dropdown Profil
  }
});

// === FUNGSI UNTUK MENGAMBIL DAN MENAMPILKAN BERITA (TETAP SAMA) ===
const beritaContainer = document.getElementById("berita-container");

async function tampilkanBerita() {
  try {
    const querySnapshot = await getDocs(collection(db, "berita"));
    beritaContainer.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const berita = doc.data();
      const kartuHTML = `
        <article class="kartu-berita">
            <img src="${berita.gambarUrl}" alt="Gambar Berita">
            <div class="konten-kartu">
                <span class="tanggal">${berita.tanggal}</span>
                <h3>${berita.judul}</h3>
            </div>
        </article>
      `;
      const slideWrapper = document.createElement("div");
      slideWrapper.className = "swiper-slide";
      slideWrapper.innerHTML = kartuHTML;
      beritaContainer.appendChild(slideWrapper);
    });
    initializeSwiper();
  } catch (error) {
    console.error("Error mengambil data berita: ", error);
    beritaContainer.innerHTML = "<p>Gagal memuat berita. Coba lagi nanti.</p>";
  }
}

// === FUNGSI UNTUK MENGAKTIFKAN SWIPER CAROUSEL (TETAP SAMA) ===
function initializeSwiper() {
  const swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
    },
  });
}

// === FUNGSI UNTUK HAMBURGER MENU (TETAP SAMA) ===
const hamburgerMenu = document.getElementById("hamburger-menu");
const navbar = document.querySelector(".navbar");
if (hamburgerMenu) {
  hamburgerMenu.addEventListener("click", () => {
    navbar.classList.toggle("active");
  });
}

// =====================================
// === LOGIKA BARU UNTUK DROPDOWN MENU ===
// =====================================
function closeAllDropdowns() {
  document
    .querySelectorAll(".dropdown-menu")
    .forEach((menu) => menu.classList.remove("active"));
  document
    .querySelectorAll(".dropdown-toggle")
    .forEach((toggle) => toggle.classList.remove("active"));
}

document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const menu = toggle.nextElementSibling;
    const isActive = menu.classList.contains("active");
    closeAllDropdowns();
    if (!isActive) {
      menu.classList.add("active");
      toggle.classList.add("active");
    }
  });
});

window.addEventListener("click", () => {
  closeAllDropdowns();
});

// === LOGIKA BARU UNTUK TOMBOL LOGOUT ===
const logoutLinkNav = document.getElementById("logout-link-nav");
if (logoutLinkNav) {
  logoutLinkNav.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        console.log("Logout berhasil.");
        alert("Anda berhasil logout.");
        window.location.href = "index.html"; // Kembali ke halaman utama setelah logout
      })
      .catch((error) => {
        console.error("Error saat logout:", error);
      });
  });
}

// Panggil fungsi yang relevan saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Cek apakah kita berada di halaman yang memiliki kontainer berita
  if (document.getElementById("berita-container")) {
    tampilkanBerita();
  }
  // Fungsi lain yang perlu dijalankan di semua halaman bisa ditambahkan di sini
});
