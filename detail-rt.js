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

function getRtIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Fungsi Bantuan untuk mengisi kartu pengurus (desktop)
function populateOrgCard(elementId, pengurusData) {
  const card = document.getElementById(elementId);
  if (card && pengurusData) {
    card.querySelector("img").src =
      pengurusData.fotoUrl || "https://placehold.co/100x100/eee/ccc?text=Foto";
    card.querySelector("h3").textContent = pengurusData.nama;
  } else if (card) {
    card.style.display = "none";
  }
}

async function tampilkanDetailRT() {
  const rtId = getRtIdFromUrl();
  if (!rtId) {
    document.body.innerHTML = "<h1>ID RT tidak ditemukan.</h1>";
    return;
  }

  const rtNumber = rtId.replace("rt", "RT ").toUpperCase();
  document.title = `Struktur ${rtNumber} - RW 16`;
  document.getElementById("rt-sidebar-title").textContent = rtNumber;

  try {
    const docRef = doc(db, "struktur_organisasi", rtId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const pengurus = data.pengurus || [];

      // --- Mengisi Bagan Desktop ---
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

      // --- [BARU] Mengisi Swiper Mobile ---
      const swiperWrapper = document.getElementById("pengurus-swiper-wrapper");
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

      // Inisialisasi Swiper SETELAH slide ditambahkan
      new Swiper(".swiper-container", {
        slidesPerView: "auto",
        spaceBetween: 15,
        centeredSlides: true,
        loop: false,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });

      // --- Mengisi Statistik ---
      document.getElementById("stat-tetap").textContent = data.wargaTetap || 0;
      document.getElementById("stat-sementara").textContent =
        data.wargaSementara || 0;
      document.getElementById("stat-jumlah").textContent =
        (data.wargaTetap || 0) + (data.wargaSementara || 0);
    } else {
      console.log(`Dokumen untuk ${rtId} tidak ditemukan.`);
    }
  } catch (error) {
    console.error("Gagal memuat data RT: ", error);
  }
}

document.addEventListener("DOMContentLoaded", tampilkanDetailRT);
