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
  });

  // --- Logika untuk Slider Berita (hanya di index.html) ---
  if (document.getElementById("berita-container")) {
    tampilkanBerita();
  }

  // --- Logika untuk Statistik di Home ---
  if (document.getElementById("home-total-penduduk")) {
    loadHomeStats();
  }

  // --- Logika untuk Hamburger Menu ---
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const navbar = document.querySelector(".navbar");
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", () => {
      navbar.classList.toggle("active");
    });
  }

  // --- Logika untuk Dropdown Menu ---
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
  });

  // --- Logika untuk Tombol Logout ---
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
});

// === FUNGSI-FUNGSI PEMBANTU ===

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

// [MODIFIKASI] Fungsi untuk menampilkan berita di slider
async function tampilkanBerita() {
  const beritaContainer = document.getElementById("berita-container");
  try {
    // Mengambil 5 berita terbaru
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

      // [FIX] Mengubah Timestamp menjadi format tanggal yang bisa dibaca
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
document.addEventListener("DOMContentLoaded", () => {
  // Cek dulu apakah kita berada di tampilan mobile
  if (window.innerWidth <= 768) {
    const footerToggles = document.querySelectorAll(".footer-toggle");

    footerToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        // Ambil elemen konten yang berada tepat setelah judul
        const content = toggle.nextElementSibling;

        // Toggle class 'active' untuk animasi
        toggle.classList.toggle("active");

        // Cek apakah kontennya sedang aktif/terbuka
        if (content.style.maxHeight) {
          // Jika iya, tutup dengan set maxHeight ke null
          content.style.maxHeight = null;
        } else {
          // Jika tidak, buka dengan set maxHeight sesuai tinggi kontennya
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });
  }
});
