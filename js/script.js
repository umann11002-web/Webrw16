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

  // --- Logika untuk Hero Slider (hanya di index.html) ---
  if (document.querySelector(".heroSwiper")) {
    const heroWrapper = document.getElementById("hero-swiper-wrapper");

    // Load slides from Firestore
    async function loadHeroSlides() {
      try {
        const heroDocRef = doc(db, "struktur_organisasi", "hero_carousel");
        const docSnap = await getDoc(heroDocRef);

        let slides = [];
        if (docSnap.exists() && docSnap.data().slides && docSnap.data().slides.length > 0) {
          slides = docSnap.data().slides;
        }

        if (slides.length === 0) {
          // Fallback: Tampilkan background slate bersih
          heroWrapper.innerHTML = `
            <div class="swiper-slide hero-video-slide">
              <div class="hero-loading-slate">
                <div style="text-align: center; color: rgba(255,255,255,0.6);">
                  <i class="fas fa-city" style="font-size: 2.5rem; margin-bottom: 0.8rem; display: block; opacity: 0.4;"></i>
                  <span style="font-size: 0.9rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;">Portal RW 16 Kelurahan Cibabat</span>
                </div>
              </div>
            </div>
          `;
        } else {
          // Render slides dengan atribut video lengkap (autoplay muted loop playsinline)
          heroWrapper.innerHTML = slides.map((slide) => {
            if (slide.type === "video") {
              return `
                <div class="swiper-slide hero-video-slide">
                  <video src="${slide.url}" autoplay muted loop playsinline preload="auto" class="hero-bg-video"></video>
                </div>
              `;
            } else {
              return `
                <div class="swiper-slide">
                  <img src="${slide.url}" alt="Hero Banner RW 16" class="hero-bg-video" />
                </div>
              `;
            }
          }).join("");
        }

        // Tampilkan tombol navigasi & pagination hanya jika ada lebih dari 1 slide
        const nextBtn = document.querySelector(".heroSwiper .swiper-button-next");
        const prevBtn = document.querySelector(".heroSwiper .swiper-button-prev");
        const pagEl = document.querySelector(".heroSwiper .swiper-pagination");
        const hasMultipleSlides = slides.length > 1;

        if (nextBtn) nextBtn.style.display = hasMultipleSlides ? "" : "none";
        if (prevBtn) prevBtn.style.display = hasMultipleSlides ? "" : "none";
        if (pagEl) pagEl.style.display = hasMultipleSlides ? "" : "none";

        // Initialize Swiper AFTER slides are loaded
        const heroSwiper = new Swiper(".heroSwiper", {
          slidesPerView: 1,
          loop: hasMultipleSlides,
          autoplay: hasMultipleSlides ? {
            delay: 5000,
            disableOnInteraction: false,
          } : false,
          pagination: {
            el: ".heroSwiper .swiper-pagination",
            clickable: true,
          },
          navigation: {
            nextEl: ".heroSwiper .swiper-button-next",
            prevEl: ".heroSwiper .swiper-button-prev",
          },
          on: {
            // Handle video autoplay on slide change
            slideChangeTransitionEnd: function () {
              // Pause all videos
              document.querySelectorAll(".heroSwiper video").forEach(v => {
                v.pause();
                v.currentTime = 0;
              });
              // Play video on active slide
              const activeSlide = this.slides[this.activeIndex];
              if (activeSlide) {
                const video = activeSlide.querySelector("video");
                if (video) {
                  video.play().catch(() => {});
                  if (hasMultipleSlides) {
                    this.params.autoplay.delay = Math.max(video.duration * 1000 || 8000, 5000);
                  }
                } else if (hasMultipleSlides) {
                  this.params.autoplay.delay = 5000;
                }
              }
            },
            init: function () {
              // Auto-play video on first slide
              const firstSlide = this.slides[this.activeIndex];
              if (firstSlide) {
                const video = firstSlide.querySelector("video");
                if (video) {
                  video.play().catch(() => {});
                }
              }
            },
          },
        });
      } catch (error) {
        console.error("Error loading hero slides:", error);
        heroWrapper.innerHTML = `
          <div class="swiper-slide hero-video-slide">
            <div class="hero-loading-slate">
              <div style="text-align: center; color: rgba(255,255,255,0.6);">
                <i class="fas fa-city" style="font-size: 2.5rem; margin-bottom: 0.8rem; display: block; opacity: 0.4;"></i>
                <span style="font-size: 0.9rem; font-weight: 500;">Portal RW 16 Kelurahan Cibabat</span>
              </div>
            </div>
          </div>
        `;
        new Swiper(".heroSwiper", { slidesPerView: 1 });
      }
    }

    loadHeroSlides();

    // --- Logika untuk Transparent Header on Scroll ---
    const header = document.querySelector("header");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  // --- Logika untuk Statistik di Home ---
  // Dihapus: sekarang dipanggil saat hover tab Penduduk

  // Logika untuk Sambutan Ketua RW (hanya di index.html)
  if (document.querySelector(".sambutan-ketua")) {
    loadSambutan();
  }

  // --- Logika untuk Hover Efek Informasi ---
  const infoContainer = document.getElementById('info-interactive-container');
  const infoBtns = document.querySelectorAll('.info-interactive-container .info-btn');
  const detailContents = document.querySelectorAll('.info-detail-content');

  if (infoContainer) {
    infoBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        // Cek jika layar bukan mobile, baru jalankan efek hover
        if (window.innerWidth >= 769) {
          const targetId = btn.getAttribute('data-target');
          
          // [BARU] Load stats animasi saat tab penduduk dihover pertama kali
          if (targetId === 'penduduk' && !window.statsLoaded && document.getElementById("home-total-penduduk")) {
            loadHomeStats();
            window.statsLoaded = true;
          }

          infoContainer.classList.add('has-active');
          
          infoBtns.forEach(b => {
            if (b === btn) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
          
          detailContents.forEach(content => {
            if (content.id === `detail-${targetId}`) {
              content.classList.add('show');
            } else {
              content.classList.remove('show');
            }
          });
        }
      });
    });

    infoContainer.addEventListener('mouseleave', () => {
      infoContainer.classList.remove('has-active');
      infoBtns.forEach(b => b.classList.remove('active'));
      detailContents.forEach(content => content.classList.remove('show'));
    });
  }

  // --- Logika untuk Hamburger Menu ---
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const navbar = document.querySelector(".navbar");
  if (hamburgerMenu) {
    // Buat elemen overlay
    const overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    document.body.appendChild(overlay);

    // Buat tombol close
    const closeBtn = document.createElement("button");
    closeBtn.className = "nav-close-btn";
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    navbar.insertBefore(closeBtn, navbar.firstChild);

    hamburgerMenu.addEventListener("click", () => {
      navbar.classList.add("active");
      overlay.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
      navbar.classList.remove("active");
      overlay.classList.remove("active");
    });

    overlay.addEventListener("click", () => {
      navbar.classList.remove("active");
      overlay.classList.remove("active");
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
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Error saat logout:", error);
        });
    });
  }

  // --- [DIPERBAIKI] Logika untuk Footer Accordion ---
  // Kode ini akan berjalan di semua halaman dan responsif
  const footerToggles = document.querySelectorAll(".footer-toggle");
  footerToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      // Cek dulu apakah di mode mobile, baru jalankan
      if (window.innerWidth <= 768) {
        const content = toggle.nextElementSibling;
        toggle.classList.toggle("active");
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      }
    });
  });
  // --- Logika untuk Galeri Coverflow (3D Carousel Dinamis) ---
  if (document.getElementById("galeri-coverflow-wrapper")) {
    loadGaleriHome();
  }
});

