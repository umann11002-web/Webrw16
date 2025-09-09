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

      // Ambil semua data statistik dari Firebase
      const wargaTetap = data.wargaTetap || 0;
      const wargaSementara = data.wargaSementara || 0;
      const jumlahLaki = data.jumlahLaki || 0;
      const jumlahPerempuan = data.jumlahPerempuan || 0;
      const totalKK = data.totalKK || 0;
      const totalJiwa = wargaTetap + wargaSementara;

      // Update elemen statistik di HTML
      document.getElementById("stat-tetap").textContent = wargaTetap;
      document.getElementById("stat-sementara").textContent = wargaSementara;
      document.getElementById("stat-laki").textContent = jumlahLaki;
      document.getElementById("stat-perempuan").textContent = jumlahPerempuan;
      document.getElementById("stat-kk").textContent = totalKK;
      document.getElementById("stat-jumlah").textContent = totalJiwa;

      const pengurus = data.pengurus || [];
      const desktopContainer = document.getElementById("pengurus-grid-desktop");
      const mobileWrapper = document.getElementById("pengurus-wrapper-mobile");

      if (pengurus.length > 0) {
        desktopContainer.innerHTML = "";
        mobileWrapper.innerHTML = "";

        let cardsHTML = "";
        let slidesHTML = "";

        pengurus.forEach((p) => {
          const cardContent = `
            <img src="${
              p.fotoUrl || "https://placehold.co/100x100/eee/ccc?text=Foto"
            }" alt="Foto ${p.jabatan}">
            <h3>${p.nama}</h3>
            <p>${p.jabatan}</p>
          `;

          cardsHTML += `<div class="org-card">${cardContent}</div>`;
          slidesHTML += `<div class="swiper-slide"><div class="org-card">${cardContent}</div></div>`;
        });

        desktopContainer.innerHTML = cardsHTML;
        mobileWrapper.innerHTML = slidesHTML;

        // Inisialisasi Swiper Slider setelah data dimuat
        new Swiper("#pengurus-slider-mobile", {
          slidesPerView: "auto",
          spaceBetween: 15,
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
        });
      } else {
        desktopContainer.innerHTML = "<p>Data pengurus belum tersedia.</p>";
      }
    } else {
      console.log(`Dokumen untuk ${rtId} tidak ditemukan.`);
      document.getElementById("pengurus-grid-desktop").innerHTML =
        "<p>Data RT tidak ditemukan.</p>";
    }
  } catch (error) {
    console.error("Gagal memuat data RT: ", error);
  }
}

document.addEventListener("DOMContentLoaded", tampilkanDetailRT);
