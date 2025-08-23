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
  deleteDoc,
  getDoc,
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
const formTitle = document.querySelector(".card h2:last-of-type");
const submitButton = addLayananForm.querySelector("button");
const layananIdInput = document.getElementById("layanan-id");

// Satpam
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
      loadLayanan();
    } else {
      alert("Anda tidak punya hak akses.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Fungsi untuk memuat dan menampilkan daftar layanan
async function loadLayanan() {
  try {
    const querySnapshot = await getDocs(collection(db, "layanan"));
    layananList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const layanan = doc.data();
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";

      const textSpan = document.createElement("span");
      textSpan.textContent = layanan.namaLayanan;

      const buttonsDiv = document.createElement("div");

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.onclick = () => populateFormForEdit(doc.id);
      editButton.style.marginRight = "10px";

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Hapus";
      deleteButton.onclick = () => deleteLayanan(doc.id);

      buttonsDiv.appendChild(editButton);
      buttonsDiv.appendChild(deleteButton);
      li.appendChild(textSpan);
      li.appendChild(buttonsDiv);
      layananList.appendChild(li);
    });
  } catch (error) {
    console.error("Error memuat layanan: ", error);
  }
}

// Fungsi untuk menangani penambahan ATAU pengeditan layanan
addLayananForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = layananIdInput.value.trim();
  const nama = document.getElementById("layanan-nama").value.trim();
  const deskripsi = document.getElementById("layanan-deskripsi").value.trim();
  const persyaratanInput = document.getElementById("layanan-persyaratan").value;
  const persyaratanArray = persyaratanInput
    .split(",")
    .map((item) => item.trim());

  if (!id || !nama || !deskripsi || persyaratanArray.length === 0) {
    alert("Semua field wajib diisi.");
    return;
  }

  try {
    await setDoc(doc(db, "layanan", id), {
      namaLayanan: nama,
      deskripsi: deskripsi,
      persyaratan: persyaratanArray,
    });

    statusMessage.textContent = "Layanan berhasil disimpan!";
    statusMessage.style.color = "green";
    resetForm();
    loadLayanan();
  } catch (error) {
    console.error("Error menyimpan layanan: ", error);
    statusMessage.textContent = "Gagal menyimpan layanan.";
    statusMessage.style.color = "red";
  }
});

// FUNGSI BARU: Mengisi form untuk diedit
async function populateFormForEdit(id) {
  try {
    const docRef = doc(db, "layanan", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      layananIdInput.value = id;
      document.getElementById("layanan-nama").value = data.namaLayanan;
      document.getElementById("layanan-deskripsi").value = data.deskripsi;
      document.getElementById("layanan-persyaratan").value =
        data.persyaratan.join(", ");

      formTitle.textContent = "Edit Layanan";
      submitButton.textContent = "Update Layanan";
      layananIdInput.disabled = true; // ID tidak boleh diubah saat edit
    }
  } catch (error) {
    console.error("Error mengambil data untuk diedit:", error);
  }
}

// FUNGSI BARU: Menghapus layanan
async function deleteLayanan(id) {
  if (confirm(`Apakah Anda yakin ingin menghapus layanan dengan ID "${id}"?`)) {
    try {
      await deleteDoc(doc(db, "layanan", id));
      alert("Layanan berhasil dihapus.");
      loadLayanan();
    } catch (error) {
      console.error("Error menghapus layanan:", error);
      alert("Gagal menghapus layanan.");
    }
  }
}

// Fungsi untuk mereset form kembali ke mode "Tambah"
function resetForm() {
  addLayananForm.reset();
  formTitle.textContent = "Tambah Layanan Baru";
  submitButton.textContent = "Tambah Layanan";
  layananIdInput.disabled = false;
}
