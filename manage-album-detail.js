import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
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

// Elemen UI
const albumTitleEl = document.getElementById("detail-album-title");
const photoGrid = document.getElementById("photo-grid");
const addPhotosForm = document.getElementById("add-photos-form");
const photoFilesInput = document.getElementById("photo-files-input");
const previewContainer = document.getElementById("preview-container");
const uploadBtn = document.getElementById("upload-photos-btn");
const progressText = document.getElementById("upload-progress");

// Fungsi untuk upload file ke Cloudinary (sama seperti sebelumnya)
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

// Muat detail album dan foto-fotonya
async function loadAlbumDetails() {
  if (!albumId) {
    albumTitleEl.textContent = "Album Tidak Ditemukan";
    return;
  }

  // Ambil judul album
  const albumRef = doc(db, "albums", albumId);
  const albumSnap = await getDoc(albumRef);
  if (albumSnap.exists()) {
    albumTitleEl.textContent = `Kelola Album: ${albumSnap.data().judul}`;
  }

  // Ambil dan tampilkan foto-foto secara real-time
  const photosQuery = query(
    collection(db, "photos"),
    where("albumId", "==", albumId)
  );
  onSnapshot(photosQuery, (snapshot) => {
    photoGrid.innerHTML = "";
    if (snapshot.empty) {
      photoGrid.innerHTML = "<p>Belum ada foto di album ini.</p>";
      return;
    }
    snapshot.forEach((doc) => {
      const photo = doc.data();
      const photoEl = document.createElement("div");
      photoEl.className = "photo-card";
      photoEl.innerHTML = `
                <img src="${photo.imageUrl}" alt="Foto Album">
                <button class="delete-photo-btn" data-id="${doc.id}">&times;</button>
            `;
      photoGrid.appendChild(photoEl);
    });
  });
}

// Tampilkan preview gambar
photoFilesInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  for (const file of photoFilesInput.files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "preview-img";
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// Submit form untuk menambah foto baru
addPhotosForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const files = photoFilesInput.files;
  if (files.length === 0) return;

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Mengunggah...";

  try {
    const uploadPromises = Array.from(files).map(uploadFileToCloudinary);
    const imageUrls = await Promise.all(uploadPromises);

    for (const url of imageUrls) {
      await addDoc(collection(db, "photos"), {
        albumId: albumId,
        imageUrl: url,
        diunggahPada: serverTimestamp(),
      });
    }

    // Update cover album jika belum ada
    const albumRef = doc(db, "albums", albumId);
    const albumSnap = await getDoc(albumRef);
    if (albumSnap.exists() && !albumSnap.data().coverImageUrl) {
      await updateDoc(albumRef, { coverImageUrl: imageUrls[0] });
    }

    progressText.textContent = "Semua foto berhasil diunggah!";
    addPhotosForm.reset();
    previewContainer.innerHTML = "";
  } catch (error) {
    console.error("Error uploading photos: ", error);
    progressText.textContent = `Gagal: ${error.message}`;
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Unggah Foto";
  }
});

// Hapus foto individual
photoGrid.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-photo-btn")) {
    if (!confirm("Yakin ingin menghapus foto ini?")) return;
    const photoId = e.target.dataset.id;
    try {
      await deleteDoc(doc(db, "photos", photoId));
      // Cek apakah foto yg dihapus adalah cover, jika ya, reset cover
      // (Logika ini bisa ditambahkan jika diperlukan)
    } catch (error) {
      console.error("Error deleting photo: ", error);
      alert("Gagal menghapus foto.");
    }
  }
});

loadAlbumDetails();