// === FUNGSI-FUNGSI PEMBANTU ===

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

      animateValue(document.getElementById("home-total-penduduk"), 0, totalPenduduk, 2000);
      animateValue(document.getElementById("home-kepala-keluarga"), 0, parseInt(data.kepalaKeluarga) || 0, 2000);
      animateValue(document.getElementById("home-jumlah-wanita"), 0, totalWanita, 2000);
      animateValue(document.getElementById("home-jumlah-pria"), 0, totalPria, 2000);
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
      limit(4)
    );
    const querySnapshot = await getDocs(q);

    beritaContainer.innerHTML = "";
    let index = 0;
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

      // Buat ringkasan teks
      let isiRingkas = "";
      if (berita.isi) {
        // Hapus tag HTML jika ada dan ambil 120 karakter pertama
        isiRingkas = berita.isi.replace(/(<([^>]+)>)/gi, "").substring(0, 120) + "...";
      }
      const kategori = berita.kategori || "Berita Utama";

      const kartuHTML = `
        <a href="../berita-detail.html?id=${beritaId}" class="magazine-card">
            <div class="gambar-wrapper">
              <img src="${berita.gambarUrl}" alt="Gambar Berita">
              <span class="badge-kategori">${kategori}</span>
            </div>
            <div class="konten-kartu">
                <span class="tanggal">${tanggalFormatted}</span>
                <h3>${berita.judul}</h3>
                <p class="ringkasan">${isiRingkas}</p>
            </div>
        </a>
      `;
      // We can just append the HTML directly
      beritaContainer.insertAdjacentHTML('beforeend', kartuHTML);
      index++;
    });
  } catch (error) {
    console.error("Error mengambil data berita: ", error);
    beritaContainer.innerHTML = "<p>Gagal memuat berita.</p>";
  }
}

