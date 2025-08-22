// Import fungsi yang kita butuhkan dari Firebase SDK
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
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// Konfigurasi Firebase-mu
const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.appspot.com",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ... (kode elemen, variabel, dan fungsi lainnya tetap sama) ...
const mainContent = document.getElementById("main-content");
const loadingIndicator = document.getElementById("loading-indicator");
const formTitle = document.getElementById("form-title");
const persyaratanInfo = document.getElementById("persyaratan-info");
const suratForm = document.getElementById("surat-form");
const statusMessage = document.getElementById("status-message");
const submitButton = document.getElementById("submit-btn");

let currentUser = null;
let layananId = null;

// ... (kode getLayananIdFromUrl, loadFormDetails, onAuthStateChanged tetap sama) ...
function getLayananIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}
async function loadFormDetails() {
  layananId = getLayananIdFromUrl();
  if (!layananId) {
    loadingIndicator.innerHTML = "<h2>Error: ID Layanan tidak ditemukan.</h2>";
    return;
  }
  try {
    const docRef = doc(db, "layanan", layananId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const layanan = docSnap.data();
      formTitle.textContent = `Form Pengajuan: ${layanan.namaLayanan}`;
      let persyaratanHTML = "<p><strong>Persyaratan:</strong></p><ul>";
      layanan.persyaratan.forEach((item) => {
        persyaratanHTML += `<li>${item}</li>`;
      });
      persyaratanHTML += "</ul>";
      persyaratanInfo.innerHTML = persyaratanHTML;
      loadingIndicator.style.display = "none";
      mainContent.style.display = "block";
    } else {
      loadingIndicator.innerHTML = "<h2>Error: Layanan tidak ditemukan.</h2>";
    }
  } catch (error) {
    loadingIndicator.innerHTML = "<h2>Gagal memuat form.</h2>";
  }
}
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadFormDetails();
  } else {
    const currentUrl = window.location.href;
    alert("Anda harus login untuk mengakses halaman ini.");
    window.location.href = `login.html?redirect=${encodeURIComponent(
      currentUrl
    )}`;
  }
});

// ### LOGIKA PENGIRIMAN FORM (DIPERBARUI UNTUK WORKAROUND) ###
suratForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser || !layananId) return;

  const file = document.getElementById("file-persyaratan").files[0];
  const keperluan = document.getElementById("keperluan").value;
  let fileUrl = null; // Variabel untuk menyimpan URL, defaultnya null

  submitButton.disabled = true;
  submitButton.textContent = "Mengirim...";
  statusMessage.textContent = "";

  try {
    // Cek apakah user memilih file untuk diunggah
    if (file) {
      // JIKA ADA FILE, JALANKAN PROSES UPLOAD (ini akan gagal untuk sekarang)
      submitButton.textContent = "Mengunggah file...";
      const filePath = `persyaratan/${currentUser.uid}/${Date.now()}-${
        file.name
      }`;
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(snapshot.ref);
      submitButton.textContent = "Menyimpan data...";
    } else {
      // JIKA TIDAK ADA FILE, kita biarkan fileUrl tetap null dan lanjut
      console.log("Tidak ada file yang diunggah, melanjutkan tanpa upload.");
    }

    // Siapkan data untuk disimpan ke Firestore
    const dataPengajuan = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      layananId: layananId,
      jenisSurat: formTitle.textContent.replace("Form Pengajuan: ", ""),
      keperluan: keperluan,
      status: "Menunggu Persetujuan",
      tanggalPengajuan: serverTimestamp(),
      fileUrl: fileUrl, // Ini akan berisi URL jika berhasil, atau null jika tidak ada file
    };

    // Simpan data ke Firestore
    await addDoc(collection(db, "pengajuanSurat"), dataPengajuan);

    statusMessage.textContent = "Pengajuan surat berhasil dikirim!";
    statusMessage.style.color = "green";
    suratForm.reset();
  } catch (error) {
    console.error("Error saat proses pengajuan: ", error);
    statusMessage.textContent = "Gagal mengirim pengajuan. Silakan coba lagi.";
    statusMessage.style.color = "red";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Ajukan Surat";
  }
});
