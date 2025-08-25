import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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

// Ambil elemen
const statistikForm = document.getElementById("statistik-form");
const totalPendudukInput = document.getElementById("total-penduduk");
const kepalaKeluargaInput = document.getElementById("kepala-keluarga");
const jumlahPriaInput = document.getElementById("jumlah-pria");
const jumlahWanitaInput = document.getElementById("jumlah-wanita");
const statusMessage = document.getElementById("status-message");
const saveBtn = document.getElementById("save-btn");
const logoutBtn = document.getElementById("logout-btn");

const docRef = doc(db, "statistik", "data_penduduk");

// Satpam: Pastikan hanya admin yang bisa akses
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
      loadStatistik(); // Jika admin, muat data statistik
    } else {
      alert("Anda tidak punya hak akses ke halaman ini.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Fungsi untuk memuat data statistik yang ada ke dalam form
async function loadStatistik() {
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      totalPendudukInput.value = data.totalPenduduk;
      kepalaKeluargaInput.value = data.kepalaKeluarga;
      jumlahPriaInput.value = data.jumlahPria;
      jumlahWanitaInput.value = data.jumlahWanita;
    } else {
      console.log("Belum ada data statistik, form akan kosong.");
    }
  } catch (error) {
    console.error("Error memuat statistik: ", error);
    statusMessage.textContent = "Gagal memuat data.";
    statusMessage.style.color = "red";
  }
}

// Fungsi untuk menyimpan perubahan
statistikForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  saveBtn.disabled = true;
  saveBtn.textContent = "Menyimpan...";

  try {
    const dataToSave = {
      totalPenduduk: Number(totalPendudukInput.value),
      kepalaKeluarga: Number(kepalaKeluargaInput.value),
      jumlahPria: Number(jumlahPriaInput.value),
      jumlahWanita: Number(jumlahWanitaInput.value),
    };

    await setDoc(docRef, dataToSave);

    statusMessage.textContent = "Data berhasil diperbarui!";
    statusMessage.style.color = "green";
  } catch (error) {
    console.error("Error menyimpan statistik: ", error);
    statusMessage.textContent = "Gagal menyimpan data.";
    statusMessage.style.color = "red";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Simpan Perubahan";
  }
});

// Tombol Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});