// --- FUNGSI LOAD GALERI HOME (DYNAMIC COVERFLOW) ---
async function loadGaleriHome() {
  const wrapper = document.getElementById("galeri-coverflow-wrapper");
  if (!wrapper) return;

  try {
    const q = query(
      collection(db, "albums"),
      orderBy("dibuatPada", "desc"),
      limit(8)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      wrapper.innerHTML = `
        <div class="swiper-slide galeri-home-item" style="display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px dashed #cbd5e1;">
          <div style="text-align: center; color: #64748b; padding: 1.5rem;">
            <i class="fas fa-images" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: #94a3b8;"></i>
            <span style="font-weight: 500;">Belum ada album kegiatan</span>
          </div>
        </div>
      `;
      return;
    }

    let slidesHTML = "";
    querySnapshot.forEach((docSnap) => {
      const album = docSnap.data();
      const albumId = docSnap.id;
      const coverUrl = album.coverImageUrl || "https://placehold.co/600x450/f0f2f5/94a3b8?text=Album";
      const judul = album.judul || "Album Kegiatan";

      slidesHTML += `
        <a href="galeri.html?albumId=${albumId}&albumTitle=${encodeURIComponent(judul)}" 
           class="swiper-slide galeri-home-item" 
           title="Buka Album: ${judul}">
          <img src="${coverUrl}" alt="${judul}" loading="lazy" onerror="this.src='https://placehold.co/600x450/f0f2f5/94a3b8?text=Album'">
          <div class="galeri-overlay">
            <i class="fas fa-images"></i>
            <span>${judul}</span>
          </div>
        </a>
      `;
    });

    wrapper.innerHTML = slidesHTML;

    // Inisialisasi Swiper 3D Coverflow setelah slide dirender
    new Swiper(".galeriCoverflowSwiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 35,
        stretch: 0,
        depth: 140,
        modifier: 1,
        slideShadows: true,
      },
      pagination: {
        el: ".galeriCoverflowSwiper .swiper-pagination",
        clickable: true,
      },
      loop: querySnapshot.docs.length >= 3,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
    });
  } catch (error) {
    console.error("Error mengambil galeri untuk home:", error);
    wrapper.innerHTML = `
      <div class="swiper-slide galeri-home-item" style="display: flex; align-items: center; justify-content: center; background: #fff1f2;">
        <div style="text-align: center; color: #e11d48; padding: 1.5rem;">
          <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
          <span>Gagal memuat album kegiatan</span>
        </div>
      </div>
    `;
  }
}

// --- FUNGSI ANIMASI ANGKA ---
function animateValue(obj, start, end, duration, suffix = "") {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ============================================
// === SCROLL REVEAL (Intersection Observer) ===
// ============================================
function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );

  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px 0px 0px',
    }
  );

  // Small delay to ensure DOM is fully rendered before observing
  setTimeout(() => {
    revealElements.forEach((el) => observer.observe(el));
  }, 100);
}

// Initialize scroll reveal
document.addEventListener('DOMContentLoaded', initScrollReveal);
