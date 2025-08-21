// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Konfigurasi Firebase-mu (WAJIB GANTI DENGAN PUNYAMU)
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

// === FUNGSI UNTUK PROSES REGISTRASI ===

const registerForm = document.getElementById("register-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Jika registrasi berhasil
      const user = userCredential.user;
      console.log("Registrasi berhasil:", user);
      alert("Registrasi berhasil! Anda akan diarahkan ke halaman utama.");
      // Arahkan ke halaman utama setelah berhasil
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Jika registrasi gagal
      console.error("Registrasi Gagal:", error.message);
      if (error.code === "auth/email-already-in-use") {
        errorMessage.textContent = "Email ini sudah terdaftar. Silakan login.";
      } else if (error.code === "auth/weak-password") {
        errorMessage.textContent =
          "Password terlalu lemah. Gunakan minimal 6 karakter.";
      } else {
        errorMessage.textContent = "Terjadi kesalahan. Silakan coba lagi.";
      }
    });
});
