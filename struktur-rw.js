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

const orgChartContainer = document.getElementById("org-chart-container");
const rwDocRef = doc(db, "struktur_organisasi", "rw");

async function tampilkanStrukturRW() {
  try {
    const docSnap = await getDoc(rwDocRef);
    orgChartContainer.innerHTML = ""; // Kosongkan kontainer

    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurusArray = docSnap.data().pengurus;

      if (pengurusArray.length === 0) {
        orgChartContainer.innerHTML = "<p>Belum ada data pengurus.</p>";
        return;
      }

      // Pisahkan pengurus berdasarkan jabatan
      const ketua = pengurusArray.filter((p) =>
        p.jabatan.toLowerCase().includes("ketua")
      );
      const inti = pengurusArray.filter((p) =>
        ["wakil", "sekretaris", "bendahara"].some((j) =>
          p.jabatan.toLowerCase().includes(j)
        )
      );
      const seksi = pengurusArray.filter(
        (p) => !ketua.includes(p) && !inti.includes(p)
      );

      // Buat Level 1: Ketua
      const level1 = document.createElement("div");
      level1.className = "org-level";
      ketua.forEach((p) => (level1.innerHTML += createCardHTML(p)));
      orgChartContainer.appendChild(level1);

      // Buat Level 2: Pengurus Inti
      const level2 = document.createElement("div");
      level2.className = "org-level";
      inti.forEach((p) => (level2.innerHTML += createCardHTML(p)));
      orgChartContainer.appendChild(level2);

      // Buat Level 3: Seksi-seksi
      if (seksi.length > 0) {
        const level3 = document.createElement("div");
        level3.className = "org-level";
        seksi.forEach((p) => (level3.innerHTML += createCardHTML(p)));
        orgChartContainer.appendChild(level3);
      }
    } else {
      orgChartContainer.innerHTML =
        "<p>Data struktur organisasi belum tersedia.</p>";
    }
  } catch (error) {
    console.error("Error memuat struktur RW: ", error);
    orgChartContainer.innerHTML =
      '<p style="color:red;">Gagal memuat data.</p>';
  }
}

// Fungsi pembantu untuk membuat HTML kartu
function createCardHTML(pengurus) {
  return `
        <div class="org-card">
            <img src="${pengurus.fotoUrl}" alt="Foto ${pengurus.jabatan}">
            <h3>${pengurus.nama}</h3>
            <p>${pengurus.jabatan}</p>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", tampilkanStrukturRW);
