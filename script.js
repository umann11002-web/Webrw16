// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// === FUNGSI UNTUK MENGAMBIL DAN MENAMPILKAN BERITA ===

const beritaContainer = document.getElementById("berita-container");

async function tampilkanBerita() {
  try {
    // Ambil semua dokumen dari koleksi 'berita'
    const querySnapshot = await getDocs(collection(db, "berita"));

    // Kosongkan kontainer sebelum diisi berita baru
    beritaContainer.innerHTML = "";

    // Looping untuk setiap dokumen (berita) yang ditemukan
    querySnapshot.forEach((doc) => {
      const berita = doc.data(); // Ambil datanya

      // Buat elemen HTML untuk setiap kartu berita
      const kartuHTML = `
        <article class="kartu-berita">
            <img src="${berita.gambarUrl}" alt="Gambar Berita">
            <div class="konten-kartu">
                <span class="tanggal">${berita.tanggal}</span>
                <h3>${berita.judul}</h3>
            </div>
        </article>
      `;

      // Buat div pembungkus untuk slide Swiper
      const slideWrapper = document.createElement("div");
      slideWrapper.className = "swiper-slide";
      slideWrapper.innerHTML = kartuHTML;

      // Masukkan slide yang sudah jadi ke dalam kontainer
      beritaContainer.appendChild(slideWrapper);
    });

    // Setelah semua berita berhasil dimuat, panggil fungsi untuk mengaktifkan slider
    initializeSwiper();
  } catch (error) {
    console.error("Error mengambil data berita: ", error);
    beritaContainer.innerHTML = "<p>Gagal memuat berita. Coba lagi nanti.</p>";
  }
}

// === FUNGSI BARU UNTUK MENGAKTIFKAN SWIPER CAROUSEL ===
function initializeSwiper() {
  const swiper = new Swiper(".mySwiper", {
    // Mengatur agar terlihat beberapa slide sekaligus
    slidesPerView: 1,
    spaceBetween: 30, // Jarak antar slide
    loop: true, // Agar bisa berputar terus menerus

    // Opsi untuk Autoplay
    autoplay: {
      delay: 3000, // Pindah setiap 3 detik
      disableOnInteraction: false, // Tetap autoplay setelah di-swipe manual
    },

    // Opsi untuk Pagination (titik-titik di bawah)
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    // Opsi untuk Navigation (tombol panah)
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    // Pengaturan responsif untuk menyesuaikan jumlah slide di layar berbeda
    breakpoints: {
      // Jika lebar layar 640px atau lebih
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      // Jika lebar layar 1024px atau lebih
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
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

// Panggil fungsi untuk menampilkan berita saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", tampilkanBerita);
