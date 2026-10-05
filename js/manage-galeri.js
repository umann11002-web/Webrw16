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
const albumCoverInput = document.getElementById("album-cover-input");
const modalCoverPreview = document.getElementById("modal-cover-preview");
const modalCoverPreviewImg = document.getElementById("modal-cover-preview-img");
const removeModalCoverBtn = document.getElementById("remove-modal-cover-btn");
const saveAlbumBtn = document.getElementById("save-album-btn");

// Variabel penyimpan state cover saat ini di modal
let currentModalCoverUrl = "";

// Helper Cloudinary upload
const uploadFileToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "yd99selh");
  const cloudName = "do1ba7gkn";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await fetch(uploadUrl, { method: "POST", body: formData });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
};

// Preview gambar sampul pada modal jika user memilih file baru
albumCoverInput.addEventListener("change", () => {
  const file = albumCoverInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    modalCoverPreviewImg.src = e.target.result;
    modalCoverPreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Tombol hapus sampul di modal
removeModalCoverBtn.addEventListener("click", () => {
  albumCoverInput.value = "";
  currentModalCoverUrl = "";
  modalCoverPreviewImg.src = "";
  modalCoverPreview.style.display = "none";
});

// Tampilkan album secara real-time
const q = collection(db, "albums");
onSnapshot(q, (snapshot) => {
  albumGrid.innerHTML = "";
  if (snapshot.empty) {
    albumGrid.innerHTML =
      "<p style='grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;'>Belum ada album. Klik tombol '+' untuk membuat album baru.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const album = docSnap.data();
    const albumId = docSnap.id;
    const hasCover = Boolean(album.coverImageUrl);

    const albumCard = document.createElement("div");
    albumCard.className = "album-card-new";
    albumCard.innerHTML = `
      <a href="../admin/manage-album-detail.html?id=${albumId}" class="album-cover-link" title="Klik untuk mengelola foto & sampul album">
        <img src="${
          album.coverImageUrl ||
          "https://placehold.co/400x260/eee/999?text=Belum+Ada+Cover"
        }" alt="${album.judul}" class="album-cover-img">
        <span class="album-cover-tag ${hasCover ? "tag-has-cover" : "tag-no-cover"}">
          <i class="fas ${hasCover ? "fa-star" : "fa-image"}"></i> 
          ${hasCover ? "Sampul Siap" : "Belum Ada Sampul"}
        </span>
      </a>
      <div class="album-info-new">
        <div style="flex-grow: 1; min-width: 0; padding-right: 0.5rem;">
          <h3 class="album-title-new" title="${album.judul}">${album.judul}</h3>
          <a href="../admin/manage-album-detail.html?id=${albumId}" style="font-size: 0.82rem; color: #0284c7; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;">
            <i class="fas fa-images"></i> Kelola Foto & Sampul
          </a>
        </div>
        <div class="album-card-actions">
          <button class="card-action-btn edit-album-btn" data-id="${albumId}" data-title="${
            album.judul
          }" data-cover="${album.coverImageUrl || ""}" title="Edit Album"><i class="fas fa-edit"></i></button>
          <button class="card-action-btn delete-album-btn" data-id="${albumId}" title="Hapus Album"><i class="fas fa-trash"></i></button>
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
  currentModalCoverUrl = "";
  modalCoverPreviewImg.src = "";
  modalCoverPreview.style.display = "none";
  modalTitle.textContent = "Buat Album Baru";
  albumModal.style.display = "flex";
});

// Buka modal untuk Edit Album
albumGrid.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-album-btn");
  if (editBtn) {
    const albumId = editBtn.dataset.id;
    const albumTitle = editBtn.dataset.title;
    const albumCover = editBtn.dataset.cover || "";

    albumForm.reset();
    albumIdHidden.value = albumId;
    albumTitleInput.value = albumTitle;
    currentModalCoverUrl = albumCover;

    if (albumCover) {
      modalCoverPreviewImg.src = albumCover;
      modalCoverPreview.style.display = "block";
    } else {
      modalCoverPreviewImg.src = "";
      modalCoverPreview.style.display = "none";
    }

    modalTitle.textContent = "Edit Album & Sampul";
    albumModal.style.display = "flex";
  }
});

// Hapus Album
albumGrid.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".delete-album-btn");
  if (deleteBtn) {
    if (!confirm("Yakin ingin menghapus album ini beserta semua fotonya?")) return;

    const albumId = deleteBtn.dataset.id;
    try {
      // Hapus semua foto di dalam subcollection 'photos'
      const photosQuery = query(
        collection(db, "photos"),
        where("albumId", "==", albumId)
      );
      const photoDocs = await getDocs(photosQuery);
      const batch = writeBatch(db);
      photoDocs.forEach((docSnap) => batch.delete(docSnap.ref));
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
closeModalBtn.addEventListener("click", () => (albumModal.style.display = "none"));
albumModal.addEventListener("click", (e) => {
  if (e.target === albumModal) albumModal.style.display = "none";
});

// Simpan data dari form (Tambah atau Edit)
albumForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const albumId = albumIdHidden.value;
  const albumTitle = albumTitleInput.value.trim();
  if (!albumTitle) return;

  saveAlbumBtn.disabled = true;
  saveAlbumBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan Album...';

  try {
    let finalCoverUrl = currentModalCoverUrl;

    // Jika user memilih file sampul baru di modal
    if (albumCoverInput.files && albumCoverInput.files[0]) {
      finalCoverUrl = await uploadFileToCloudinary(albumCoverInput.files[0]);
    }

    if (albumId) {
      // Mode Edit
      await updateDoc(doc(db, "albums", albumId), {
        judul: albumTitle,
        coverImageUrl: finalCoverUrl,
      });
    } else {
      // Mode Tambah Album Baru
      await addDoc(collection(db, "albums"), {
        judul: albumTitle,
        dibuatPada: serverTimestamp(),
        coverImageUrl: finalCoverUrl,
      });
    }

    albumModal.style.display = "none";
  } catch (error) {
    console.error("Error saving album: ", error);
    alert(`Gagal menyimpan album: ${error.message}`);
  } finally {
    saveAlbumBtn.disabled = false;
    saveAlbumBtn.innerHTML = "Simpan Album";
  }
});
