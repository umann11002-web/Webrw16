import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  writeBatch,
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
const auth = getAuth(app);
const db = getFirestore(app);

// Elemen UI
const createAlbumForm = document.getElementById("create-album-form");
const albumGrid = document.getElementById("album-grid");
const uploadModal = document.getElementById("upload-photos-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const uploadPhotosForm = document.getElementById("upload-photos-form");
const photoFilesInput = document.getElementById("photo-files-input");
const previewContainer = document.getElementById("preview-container");

// Cek status login admin
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      loadAlbums(); // Muat daftar album jika admin
    } else {
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Fungsi untuk memuat dan menampilkan semua album
async function loadAlbums() {
  albumGrid.innerHTML = "<p>Memuat album...</p>";
  try {
    const querySnapshot = await getDocs(collection(db, "albums"));
    albumGrid.innerHTML = "";
    if (querySnapshot.empty) {
      albumGrid.innerHTML = "<p>Belum ada album yang dibuat.</p>";
      return;
    }
    querySnapshot.forEach((doc) => {
      const album = doc.data();
      const albumId = doc.id;
      const albumCard = document.createElement("div");
      albumCard.className = "album-card";
      albumCard.innerHTML = `
        <div class="album-cover">
          ${
            album.coverImageUrl
              ? `<img src="${album.coverImageUrl}" alt="${album.judul}">`
              : '<i class="fas fa-image fa-3x"></i>'
          }
        </div>
        <div class="album-info">
          <p class="album-title">${album.judul}</p>
          <div class="album-actions">
            <button class="album-btn btn-add-photo" data-id="${albumId}" data-title="${
        album.judul
      }">Tambah Foto</button>
          </div>
        </div>
        <button class="delete-album-btn-corner" data-id="${albumId}">&times;</button>
      `;
      albumGrid.appendChild(albumCard);
    });
  } catch (error) {
    console.error("Error memuat album: ", error);
    albumGrid.innerHTML = "<p>Gagal memuat album.</p>";
  }
}

// Event listener untuk form buat album baru
createAlbumForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const albumTitle = document.getElementById("album-title-input").value;
  const btn = document.getElementById("create-album-btn");
  btn.disabled = true;
  btn.textContent = "Membuat...";

  try {
    await addDoc(collection(db, "albums"), {
      judul: albumTitle,
      dibuatPada: serverTimestamp(),
      coverImageUrl: "", // Awalnya kosong
    });
    createAlbumForm.reset();
    loadAlbums();
  } catch (error) {
    console.error("Error membuat album: ", error);
    alert("Gagal membuat album.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Buat Album";
  }
});

// Event listener untuk tombol di dalam grid album (tambah foto & hapus)
albumGrid.addEventListener("click", (e) => {
  const target = e.target;
  // Jika tombol "Tambah Foto" diklik
  if (target.classList.contains("btn-add-photo")) {
    const albumId = target.dataset.id;
    const albumTitle = target.dataset.title;
    document.getElementById("album-id-hidden").value = albumId;
    document.getElementById(
      "modal-album-title"
    ).textContent = `Unggah Foto ke Album: ${albumTitle}`;
    uploadModal.style.display = "flex";
  }
  // Jika tombol "Hapus Album" (pojok) diklik
  if (target.classList.contains("delete-album-btn-corner")) {
    const albumId = target.dataset.id;
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus album ini beserta semua fotonya?"
      )
    ) {
      deleteAlbum(albumId);
    }
  }
});

// Fungsi untuk menghapus album beserta fotonya
async function deleteAlbum(albumId) {
  try {
    // 1. Hapus semua foto di dalam album
    const photosQuery = query(
      collection(db, "photos"),
      where("albumId", "==", albumId)
    );
    const photoDocs = await getDocs(photosQuery);

    const batch = writeBatch(db);
    photoDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // 2. Hapus dokumen album itu sendiri
    await deleteDoc(doc(db, "albums", albumId));

    alert("Album berhasil dihapus.");
    loadAlbums();
  } catch (error) {
    console.error("Error menghapus album: ", error);
    alert("Gagal menghapus album.");
  }
}

// Menutup modal
closeModalBtn.addEventListener("click", () => {
  uploadModal.style.display = "none";
  uploadPhotosForm.reset();
  previewContainer.innerHTML = "";
});

// Menampilkan preview gambar sebelum di-upload
photoFilesInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  for (const file of photoFilesInput.files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// Event listener untuk form upload banyak foto
uploadPhotosForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const albumId = document.getElementById("album-id-hidden").value;
  const files = photoFilesInput.files;
  const btn = document.getElementById("upload-photos-btn");
  const progressText = document.getElementById("upload-progress");

  if (files.length === 0) {
    alert("Pilih setidaknya satu file gambar.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Mengunggah...";

  // Fungsi untuk upload satu file ke Cloudinary
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "yd99selh"); // GANTI DENGAN NAMA PRESET-MU
    const cloudName = "do1ba7gkn"; // GANTI JIKA BEDA
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(uploadUrl, { method: "POST", body: formData });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
  };

  try {
    const uploadPromises = Array.from(files).map(uploadFile);
    let uploadedCount = 0;

    // Memberi tahu progress upload
    uploadPromises.forEach((p) =>
      p.then(() => {
        uploadedCount++;
        progressText.textContent = `Proses: ${uploadedCount} dari ${files.length} foto berhasil diunggah.`;
      })
    );

    // Menunggu semua promise upload selesai
    const imageUrls = await Promise.all(uploadPromises);

    // Simpan semua URL ke Firestore
    const batch = writeBatch(db);
    imageUrls.forEach((url) => {
      const photoRef = doc(collection(db, "photos"));
      batch.set(photoRef, {
        albumId: albumId,
        imageUrl: url,
        diunggahPada: serverTimestamp(),
      });
    });
    await batch.commit();

    // Cek dan update cover image album jika belum ada
    const albumRef = doc(db, "albums", albumId);
    const albumSnap = await getDoc(albumRef);
    if (albumSnap.exists() && !albumSnap.data().coverImageUrl) {
      await updateDoc(albumRef, { coverImageUrl: imageUrls[0] });
    }

    alert("Semua foto berhasil diunggah!");
    uploadModal.style.display = "none";
    uploadPhotosForm.reset();
    previewContainer.innerHTML = "";
    loadAlbums(); // Muat ulang daftar album untuk update cover
  } catch (error) {
    console.error("Error mengunggah foto: ", error);
    progressText.textContent = `Gagal: ${error.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Unggah Foto";
  }
});
