// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Konfigurasi Firebase-mu
const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.firebasestorage.app",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === FUNGSI UNTUK PROSES REGISTRASI ===

const registerForm = document.getElementById("register-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    // 1. Buat user di Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Registrasi Auth berhasil:", user);

    // 2. BUAT DOKUMEN BARU DI KOLEKSI 'users' UNTUK MENYIMPAN PERAN
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "warga", // Tetapkan peran default sebagai 'warga'
    });

    console.log("Dokumen user dengan peran berhasil dibuat di Firestore.");
    alert("Registrasi berhasil! Anda akan diarahkan ke halaman utama.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Registrasi Gagal:", error.message);
    if (error.code === "auth/email-already-in-use") {
      errorMessage.textContent = "Email ini sudah terdaftar. Silakan login.";
    } else if (error.code === "auth/weak-password") {
      errorMessage.textContent =
        "Password terlalu lemah. Gunakan minimal 6 karakter.";
    } else {
      errorMessage.textContent = "Terjadi kesalahan. Silakan coba lagi.";
    }
  }
});
