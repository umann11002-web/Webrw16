import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
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
const auth = getAuth(app);
const db = getFirestore(app);

// Elemen UI
const beritaForm = document.getElementById("berita-form");
const submitBtn = document.getElementById("submit-berita-btn");
const uploadStatus = document.getElementById("upload-status");
const beritaListContainer = document.getElementById("berita-list-container");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const formTitle = document.getElementById("form-title");

// Cek status login admin
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      loadBerita(); // Muat daftar berita saat halaman dibuka
    } else {
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// [BARU] Fungsi untuk memuat dan menampilkan daftar berita
async function loadBerita() {
  beritaListContainer.innerHTML = `<p>Memuat daftar berita...</p>`;
  try {
    const q = query(collection(db, "berita"), orderBy("tanggal", "desc"));
    const querySnapshot = await getDocs(q);
    beritaListContainer.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const berita = doc.data();
      const beritaItem = document.createElement("div");
      beritaItem.className = "berita-list-item";
      beritaItem.innerHTML = `
                <span>${berita.judul}</span>
                <div class="berita-actions">
                    <button class="btn-edit" data-id="${doc.id}">Edit</button>
                    <button class="btn-delete" data-id="${doc.id}">Hapus</button>
                </div>
            `;
      beritaListContainer.appendChild(beritaItem);
    });
  } catch (error) {
    console.error("Error memuat berita: ", error);
    beritaListContainer.innerHTML = `<p>Gagal memuat daftar berita.</p>`;
  }
}

// [MODIFIKASI] Event listener untuk form, sekarang bisa handle tambah & edit
beritaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const judul = document.getElementById("berita-judul").value;
  const isi = document.getElementById("berita-isi").value;
  const file = document.getElementById("berita-gambar").files[0];
  const beritaId = document.getElementById("berita-id").value;

  // Validasi dasar
  if (!judul || !isi) {
    alert("Judul dan Isi Berita harus diisi.");
    return;
  }
  // Jika ini mode tambah baru, file gambar wajib ada
  if (!beritaId && !file) {
    alert("Gambar utama wajib diisi untuk berita baru.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan...";
  uploadStatus.textContent = "";

  try {
    let gambarUrl;
    // Hanya upload gambar baru jika ada file yang dipilih
    if (file) {
      uploadStatus.textContent = "Mengunggah gambar...";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "yd99selh");
      const cloudName = "do1ba7gkn";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (uploadData.error) throw new Error(uploadData.error.message);
      gambarUrl = uploadData.secure_url;
    }

    uploadStatus.textContent = "Menyimpan data berita...";

    if (beritaId) {
      // === MODE EDIT ===
      const beritaRef = doc(db, "berita", beritaId);
      const dataToUpdate = {
        judul: judul,
        isi: isi,
      };
      // Hanya update URL gambar jika gambar baru diupload
      if (gambarUrl) {
        dataToUpdate.gambarUrl = gambarUrl;
      }
      await updateDoc(beritaRef, dataToUpdate);
      uploadStatus.textContent = "Berita berhasil diperbarui!";
    } else {
      // === MODE TAMBAH BARU ===
      await addDoc(collection(db, "berita"), {
        judul: judul,
        isi: isi,
        gambarUrl: gambarUrl,
        tanggal: serverTimestamp(),
        dilihat: 0,
      });
      uploadStatus.textContent = "Berita berhasil dipublikasikan!";
    }

    uploadStatus.style.color = "green";
    resetForm();
    loadBerita();
  } catch (error) {
    console.error("Error: ", error);
    uploadStatus.textContent = `Gagal: ${error.message}`;
    uploadStatus.style.color = "red";
  } finally {
    submitBtn.disabled = false;
  }
});

// [BARU] Event listener untuk tombol di daftar berita (Edit & Hapus)
beritaListContainer.addEventListener("click", (e) => {
  const target = e.target;
  const id = target.dataset.id;
  if (target.classList.contains("btn-delete")) {
    if (confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      deleteBerita(id);
    }
  }
  if (target.classList.contains("btn-edit")) {
    prepareForEdit(id);
  }
});

// [BARU] Fungsi untuk menghapus berita
async function deleteBerita(id) {
  try {
    await deleteDoc(doc(db, "berita", id));
    alert("Berita berhasil dihapus.");
    loadBerita();
  } catch (error) {
    console.error("Error menghapus berita: ", error);
    alert("Gagal menghapus berita.");
  }
}

// [BARU] Fungsi untuk menyiapkan form dalam mode edit
async function prepareForEdit(id) {
  try {
    const beritaRef = doc(db, "berita", id);
    const docSnap = await getDoc(beritaRef);
    if (docSnap.exists()) {
      const berita = docSnap.data();
      document.getElementById("berita-id").value = id;
      document.getElementById("berita-judul").value = berita.judul;
      document.getElementById("berita-isi").value = berita.isi;

      formTitle.textContent = "Edit Berita";
      submitBtn.textContent = "Simpan Perubahan";
      cancelEditBtn.style.display = "inline-block";
      window.scrollTo(0, 0); // Scroll ke atas halaman
    }
  } catch (error) {
    console.error("Error menyiapkan edit: ", error);
    alert("Gagal memuat data untuk diedit.");
  }
}

// [BARU] Fungsi untuk mereset form dan kembali ke mode tambah
function resetForm() {
  beritaForm.reset();
  document.getElementById("berita-id").value = "";
  formTitle.textContent = "Tambah Berita Baru";
  submitBtn.textContent = "Publikasikan Berita";
  cancelEditBtn.style.display = "none";
}

// Event listener untuk tombol batal edit
cancelEditBtn.addEventListener("click", resetForm);
