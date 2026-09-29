// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
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

const tableBody = document.getElementById("riwayat-table-body");
const loadingEl = document.getElementById("riwayat-loading");
const authNoticeSection = document.getElementById("auth-notice-section");
const contentSection = document.getElementById("riwayat-content-section");

// Satpam digital + pemuat data
onAuthStateChanged(auth, (user) => {
  if (loadingEl) loadingEl.style.display = "none";

  if (user) {
    // Jika user login, sembunyikan notice dan tampilkan riwayat
    if (authNoticeSection) authNoticeSection.style.display = "none";
    if (contentSection) contentSection.style.display = "block";
    tampilkanRiwayat(user.uid);
  } else {
    // Jika belum login, tampilkan card notifikasi ramah tanpa redirect paksa
    if (contentSection) contentSection.style.display = "none";
    if (authNoticeSection) authNoticeSection.style.display = "block";
  }
});

async function tampilkanRiwayat(userId) {
  try {
    const q = query(
      collection(db, "pengajuanSurat"),
      where("userId", "==", userId),
      orderBy("tanggalPengajuan", "desc")
    );
    const querySnapshot = await getDocs(q);

    tableBody.innerHTML = ""; // Kosongkan tabel

    if (querySnapshot.empty) {
      tableBody.innerHTML =
        '<tr><td colspan="5" style="text-align: center; padding: 2.5rem; color: #64748b;"><i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: #cbd5e1;"></i>Anda belum pernah mengajukan surat.</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const tanggal = data.tanggalPengajuan
        ? data.tanggalPengajuan.toDate().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-";

      // Format status badge
      let statusBadge = `<span class="badge-status status-menunggu">${data.status || "Menunggu"}</span>`;
      if (data.status === "Selesai") {
        statusBadge = `<span class="badge-status status-selesai">Disetujui / Selesai</span>`;
      } else if (data.status === "Ditolak") {
        statusBadge = `<span class="badge-status status-ditolak">Ditolak</span>`;
      }

      // Siapkan tombol download (nonaktif jika belum selesai)
      const isSelesai = data.status === "Selesai";
      const hasFileLink =
        data.fileSuratJadiUrl && data.fileSuratJadiUrl !== "#";
      const downloadButton =
        isSelesai && hasFileLink
          ? `<a href="${data.fileSuratJadiUrl}" class="download-btn" target="_blank"><i class="fas fa-download"></i> Unduh</a>`
          : `<button class="download-btn disabled" disabled title="Surat belum selesai atau belum diunggah pengurus">Unduh</button>`;

      const row = `
        <tr>
          <td>${tanggal}</td>
          <td><strong>${data.jenisSurat || "-"}</strong></td>
          <td>${data.keperluan || "-"}</td>
          <td>${statusBadge}</td>
          <td>${downloadButton}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error mengambil riwayat: ", error);
    tableBody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #ef4444;"><i class="fas fa-exclamation-triangle" style="margin-right: 6px;"></i> Gagal memuat riwayat.</td></tr>';
  }
}
