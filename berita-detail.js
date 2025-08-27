import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
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

const beritaContainer = document.getElementById("berita-detail-container");

function getBeritaIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function tampilkanDetailBerita() {
  const beritaId = getBeritaIdFromUrl();
  if (!beritaId) {
    beritaContainer.innerHTML = "<p>Berita tidak ditemukan.</p>";
    return;
  }

  try {
    const docRef = doc(db, "berita", beritaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const berita = docSnap.data();
      document.title = `${berita.judul || "Berita"} - RW 16`;

      // [FIX] Pengecekan tanggal yang lebih kuat
      let tanggalFormatted = "Tanggal tidak tersedia";
      if (berita.tanggal && typeof berita.tanggal.toDate === "function") {
        tanggalFormatted = berita.tanggal.toDate().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } else if (berita.tanggal) {
        tanggalFormatted = berita.tanggal; // Tampilkan sebagai teks jika bukan timestamp
      }

      // [FIX] Pengecekan isi berita yang lebih kuat
      const isiBerita = berita.isi || "<p>[Isi berita tidak tersedia]</p>";

      beritaContainer.innerHTML = `
        <div class="berita-header">
          <img src="${berita.gambarUrl}" alt="${berita.judul}">
          <h1>${berita.judul}</h1>
          <div class="meta-info">
            <span><i class="fas fa-calendar-alt"></i> ${tanggalFormatted}</span>
            <span><i class="fas fa-user"></i> Ditulis oleh Admin</span>
            <span><i class="fas fa-eye"></i> Dilihat ${
              berita.dilihat || 0
            } kali</span>
          </div>
        </div>
        <div class="berita-content">
          ${isiBerita}
        </div>
      `;

      // Update jumlah 'dilihat'
      await updateDoc(docRef, {
        dilihat: increment(1),
      });
    } else {
      beritaContainer.innerHTML = "<p>Berita tidak ditemukan.</p>";
    }
  } catch (error) {
    console.error("Error mengambil detail berita: ", error);
    beritaContainer.innerHTML = "<p>Gagal memuat berita.</p>";
  }
}

document.addEventListener("DOMContentLoaded", tampilkanDetailBerita);
