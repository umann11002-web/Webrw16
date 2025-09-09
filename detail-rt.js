import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// WARNING: It's recommended to use environment variables for Firebase config keys
// to avoid exposing them publicly. For this example, we'll use the provided config.
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

// Fungsi untuk mendapatkan ID RT dari URL
function getRtIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // Contoh: 'rt01'
}

async function tampilkanDetailRT() {
  const rtId = getRtIdFromUrl();
  if (!rtId) {
    document.body.innerHTML = "<h1>ID RT tidak ditemukan di URL.</h1>";
    return;
  }

  const rtNumber = rtId.replace("rt", "RT ").toUpperCase();
  document.title = `Struktur ${rtNumber} - RW 16`;
  document.getElementById("rt-sidebar-title").textContent = rtNumber;

  try {
    const docRef = doc(db, "struktur_organisasi", rtId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Mengisi data statistik
      const wargaTetap = data.wargaTetap || 0;
      const wargaSementara = data.wargaSementara || 0;
      document.getElementById("stat-tetap").textContent = wargaTetap;
      document.getElementById("stat-sementara").textContent = wargaSementara;
      document.getElementById("stat-jumlah").textContent =
        wargaTetap + wargaSementara;

      // Mengisi data pengurus
      const pengurus = data.pengurus || [];
      const pengurusGridContainer = document.getElementById(
        "pengurus-grid-container"
      );

      if (pengurus.length > 0) {
        pengurusGridContainer.innerHTML = ""; // Kosongkan placeholder
        let cardsHTML = "";
        pengurus.forEach((p) => {
          cardsHTML += `
            <div class="org-card">
              <img src="${
                p.fotoUrl || "https://placehold.co/100x100/eee/ccc?text=Foto"
              }" alt="Foto ${p.jabatan}">
              <h3>${p.nama}</h3>
              <p>${p.jabatan}</p>
            </div>
          `;
        });
        pengurusGridContainer.innerHTML = cardsHTML;
      } else {
        pengurusGridContainer.innerHTML =
          "<p>Data pengurus untuk RT ini belum tersedia.</p>";
      }
    } else {
      console.log(`Dokumen untuk ${rtId} tidak ditemukan.`);
      document.getElementById("pengurus-grid-container").innerHTML =
        "<p>Data untuk RT ini tidak ditemukan.</p>";
    }
  } catch (error) {
    console.error("Gagal memuat data RT dari Firebase: ", error);
    pengurusGridContainer.innerHTML =
      "<p>Terjadi kesalahan saat memuat data.</p>";
  }
}

// Menjalankan fungsi setelah halaman selesai dimuat
document.addEventListener("DOMContentLoaded", tampilkanDetailRT);
