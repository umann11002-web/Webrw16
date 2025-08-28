// Import fungsi yang relevan dari Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.appspot.com",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elemen UI
const profileForm = document.getElementById("profile-form");
const saveBtn = document.getElementById("save-profile-btn");
const saveStatus = document.getElementById("save-status");

let currentUser = null;

// Cek login dan muat data yang ada ke dalam form
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadUserProfile(user.uid);
  } else {
    window.location.href = "login.html";
  }
});

async function loadUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("profile-email").value = currentUser.email;
    document.getElementById("profile-nik").value = data.nik || "";
    document.getElementById("profile-nama").value = data.namaLengkap || "";
    document.getElementById("profile-alamat").value = data.alamat || "";
    document.getElementById("profile-nohp").value = data.noHp || "";
  } else {
    document.getElementById("profile-email").value = currentUser.email;
  }
}

// Event listener untuk menyimpan form
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  saveBtn.disabled = true;
  saveBtn.textContent = "Menyimpan...";
  saveStatus.textContent = "";

  try {
    const userRef = doc(db, "users", currentUser.uid);
    const dataToSave = {
      nik: document.getElementById("profile-nik").value,
      namaLengkap: document.getElementById("profile-nama").value,
      alamat: document.getElementById("profile-alamat").value,
      noHp: document.getElementById("profile-nohp").value,
    };

    // Gunakan setDoc dengan merge: true agar tidak menghapus field lain (seperti fotoUrl dan role)
    await setDoc(userRef, dataToSave, { merge: true });

    saveStatus.textContent = "Biodata berhasil diperbarui!";
    saveStatus.style.color = "green";

    // Arahkan kembali ke halaman profil setelah 2 detik
    setTimeout(() => {
      window.location.href = "profil.html";
    }, 2000);
  } catch (error) {
    console.error("Error menyimpan profil:", error);
    saveStatus.textContent = `Gagal: ${error.message}`;
    saveStatus.style.color = "red";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Simpan Biodata";
  }
});
