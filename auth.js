// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
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
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    // 1. Lakukan proses login seperti biasa
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Login Auth berhasil:", user);

    // 2. AMBIL DATA PERAN DARI FIRESTORE
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log("Data user ditemukan:", userData);

      // 3. CEK PERAN DAN ARAHKAN (REDIRECT)
      if (userData.role === "admin") {
        alert("Login sebagai Admin berhasil!");
        window.location.href = "admin.html"; // Arahkan admin ke dashboard
      } else {
        alert("Login sebagai Warga berhasil!");
        window.location.href = "layanan.html"; // Arahkan warga ke halaman layanan
      }
    } else {
      // Jika data user tidak ditemukan di firestore (kasus aneh)
      console.log(
        "Tidak ada data peran untuk user ini, arahkan ke halaman utama."
      );
      alert("Login berhasil!");
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("Login Gagal:", error.message);
    errorMessage.textContent = "Email atau password salah. Silakan coba lagi.";
  }
});
