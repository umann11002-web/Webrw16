import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
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

// Ambil ID album dari URL
const params = new URLSearchParams(window.location.search);
const albumId = params.get("id");

// Cache data album saat ini
let currentAlbumData = null;
let currentPhotosList = [];

// Elemen UI Halaman
const albumTitleEl = document.getElementById("detail-album-title");

// Elemen Cover Manager
const coverStatusBadge = document.getElementById("cover-status-badge");
const currentCoverImg = document.getElementById("current-cover-img");
const removeCoverBtn = document.getElementById("remove-cover-btn");
const uploadCoverForm = document.getElementById("upload-cover-form");
const coverFileInput = document.getElementById("cover-file-input");
const coverFileNameText = document.getElementById("cover-file-name-text");
const coverPreviewContainer = document.getElementById("cover-preview-container");
const coverNewPreviewImg = document.getElementById("cover-new-preview-img");
const cancelCoverPreviewBtn = document.getElementById("cancel-cover-preview-btn");
const saveCoverBtn = document.getElementById("save-cover-btn");
const coverUploadProgress = document.getElementById("cover-upload-progress");

// Elemen Tambah Foto
const addPhotosForm = document.getElementById("add-photos-form");
const photoFilesInput = document.getElementById("photo-files-input");
const previewMetaBar = document.getElementById("preview-meta-bar");
const previewCountText = document.getElementById("preview-count-text");
const clearSelectedPhotosBtn = document.getElementById("clear-selected-photos-btn");
const previewContainer = document.getElementById("preview-container");
const uploadPhotosBtn = document.getElementById("upload-photos-btn");
const uploadProgress = document.getElementById("upload-progress");

// Elemen Foto di Album
const photoTotalCountEl = document.getElementById("photo-total-count");
const photoGrid = document.getElementById("photo-grid");

// Helper upload ke Cloudinary
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

// Render status & gambar sampul album
function renderCoverDisplay() {
  if (currentAlbumData && currentAlbumData.coverImageUrl) {
    currentCoverImg.src = currentAlbumData.coverImageUrl;
    coverStatusBadge.textContent = "Sampul Aktif";
    coverStatusBadge.className = "badge-status-cover badge-status-active";
    removeCoverBtn.style.display = "inline-flex";
  } else {
    currentCoverImg.src = "https://placehold.co/400x300/eee/999?text=Belum+Ada+Sampul";
    coverStatusBadge.textContent = "Belum Ada Sampul";
    coverStatusBadge.className = "badge-status-cover badge-status-empty";
    removeCoverBtn.style.display = "none";
  }
}

// Render grid foto dokumentasi
function renderPhotosGrid() {
  photoGrid.innerHTML = "";

  if (currentPhotosList.length === 0) {
    photoGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b;">
        <i class="fas fa-images" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 0.75rem; display: block;"></i>
        <p style="font-weight: 500; margin: 0;">Belum ada foto di album ini.</p>
        <p style="font-size: 0.85rem; margin-top: 0.35rem;">Pilih foto pada form di atas dan klik tombol "Simpan & Unggah Foto ke Album".</p>
      </div>
    `;
    photoTotalCountEl.textContent = "0 Foto";
    return;
  }

  photoTotalCountEl.textContent = `${currentPhotosList.length} Foto`;

  currentPhotosList.forEach((item) => {
    const isCover =
      currentAlbumData &&
      currentAlbumData.coverImageUrl &&
      currentAlbumData.coverImageUrl === item.imageUrl;

    const photoCard = document.createElement("div");
    photoCard.className = `admin-photo-item ${isCover ? "is-cover-item" : ""}`;
    photoCard.innerHTML = `
      <div class="photo-img-wrapper">
        <img src="${item.imageUrl}" alt="Foto Album" loading="lazy">
        ${
          isCover
            ? '<span class="cover-badge active"><i class="fas fa-star"></i> Sampul Utama</span>'
            : ""
        }
      </div>
      <div class="photo-actions">
        ${
          !isCover
            ? `<button type="button" class="btn-make-cover" data-url="${item.imageUrl}" title="Jadikan foto ini sebagai sampul album">
                <i class="fas fa-star"></i> Jadikan Sampul
              </button>`
            : `<span class="active-cover-text"><i class="fas fa-check-circle"></i> Sampul Aktif</span>`
        }
        <button type="button" class="btn-delete-photo" data-id="${item.id}" data-url="${item.imageUrl}" title="Hapus foto ini">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
    photoGrid.appendChild(photoCard);
  });
}

