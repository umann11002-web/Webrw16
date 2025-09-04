import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
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

// Fungsi untuk mendapatkan ID RT dari URL
function getRtIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // Contoh: 'rt01'
}

// Fungsi bantuan untuk mengisi data ke kartu pengurus (desktop)
function populateOrgCard(elementId, pengurusData) {
  const card = document.getElementById(elementId);
  if (card && pengurusData) {
    card.innerHTML = `
            <img src="${
              pengurusData.fotoUrl ||
              "https://placehold.co/100x100/eee/ccc?text=Foto"
            }" alt="Foto ${pengurusData.jabatan}">
            <h3>${pengurusData.nama}</h3>
            <p>${pengurusData.jabatan}</p>
        `;
  } else if (card) {
    card.style.display = "none"; // Sembunyikan jika tidak ada data
  }
}

async function tampilkanDetailRT() {
  const rtId = getRtIdFromUrl();
  if (!rtId) {
    document.body.innerHTML = "<h1>ID RT tidak ditemukan.</h1>";
    return;
  }

  // Mengubah 'rt01' menjadi 'RT 01' untuk judul
  const rtNumber = rtId.replace("rt", "RT ").toUpperCase();
  document.title = `Struktur ${rtNumber} - RW 16`;
  document.getElementById("rt-sidebar-title").textContent = rtNumber;

  try {
    const docRef = doc(db, "struktur_organisasi", rtId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // 1. Tampilkan semua data statistik dari dokumen (versi manual)
      const wargaTetap = data.wargaTetap || 0;
      const wargaSementara = data.wargaSementara || 0;
      document.getElementById("stat-tetap").textContent = wargaTetap;
      document.getElementById("stat-sementara").textContent = wargaSementara;
      document.getElementById("stat-laki").textContent =
        data.jumlahLakiLaki || 0;
      document.getElementById("stat-perempuan").textContent =
        data.jumlahPerempuan || 0;
      document.getElementById("stat-kk").textContent = data.jumlahKK || 0;
      document.getElementById("stat-total").textContent =
        wargaTetap + wargaSementara;

      // 2. Tampilkan data pengurus
      const pengurus = data.pengurus || [];

      // Mengisi Bagan Desktop
      const ketua = pengurus.find((p) =>
        p.jabatan.toLowerCase().includes("ketua")
      );
      const sekretaris = pengurus.find((p) =>
        p.jabatan.toLowerCase().includes("sekretaris")
      );
      const bendahara = pengurus.find((p) =>
        p.jabatan.toLowerCase().includes("bendahara")
      );

      populateOrgCard("ketua-rt-desktop", ketua);
      populateOrgCard("sekretaris-rt-desktop", sekretaris);
      populateOrgCard("bendahara-rt-desktop", bendahara);

      // Mengisi Swiper Mobile
      const swiperWrapper = document.getElementById("pengurus-swiper-wrapper");
      if (swiperWrapper) {
        let slidesHTML = "";
        pengurus.forEach((p) => {
          slidesHTML += `
                        <div class="swiper-slide">
                            <div class="org-card">
                                <img src="${
                                  p.fotoUrl ||
                                  "https://placehold.co/100x100/eee/ccc?text=Foto"
                                }" alt="Foto ${p.jabatan}">
                                <h3>${p.nama}</h3>
                                <p>${p.jabatan}</p>
                            </div>
                        </div>
                    `;
        });
        swiperWrapper.innerHTML = slidesHTML;

        // Inisialisasi Swiper
        new Swiper(".swiper-container", {
          slidesPerView: "auto", // Ini kunci agar lebar CSS dipakai
          spaceBetween: 15, // Jarak 15px antar kartu
          centeredSlides: true, // Kartu aktif akan di tengah (opsional, tapi bagus)
          loop: false, // Jangan mengulang slide
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
        });
      }
    } else {
      console.log(`Dokumen untuk ${rtId} tidak ditemukan.`);
      // Anda bisa menambahkan pesan error di halaman di sini jika mau
    }
  } catch (error) {
    console.error("Gagal memuat data RT: ", error);
  }
}

document.addEventListener("DOMContentLoaded", tampilkanDetailRT);
