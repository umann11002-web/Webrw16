// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// === FUNGSI UNTUK PROSES LOGIN ===

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeInput = document.getElementById("remember-me");
const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");
const submitBtn = document.getElementById("login-submit-btn");

// Tampilkan pesan sukses jika baru selesai mendaftar
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("registered") === "true") {
    if (successMessage) {
      successMessage.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 6px;"></i> Registrasi berhasil! Silakan masuk dengan akun baru Anda.';
      successMessage.style.display = "block";
    }
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const rememberMe = rememberMeInput ? rememberMeInput.checked : false;

  // Reset tampilan error & aktifkan tombol loading
  if (errorMessage) {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }
  if (successMessage) {
    successMessage.style.display = "none";
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
  }

  try {
    // Tentukan tipe persistensi berdasarkan pilihan 'Ingat Saya'
    const persistenceType = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;

    await setPersistence(auth, persistenceType);

    // 1. Lakukan proses login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 2. Ambil data peran dari Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get("redirect");

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      // 3. Arahkan langsung ke halaman tujuan tanpa alert popup
      if (userData.role === "admin") {
        window.location.href = "../admin/admin.html";
      } else {
        if (redirectParam) {
          window.location.href = redirectParam;
        } else {
          window.location.href = "../index.html";
        }
      }
    } else {
      // Jika data peran belum ada, default ke beranda
      if (redirectParam) {
        window.location.href = redirectParam;
      } else {
        window.location.href = "../index.html";
      }
    }
  } catch (error) {
    console.error("Login Gagal:", error.code, error.message);

    // Kembalikan tombol ke keadaan normal
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Login';
    }

    // Tampilkan pesan error ramah langsung di halaman
    if (errorMessage) {
      let friendlyMsg = "Email atau password yang Anda masukkan salah. Silakan periksa kembali.";
      if (error.code === "auth/invalid-email") {
        friendlyMsg = "Format email tidak valid. Pastikan penulisan email sudah benar.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        friendlyMsg = "Email atau password salah. Pastikan tidak ada kesalahan ketik (typo).";
      } else if (error.code === "auth/too-many-requests") {
        friendlyMsg = "Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat lagi sebelum mencoba kembali.";
      } else if (error.code === "auth/network-request-failed") {
        friendlyMsg = "Koneksi internet bermasalah. Mohon periksa jaringan Anda.";
      }

      errorMessage.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right: 6px;"></i> ${friendlyMsg}`;
      errorMessage.style.display = "block";
    }
  }
});
