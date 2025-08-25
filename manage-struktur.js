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
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ... (Konfigurasi Firebase) ...
const firebaseConfig = {
  /* ... salin dari file lain ... */
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const pengurusListDiv = document.getElementById("pengurus-list");
const addPengurusForm = document.getElementById("add-pengurus-form");
const rwDocRef = doc(db, "struktur_organisasi", "rw");

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
                    <button>Hapus</button>
                `;
        item.querySelector("button").onclick = () => deletePengurus(p);
        pengurusListDiv.appendChild(item);
      });
    } else {
      pengurusListDiv.innerHTML = "<p>Belum ada data pengurus.</p>";
    }
  } catch (error) {
    console.error("Error memuat pengurus: ", error);
  }
}

// Menambah pengurus baru
addPengurusForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("nama-pengurus").value;
  const jabatan = document.getElementById("jabatan-pengurus").value;
  const fotoUrl =
    document.getElementById("foto-url").value || "https://placehold.co/100x100";

  const newPengurus = { nama, jabatan, fotoUrl };

  try {
    await updateDoc(rwDocRef, {
      pengurus: arrayUnion(newPengurus),
    });
    addPengurusForm.reset();
    loadPengurus();
  } catch (error) {
    console.error("Error menambah pengurus: ", error);
  }
});

// Menghapus pengurus
async function deletePengurus(pengurusObject) {
  if (confirm(`Yakin ingin menghapus ${pengurusObject.nama}?`)) {
    try {
      await updateDoc(rwDocRef, {
        pengurus: arrayRemove(pengurusObject),
      });
      loadPengurus();
    } catch (error) {
      console.error("Error menghapus pengurus: ", error);
    }
  }
}
