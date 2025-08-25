import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  addDoc,
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

// Ambil elemen
const galleryGrid = document.getElementById("gallery-grid-admin");
const uploadForm = document.getElementById("upload-gallery-form");
const uploadStatus = document.getElementById("upload-status");
const uploadBtn = document.getElementById("upload-btn");
const logoutBtn = document.getElementById("logout-btn");

// Satpam
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
      loadGallery();
    } else {
      alert("Akses ditolak.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Memuat dan menampilkan galeri yang ada
async function loadGallery() {
  try {
    const querySnapshot = await getDocs(collection(db, "galeri"));
    galleryGrid.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const foto = doc.data();
      const item = document.createElement("div");
      item.className = "gallery-item-admin";
      item.innerHTML = `
                <img src="${foto.imageUrl}" alt="${foto.judul}">
                <button class="delete-btn" data-id="${doc.id}">&times;</button>
            `;
      galleryGrid.appendChild(item);
    });
  } catch (error) {
    console.error("Error memuat galeri: ", error);
  }
}

// Menangani form upload
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("gallery-title").value;
  const file = document.getElementById("gallery-file").files[0];

  if (!title || !file) {
    alert("Judul dan file tidak boleh kosong.");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Mengunggah...";
  uploadStatus.textContent = "";

  try {
    // Menggunakan metode Unsigned Upload Cloudinary yang sudah kita buat
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "yd99selh"); // GANTI DENGAN NAMA PRESET-MU

    const cloudName = "do1ba7gkn"; // GANTI JIKA BEDA
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadResponse.json();
    if (uploadData.error) throw new Error(uploadData.error.message);

    const imageUrl = uploadData.secure_url;

    // Simpan info ke Firestore
    await addDoc(collection(db, "galeri"), {
      judul: title,
      imageUrl: imageUrl,
      diunggahPada: serverTimestamp(),
    });

    uploadStatus.textContent = "Foto berhasil diunggah!";
    uploadStatus.style.color = "green";
    uploadForm.reset();
    loadGallery(); // Muat ulang galeri
  } catch (error) {
    console.error("Error mengunggah foto: ", error);
    uploadStatus.textContent = `Gagal: ${error.message}`;
    uploadStatus.style.color = "red";
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Unggah Foto";
  }
});

// Menangani tombol hapus
galleryGrid.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const docId = e.target.dataset.id;
    if (confirm("Apakah Anda yakin ingin menghapus foto ini?")) {
      try {
        await deleteDoc(doc(db, "galeri", docId));
        alert("Foto berhasil dihapus.");
        loadGallery();
      } catch (error) {
        alert("Gagal menghapus foto.");
      }
    }
  }
});

// Tombol Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});
