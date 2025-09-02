import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
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
const albumGrid = document.getElementById("album-grid");
const addAlbumBtn = document.getElementById("add-album-btn");
const albumModal = document.getElementById("album-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const albumForm = document.getElementById("album-form");
const modalTitle = document.getElementById("modal-title");
const albumTitleInput = document.getElementById("album-title-input");
const albumIdHidden = document.getElementById("album-id-hidden");

// Tampilkan album secara real-time
const q = collection(db, "albums");
onSnapshot(q, (snapshot) => {
  albumGrid.innerHTML = "";
  if (snapshot.empty) {
    albumGrid.innerHTML =
      "<p>Belum ada album. Klik tombol '+' untuk membuat.</p>";
    return;
  }
  snapshot.forEach((doc) => {
    const album = doc.data();
    const albumId = doc.id;
    const albumCard = document.createElement("div");
    albumCard.className = "album-card-new"; // Menggunakan class baru
    albumCard.innerHTML = `
            <a href="manage-album-detail.html?id=${albumId}" class="album-cover-link">
                <img src="${
                  album.coverImageUrl ||
                  "https://placehold.co/300x200/eee/ccc?text=Album"
                }" alt="${album.judul}" class="album-cover-img">
            </a>
            <div class="album-info-new">
                <h3 class="album-title-new">${album.judul}</h3>
                <div class="album-card-actions">
                    <button class="card-action-btn edit-album-btn" data-id="${albumId}" data-title="${
      album.judul
    }"><i class="fas fa-edit"></i></button>
                    <button class="card-action-btn delete-album-btn" data-id="${albumId}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    albumGrid.appendChild(albumCard);
  });
});

// Buka modal untuk Tambah Album
addAlbumBtn.addEventListener("click", () => {
  albumForm.reset();
  albumIdHidden.value = "";
  modalTitle.textContent = "Buat Album Baru";
  albumModal.style.display = "flex";
});

// Buka modal untuk Edit Album
albumGrid.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-album-btn");
  if (editBtn) {
    const albumId = editBtn.dataset.id;
    const albumTitle = editBtn.dataset.title;
    albumForm.reset();
    albumIdHidden.value = albumId;
    albumTitleInput.value = albumTitle;
    modalTitle.textContent = "Edit Judul Album";
    albumModal.style.display = "flex";
  }
});

// Hapus Album
albumGrid.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".delete-album-btn");
  if (deleteBtn) {
    if (!confirm("Yakin ingin menghapus album ini beserta semua fotonya?"))
      return;

    const albumId = deleteBtn.dataset.id;
    try {
      // Hapus semua foto di dalam subcollection 'photos'
      const photosQuery = query(
        collection(db, "photos"),
        where("albumId", "==", albumId)
      );
      const photoDocs = await getDocs(photosQuery);
      const batch = writeBatch(db);
      photoDocs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      // Hapus dokumen album itu sendiri
      await deleteDoc(doc(db, "albums", albumId));
    } catch (error) {
      console.error("Error deleting album: ", error);
      alert("Gagal menghapus album.");
    }
  }
});

// Tutup Modal
closeModalBtn.addEventListener(
  "click",
  () => (albumModal.style.display = "none")
);
albumModal.addEventListener("click", (e) => {
  if (e.target === albumModal) albumModal.style.display = "none";
});

// Simpan data dari form (Tambah atau Edit)
albumForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const albumId = albumIdHidden.value;
  const albumTitle = albumTitleInput.value.trim();
  if (!albumTitle) return;

  if (albumId) {
    // Mode Edit
    await updateDoc(doc(db, "albums", albumId), { judul: albumTitle });
  } else {
    // Mode Tambah
    await addDoc(collection(db, "albums"), {
      judul: albumTitle,
      dibuatPada: serverTimestamp(),
      coverImageUrl: "",
    });
  }
  albumModal.style.display = "none";
});
