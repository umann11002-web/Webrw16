import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
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
const layananList = document.getElementById("layanan-list");
const addLayananForm = document.getElementById("add-layanan-form");
const statusMessage = document.getElementById("status-message");

// Satpam: Pastikan hanya admin yang bisa akses
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
      // Jika admin, muat data layanan
      loadLayanan();
    } else {
      // Jika bukan admin, tendang
      alert("Anda tidak punya hak akses ke halaman ini.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Fungsi untuk memuat dan menampilkan daftar layanan yang sudah ada
async function loadLayanan() {
  try {
    const querySnapshot = await getDocs(collection(db, "layanan"));
    layananList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const layanan = doc.data();
      const li = document.createElement("li");
      li.textContent = layanan.namaLayanan;
      layananList.appendChild(li);
    });
  } catch (error) {
    console.error("Error memuat layanan: ", error);
    layananList.innerHTML = "<li>Gagal memuat layanan.</li>";
  }
}

// Fungsi untuk menangani penambahan layanan baru
addLayananForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Ambil data dari form
  const id = document.getElementById("layanan-id").value.trim();
  const nama = document.getElementById("layanan-nama").value.trim();
  const deskripsi = document.getElementById("layanan-deskripsi").value.trim();
  const persyaratanInput = document.getElementById("layanan-persyaratan").value;

  // Ubah string persyaratan menjadi array
  const persyaratanArray = persyaratanInput
    .split(",")
    .map((item) => item.trim());

  if (!id || !nama || !deskripsi || persyaratanArray.length === 0) {
    alert("Semua field wajib diisi.");
    return;
  }

  try {
    // Simpan data sebagai dokumen baru di koleksi 'layanan'
    await setDoc(doc(db, "layanan", id), {
      namaLayanan: nama,
      deskripsi: deskripsi,
      persyaratan: persyaratanArray,
    });

    statusMessage.textContent = "Layanan baru berhasil ditambahkan!";
    statusMessage.style.color = "green";
    addLayananForm.reset();
    loadLayanan(); // Muat ulang daftar layanan
  } catch (error) {
    console.error("Error menambahkan layanan: ", error);
    statusMessage.textContent = "Gagal menambahkan layanan.";
    statusMessage.style.color = "red";
  }
});
