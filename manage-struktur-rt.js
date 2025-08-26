import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
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

const rtSelect = document.getElementById("rt-select");
const managementContent = document.getElementById("management-content");
const pengurusListDiv = document.getElementById("pengurus-list");
const addPengurusForm = document.getElementById("add-pengurus-form");
let currentRtDocRef = null;

// Satpam
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Event listener saat admin memilih RT
rtSelect.addEventListener("change", () => {
  const selectedRtId = rtSelect.value;
  if (selectedRtId) {
    currentRtDocRef = doc(db, "struktur_organisasi", selectedRtId);
    document.getElementById("rt-title").textContent =
      rtSelect.options[rtSelect.selectedIndex].text;
    document.getElementById("rt-title-form").textContent =
      rtSelect.options[rtSelect.selectedIndex].text;
    managementContent.style.display = "block";
    loadPengurus();
  } else {
    managementContent.style.display = "none";
  }
});

// Memuat daftar pengurus untuk RT yang dipilih
async function loadPengurus() {
  if (!currentRtDocRef) return;
  try {
    const docSnap = await getDoc(currentRtDocRef);
    pengurusListDiv.innerHTML = "";
    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurusArray = docSnap.data().pengurus;
      pengurusArray.forEach((p) => {
        const item = document.createElement("div");
        item.className = "pengurus-list-item";
        item.innerHTML = `<span><strong>${p.nama}</strong> - ${p.jabatan}</span><button>Hapus</button>`;
        item.querySelector("button").onclick = () => deletePengurus(p);
        pengurusListDiv.appendChild(item);
      });
    } else {
      pengurusListDiv.innerHTML =
        "<p>Belum ada data pengurus untuk RT ini.</p>";
    }
  } catch (error) {
    console.error("Error memuat pengurus RT: ", error);
  }
}

// Menambah pengurus baru
addPengurusForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentRtDocRef) return;

  const nama = document.getElementById("nama-pengurus").value;
  const jabatan = document.getElementById("jabatan-pengurus").value;
  const fotoUrl =
    document.getElementById("foto-url").value || "https://placehold.co/100x100";
  const newPengurus = { nama, jabatan, fotoUrl };

  try {
    // Menggunakan setDoc dengan merge agar membuat dokumen jika belum ada
    await setDoc(
      currentRtDocRef,
      {
        pengurus: arrayUnion(newPengurus),
      },
      { merge: true }
    );
    addPengurusForm.reset();
    loadPengurus();
  } catch (error) {
    console.error("Error menambah pengurus RT: ", error);
  }
});

// Menghapus pengurus
async function deletePengurus(pengurusObject) {
  if (!currentRtDocRef) return;
  if (confirm(`Yakin ingin menghapus ${pengurusObject.nama}?`)) {
    try {
      await updateDoc(currentRtDocRef, {
        pengurus: arrayRemove(pengurusObject),
      });
      loadPengurus();
    } catch (error) {
      console.error("Error menghapus pengurus RT: ", error);
    }
  }
}
