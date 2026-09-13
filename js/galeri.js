import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
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

// Elemen UI
const galleryContainer = document.getElementById("gallery-container");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("gallery-subtitle");
const backBtn = document.getElementById("back-to-albums-btn");
const lightboxModal = document.getElementById("lightbox-modal");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCloseBtn = document.getElementById("lightbox-close-btn");

// Fungsi untuk menampilkan daftar album
async function showAlbums() {
  pageTitle.textContent = "Galeri Album";
  if (pageSubtitle) {
    pageSubtitle.textContent = "Dokumentasi kegiatan dan momen kebersamaan warga RW 16 Kelurahan Cibabat.";
  }
  backBtn.style.display = "none";
  galleryContainer.className = "grid-container album-grid-view";
  galleryContainer.innerHTML = '<div class="gallery-empty"><i class="fas fa-spinner fa-spin"></i><p>Memuat album kegiatan...</p></div>';

  try {
    const q = query(collection(db, "albums"), orderBy("dibuatPada", "desc"));
    const querySnapshot = await getDocs(q);

    galleryContainer.innerHTML = "";
    if (querySnapshot.empty) {
      galleryContainer.innerHTML = '<div class="gallery-empty"><i class="fas fa-folder-open"></i><p>Belum ada album kegiatan saat ini.</p></div>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const album = doc.data();
      const itemHTML = `
        <div class="album-card-public" data-id="${doc.id}" data-title="${album.judul}">
          <div class="album-cover-wrapper">
            <img src="${
              album.coverImageUrl ||
              "https://placehold.co/600x450/f0f2f5/94a3b8?text=Album"
            }" alt="${album.judul}" loading="lazy">
          </div>
          <div class="album-title-public">
            <i class="fas fa-images"></i>
            <span>${album.judul}</span>
          </div>
        </div>
      `;
      galleryContainer.innerHTML += itemHTML;
    });
  } catch (error) {
    console.error("Error memuat album: ", error);
    galleryContainer.innerHTML = '<div class="gallery-empty"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat album kegiatan.</p></div>';
  }
}

// Fungsi untuk menampilkan foto di dalam album yang dipilih
async function showPhotosInAlbum(albumId, albumTitle) {
  pageTitle.textContent = albumTitle;
  if (pageSubtitle) {
    pageSubtitle.textContent = `Dokumentasi foto kegiatan ${albumTitle}. Klik foto untuk melihat ukuran penuh.`;
  }
  backBtn.style.display = "inline-flex";
  galleryContainer.className = "grid-container photo-grid-view";
  galleryContainer.innerHTML = '<div class="gallery-empty"><i class="fas fa-spinner fa-spin"></i><p>Memuat foto...</p></div>';

  try {
    const q = query(
      collection(db, "photos"),
      where("albumId", "==", albumId),
      orderBy("diunggahPada", "desc")
    );
    const querySnapshot = await getDocs(q);

    galleryContainer.innerHTML = "";
    if (querySnapshot.empty) {
      galleryContainer.innerHTML = '<div class="gallery-empty"><i class="fas fa-image"></i><p>Album ini belum memiliki foto dokumentasi.</p></div>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const photo = doc.data();
      const itemHTML = `
        <div class="photo-item" data-img-src="${photo.imageUrl}" title="Klik untuk memperbesar">
          <div class="photo-item-wrapper">
            <img src="${photo.imageUrl}" alt="Foto dari album ${albumTitle}" loading="lazy">
          </div>
        </div>
      `;
      galleryContainer.innerHTML += itemHTML;
    });
  } catch (error) {
    console.error("Error memuat foto: ", error);
    galleryContainer.innerHTML = '<div class="gallery-empty"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat foto dokumentasi.</p></div>';
  }
}

// Event listener utama untuk interaksi
galleryContainer.addEventListener("click", (e) => {
  const albumCard = e.target.closest(".album-card-public");
  const photoItem = e.target.closest(".photo-item");

  // Jika kartu album diklik
  if (albumCard) {
    const albumId = albumCard.dataset.id;
    const albumTitle = albumCard.dataset.title;
    showPhotosInAlbum(albumId, albumTitle);
  }

  // Jika sebuah foto diklik
  if (photoItem) {
    const imgSrc = photoItem.dataset.imgSrc;
    lightboxImage.src = imgSrc;
    lightboxModal.style.display = "flex";
  }
});

// Event listener untuk tombol kembali
backBtn.addEventListener("click", showAlbums);

// Event listener untuk menutup lightbox
lightboxCloseBtn.addEventListener("click", () => {
  lightboxModal.style.display = "none";
});
lightboxModal.addEventListener("click", (e) => {
  if (e.target === lightboxModal) {
    lightboxModal.style.display = "none";
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightboxModal.style.display === "flex") {
    lightboxModal.style.display = "none";
  }
});

// Memuat daftar album saat halaman pertama kali dibuka
document.addEventListener("DOMContentLoaded", showAlbums);