// Muat data album dan pasang listener real-time untuk foto
async function loadAlbumDetails() {
  if (!albumId) {
    albumTitleEl.textContent = "ID Album Tidak Ditemukan";
    return;
  }

  try {
    const albumRef = doc(db, "albums", albumId);
    const albumSnap = await getDoc(albumRef);

    if (!albumSnap.exists()) {
      albumTitleEl.textContent = "Album Tidak Ditemukan";
      return;
    }

    currentAlbumData = albumSnap.data();
    albumTitleEl.textContent = `Kelola Album: ${currentAlbumData.judul || "Tanpa Judul"}`;
    renderCoverDisplay();

    // Listener foto di album secara real-time
    const photosQuery = query(
      collection(db, "photos"),
      where("albumId", "==", albumId),
      orderBy("diunggahPada", "desc")
    );

    onSnapshot(
      photosQuery,
      (snapshot) => {
        currentPhotosList = [];
        snapshot.forEach((docSnap) => {
          currentPhotosList.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        renderPhotosGrid();
      },
      (error) => {
        console.error("Error fetching photos: ", error);
        // Fallback jika query with orderBy requires composite index
        const fallbackQuery = query(
          collection(db, "photos"),
          where("albumId", "==", albumId)
        );
        onSnapshot(fallbackQuery, (snapshot) => {
          currentPhotosList = [];
          snapshot.forEach((docSnap) => {
            currentPhotosList.push({
              id: docSnap.id,
              ...docSnap.data(),
            });
          });
          renderPhotosGrid();
        });
      }
    );
  } catch (error) {
    console.error("Error loading album details: ", error);
    albumTitleEl.textContent = "Gagal memuat detail album.";
  }
}

// --- PENGATURAN COVER KHUSUS (UPLOAD DEDIKASI) ---
coverFileInput.addEventListener("change", () => {
  const file = coverFileInput.files[0];
  if (!file) return;

  coverFileNameText.textContent = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    coverNewPreviewImg.src = e.target.result;
    coverPreviewContainer.style.display = "block";
    saveCoverBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

cancelCoverPreviewBtn.addEventListener("click", () => {
  coverFileInput.value = "";
  coverFileNameText.textContent = "Pilih File Foto Sampul";
  coverPreviewContainer.style.display = "none";
  coverNewPreviewImg.src = "";
  saveCoverBtn.disabled = true;
  coverUploadProgress.textContent = "";
});

uploadCoverForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = coverFileInput.files[0];
  if (!file) return;

  saveCoverBtn.disabled = true;
  saveCoverBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengunggah Sampul...';
  coverUploadProgress.textContent = "Mengunggah gambar sampul ke cloud...";
  coverUploadProgress.style.color = "#0284c7";

  try {
    const uploadedUrl = await uploadFileToCloudinary(file);
    const albumRef = doc(db, "albums", albumId);
    await updateDoc(albumRef, { coverImageUrl: uploadedUrl });

    currentAlbumData.coverImageUrl = uploadedUrl;
    renderCoverDisplay();
    renderPhotosGrid();

    coverUploadProgress.textContent = "Foto sampul berhasil diperbarui!";
    coverUploadProgress.style.color = "#166534";

    // Reset input cover
    coverFileInput.value = "";
    coverFileNameText.textContent = "Pilih File Foto Sampul";
    coverPreviewContainer.style.display = "none";
    coverNewPreviewImg.src = "";

    setTimeout(() => {
      coverUploadProgress.textContent = "";
    }, 4000);
  } catch (error) {
    console.error("Gagal mengunggah foto sampul: ", error);
    coverUploadProgress.textContent = `Gagal mengunggah sampul: ${error.message}`;
    coverUploadProgress.style.color = "#dc2626";
  } finally {
    saveCoverBtn.disabled = false;
    saveCoverBtn.innerHTML = '<i class="fas fa-check"></i> Simpan Foto Sampul';
  }
});

// Hapus sampul album
removeCoverBtn.addEventListener("click", async () => {
  if (
    !confirm(
      "Apakah Anda yakin ingin menghapus foto sampul album ini? Album akan tampil tanpa thumbnail khusus."
    )
  ) {
    return;
  }

  try {
    const albumRef = doc(db, "albums", albumId);
    await updateDoc(albumRef, { coverImageUrl: "" });
    currentAlbumData.coverImageUrl = "";
    renderCoverDisplay();
    renderPhotosGrid();
  } catch (error) {
    console.error("Gagal menghapus sampul: ", error);
    alert("Gagal menghapus sampul album.");
  }
});

// --- PENGATURAN TAMBAH FOTO DOKUMENTASI KE ALBUM ---
// Preview file foto yang dipilih
photoFilesInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  const files = photoFilesInput.files;

  if (!files || files.length === 0) {
    previewMetaBar.style.display = "none";
    return;
  }

  previewMetaBar.style.display = "flex";
  previewCountText.textContent = `${files.length} foto dipilih`;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const item = document.createElement("div");
      item.className = "preview-item";
      item.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
      previewContainer.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
});

