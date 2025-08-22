// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Konfigurasi Firebase-mu (JANGAN LUPA GANTI)
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

// Variabel untuk menyimpan data user yang login
let currentUser = null;

// === SATPAM DIGITAL (ROUTE GUARD) ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Jika ADA user yang login...
    console.log("User terverifikasi:", user.email);
    currentUser = user; // Simpan data user yang sedang login
  } else {
    // Jika TIDAK ADA user yang login...
    console.log("Tidak ada user, tendang ke halaman login!");
    // Arahkan user kembali ke halaman login
    window.location.href = "login.html";
  }
});

// ######################################################
// ### BAGIAN BARU: FUNGSI UNTUK MENGIRIM DATA FORM ###
// ######################################################

// Ambil elemen form dari HTML
const suratForm = document.getElementById("surat-form");
const statusMessage = document.getElementById("status-message");
const submitButton = document.getElementById("submit-btn");

// Tambahkan event listener saat form di-submit
suratForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Mencegah halaman refresh

  // Pastikan ada user yang login sebelum mengirim
  if (!currentUser) {
    statusMessage.textContent =
      "Error: Anda harus login untuk mengajukan surat.";
    statusMessage.style.color = "red";
    return;
  }

  // Ambil data dari setiap input di form
  const jenisSurat = document.getElementById("jenis-surat").value;
  const keperluan = document.getElementById("keperluan").value;
  // const filePersyaratan = document.getElementById('file-persyaratan').files[0]; // Kita skip dulu

  // Nonaktifkan tombol submit untuk mencegah klik ganda
  submitButton.disabled = true;
  submitButton.textContent = "Mengirim...";
  statusMessage.textContent = "";

  try {
    // Siapkan data yang akan disimpan ke Firestore
    const dataPengajuan = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      jenisSurat: jenisSurat,
      keperluan: keperluan,
      status: "Menunggu Persetujuan", // Status awal
      tanggalPengajuan: serverTimestamp(), // Tanggal & waktu saat ini
      // fileUrl: '...' // Akan kita tambahkan nanti setelah fitur upload jadi
    };

    // Simpan data ke koleksi 'pengajuanSurat' di Firestore
    const docRef = await addDoc(
      collection(db, "pengajuanSurat"),
      dataPengajuan
    );

    console.log("Dokumen berhasil ditulis dengan ID: ", docRef.id);

    // Beri pesan sukses ke user
    statusMessage.textContent = "Pengajuan surat berhasil dikirim!";
    statusMessage.style.color = "green";
    suratForm.reset(); // Kosongkan form setelah berhasil
  } catch (error) {
    console.error("Error menambahkan dokumen: ", error);
    statusMessage.textContent = "Gagal mengirim pengajuan. Silakan coba lagi.";
    statusMessage.style.color = "red";
  } finally {
    // Aktifkan kembali tombol submit apa pun hasilnya
    submitButton.disabled = false;
    submitButton.textContent = "Ajukan Surat";
  }
});
