import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Tidak perlu import storage lagi
// import { getStorage, ... } from ...

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
// const storage = getStorage(app); // Tidak perlu inisialisasi storage

document.addEventListener("DOMContentLoaded", () => {
  const rwDocRef = doc(db, "struktur_organisasi", "rw");
  const settingsDocRef = doc(db, "struktur_organisasi", "settings");
  let pengurusData = [];

  // === BAGAN STRUKTUR ORGANISASI ===
  const currentStrukturImg = document.getElementById("current-struktur-img");
  const noStrukturImgText = document.getElementById("no-struktur-img-text");
  const strukturImgFile = document.getElementById("struktur-img-file");
  const uploadStrukturBtn = document.getElementById("upload-struktur-btn");
  const strukturUploadProgress = document.getElementById("struktur-upload-progress");
  const strukturProgressBar = document.getElementById("struktur-progress-bar");
  const strukturUploadStatus = document.getElementById("struktur-upload-status");
  const strukturImgStatus = document.getElementById("struktur-img-status");

  // Load current bagan image
  async function loadBaganImage() {
    try {
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists() && docSnap.data().baganUrl) {
        currentStrukturImg.src = docSnap.data().baganUrl;
        currentStrukturImg.style.display = "block";
        noStrukturImgText.style.display = "none";
      } else {
        currentStrukturImg.style.display = "none";
        noStrukturImgText.style.display = "block";
      }
    } catch (error) {
      console.error("Error loading bagan:", error);
    }
  }

  // Upload bagan image
  uploadStrukturBtn.addEventListener("click", async () => {
    const file = strukturImgFile.files[0];
    if (!file) {
      strukturImgStatus.textContent = "Pilih file gambar terlebih dahulu!";
      strukturImgStatus.style.color = "#dc3545";
      return;
    }

    uploadStrukturBtn.disabled = true;
    uploadStrukturBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    strukturUploadProgress.style.display = "block";
    strukturProgressBar.value = 30;
    strukturUploadStatus.textContent = "Mengunggah gambar...";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "yd99selh");
      const cloudName = "do1ba7gkn";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      strukturProgressBar.value = 50;
      const response = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      strukturProgressBar.value = 80;
      strukturUploadStatus.textContent = "Menyimpan ke database...";

      // Save URL to Firestore
      await setDoc(settingsDocRef, { baganUrl: data.secure_url }, { merge: true });

      strukturProgressBar.value = 100;
      strukturUploadStatus.textContent = "Selesai!";
      strukturImgStatus.textContent = "Gambar bagan berhasil diupload!";
      strukturImgStatus.style.color = "var(--primary-green, #28a745)";

      // Update preview
      currentStrukturImg.src = data.secure_url;
      currentStrukturImg.style.display = "block";
      noStrukturImgText.style.display = "none";
      strukturImgFile.value = "";

      setTimeout(() => {
        strukturImgStatus.textContent = "";
        strukturUploadProgress.style.display = "none";
      }, 3000);
    } catch (error) {
      console.error("Error uploading bagan:", error);
      strukturImgStatus.textContent = `Gagal: ${error.message}`;
      strukturImgStatus.style.color = "#dc3545";
    } finally {
      uploadStrukturBtn.disabled = false;
      uploadStrukturBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Bagan';
    }
  });

  loadBaganImage();

  const tableBody = document.getElementById("pengurus-table-body");
  const modal = document.getElementById("edit-modal");
  const modalTitle = document.getElementById("modal-title");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const editForm = document.getElementById("edit-form");
  const statusMessage = document.getElementById("status-message");
  const addNewBtn = document.getElementById("add-new-btn");
  const saveButton = document.getElementById("save-button");
  const progressContainer = document.getElementById(
    "upload-progress-container"
  );
  const uploadStatus = document.getElementById("upload-status");
  const progressBar = document.getElementById("upload-progress"); // Kita tetap pakai untuk visual

  function showStatusMessage(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? "#dc3545" : "var(--primary-green)";
    setTimeout(() => {
      statusMessage.textContent = "";
    }, 4000);
  }

  async function loadAndRender() {
    try {
      const docSnap = await getDoc(rwDocRef);
      if (docSnap.exists() && docSnap.data().pengurus) {
        pengurusData = docSnap.data().pengurus;
        tableBody.innerHTML = "";
        pengurusData.forEach((p, index) => {
          const row = `
                        <tr>
                            <td><img src="${
                              p.fotoUrl ||
                              "https://placehold.co/50x50/ccc/333?text=Foto"
                            }" alt="${p.nama}" class="table-photo"></td>
                            <td>${p.nama}</td>
                            <td>${p.jabatan}</td>
                            <td class="action-cell">
                                <button class="action-btn btn-approve edit-btn" data-index="${index}">Edit</button>
                                <button class="action-btn btn-reject delete-btn" data-index="${index}">Hapus</button>
                            </td>
                        </tr>
                    `;
          tableBody.innerHTML += row;
        });
      } else {
        tableBody.innerHTML = `<tr><td colspan="4">Belum ada data.</td></tr>`;
      }
    } catch (error) {
      console.error("Error loading data: ", error);
      tableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Gagal memuat data.</td></tr>`;
    }
  }

  function openEditModal(index) {
    const p = pengurusData[index];
    editForm.reset();
    modalTitle.textContent = "Edit Detail Pengurus";
    document.getElementById("edit-index").value = index;
    document.getElementById("current-fotoUrl").value = p.fotoUrl || "";
    document.getElementById("edit-nama").value = p.nama;
    document.getElementById("edit-jabatan").value = p.jabatan;
    document.getElementById("edit-noHp").value = p.noHp || "";
    document.getElementById("edit-email").value = p.email || "";
    document.getElementById("edit-alamat").value = p.alamat || "";
    document.getElementById("edit-sambutan").value = p.sambutan || "";
    progressContainer.style.display = "none";
    modal.style.display = "flex";
  }

  function openAddModal() {
    editForm.reset();
    modalTitle.textContent = "Tambah Pengurus Baru";
    document.getElementById("edit-index").value = "-1";
    document.getElementById("current-fotoUrl").value = "";
    progressContainer.style.display = "none";
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";

    const index = parseInt(document.getElementById("edit-index").value, 10);
    const file = document.getElementById("edit-fotoFile").files[0];
    let newFotoUrl = document.getElementById("current-fotoUrl").value;

    try {
      // [DIUBAH] Logika upload sekarang menggunakan Cloudinary
      if (file) {
        progressContainer.style.display = "block";
        uploadStatus.textContent = "Mengunggah foto...";
        progressBar.value = 50; // Visual indikator saja

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "yd99selh"); // GANTI DENGAN NAMA PRESET-MU
        const cloudName = "do1ba7gkn"; // GANTI JIKA BEDA
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }
        newFotoUrl = data.secure_url;
        progressBar.value = 100;
        uploadStatus.textContent = "Unggah Selesai!";
      }

      const updatedPengurus = {
        nama: document.getElementById("edit-nama").value,
        jabatan: document.getElementById("edit-jabatan").value,
        fotoUrl: newFotoUrl,
        noHp: document.getElementById("edit-noHp").value,
        email: document.getElementById("edit-email").value,
        alamat: document.getElementById("edit-alamat").value,
        sambutan: document.getElementById("edit-sambutan").value,
      };

      if (index === -1) {
        pengurusData.push(updatedPengurus);
      } else {
        pengurusData[index] = updatedPengurus;
      }

      await updateDoc(rwDocRef, { pengurus: pengurusData });
      showStatusMessage("Data berhasil disimpan!");
      closeModal();
      loadAndRender();
    } catch (error) {
      console.error("Error saving data: ", error);
      showStatusMessage(`Gagal: ${error.message}`, true);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Simpan Perubahan";
    }
  });

  tableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
      openEditModal(e.target.dataset.index);
    }

    if (e.target.classList.contains("delete-btn")) {
      if (!confirm("Apakah Anda yakin ingin menghapus pengurus ini?")) {
        return;
      }
      const index = parseInt(e.target.dataset.index, 10);
      pengurusData.splice(index, 1);

      try {
        await updateDoc(rwDocRef, { pengurus: pengurusData });
        showStatusMessage("Pengurus berhasil dihapus!");
        loadAndRender();
      } catch (error) {
        console.error("Error deleting data: ", error);
        showStatusMessage("Gagal menghapus data.", true);
        loadAndRender();
      }
    }
  });

  addNewBtn.addEventListener("click", openAddModal);
  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  loadAndRender();
});