// Batal semua pilihan foto
clearSelectedPhotosBtn.addEventListener("click", () => {
  photoFilesInput.value = "";
  previewContainer.innerHTML = "";
  previewMetaBar.style.display = "none";
  uploadProgress.textContent = "";
});

// Submit unggah foto-foto baru
addPhotosForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const files = photoFilesInput.files;
  if (!files || files.length === 0) {
    alert("Silakan pilih minimal satu foto terlebih dahulu.");
    return;
  }

  uploadPhotosBtn.disabled = true;
  uploadPhotosBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengunggah Foto (0/${files.length})...`;
  uploadProgress.textContent = `Sedang mengunggah ${files.length} foto, mohon tunggu...`;
  uploadProgress.style.color = "#0284c7";

  try {
    let completed = 0;
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      uploadPhotosBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengunggah Foto (${i + 1}/${files.length})...`;
      const url = await uploadFileToCloudinary(files[i]);
      uploadedUrls.push(url);

      await addDoc(collection(db, "photos"), {
        albumId: albumId,
        imageUrl: url,
        diunggahPada: serverTimestamp(),
      });
      completed++;
    }

    // CATATAN PENTING: Sesuai permintaan pengguna, cover album sengaja dipisah
    // dan TIDAK otomatis memaksa foto pertama jadi cover. Pengguna bebas menentukan
    // sampul lewat tombol "Jadikan Sampul" di kartu foto atau form upload sampul khusus.
    uploadProgress.textContent = `Berhasil! ${completed} foto telah ditambahkan ke album. Anda dapat memilih salah satunya sebagai sampul album di bawah.`;
    uploadProgress.style.color = "#166534";

    addPhotosForm.reset();
    previewContainer.innerHTML = "";
    previewMetaBar.style.display = "none";

    setTimeout(() => {
      uploadProgress.textContent = "";
    }, 6000);
  } catch (error) {
    console.error("Error mengunggah foto: ", error);
    uploadProgress.textContent = `Gagal mengunggah foto: ${error.message}`;
    uploadProgress.style.color = "#dc2626";
  } finally {
    uploadPhotosBtn.disabled = false;
    uploadPhotosBtn.innerHTML =
      '<i class="fas fa-cloud-upload-alt"></i> Simpan & Unggah Foto ke Album';
  }
});

// Delegasi klik di Photo Grid (Jadikan Sampul atau Hapus Foto)
photoGrid.addEventListener("click", async (e) => {
  // 1. Jadikan foto ini sebagai Sampul Album
  const makeCoverBtn = e.target.closest(".btn-make-cover");
  if (makeCoverBtn) {
    const photoUrl = makeCoverBtn.dataset.url;
    if (!photoUrl) return;

    makeCoverBtn.disabled = true;
    makeCoverBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    try {
      const albumRef = doc(db, "albums", albumId);
      await updateDoc(albumRef, { coverImageUrl: photoUrl });

      currentAlbumData.coverImageUrl = photoUrl;
      renderCoverDisplay();
      renderPhotosGrid();

      // Scroll halus ke kartu cover agar terlihat langsung perubahannya
      document.querySelector(".album-cover-card")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (error) {
      console.error("Error setting album cover: ", error);
      alert("Gagal mengubah foto sampul album.");
      makeCoverBtn.disabled = false;
      makeCoverBtn.innerHTML = '<i class="fas fa-star"></i> Jadikan Sampul';
    }
    return;
  }

  // 2. Hapus foto individual
  const deleteBtn = e.target.closest(".btn-delete-photo");
  if (deleteBtn) {
    if (!confirm("Apakah Anda yakin ingin menghapus foto ini dari album?")) return;

    const photoId = deleteBtn.dataset.id;
    const photoUrl = deleteBtn.dataset.url;

    deleteBtn.disabled = true;

    try {
      await deleteDoc(doc(db, "photos", photoId));

      // Jika foto yang dihapus kebetulan sedang menjadi cover album, bersihkan covernya
      if (
        currentAlbumData &&
        currentAlbumData.coverImageUrl &&
        currentAlbumData.coverImageUrl === photoUrl
      ) {
        const albumRef = doc(db, "albums", albumId);
        await updateDoc(albumRef, { coverImageUrl: "" });
        currentAlbumData.coverImageUrl = "";
        renderCoverDisplay();
      }
    } catch (error) {
      console.error("Error deleting photo: ", error);
      alert("Gagal menghapus foto dari album.");
      deleteBtn.disabled = false;
    }
  }
});

// Mulai muat data
loadAlbumDetails();
