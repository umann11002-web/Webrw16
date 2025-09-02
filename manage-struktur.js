import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
// [BARU] Import modul untuk Firebase Storage
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

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
const storage = getStorage(app); // [BARU] Inisialisasi Storage

document.addEventListener("DOMContentLoaded", () => {
  const rwDocRef = doc(db, "struktur_organisasi", "rw");
  let pengurusData = [];

  const tableBody = document.getElementById("pengurus-table-body");
  const modal = document.getElementById("edit-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const editForm = document.getElementById("edit-form");
  const statusMessage = document.getElementById("status-message");

  // Elemen untuk progress upload
  const progressContainer = document.getElementById(
    "upload-progress-container"
  );
  const progressBar = document.getElementById("upload-progress");
  const uploadStatus = document.getElementById("upload-status");
  const saveButton = document.getElementById("save-button");

  function showStatusMessage(message, isError = false) {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? "#dc3545" : "var(--primary-green)";
    setTimeout(() => {
      statusMessage.textContent = "";
    }, 4000);
  }

  async function loadPengurus() {
    if (!tableBody) return;
    try {
      const docSnap = await getDoc(rwDocRef);
      if (docSnap.exists() && docSnap.data().pengurus) {
        pengurusData = docSnap.data().pengurus;
        renderTable();
      } else {
        tableBody.innerHTML = `<tr><td colspan="4">Data tidak ditemukan.</td></tr>`;
      }
    } catch (error) {
      console.error("Error loading data: ", error);
      tableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Gagal memuat data.</td></tr>`;
    }
  }

  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    pengurusData.forEach((p, index) => {
      const row = `
                <tr>
                    <td><img src="${
                      p.fotoUrl ||
                      "https://placehold.co/50x50/ccc/333?text=Foto"
                    }" alt="${
        p.nama
      }" style="width:50px; height:50px; border-radius:50%; object-fit:cover;"></td>
                    <td>${p.nama}</td>
                    <td>${p.jabatan}</td>
                    <td><button class="action-btn btn-approve edit-btn" data-index="${index}">Edit</button></td>
                </tr>
            `;
      tableBody.innerHTML += row;
    });
  }

  function openEditModal(index) {
    if (!modal) return;
    const p = pengurusData[index];
    document.getElementById("edit-index").value = index;
    document.getElementById("edit-nama").value = p.nama;
    document.getElementById("edit-jabatan").value = p.jabatan;
    document.getElementById("current-fotoUrl").value = p.fotoUrl || "";
    document.getElementById("edit-bio").value = p.bio || "";
    document.getElementById("edit-fotoFile").value = ""; // Reset input file
    progressContainer.style.display = "none"; // Sembunyikan progress bar
    modal.style.display = "flex";
  }

  function closeModal() {
    if (modal) modal.style.display = "none";
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      saveButton.disabled = true;
      saveButton.textContent = "Menyimpan...";

      const index = document.getElementById("edit-index").value;
      const fileInput = document.getElementById("edit-fotoFile");
      const file = fileInput.files[0];
      let newFotoUrl = document.getElementById("current-fotoUrl").value;

      if (file) {
        progressContainer.style.display = "block";
        const storageRef = ref(storage, `pengurus/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              progressBar.value = progress;
              uploadStatus.textContent = `Mengunggah: ${Math.round(progress)}%`;
            },
            (error) => {
              console.error("Upload failed: ", error);
              reject(error);
            },
            async () => {
              newFotoUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      pengurusData[index].nama = document.getElementById("edit-nama").value;
      pengurusData[index].jabatan =
        document.getElementById("edit-jabatan").value;
      pengurusData[index].bio = document.getElementById("edit-bio").value;
      pengurusData[index].fotoUrl = newFotoUrl;

      try {
        await updateDoc(rwDocRef, { pengurus: pengurusData });
        showStatusMessage("Data berhasil diperbarui!");
        closeModal();
        renderTable();
      } catch (error) {
        console.error("Error updating document: ", error);
        showStatusMessage("Gagal memperbarui data.", true);
      } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Simpan Perubahan";
      }
    });
  }

  if (tableBody) {
    tableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-btn")) {
        const index = e.target.dataset.index;
        openEditModal(index);
      }
    });
  }
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  loadPengurus();
});
