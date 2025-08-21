// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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

// === SATPAM DIGITAL (ROUTE GUARD) ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Jika ADA user yang login...
    console.log("User sedang login:", user);
    // Tampilkan email user di halaman
    const userEmailElement = document.getElementById("user-email");
    if (userEmailElement) {
      userEmailElement.textContent = user.email;
    }
  } else {
    // Jika TIDAK ADA user yang login...
    console.log("Tidak ada user yang login, tendang ke halaman login!");
    // "Tendang" atau redirect user kembali ke halaman login
    window.location.href = "login.html";
  }
});

// === FUNGSI LOGOUT ===
const logoutButton = document.getElementById("logout-btn");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        // Logout berhasil
        console.log("Logout berhasil");
        alert("Anda berhasil logout.");
        // Arahkan kembali ke halaman login
        window.location.href = "login.html";
      })
      .catch((error) => {
        // Terjadi error saat logout
        console.error("Error saat logout:", error);
      });
  });
}
