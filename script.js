// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Konfigurasi Firebase-mu
const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.appspot.com",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  // --- Logika Status Login & Navigasi ---
  const loginButtonNav = document.getElementById("login-button-nav");
  const profilDropdown = document.getElementById("profil-dropdown");
  const bottomNavLogin = document.getElementById("bottom-nav-login");
  const bottomNavProfil = document.getElementById("bottom-nav-profil");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (loginButtonNav) loginButtonNav.style.display = "none";
      if (profilDropdown) profilDropdown.style.display = "inline-block";
      if (bottomNavLogin) bottomNavLogin.style.display = "none";
      if (bottomNavProfil) bottomNavProfil.style.display = "flex";
    } else {
      if (loginButtonNav) loginButtonNav.style.display = "inline-block";
      if (profilDropdown) profilDropdown.style.display = "none";
      if (bottomNavLogin) bottomNavLogin.style.display = "flex";
      if (bottomNavProfil) bottomNavProfil.style.display = "none";
    }
  }); // --- Logika untuk Slider Berita (hanya di index.html) ---

  if (document.getElementById("berita-container")) {
    tampilkanBerita();
  } // --- Logika untuk Statistik di Home ---

  if (document.getElementById("home-total-penduduk")) {
    loadHomeStats();
  }

  // [BARU] Logika untuk Sambutan Ketua RW (hanya di index.html)
  if (document.querySelector(".sambutan-ketua")) {
    loadSambutan();
  } // --- Logika untuk Hamburger Menu ---

  const hamburgerMenu = document.getElementById("hamburger-menu");
  const navbar = document.querySelector(".navbar");
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", () => {
      navbar.classList.toggle("active");
    });
  } // --- Logika untuk Dropdown Menu ---

  function closeAllDropdowns() {
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((menu) => menu.classList.remove("active"));
    document
      .querySelectorAll(".dropdown-toggle")
      .forEach((toggle) => toggle.classList.remove("active"));
  }

  document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const menu = toggle.nextElementSibling;
      const isActive = menu.classList.contains("active");
      closeAllDropdowns();
      if (!isActive) {
        menu.classList.add("active");
        toggle.classList.add("active");
      }
    });
  });

  window.addEventListener("click", () => {
    closeAllDropdowns();
  }); // --- Logika untuk Tombol Logout ---

  const logoutLinkNav = document.getElementById("logout-link-nav");
  if (logoutLinkNav) {
    logoutLinkNav.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          alert("Anda berhasil logout.");
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Error saat logout:", error);
        });
    });
  }

  // Logika untuk Footer Accordion di Tampilan Mobile
  if (window.innerWidth <= 768) {
    const footerToggles = document.querySelectorAll(".footer-toggle");

    footerToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const content = toggle.nextElementSibling;
        toggle.classList.toggle("active");
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });
  }
});

// === FUNGSI-FUNGSI PEMBANTU ===

// [BARU] Fungsi untuk memuat dan menampilkan sambutan Ketua RW
async function loadSambutan() {
  const fotoEl = document.getElementById("ketua-foto");
  const namaEl = document.getElementById("ketua-nama");
  const jabatanEl = document.getElementById("ketua-jabatan");
  const sambutanEl = document.getElementById("ketua-sambutan");

  try {
    const docRef = doc(db, "struktur_organisasi", "rw");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurus = docSnap.data().pengurus;
      const ketuaRW = pengurus.find((p) => p.jabatan === "Ketua RW");

      if (ketuaRW) {
        fotoEl.src =
          ketuaRW.fotoUrl || "https://placehold.co/200x200/eee/ccc?text=Foto";
        namaEl.textContent = ketuaRW.nama || "Nama Tidak Tersedia";
        jabatanEl.textContent = ketuaRW.jabatan;
        sambutanEl.textContent =
          ketuaRW.sambutan ||
          "Selamat datang di website resmi RW 16 Kelurahan Cibabat. Website ini merupakan media informasi dan komunikasi bagi seluruh warga.";
      } else {
        // Tampilkan data default jika Ketua RW tidak ditemukan
        namaEl.textContent = "Ketua RW";
        jabatanEl.textContent = "RW 16 Kel. Cibabat";
        sambutanEl.textContent =
          "Selamat datang di website resmi RW 16 Kelurahan Cibabat. Website ini merupakan media informasi dan komunikasi bagi seluruh warga.";
      }
    }
  } catch (error) {
    console.error("Error memuat data sambutan: ", error);
    namaEl.textContent = "Gagal memuat data";
  }
}

async function loadHomeStats() {
  try {
    const docRef = doc(db, "statistik", "data_penduduk");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const kelompokUmur = data.kelompokUmur || {};

      let totalPria = 0;
      let totalWanita = 0;
      Object.values(kelompokUmur).forEach((kelompok) => {
        totalPria += kelompok.pria || 0;
        totalWanita += kelompok.wanita || 0;
      });
      const totalPenduduk = totalPria + totalWanita;

      document.getElementById("home-total-penduduk").textContent =
        totalPenduduk;
      document.getElementById("home-kepala-keluarga").textContent =
        data.kepalaKeluarga;
      document.getElementById("home-jumlah-wanita").textContent = totalWanita;
      document.getElementById("home-jumlah-pria").textContent = totalPria;
    } else {
      console.log("Dokumen statistik tidak ditemukan!");
    }
  } catch (error) {
    console.error("Error mengambil data statistik untuk home: ", error);
  }
}

async function tampilkanBerita() {
  const beritaContainer = document.getElementById("berita-container");
  try {
    const q = query(
      collection(db, "berita"),
      orderBy("tanggal", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);

    beritaContainer.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const berita = doc.data();
      const beritaId = doc.id;

      const tanggalFormatted = berita.tanggal
        .toDate()
        .toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

      const kartuHTML = `
        <a href="berita-detail.html?id=${beritaId}" class="kartu-berita">
            <img src="${berita.gambarUrl}" alt="Gambar Berita">
            <div class="konten-kartu">
                <span class="tanggal">${tanggalFormatted}</span>
                <h3>${berita.judul}</h3>
            </div>
        </a>
      `;
      const slideWrapper = document.createElement("div");
      slideWrapper.className = "swiper-slide";
      slideWrapper.innerHTML = kartuHTML;
      beritaContainer.appendChild(slideWrapper);
    });
    initializeSwiper();
  } catch (error) {
    console.error("Error mengambil data berita: ", error);
    beritaContainer.innerHTML = "<p>Gagal memuat berita.</p>";
  }
}

function initializeSwiper() {
  const swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
    },
  });
}
