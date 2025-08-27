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

// Fungsi untuk mengambil ID berita dari URL
function getBeritaIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Fungsi untuk menampilkan detail berita
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

      // Update judul halaman
      document.title = `${berita.judul} - RW 16`;

      // Format tanggal
      const tanggal = new Date(berita.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Render HTML
      beritaContainer.innerHTML = `
        <div class="berita-header">
          <img src="${berita.gambarUrl}" alt="${berita.judul}">
          <h1>${berita.judul}</h1>
          <div class="meta-info">
            <span><i class="fas fa-calendar-alt"></i> ${tanggal}</span>
            <span><i class="fas fa-user"></i> Ditulis oleh Admin</span>
            <span><i class="fas fa-eye"></i> Dilihat ${
              berita.dilihat || 0
            } kali</span>
          </div>
        </div>
        <div class="berita-content">
          ${berita.isi}
        </div>
      `;

      // Update jumlah 'dilihat' (increment)
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
