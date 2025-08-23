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
const auth = getAuth(app);
const db = getFirestore(app);

const tableBody = document.getElementById("pengajuan-table-body");
const logoutButton = document.getElementById("logout-btn");

// Satpam digital (Disederhanakan untuk desain baru)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
      // Jika benar admin, langsung muat data
      tampilkanPengajuan();
    } else {
      alert("Akses ditolak. Anda bukan admin.");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Tombol Logout
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

// === FUNGSI TAMPILKAN PENGAJUAN ===
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
        '<tr><td colspan="7" style="text-align:center;">Belum ada pengajuan surat.</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id;
      const tanggal = data.tanggalPengajuan
        .toDate()
        .toLocaleDateString("id-ID");

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

      const row = `
              <tr>
                  <td>${tanggal}</td>
                  <td>${data.userEmail}</td>
                  <td>${data.jenisSurat}</td>
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

// ... (sisa kode addEventListenersToButtons, updateStatus, dan tandaiSelesai tetap sama) ...
function addEventListenersToButtons() {
  document.querySelectorAll(".btn-approve").forEach((button) => {
    button.addEventListener("click", (e) => {
      const docId = e.target.dataset.id;
      if (e.target.textContent === "Setujui") {
        updateStatus(docId, "Disetujui");
      } else if (e.target.textContent === "Tandai Selesai") {
        tandaiSelesai(docId);
      }
    });
  });
  document.querySelectorAll(".btn-reject").forEach((button) => {
    button.addEventListener("click", (e) => {
      const docId = e.target.dataset.id;
      updateStatus(docId, "Ditolak");
    });
  });
}
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
async function tandaiSelesai(docId) {
  const fileUrl = prompt(
    "PROSES SIMULASI:\n\nMasukkan link ke file surat yang sudah jadi (misal: link Google Drive).",
    ""
  );
  if (fileUrl === null) {
    alert("Aksi dibatalkan.");
    return;
  }
  try {
    const docRef = doc(db, "pengajuanSurat", docId);
    await updateDoc(docRef, {
      status: "Selesai",
      fileSuratJadiUrl: fileUrl || "#",
    });
    alert('Pengajuan berhasil ditandai sebagai "Selesai"');
    tampilkanPengajuan();
  } catch (error) {
    console.error("Error menandai selesai:", error);
    alert("Gagal menandai selesai.");
  }
}
