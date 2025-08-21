// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Konfigurasi Firebase dari HTML-mu (GANTI DENGAN PUNYAMU)
// Cukup salin bagian 'const firebaseConfig = { ... };' dari index.html
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

// 1. Ambil elemen kontainer berita dari HTML
const beritaContainer = document.getElementById("berita-container");

// 2. Fungsi utama untuk mengambil data dari Firestore
async function tampilkanBerita() {
  try {
    // Ambil semua dokumen dari koleksi 'berita'
    const querySnapshot = await getDocs(collection(db, "berita"));

    // Kosongkan kontainer sebelum diisi berita baru
    beritaContainer.innerHTML = "";

    // 3. Looping untuk setiap dokumen (berita) yang ditemukan
    querySnapshot.forEach((doc) => {
      const berita = doc.data(); // Ambil datanya (judul, tanggal, gambarUrl)

      // 4. Buat elemen HTML untuk setiap kartu berita
      const kartuHTML = `
                <article class="kartu-berita">
                    <img src="${berita.gambarUrl}" alt="Gambar Berita">
                    <div class="konten-kartu">
                        <span class="tanggal">${berita.tanggal}</span>
                        <h3>${berita.judul}</h3>
                    </div>
                </article>
            `;

      // 5. Masukkan kartu yang sudah jadi ke dalam kontainer
      beritaContainer.innerHTML += kartuHTML;
    });
  } catch (error) {
    console.error("Error mengambil data berita: ", error);
    beritaContainer.innerHTML = "<p>Gagal memuat berita. Coba lagi nanti.</p>";
  }
}

// === FUNGSI UNTUK HAMBURGER MENU (KODE LAMA) ===
const hamburgerMenu = document.getElementById("hamburger-menu");
const navbar = document.querySelector(".navbar");

hamburgerMenu.addEventListener("click", () => {
  navbar.classList.toggle("active");
});

// Panggil fungsi untuk menampilkan berita saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", tampilkanBerita);
