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

const orgChartContainer = document.getElementById("org-chart-container");
const rwDocRef = doc(db, "struktur_organisasi", "rw");

async function tampilkanStrukturRW() {
  try {
    const docSnap = await getDoc(rwDocRef);
    orgChartContainer.innerHTML = ""; // Kosongkan kontainer

    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurusArray = docSnap.data().pengurus;

      if (pengurusArray.length === 0) {
        orgChartContainer.innerHTML = "<p>Belum ada data pengurus.</p>";
        return;
      }

      // [PERUBAHAN] Loop melalui semua pengurus dan buat slide untuk masing-masing
      pengurusArray.forEach((p) => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide"; // Setiap kartu adalah sebuah slide
        slide.innerHTML = createCardHTML(p);
        orgChartContainer.appendChild(slide);
      });

      // [BARU] Inisialisasi Swiper setelah semua slide ditambahkan
      initializeOrgSwiper();
    } else {
      orgChartContainer.innerHTML =
        "<p>Data struktur organisasi belum tersedia.</p>";
    }
  } catch (error) {
    console.error("Error memuat struktur RW: ", error);
    orgChartContainer.innerHTML =
      '<p style="color:red;">Gagal memuat data.</p>';
  }
}

// Fungsi pembantu untuk membuat HTML kartu (tidak berubah)
function createCardHTML(pengurus) {
  return `
    <div class="org-card">
      <img src="${
        pengurus.fotoUrl || "https://placehold.co/100x100/EFEFEF/333?text=Foto"
      }" alt="Foto ${pengurus.jabatan}">
      <h3>${pengurus.nama}</h3>
      <p>${pengurus.jabatan}</p>
    </div>
  `;
}

// [BARU] Fungsi untuk inisialisasi Swiper
function initializeOrgSwiper() {
  const swiper = new Swiper(".org-swiper", {
    // Opsi untuk mobile
    slidesPerView: "auto",
    spaceBetween: 15,
    centeredSlides: true,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    // Nonaktifkan beberapa fitur di desktop
    breakpoints: {
      769: {
        // Ukuran desktop
        slidesPerView: 4,
        spaceBetween: 30,
        centeredSlides: false,
        loop: false,
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", tampilkanStrukturRW);
