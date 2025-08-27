import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
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

const beritaGridContainer = document.getElementById("berita-grid-container");

async function tampilkanSemuaBerita() {
  try {
    const q = query(collection(db, "berita"), orderBy("tanggal", "desc"));
    const querySnapshot = await getDocs(q);

    beritaGridContainer.innerHTML = "";

    if (querySnapshot.empty) {
      beritaGridContainer.innerHTML =
        "<p>Belum ada berita yang dipublikasikan.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const berita = doc.data();
      const beritaId = doc.id;

      // [FIX] Cek dulu apakah 'berita.isi' ada sebelum membuat cuplikan
      // Jika tidak ada, beri string kosong agar tidak error.
      const cuplikan = berita.isi ? berita.isi.substring(0, 100) + "..." : "";

      // Menggunakan .toDate() untuk mengubah Firebase Timestamp menjadi JavaScript Date
      const tanggal = berita.tanggal.toDate().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const kartuHTML = `
        <a href="berita-detail.html?id=${beritaId}" class="kartu-berita">
            <img src="${berita.gambarUrl}" alt="Gambar Berita">
            <div class="konten-kartu">
                <h3>${berita.judul}</h3>
                <p class="cuplikan">${cuplikan}</p>
                <div class="meta-info-kartu">
                    <span><i class="fas fa-calendar-alt"></i> ${tanggal}</span>
                    <span><i class="fas fa-eye"></i> ${
                      berita.dilihat || 0
                    }</span>
                </div>
            </div>
        </a>
      `;
      beritaGridContainer.innerHTML += kartuHTML;
    });
  } catch (error) {
    console.error("Error mengambil semua berita: ", error);
    beritaGridContainer.innerHTML =
      '<p style="color: red;">Gagal memuat berita.</p>';
  }
}

document.addEventListener("DOMContentLoaded", tampilkanSemuaBerita);
