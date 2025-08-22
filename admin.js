// ... (semua import dan inisialisasi Firebase tetap sama) ...
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

// ... (kode elemen, satpam, dan logout tetap sama) ...
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
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    signOut(auth);
  });
}

// === FUNGSI TAMPILKAN PENGAJUAN (DIPERBARUI TOTAL) ===
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
      // Perbarui colspan menjadi 7 karena ada kolom baru
      tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;">Belum ada pengajuan surat.</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id;
      const tanggal = data.tanggalPengajuan
        .toDate()
        .toLocaleDateString("id-ID");

      // ... (logika untuk tombol tetap sama) ...
      let aksiAwalHTML = "";
      if (data.status === "Menunggu Persetujuan") {
        aksiAwalHTML = `
                    <button class="action-btn btn-approve" data-id="${docId}">Setujui</button>
                    <button class="action-btn btn-reject" data-id="${docId}">Tolak</button>
                `;
      }
      let aksiLanjutanHTML = "";
      if (data.fileUrl) {
        aksiLanjutanHTML += `<a href="${data.fileUrl}" target="_blank">Lihat Syarat</a><br>`;
      } else {
        aksiLanjutanHTML += `<span>(Tanpa File)</span><br>`;
      }
      if (data.status === "Disetujui") {
        aksiLanjutanHTML += `<button class="action-btn btn-approve" data-id="${docId}" style="margin-top:5px;">Tandai Selesai</button>`;
      }

      // Buat baris baru untuk tabel
      const row = `
                <tr>
                    <td>${tanggal}</td>
                    <td>${data.userEmail}</td>
                    <td>${data.jenisSurat}</td>
                    
                    <!-- DATA BARU YANG DITAMPILKAN -->
                    <td>${data.keperluan}</td>
                    
                    <td>${data.status}</td>
                    <td>${aksiAwalHTML}</td>
                    <td>${aksiLanjutanHTML}</td>
                </tr>
            `;
      tableBody.innerHTML += row;
    });

    addEventListenersToButtons();
  } catch (error) {
    console.error("Error mengambil data pengajuan: ", error);
    tableBody.innerHTML = '<tr><td colspan="7">Gagal memuat data.</td></tr>';
  }
}

// === FUNGSI EVENT LISTENER (DIPERBARUI) ===
function addEventListenersToButtons() {
  // Tombol Setujui
  document.querySelectorAll(".btn-approve").forEach((button) => {
    button.addEventListener("click", (e) => {
      const docId = e.target.dataset.id;
      // Cek teks tombol untuk menentukan aksi
      if (e.target.textContent === "Setujui") {
        updateStatus(docId, "Disetujui");
      } else if (e.target.textContent === "Tandai Selesai") {
        tandaiSelesai(docId);
      }
    });
  });

  // Tombol Tolak
  document.querySelectorAll(".btn-reject").forEach((button) => {
    button.addEventListener("click", (e) => {
      const docId = e.target.dataset.id;
      updateStatus(docId, "Ditolak");
    });
  });
}

// === FUNGSI UPDATE STATUS (TETAP SAMA) ===
async function updateStatus(docId, newStatus) {
  try {
    const docRef = doc(db, "pengajuanSurat", docId);
    await updateDoc(docRef, { status: newStatus });
    alert(`Status berhasil diubah menjadi "${newStatus}"`);
    tampilkanPengajuan();
  } catch (error) {
    alert("Gagal mengubah status.");
  }
}

// === FUNGSI BARU UNTUK TANDAI SELESAI ===
async function tandaiSelesai(docId) {
  // WORKAROUND: Karena belum ada upload, kita hanya konfirmasi
  const isConfirmed = confirm(
    "Apakah Anda yakin ingin menandai pengajuan ini sebagai 'Selesai'? Aksi ini tidak bisa dibatalkan."
  );

  if (isConfirmed) {
    try {
      const docRef = doc(db, "pengajuanSurat", docId);
      await updateDoc(docRef, {
        status: "Selesai",
        // Nanti, URL file surat jadi akan disimpan di sini
        fileSuratJadiUrl: "#", // Kita beri placeholder '#'
      });
      alert('Pengajuan berhasil ditandai sebagai "Selesai"');
      tampilkanPengajuan();
    } catch (error) {
      alert("Gagal menandai selesai.");
    }
  }
}
