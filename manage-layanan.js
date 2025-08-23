import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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

// Ambil semua elemen penting dari HTML
const layananGrid = document.getElementById("layanan-grid");
const modalOverlay = document.getElementById("layanan-modal");
const modalTitle = document.getElementById("modal-title");
const closeModalBtn = document.getElementById("close-modal-btn");
const addLayananBtn = document.getElementById("add-layanan-btn");
const layananForm = document.getElementById("layanan-form");
const hiddenIdInput = document.getElementById("layanan-id-hidden");
const layananIdInput = document.getElementById("layanan-id");
const logoutBtn = document.getElementById("logout-btn-alt");

// --- FUNGSI MODAL ---
function openModal() {
  modalOverlay.style.display = "flex";
}
function closeModal() {
  modalOverlay.style.display = "none";
  resetForm();
}

// --- SATPAM & PEMUAT DATA AWAL ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
      loadLayanan(); // Jika admin, muat data layanan
    } else {
      alert("Anda tidak punya hak akses.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// --- FUNGSI UTAMA ---

// 1. Memuat dan menampilkan semua layanan sebagai kartu
async function loadLayanan() {
  try {
    const querySnapshot = await getDocs(collection(db, "layanan"));
    layananGrid.innerHTML = ""; // Kosongkan grid
    querySnapshot.forEach((doc) => {
      const layanan = doc.data();
      const card = document.createElement("div");
      card.className = "kartu-layanan-admin";
      card.innerHTML = `
                <h3>${layanan.namaLayanan}</h3>
                <p>${layanan.deskripsi}</p>
                <div class="kartu-actions">
                    <button class="edit-btn" data-id="${doc.id}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
      layananGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Error memuat layanan: ", error);
  }
}

// 2. Mengisi form untuk diedit saat tombol pensil diklik
async function populateFormForEdit(id) {
  try {
    const docRef = doc(db, "layanan", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      hiddenIdInput.value = id; // Simpan ID lama di input tersembunyi
      layananIdInput.value = id;
      document.getElementById("layanan-nama").value = data.namaLayanan;
      document.getElementById("layanan-deskripsi").value = data.deskripsi;
      document.getElementById("layanan-persyaratan").value =
        data.persyaratan.join(", ");

      modalTitle.textContent = "Edit Layanan";
      layananIdInput.disabled = true; // ID tidak boleh diubah saat edit
      openModal();
    }
  } catch (error) {
    console.error("Error mengambil data untuk diedit:", error);
  }
}

// 3. Menghapus layanan saat tombol tong sampah diklik
async function deleteLayanan(id) {
  if (confirm(`Apakah Anda yakin ingin menghapus layanan dengan ID "${id}"?`)) {
    try {
      await deleteDoc(doc(db, "layanan", id));
      alert("Layanan berhasil dihapus.");
      loadLayanan(); // Muat ulang daftar
    } catch (error) {
      console.error("Error menghapus layanan:", error);
      alert("Gagal menghapus layanan.");
    }
  }
}

// 4. Mereset form kembali ke mode "Tambah"
function resetForm() {
  layananForm.reset();
  modalTitle.textContent = "Tambah Layanan Baru";
  hiddenIdInput.value = "";
  layananIdInput.disabled = false;
}

// --- EVENT LISTENERS ---

// Tombol + (FAB) untuk membuka modal tambah
addLayananBtn.addEventListener("click", () => {
  resetForm();
  openModal();
});

// Tombol close di modal
closeModalBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Menangani submit form (bisa untuk tambah atau edit)
layananForm.addEventListener("submit", async (e) => {
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
    alert("Layanan berhasil disimpan!");
    closeModal();
    loadLayanan();
  } catch (error) {
    console.error("Error menyimpan layanan: ", error);
    alert("Gagal menyimpan layanan.");
  }
});

// Menangani klik pada tombol edit/hapus di kartu
layananGrid.addEventListener("click", (e) => {
  if (e.target.closest(".edit-btn")) {
    const id = e.target.closest(".edit-btn").dataset.id;
    populateFormForEdit(id);
  }
  if (e.target.closest(".delete-btn")) {
    const id = e.target.closest(".delete-btn").dataset.id;
    deleteLayanan(id);
  }
});

// Tombol logout di nav bar
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});
