import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  // Elemen UI
  const tableBody = document.getElementById("berita-table-body");
  const addNewBtn = document.getElementById("add-news-btn");
  const modal = document.getElementById("berita-modal");
  const modalTitle = document.getElementById("modal-title");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const beritaForm = document.getElementById("berita-form");
  const saveBtn = document.getElementById("save-berita-btn");
  const statusMessage = document.getElementById("status-message");
  const progressContainer = document.getElementById(
    "upload-progress-container"
  );
  const progressBar = document.getElementById("upload-progress");
  const uploadStatus = document.getElementById("upload-status");

  // Fungsi upload ke Cloudinary
  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "yd99selh");
    const cloudName = "do1ba7gkn";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(uploadUrl, { method: "POST", body: formData });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
  };

  function showStatusMessage(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? "#dc3545" : "var(--primary-green)";
    setTimeout(() => {
      statusMessage.textContent = "";
    }, 4000);
  }

  // Muat dan tampilkan berita secara real-time
  const q = query(collection(db, "berita"), orderBy("tanggal", "desc"));
  onSnapshot(q, (snapshot) => {
    tableBody.innerHTML = "";
    if (snapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="4">Belum ada berita. Klik tombol '+' untuk menambah.</td></tr>`;
      return;
    }
    snapshot.forEach((doc) => {
      const berita = doc.data();
      const tanggal = berita.tanggal
        ? berita.tanggal.toDate().toLocaleDateString("id-ID")
        : "N/A";
      const row = `
                <tr>
                    <td><img src="${
                      berita.gambarUrl ||
                      "https://placehold.co/100x60/eee/ccc?text=Gambar"
                    }" alt="${
        berita.judul
      }" class="table-photo" style="height:60px; width:100px; border-radius:4px;"></td>
                    <td>${berita.judul}</td>
                    <td>${tanggal}</td>
                    <td class="action-cell">
                        <button class="action-btn btn-approve edit-btn" data-id="${
                          doc.id
                        }">Edit</button>
                        <button class="action-btn btn-reject delete-btn" data-id="${
                          doc.id
                        }">Hapus</button>
                    </td>
                </tr>
            `;
      tableBody.innerHTML += row;
    });
  });

  function openAddModal() {
    beritaForm.reset();
    modalTitle.textContent = "Tambah Berita Baru";
    document.getElementById("berita-id").value = "";
    saveBtn.textContent = "Publikasikan";
    progressContainer.style.display = "none";
    modal.style.display = "flex";
  }

  async function openEditModal(id) {
    try {
      const docRef = doc(db, "berita", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const berita = docSnap.data();
        beritaForm.reset();
        modalTitle.textContent = "Edit Berita";
        document.getElementById("berita-id").value = id;
        document.getElementById("current-gambarUrl").value = berita.gambarUrl;
        document.getElementById("berita-judul").value = berita.judul;
        document.getElementById("berita-isi").value = berita.isi;
        saveBtn.textContent = "Simpan Perubahan";
        progressContainer.style.display = "none";
        modal.style.display = "flex";
      }
    } catch (error) {
      console.error("Error fetching document for edit:", error);
    }
  }

  function closeModal() {
    modal.style.display = "none";
  }

  beritaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = "Menyimpan...";

    const beritaId = document.getElementById("berita-id").value;
    const file = document.getElementById("berita-gambar").files[0];
    let gambarUrl = document.getElementById("current-gambarUrl").value;

    try {
      if (file) {
        progressContainer.style.display = "block";
        uploadStatus.textContent = "Mengunggah gambar...";
        progressBar.value = 50;
        gambarUrl = await uploadFileToCloudinary(file);
        progressBar.value = 100;
        uploadStatus.textContent = "Selesai!";
      }

      const data = {
        judul: document.getElementById("berita-judul").value,
        isi: document.getElementById("berita-isi").value,
        gambarUrl: gambarUrl,
      };

      if (beritaId) {
        // Mode Edit
        await updateDoc(doc(db, "berita", beritaId), data);
        showStatusMessage("Berita berhasil diperbarui!");
      } else {
        // Mode Tambah
        data.tanggal = serverTimestamp();
        data.dilihat = 0;
        await addDoc(collection(db, "berita"), data);
        showStatusMessage("Berita berhasil dipublikasikan!");
      }
      closeModal();
    } catch (error) {
      console.error("Error saving berita:", error);
      showStatusMessage(`Gagal: ${error.message}`, true);
    } finally {
      saveBtn.disabled = false;
    }
  });

  tableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
      openEditModal(e.target.dataset.id);
    }
    if (e.target.classList.contains("delete-btn")) {
      if (!confirm("Yakin ingin menghapus berita ini?")) return;
      try {
        await deleteDoc(doc(db, "berita", e.target.dataset.id));
        showStatusMessage("Berita berhasil dihapus!");
      } catch (error) {
        console.error("Error deleting berita:", error);
        showStatusMessage("Gagal menghapus berita.", true);
      }
    }
  });

  addNewBtn.addEventListener("click", openAddModal);
  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
});
