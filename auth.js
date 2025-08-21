// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Konfigurasi Firebase-mu (INI SUDAH SAYA ISI DARI KODEMU)
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

// === FUNGSI UNTUK PROSES LOGIN ===

// 1. Ambil elemen-elemen form dari HTML
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

// 2. Tambahkan event listener saat form di-submit
loginForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Mencegah form refresh halaman

  // 3. Ambil nilai email dan password dari input
  const email = emailInput.value;
  const password = passwordInput.value;

  // 4. Kirim data ke Firebase untuk diverifikasi
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Jika login berhasil
      const user = userCredential.user;
      console.log("Login berhasil:", user);
      alert("Login berhasil!");

      // Arahkan ke halaman admin (yang akan kita buat nanti)
      window.location.href = "admin.html";
    })
    .catch((error) => {
      // Jika login gagal
      console.error("Login Gagal:", error.message);
      errorMessage.textContent =
        "Email atau password salah. Silakan coba lagi.";
    });
});
