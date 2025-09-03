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

// Fungsi untuk format tanggal
function formatDate(timestamp) {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function loadBeritaDetail() {
  const params = new URLSearchParams(window.location.search);
  const beritaId = params.get("id");
  const contentEl = document.getElementById("berita-detail-content");

  if (!beritaId) {
    contentEl.innerHTML = "<h1>Berita tidak ditemukan.</h1>";
    return;
  }

  try {
    const docRef = doc(db, "berita", beritaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const berita = docSnap.data();

      // Update judul halaman dan elemen
      document.title = `${berita.judul} - RW 16`;
      document.getElementById("detail-judul").textContent = berita.judul;
      document.getElementById(
        "detail-tanggal-publish"
      ).textContent = `Dipublikasikan pada ${formatDate(berita.tanggal)}`;
      document.getElementById("detail-gambar").src = berita.gambarUrl;
      document.getElementById("detail-isi").innerHTML = berita.isi.replace(
        /\n/g,
        "<br>"
      );

      // [KUNCI] Tampilkan info jadwal acara jika ada
      const jadwalBox = document.getElementById("detail-info-jadwal");
      if (berita.tanggalMulaiAcara) {
        let jadwalText = formatDate(berita.tanggalMulaiAcara);
        if (berita.tanggalSelesaiAcara) {
          jadwalText += ` s/d ${formatDate(berita.tanggalSelesaiAcara)}`;
        }
        jadwalBox.innerHTML = `<i class="fas fa-calendar-alt"></i> <strong>Jadwal Acara:</strong> ${jadwalText}`;
        jadwalBox.style.display = "flex";
      }

      // Update jumlah 'dilihat'
      await updateDoc(docRef, {
        dilihat: increment(1),
      });
    } else {
      contentEl.innerHTML = "<h1>Berita tidak ditemukan.</h1>";
    }
  } catch (error) {
    console.error("Error memuat detail berita: ", error);
    contentEl.innerHTML = "<h1>Gagal memuat berita.</h1>";
  }
}

document.addEventListener("DOMContentLoaded", loadBeritaDetail);
