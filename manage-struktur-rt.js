import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  let currentRtId = null;
  let currentRtDocRef = null;
  let pengurusData = [];

  const rtSelect = document.getElementById("rt-select");
  const managementContent = document.getElementById("management-content");
  const tableBody = document.getElementById("rt-pengurus-table-body");
  const addNewBtn = document.getElementById("add-new-btn");
  const modal = document.getElementById("edit-modal");
  const modalTitle = document.getElementById("modal-title");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const editForm = document.getElementById("edit-form");
  const statusMessage = document.getElementById("status-message");
  const saveButton = document.getElementById("save-button");
  const progressContainer = document.getElementById(
    "upload-progress-container"
  );
  const progressBar = document.getElementById("upload-progress");
  const uploadStatus = document.getElementById("upload-status");

  // [BARU] Ambil elemen untuk statistik
  const wargaTetapInput = document.getElementById("warga-tetap-input");
  const wargaSementaraInput = document.getElementById("warga-sementara-input");
  const saveStatsBtn = document.getElementById("save-stats-btn");

  // Fungsi upload ke Cloudinary
  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "yd99selh"); // Pastikan preset ini ada
    const cloudName = "do1ba7gkn"; // Pastikan cloud name ini benar
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(uploadUrl, { method: "POST", body: formData });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
  };

  function showStatusMessage(message, isError = false) {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? "#dc3545" : "var(--primary-green)";
    setTimeout(() => {
      statusMessage.textContent = "";
    }, 4000);
  }

  async function loadAndRender() {
    if (!currentRtDocRef) return;
    tableBody.innerHTML = `<tr><td colspan="4">Memuat data...</td></tr>`;
    try {
      const docSnap = await getDoc(currentRtDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        pengurusData = data.pengurus || [];

        // [BARU] Isi nilai input statistik
        wargaTetapInput.value = data.wargaTetap || 0;
        wargaSementaraInput.value = data.wargaSementara || 0;

        tableBody.innerHTML = "";
        pengurusData.forEach((p, index) => {
          const row = `
    <tr>
        <td data-label="Foto"><img src="${
          p.fotoUrl || "https://placehold.co/50x50/ccc/333?text=Foto"
        }" alt="${p.nama}" class="table-photo"></td>
        <td data-label="Nama">${p.nama}</td>
        <td data-label="Jabatan">${p.jabatan}</td>
        <td data-label="Aksi" class="action-cell">
            <button class="action-btn btn-approve edit-btn" data-index="${index}">Edit</button>
            <button class="action-btn btn-reject delete-btn" data-index="${index}">Hapus</button>
        </td>
    </tr>
`;
          tableBody.innerHTML += row;
        });
      } else {
        pengurusData = [];
        tableBody.innerHTML = `<tr><td colspan="4">Belum ada data. Silakan tambah pengurus.</td></tr>`;
      }
    } catch (error) {
      console.error("Error loading RT data: ", error);
      tableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Gagal memuat data.</td></tr>`;
    }
  }

  rtSelect.addEventListener("change", () => {
    currentRtId = rtSelect.value;
    if (currentRtId) {
      currentRtDocRef = doc(db, "struktur_organisasi", currentRtId);
      managementContent.style.display = "block";
      loadAndRender();
    } else {
      managementContent.style.display = "none";
    }
  });

  function openEditModal(index) {
    const p = pengurusData[index];
    editForm.reset();
    modalTitle.textContent = `Edit Pengurus ${
      rtSelect.options[rtSelect.selectedIndex].text
    }`;
    document.getElementById("edit-index").value = index;
    document.getElementById("current-fotoUrl").value = p.fotoUrl || "";
    document.getElementById("edit-nama").value = p.nama;
    document.getElementById("edit-jabatan").value = p.jabatan;
    progressContainer.style.display = "none";
    modal.style.display = "flex";
  }

  function openAddModal() {
    editForm.reset();
    modalTitle.textContent = `Tambah Pengurus Baru ${
      rtSelect.options[rtSelect.selectedIndex].text
    }`;
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
      if (file) {
        progressContainer.style.display = "block";
        uploadStatus.textContent = "Mengunggah...";
        progressBar.value = 50;
        newFotoUrl = await uploadFileToCloudinary(file);
        progressBar.value = 100;
        uploadStatus.textContent = "Selesai!";
      }

      const updatedPengurus = {
        nama: document.getElementById("edit-nama").value,
        jabatan: document.getElementById("edit-jabatan").value,
        fotoUrl: newFotoUrl,
      };

      if (index === -1) {
        pengurusData.push(updatedPengurus);
      } else {
        pengurusData[index] = updatedPengurus;
      }

      await setDoc(
        currentRtDocRef,
        { pengurus: pengurusData },
        { merge: true }
      );
      showStatusMessage("Data berhasil disimpan!");
      closeModal();
      loadAndRender();
    } catch (error) {
      console.error("Error saving data: ", error);
      showStatusMessage(`Gagal: ${error.message}`, true);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Simpan";
    }
  });

  tableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
      openEditModal(e.target.dataset.index);
    }
    if (e.target.classList.contains("delete-btn")) {
      if (!confirm("Yakin ingin menghapus pengurus ini?")) return;
      const index = parseInt(e.target.dataset.index, 10);
      pengurusData.splice(index, 1);
      try {
        await updateDoc(currentRtDocRef, { pengurus: pengurusData });
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

  // [BARU] Event listener untuk tombol simpan statistik
  saveStatsBtn.addEventListener("click", async () => {
    if (!currentRtDocRef) return;

    saveStatsBtn.disabled = true;
    saveStatsBtn.textContent = "Menyimpan...";

    try {
      const wargaTetap = parseInt(wargaTetapInput.value, 10) || 0;
      const wargaSementara = parseInt(wargaSementaraInput.value, 10) || 0;

      // Gunakan updateDoc agar tidak menimpa data pengurus
      await updateDoc(currentRtDocRef, {
        wargaTetap: wargaTetap,
        wargaSementara: wargaSementara,
      });

      showStatusMessage("Data statistik berhasil disimpan!");
    } catch (error) {
      console.error("Error saving stats: ", error);
      showStatusMessage("Gagal menyimpan data statistik.", true);
    } finally {
      saveStatsBtn.disabled = false;
      saveStatsBtn.textContent = "Simpan Data Statistik";
    }
  });
});
