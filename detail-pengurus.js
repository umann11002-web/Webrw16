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

/**
 * Membuat "slug" atau ID yang ramah URL dari nama dan jabatan.
 * Contoh: "Opal", "Ketua RW" -> "opal-ketua-rw"
 */
function slugify(nama, jabatan) {
  const combined = `${nama} ${jabatan}`;
  return combined
    .toLowerCase()
    .replace(/\s+/g, "-") // Ganti spasi dengan -
    .replace(/[^\w-]+/g, ""); // Hapus karakter non-alfanumerik
}

async function loadDetailPengurus() {
  const container = document.getElementById("detail-pengurus-content");
  if (!container) return;

  // 1. Ambil ID dari URL
  const params = new URLSearchParams(window.location.search);
  const pengurusId = params.get("id");

  if (!pengurusId) {
    container.innerHTML =
      "<h1>Pengurus Tidak Ditemukan</h1><p>ID pengurus tidak valid atau tidak tersedia.</p>";
    return;
  }

  try {
    // 2. Ambil semua data pengurus dari Firebase
    const docRef = doc(db, "struktur_organisasi", "rw");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurusArray = docSnap.data().pengurus;

      // 3. Cari pengurus yang cocok dengan ID dari URL
      const pengurus = pengurusArray.find(
        (p) => slugify(p.nama, p.jabatan) === pengurusId
      );

      if (pengurus) {
        // 4. Jika ditemukan, tampilkan datanya
        document.title = `${pengurus.nama} - RW 16`; // Ubah judul halaman
        container.innerHTML = `
                    <div class="bio-card">
                        <img src="${
                          pengurus.fotoUrl ||
                          "https://placehold.co/150x150/ccc/333?text=Foto"
                        }" alt="Foto ${pengurus.nama}">
                        <div class="bio-info">
                            <h1>${pengurus.nama}</h1>
                            <p class="jabatan">${pengurus.jabatan}</p>
                            <div class="bio-text">
                                <p>${
                                  pengurus.bio ||
                                  "Informasi lebih lanjut tentang pengurus ini belum tersedia."
                                }</p>
                                <!-- Anda bisa menambahkan info lain di sini, misal: -->
                                <!-- <p><strong>Periode Jabatan:</strong> 2023 - 2026</p> -->
                            </div>
                        </div>
                    </div>
                `;
      } else {
        container.innerHTML =
          "<h1>Pengurus Tidak Ditemukan</h1><p>Data untuk pengurus ini tidak dapat ditemukan di database.</p>";
      }
    } else {
      container.innerHTML =
        "<h1>Data Tidak Ditemukan</h1><p>Struktur organisasi tidak tersedia.</p>";
    }
  } catch (error) {
    console.error("Error memuat detail pengurus: ", error);
    container.innerHTML = "<p style='color:red;'>Gagal memuat data.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadDetailPengurus);
