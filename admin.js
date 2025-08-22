// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Konfigurasi Firebase-mu
const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.appspot.com",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ... (kode elemen dan satpam digital tetap sama) ...
const loadingIndicator = document.getElementById("loading-indicator");
const adminContainer = document.getElementById("admin-container");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadingIndicator.style.display = "none";
    adminContainer.style.display = "block";
    tampilkanPengajuan();
  } else {
    window.location.href = "login.html";
  }
});

// ... (kode logout tetap sama) ...
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    signOut(auth);
  });
}

// === FUNGSI UNTUK MENAMPILKAN PENGAJUAN (DIPERBARUI) ===

const tableBody = document.getElementById("pengajuan-table-body");

async function tampilkanPengajuan() {
  try {
    const q = query(
      collection(db, "pengajuanSurat"),
      orderBy("tanggalPengajuan", "desc")
    );
    const querySnapshot = await getDocs(q);
    tableBody.innerHTML = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML =
        '<tr><td colspan="5">Belum ada pengajuan surat.</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id; // Ambil ID dokumen untuk update
      const tanggal = data.tanggalPengajuan
        .toDate()
        .toLocaleDateString("id-ID");

      const row = `
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;">${tanggal}</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${data.userEmail}</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${data.jenisSurat}</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${data.status}</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">
                        <button class="action-btn btn-approve" data-id="${docId}">Setujui</button>
                        <button class="action-btn btn-reject" data-id="${docId}">Tolak</button>
                    </td>
                </tr>
            `;
      tableBody.innerHTML += row;
    });

    // Setelah tabel dibuat, tambahkan event listener ke semua tombol
    addEventListenersToButtons();
  } catch (error) {
    console.error("Error mengambil data pengajuan: ", error);
    tableBody.innerHTML = '<tr><td colspan="5">Gagal memuat data.</td></tr>';
  }
}

// === FUNGSI BARU UNTUK MENAMBAHKAN EVENT LISTENER ===
function addEventListenersToButtons() {
  document.querySelectorAll(".btn-approve").forEach((button) => {
    button.addEventListener("click", (e) => {
      const docId = e.target.dataset.id;
      updateStatus(docId, "Disetujui");
    });
  });

  document.querySelectorAll(".btn-reject").forEach((button) => {
    button.addEventListener("click", (e) => {
      const docId = e.target.dataset.id;
      updateStatus(docId, "Ditolak");
    });
  });
}

// === FUNGSI BARU UNTUK UPDATE STATUS DI FIRESTORE ===
async function updateStatus(docId, newStatus) {
  try {
    const docRef = doc(db, "pengajuanSurat", docId);
    await updateDoc(docRef, {
      status: newStatus,
    });
    console.log(`Status dokumen ${docId} berhasil diubah menjadi ${newStatus}`);
    alert(`Status berhasil diubah menjadi "${newStatus}"`);
    tampilkanPengajuan(); // Muat ulang tabel untuk menampilkan data terbaru
  } catch (error) {
    console.error("Error mengupdate status: ", error);
    alert("Gagal mengubah status. Silakan coba lagi.");
  }
}
