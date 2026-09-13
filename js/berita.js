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
const heroNewsContainer = document.getElementById("hero-news-container");
const categoryFilters = document.querySelectorAll(".filter-pill");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");

let allNewsData = [];
let currentCategory = "Semua";
let searchQuery = "";
let currentSort = "terbaru";

function formatDate(timestamp, formatOptions) {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleDateString("id-ID", formatOptions);
}

function renderSkeleton() {
  heroNewsContainer.innerHTML = `
    <div class="skeleton skeleton-hero"></div>
  `;
  
  let skeletonCards = "";
  for (let i = 0; i < 6; i++) {
    skeletonCards += `
      <div class="skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton skeleton-text" style="width: 100%; margin-top: 1rem;"></div>
        <div class="skeleton skeleton-text" style="width: 70%;"></div>
      </div>
    `;
  }
  beritaGridContainer.innerHTML = skeletonCards;
}

function renderNews() {
  // Filter Data
  let filteredNews = allNewsData.filter(berita => {
    const matchCategory = currentCategory === "Semua" || (berita.kategori && berita.kategori === currentCategory);
    const matchSearch = berita.judul.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Sort Data
  if (currentSort === "terpopuler") {
    filteredNews.sort((a, b) => (b.dilihat || 0) - (a.dilihat || 0));
  } else {
    // "terbaru"
    filteredNews.sort((a, b) => b.tanggal.toMillis() - a.tanggal.toMillis());
  }

  heroNewsContainer.innerHTML = "";
  beritaGridContainer.innerHTML = "";

  if (filteredNews.length === 0) {
    beritaGridContainer.innerHTML = "<p>Tidak ada berita ditemukan.</p>";
    return;
  }

  // 1. Render Featured Hero News (first item)
  const heroBerita = filteredNews[0];
  const heroCuplikan = heroBerita.isi ? heroBerita.isi.replace(/(<([^>]+)>)/gi, "").substring(0, 150) + "..." : "";
  const heroTanggal = formatDate(heroBerita.tanggal, { day: "numeric", month: "long", year: "numeric" });
  
  heroNewsContainer.innerHTML = `
    <a href="../berita-detail.html?id=${heroBerita.id}" class="hero-news-card" style="animation-delay: 0.1s;">
      <div class="hero-image-wrapper">
        <img src="${heroBerita.gambarUrl || 'https://placehold.co/800x400/eee/ccc?text=Gambar'}" alt="Hero Image">
        <span class="badge-kategori">${heroBerita.kategori || 'Berita'}</span>
      </div>
      <div class="hero-content">
        <span class="tanggal"><i class="fas fa-calendar-alt"></i> ${heroTanggal}</span>
        <h2>${heroBerita.judul}</h2>
        <p class="cuplikan">${heroCuplikan}</p>
        <span class="baca-selengkapnya">Baca Selengkapnya <i class="fas fa-arrow-right"></i></span>
      </div>
    </a>
  `;

  // 2. Render Archive Grid News
  let gridHTML = "";
  for (let i = 1; i < filteredNews.length; i++) {
    const berita = filteredNews[i];
    const cuplikan = berita.isi ? berita.isi.replace(/(<([^>]+)>)/gi, "").substring(0, 80) + "..." : "";
    const tanggalPublish = formatDate(berita.tanggal, { day: "numeric", month: "long", year: "numeric" });
    const delay = 0.2 + (i * 0.1); // Staggered delay

    gridHTML += `
      <a href="../berita-detail.html?id=${berita.id}" class="kartu-berita staggered-animate" style="animation-delay: ${delay}s;">
          <div class="image-wrapper">
            <img src="${berita.gambarUrl || "https://placehold.co/400x250/eee/ccc?text=Gambar"}" alt="Gambar Berita">
            <span class="badge-kategori">${berita.kategori || 'Berita'}</span>
          </div>
          <div class="konten-kartu">
              <h3>${berita.judul}</h3>
              <p class="cuplikan">${cuplikan}</p>
              <div class="meta-info-kartu">
                  <span><i class="fas fa-calendar-alt"></i> ${tanggalPublish}</span>
                  <span><i class="fas fa-eye"></i> ${berita.dilihat || 0}</span>
              </div>
          </div>
      </a>
    `;
  }
  beritaGridContainer.innerHTML = gridHTML;
}

async function fetchAndRenderNews() {
  renderSkeleton();
  try {
    const q = query(collection(db, "berita"), orderBy("tanggal", "desc"));
    const querySnapshot = await getDocs(q);

    allNewsData = [];
    querySnapshot.forEach((doc) => {
      allNewsData.push({ id: doc.id, ...doc.data() });
    });

    renderNews();
  } catch (error) {
    console.error("Error mengambil semua berita: ", error);
    beritaGridContainer.innerHTML = '<p style="color: red;">Gagal memuat berita.</p>';
  }
}

// Event Listeners
categoryFilters.forEach(btn => {
  btn.addEventListener('click', (e) => {
    categoryFilters.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.getAttribute('data-category');
    renderNews();
  });
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderNews();
});

sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderNews();
});

document.addEventListener("DOMContentLoaded", fetchAndRenderNews);
