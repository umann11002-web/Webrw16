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

// Fungsi ini HARUS SAMA PERSIS dengan yang ada di struktur-rw.js
function slugify(nama, jabatan) {
  const combined = `${nama} ${jabatan}`;
  return combined
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("bio-container");
  const params = new URLSearchParams(window.location.search);
  const pengurusId = params.get("id");

  if (!pengurusId) {
    container.innerHTML = '<p style="color:red;">ID Pengurus tidak valid.</p>';
    return;
  }

  try {
    const docRef = doc(db, "struktur_organisasi", "rw");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurusArray = docSnap.data().pengurus;
      const pengurus = pengurusArray.find(
        (p) => slugify(p.nama, p.jabatan) === pengurusId
      );

      if (pengurus) {
        // Tampilkan data kontak terstruktur
        container.innerHTML = `
                    <div class="bio-card">
                        <img src="${
                          pengurus.fotoUrl ||
                          "https://placehold.co/150x150/ccc/333?text=Foto"
                        }" alt="Foto ${pengurus.nama}">
                        <div class="bio-info">
                            <h1>${pengurus.nama}</h1>
                            <p class="jabatan">${pengurus.jabatan}</p>
                            
                            <ul class="bio-kontak">
                                ${
                                  pengurus.noHp
                                    ? `<li><i class="fas fa-phone"></i><a href="tel:${pengurus.noHp}">${pengurus.noHp}</a></li>`
                                    : ""
                                }
                                ${
                                  pengurus.email
                                    ? `<li><i class="fas fa-envelope"></i><a href="mailto:${pengurus.email}">${pengurus.email}</a></li>`
                                    : ""
                                }
                                ${
                                  pengurus.alamat
                                    ? `<li><i class="fas fa-map-marker-alt"></i><span>${pengurus.alamat}</span></li>`
                                    : ""
                                }
                            </ul>
                        </div>
                    </div>
                `;
      } else {
        container.innerHTML = "<p>Detail pengurus tidak ditemukan.</p>";
      }
    } else {
      container.innerHTML = "<p>Data struktur organisasi tidak tersedia.</p>";
    }
  } catch (error) {
    console.error("Error memuat detail pengurus: ", error);
    container.innerHTML = '<p style="color:red;">Gagal memuat data.</p>';
  }
});
