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

// Satpam digital + pemuat data
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Jika user login, ambil riwayat pengajuannya
    tampilkanRiwayat(user.uid);
  } else {
    // Jika tidak, tendang ke halaman login
    window.location.href = "login.html";
  }
});

async function tampilkanRiwayat(userId) {
  try {
    // Query khusus: cari di 'pengajuanSurat' HANYA yang 'userId'-nya sama dengan ID user yang login
    const q = query(
      collection(db, "pengajuanSurat"),
      where("userId", "==", userId),
      orderBy("tanggalPengajuan", "desc")
    );
    const querySnapshot = await getDocs(q);

    tableBody.innerHTML = ""; // Kosongkan tabel

    if (querySnapshot.empty) {
      tableBody.innerHTML =
        '<tr><td colspan="5" style="text-align: center;">Anda belum pernah mengajukan surat.</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const tanggal = data.tanggalPengajuan
        .toDate()
        .toLocaleDateString("id-ID");

      // Siapkan tombol download (nonaktif jika belum selesai)
      const isSelesai = data.status === "Selesai";
      const downloadButton = isSelesai
        ? `<a href="${data.fileSuratJadiUrl}" class="download-btn" target="_blank">Download</a>`
        : `<button class="download-btn disabled" disabled>Download</button>`;

      const row = `
                <tr>
                    <td>${tanggal}</td>
                    <td>${data.jenisSurat}</td>
                    <td>${data.keperluan}</td>
                    <td>${data.status}</td>
                    <td>${downloadButton}</td>
                </tr>
            `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error mengambil riwayat: ", error);
    tableBody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; color: red;">Gagal memuat riwayat.</td></tr>';
  }
}
