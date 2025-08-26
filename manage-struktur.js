import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
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

const pengurusListDiv = document.getElementById("pengurus-list");
const addPengurusForm = document.getElementById("add-pengurus-form");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-btn");
const currentPhotoContainer = document.getElementById(
  "current-photo-container"
);
const currentPhotoImg = document.getElementById("current-photo");
const rwDocRef = doc(db, "struktur_organisasi", "rw");

let currentlyEditing = null;

// Satpam
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      loadPengurus();
    } else {
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Memuat dan menampilkan daftar pengurus
async function loadPengurus() {
  try {
    const docSnap = await getDoc(rwDocRef);
    pengurusListDiv.innerHTML = "";
    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurusArray = docSnap.data().pengurus;
      pengurusArray.forEach((p) => {
        const item = document.createElement("div");
        item.className = "pengurus-list-item";
        item.innerHTML = `
                    <span><strong>${p.nama}</strong> - ${p.jabatan}</span>
                    <div>
                        <button class="edit-btn" style="margin-right: 10px;">Edit</button>
                        <button class="delete-btn">Hapus</button>
                    </div>
                `;
        item.querySelector(".edit-btn").onclick = () => populateFormForEdit(p);
        item.querySelector(".delete-btn").onclick = () => deletePengurus(p);
        pengurusListDiv.appendChild(item);
      });
    }
  } catch (error) {
    console.error("Error memuat pengurus: ", error);
  }
}

// Mengisi form untuk diedit
function populateFormForEdit(pengurusObject) {
  document.getElementById("nama-pengurus").value = pengurusObject.nama;
  document.getElementById("jabatan-pengurus").value = pengurusObject.jabatan;

  currentPhotoImg.src = pengurusObject.fotoUrl;
  currentPhotoContainer.style.display = "block";

  formTitle.textContent = "Edit Pengurus";
  submitButton.textContent = "Update";
  currentlyEditing = pengurusObject;
}

// Menambah atau mengedit pengurus
addPengurusForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("nama-pengurus").value;
  const jabatan = document.getElementById("jabatan-pengurus").value;
  const file = document.getElementById("foto-file").files[0];
  let fotoUrl = currentlyEditing
    ? currentlyEditing.fotoUrl
    : "https://placehold.co/100x100";

  submitButton.disabled = true;
  submitButton.textContent = "Menyimpan...";

  try {
    // Jika ada file baru yang dipilih, unggah dulu
    if (file) {
      submitButton.textContent = "Mengunggah foto...";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "yd99selh"); // GANTI DENGAN NAMA PRESET-MU

      const cloudName = "do1ba7gkn"; // GANTI JIKA BEDA
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (uploadData.error) throw new Error(uploadData.error.message);
      fotoUrl = uploadData.secure_url;
    }

    const newPengurusData = { nama, jabatan, fotoUrl };

    const docSnap = await getDoc(rwDocRef);
    let currentPengurus = docSnap.exists() ? docSnap.data().pengurus : [];

    if (currentlyEditing) {
      const index = currentPengurus.findIndex(
        (p) =>
          p.nama === currentlyEditing.nama &&
          p.jabatan === currentlyEditing.jabatan
      );
      if (index > -1) {
        currentPengurus[index] = newPengurusData;
      }
    } else {
      currentPengurus.push(newPengurusData);
    }

    await updateDoc(rwDocRef, { pengurus: currentPengurus });

    resetForm();
    loadPengurus();
  } catch (error) {
    console.error("Error menyimpan pengurus: ", error);
    alert(`Gagal menyimpan data: ${error.message}`);
  } finally {
    submitButton.disabled = false;
    resetForm();
  }
});

// Menghapus pengurus
async function deletePengurus(pengurusObject) {
  if (confirm(`Yakin ingin menghapus ${pengurusObject.nama}?`)) {
    try {
      const docSnap = await getDoc(rwDocRef);
      const currentPengurus = docSnap.data().pengurus;
      const updatedPengurus = currentPengurus.filter(
        (p) =>
          p.nama !== pengurusObject.nama || p.jabatan !== pengurusObject.jabatan
      );
      await updateDoc(rwDocRef, { pengurus: updatedPengurus });
      loadPengurus();
    } catch (error) {
      console.error("Error menghapus pengurus: ", error);
      alert("Gagal menghapus data.");
    }
  }
}

// Fungsi untuk mereset form
function resetForm() {
  addPengurusForm.reset();
  formTitle.textContent = "Tambah Pengurus Baru";
  submitButton.textContent = "Tambah";
  currentPhotoContainer.style.display = "none";
  currentlyEditing = null;
}
