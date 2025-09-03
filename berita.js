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
  const beritaContainer = document.getElementById("berita-container");
  try {
    const q = query(collection(db, "berita"), orderBy("tanggal", "desc"));
    const querySnapshot = await getDocs(q);

    beritaContainer.innerHTML = "";
    if (querySnapshot.empty) {
      beritaContainer.innerHTML =
        "<p>Belum ada berita yang dipublikasikan.</p>";
      return;
    }
    querySnapshot.forEach((doc) => {
      const berita = doc.data();
      const beritaId = doc.id;
      const tanggalPublish = berita.tanggal
        .toDate()
        .toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

      // [BARU] Buat HTML untuk info jadwal jika ada
      let infoJadwalHTML = "";
      if (berita.tanggalMulaiAcara) {
        const tglMulai = berita.tanggalMulaiAcara
          .toDate()
          .toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        infoJadwalHTML = `<p class="info-jadwal-kartu"><i class="fas fa-calendar-check"></i> Acara mulai ${tglMulai}</p>`;
      }

      const kartuHTML = `
        <a href="berita-detail.html?id=${beritaId}" class="kartu-berita">
            <img src="${berita.gambarUrl}" alt="Gambar Berita">
            <div class="konten-kartu">
                <h3>${berita.judul}</h3>
               <!-- [BARU] Tampilkan info jadwal di sini -->
               ${infoJadwalHTML}
               <div class="meta-info-kartu">
                    <span><i class="fas fa-calendar-day"></i> ${tanggalPublish}</span>
                    <span><i class="fas fa-eye"></i> ${
                      berita.dilihat || 0
                    }</span>
               </div>
            </div>
        </a>
      `;
      beritaContainer.innerHTML += kartuHTML;
    });
  } catch (error) {
    console.error("Error mengambil data berita: ", error);
    beritaContainer.innerHTML = "<p>Gagal memuat berita.</p>";
  }
}

document.addEventListener("DOMContentLoaded", tampilkanSemuaBerita);
