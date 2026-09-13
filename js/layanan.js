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

// Helper untuk menentukan identitas visual (ikon Font Awesome & aksen warna) berdasarkan nama/ID layanan
function getLayananVisualIdentity(namaLayanan = "", id = "") {
  const text = (namaLayanan + " " + id).toLowerCase();

  if (text.includes("sktm") || text.includes("tidak mampu") || text.includes("bantuan") || text.includes("sosial")) {
    return { icon: "fa-hand-holding-heart", color: "#0284c7" };
  }
  if (text.includes("domisili") || text.includes("tempat tinggal") || text.includes("tinggal")) {
    return { icon: "fa-house-user", color: "#2563eb" };
  }
  if (text.includes("ktp") || text.includes("kk") || text.includes("kartu keluarga") || text.includes("identitas")) {
    return { icon: "fa-id-card", color: "#4f46e5" };
  }
  if (text.includes("usaha") || text.includes("sku") || text.includes("bisnis") || text.includes("dagang")) {
    return { icon: "fa-store", color: "#d97706" };
  }
  if (text.includes("nikah") || text.includes("perkawinan") || text.includes("kawin")) {
    return { icon: "fa-heart", color: "#e11d48" };
  }
  if (text.includes("kematian") || text.includes("meninggal")) {
    return { icon: "fa-file-medical", color: "#475569" };
  }
  if (text.includes("pindah") || text.includes("keluar") || text.includes("mutasi")) {
    return { icon: "fa-truck-moving", color: "#0891b2" };
  }
  if (text.includes("kelahiran") || text.includes("lahir") || text.includes("anak")) {
    return { icon: "fa-baby", color: "#059669" };
  }
  if (text.includes("kehilangan") || text.includes("lapor")) {
    return { icon: "fa-shield-halved", color: "#6366f1" };
  }
  return { icon: "fa-file-signature", color: "#2c3e50" };
}

// Fungsi utama untuk mengambil dan menampilkan daftar layanan
async function tampilkanLayanan() {
  try {
    const querySnapshot = await getDocs(collection(db, "layanan"));

    // Kosongkan kontainer sebelum diisi
    layananContainer.innerHTML = "";

    if (querySnapshot.empty) {
      layananContainer.innerHTML = `
        <div class="layanan-empty">
          <i class="fas fa-folder-open"></i>
          <p>Saat ini belum ada layanan yang tersedia.</p>
        </div>
      `;
      return;
    }

    // Looping untuk setiap dokumen (layanan) yang ditemukan
    querySnapshot.forEach((doc) => {
      const layanan = doc.data();
      const layananId = doc.id; // ID dokumen (misal: 'sktm')
      const visual = getLayananVisualIdentity(layanan.namaLayanan, layananId);

      // Normalisasi daftar persyaratan dari array
      const rawPersyaratan = Array.isArray(layanan.persyaratan)
        ? layanan.persyaratan
        : typeof layanan.persyaratan === "string"
        ? layanan.persyaratan.split(",").map((s) => s.trim())
        : [];

      let persyaratanListHTML = "";
      if (rawPersyaratan.length > 0) {
        rawPersyaratan.forEach((item) => {
          persyaratanListHTML += `<li><i class="fas fa-check-circle"></i> <span>${item}</span></li>`;
        });
      } else {
        persyaratanListHTML = `<li><i class="fas fa-info-circle" style="color: #94a3b8;"></i> <span>Hubungi pengurus RT/RW untuk informasi dokumen.</span></li>`;
      }

      // Membuat HTML untuk satu kartu layanan dengan struktur flex equal-height
      const kartuHTML = `
        <div class="kartu-layanan">
          <div class="kartu-layanan-header">
            <div class="layanan-icon-badge" style="color: ${visual.color}; background-color: ${visual.color}15;">
              <i class="fas ${visual.icon}"></i>
            </div>
            <div class="layanan-header-info">
              <h3>${layanan.namaLayanan}</h3>
              ${
                layanan.deskripsi
                  ? `<p class="kartu-layanan-desc">${layanan.deskripsi}</p>`
                  : ""
              }
            </div>
          </div>

          <div class="kartu-layanan-body">
            <p class="persyaratan-label">
              <i class="fas fa-clipboard-list"></i> Persyaratan Dokumen:
            </p>
            <ul class="persyaratan-list">
              ${persyaratanListHTML}
            </ul>
          </div>

          <div class="kartu-layanan-footer">
            <a href="form.html?id=${layananId}" class="btn-ajukan-layanan tombol-ajukan">
              <span>Ajukan Surat</span>
              <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      `;
      // Tambahkan kartu yang sudah jadi ke dalam kontainer
      layananContainer.innerHTML += kartuHTML;
    });
  } catch (error) {
    console.error("Error mengambil data layanan: ", error);
    layananContainer.innerHTML = `
      <div class="layanan-empty">
        <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
        <p>Gagal memuat daftar layanan. Silakan coba beberapa saat lagi.</p>
      </div>
    `;
  }
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", tampilkanLayanan);
