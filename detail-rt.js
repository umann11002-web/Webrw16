import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
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
const db = getFirestore(app);

const pengurusGridContainer = document.getElementById(
  "pengurus-grid-container"
);
const titleHeading = document.getElementById("rt-title-heading");

// Fungsi untuk mendapatkan ID RT dari URL
function getRtIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // Contoh: 'rt01'
}

async function tampilkanStrukturRT() {
  const rtId = getRtIdFromUrl();
  if (!rtId) {
    pengurusGridContainer.innerHTML = "<p>ID RT tidak ditemukan.</p>";
    titleHeading.textContent = "Error";
    return;
  }

  // Mengubah 'rt01' menjadi 'RT 01' untuk judul
  const rtNumber = rtId.replace("rt", "RT ");
  titleHeading.textContent = `Struktur Kepengurusan ${rtNumber}`;

  const rtDocRef = doc(db, "struktur_organisasi", rtId);

  try {
    const docSnap = await getDoc(rtDocRef);
    pengurusGridContainer.innerHTML = ""; // Kosongkan kontainer

    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurusArray = docSnap.data().pengurus;

      if (pengurusArray.length === 0) {
        pengurusGridContainer.innerHTML = `<p>Belum ada data pengurus untuk ${rtNumber}.</p>`;
        return;
      }

      pengurusArray.forEach((pengurus) => {
        const cardHTML = `
                    <div class="pengurus-card">
                        <img src="${pengurus.fotoUrl}" alt="Foto ${pengurus.jabatan}">
                        <h3>${pengurus.nama}</h3>
                        <p>${pengurus.jabatan}</p>
                    </div>
                `;
        pengurusGridContainer.innerHTML += cardHTML;
      });
    } else {
      pengurusGridContainer.innerHTML = `<p>Data struktur organisasi untuk ${rtNumber} belum tersedia.</p>`;
    }
  } catch (error) {
    console.error(`Error memuat struktur ${rtId}: `, error);
    pengurusGridContainer.innerHTML =
      '<p style="color:red;">Gagal memuat data.</p>';
  }
}

document.addEventListener("DOMContentLoaded", tampilkanStrukturRT);
