// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Konfigurasi Firebase-mu
const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.appspot.com",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ambil elemen kontainer dari HTML
const layananContainer = document.getElementById("layanan-grid-container");

// Fungsi utama untuk mengambil dan menampilkan daftar layanan
async function tampilkanLayanan() {
  try {
    const querySnapshot = await getDocs(collection(db, "layanan"));

    // Kosongkan kontainer sebelum diisi
    layananContainer.innerHTML = "";

    if (querySnapshot.empty) {
      layananContainer.innerHTML =
        "<p>Saat ini belum ada layanan yang tersedia.</p>";
      return;
    }

    // Looping untuk setiap dokumen (layanan) yang ditemukan
    querySnapshot.forEach((doc) => {
      const layanan = doc.data();
      const layananId = doc.id; // Ini akan mengambil ID dokumen (misal: 'sktm')

      // Membuat daftar persyaratan dari array
      let persyaratanListHTML = "";
      layanan.persyaratan.forEach((item) => {
        persyaratanListHTML += `<li><i class="fas fa-file-alt"></i> ${item}</li>`;
      });

      // Membuat HTML untuk satu kartu layanan
      const kartuHTML = `
                <div class="kartu-layanan">
                    <h3>${layanan.namaLayanan}</h3>
                    <p>Persyaratan Dokumen:</p>
                    <ul>
                        ${persyaratanListHTML}
                    </ul>
                    <!-- Link ini akan mengarah ke halaman form dengan membawa ID layanan -->
                    <a href="form.html?id=${layananId}" class="tombol-ajukan">Ajukan Surat</a>
                </div>
            `;
      // Tambahkan kartu yang sudah jadi ke dalam kontainer
      layananContainer.innerHTML += kartuHTML;
    });
  } catch (error) {
    console.error("Error mengambil data layanan: ", error);
    layananContainer.innerHTML =
      '<p style="color: red;">Gagal memuat daftar layanan. Silakan coba lagi nanti.</p>';
  }
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", tampilkanLayanan);
