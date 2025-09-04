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

// [DIUBAH] Menggunakan ID yang benar dari kode lama Anda
const beritaGridContainer = document.getElementById("berita-grid-container");

// Fungsi format tanggal (tetap sama)
function formatDate(timestamp, formatOptions) {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleDateString("id-ID", formatOptions);
}

// Ganti fungsi lama Anda dengan yang ini
async function tampilkanSemuaBerita() {
  try {
    const q = query(collection(db, "berita"), orderBy("tanggal", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      beritaGridContainer.innerHTML =
        "<p>Belum ada berita yang dipublikasikan.</p>";
      return;
    }

    // 1. Buat variabel kosong untuk menampung semua HTML kartu
    let semuaKartuHTML = "";

    querySnapshot.forEach((doc) => {
      const berita = doc.data();
      const beritaId = doc.id;
      const cuplikan = berita.isi ? berita.isi.substring(0, 100) + "..." : "";

      const tanggalPublish = formatDate(berita.tanggal, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      let infoJadwalHTML = "";
      if (berita.tanggalMulaiAcara) {
        const tglMulai = formatDate(berita.tanggalMulaiAcara, {
          day: "numeric",
          month: "short",
        });
        infoJadwalHTML = `<p class="info-jadwal-kartu"><i class="fas fa-calendar-check"></i> Acara mulai ${tglMulai}</p>`;
      }

      const kartuHTML = `
        <a href="berita-detail.html?id=${beritaId}" class="kartu-berita">
            <img src="${
              berita.gambarUrl ||
              "https://placehold.co/400x250/eee/ccc?text=Gambar"
            }" alt="Gambar Berita">
            <div class="konten-kartu">
                <h3>${berita.judul}</h3>
                <p class="cuplikan">${cuplikan}</p>
                ${infoJadwalHTML}
                <div class="meta-info-kartu">
                    <span><i class="fas fa-calendar-alt"></i> ${tanggalPublish}</span>
                    <span><i class="fas fa-eye"></i> ${
                      berita.dilihat || 0
                    }</span>
                </div>
            </div>
        </a>
      `;

      // 2. Tambahkan setiap kartu ke variabel penampung (bukan ke halaman langsung)
      semuaKartuHTML += kartuHTML;
    });

    // 3. Setelah loop selesai, masukkan semua HTML ke halaman sekaligus
    beritaGridContainer.innerHTML = semuaKartuHTML;
  } catch (error) {
    console.error("Error mengambil semua berita: ", error);
    beritaGridContainer.innerHTML =
      '<p style="color: red;">Gagal memuat berita.</p>';
  }
}

document.addEventListener("DOMContentLoaded", tampilkanSemuaBerita);
