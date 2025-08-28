import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ... (Konfigurasi Firebase kamu) ...

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Cek status login
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadProfileData(user.uid);
    loadHistoryData(user.uid);
  } else {
    window.location.href = "login.html";
  }
});

// Memuat data utama profil
async function loadProfileData(uid) {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("profile-name").textContent =
      data.namaLengkap || "Nama Belum Diisi";
    document.getElementById("profile-email").textContent = data.email || "-";
    document.getElementById("profile-nohp").textContent =
      data.noHp || "No. HP Belum Diisi";

    const profilePic = document.getElementById("profile-pic");
    const editMenu = document.getElementById("edit-pic-menu");

    if (data.fotoUrl) {
      profilePic.src = data.fotoUrl;
      editMenu.innerHTML = `
        <a href="#" id="ganti-foto">Ganti Foto</a>
        <a href="#" id="hapus-foto">Hapus Foto</a>
      `;
    } else {
      editMenu.innerHTML = `<a href="#" id="unggah-foto">Unggah Foto</a>`;
    }
  }
}

// Memuat riwayat pengajuan surat
async function loadHistoryData(uid) {
  const tableBody = document.getElementById("history-table-body");
  tableBody.innerHTML = `<tr><td colspan="5">Memuat riwayat...</td></tr>`;

  const q = query(
    collection(db, "pengajuanSurat"),
    where("userId", "==", uid),
    orderBy("tanggalPengajuan", "desc")
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="5">Anda belum pernah mengajukan surat.</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const tanggal = data.tanggalPengajuan.toDate().toLocaleDateString("id-ID");
    const aksi =
      data.status === "Selesai"
        ? `<a href="${data.fileSuratJadiUrl}" target="_blank">Unduh Surat</a>`
        : "-";

    const row = `
      <tr>
        <td>${tanggal}</td>
        <td>${data.jenisSurat}</td>
        <td>${data.keperluan}</td>
        <td>${data.status}</td>
        <td>${aksi}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

// Logika untuk tombol edit foto
const editPicBtn = document.getElementById("edit-pic-btn");
const editPicMenu = document.getElementById("edit-pic-menu");
const photoUploadInput = document.getElementById("photo-upload-input");

editPicBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  editPicMenu.style.display =
    editPicMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if (
    e.target.id !== "edit-pic-btn" &&
    e.target.closest("#edit-pic-btn") === null
  ) {
    editPicMenu.style.display = "none";
  }

  // Aksi di dalam menu
  if (e.target.id === "unggah-foto" || e.target.id === "ganti-foto") {
    e.preventDefault();
    photoUploadInput.click(); // Buka dialog pilih file
  }
  if (e.target.id === "hapus-foto") {
    e.preventDefault();
    if (confirm("Yakin ingin menghapus foto profil?")) {
      removeProfilePicture();
    }
  }
});

// Fungsi untuk upload/ganti foto
photoUploadInput.addEventListener("change", () => {
  const file = photoUploadInput.files[0];
  if (file) {
    uploadProfilePicture(file);
  }
});

async function uploadProfilePicture(file) {
  // ... (Logika upload ke Cloudinary seperti di profil.js lama) ...
  // Setelah dapat URL, simpan ke Firestore
  const userRef = doc(db, "users", currentUser.uid);
  await updateDoc(userRef, { fotoUrl: newImageUrl });
  alert("Foto profil berhasil diperbarui!");
  window.location.reload(); // Muat ulang halaman
}

// Fungsi untuk hapus foto
async function removeProfilePicture() {
  const userRef = doc(db, "users", currentUser.uid);
  await updateDoc(userRef, { fotoUrl: "" }); // Set URL jadi string kosong
  alert("Foto profil berhasil dihapus!");
  window.location.reload();
}
