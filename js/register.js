// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
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
const submitBtn = document.getElementById("register-submit-btn");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (errorMessage) {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
  }

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
    await signOut(auth);
    window.location.href = "../admin/login.html?registered=true";
  } catch (error) {
    console.error("Registrasi Gagal:", error.message);
    let msg = "Terjadi kesalahan. Silakan coba lagi.";
    if (error.code === "auth/email-already-in-use") {
      msg = "Email ini sudah terdaftar. Silakan login.";
    } else if (error.code === "auth/weak-password") {
      msg = "Password terlalu lemah. Gunakan minimal 6 karakter.";
    } else if (error.code === "auth/invalid-email") {
      msg = "Format email tidak valid.";
    }
    
    if (errorMessage) {
      errorMessage.textContent = msg;
      errorMessage.style.display = "block";
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar';
    }
  }
});
