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

// Fungsi helper untuk ID link, tetap sama
function slugify(nama, jabatan) {
  const combined = `${nama} ${jabatan}`;
  return combined
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

// Fungsi untuk membuat HTML satu kartu, tetap sama
function createCardHTML(node) {
  const linkId = slugify(node.nama, node.jabatan);
  return `
        <a href="detail-pengurus.html?id=${linkId}" class="org-card-link">
            <div class="org-card">
                <img src="${
                  node.fotoUrl ||
                  "https://placehold.co/100x100/ccc/333?text=Foto"
                }" alt="Foto ${node.nama}">
                <h3>${node.nama}</h3>
                <p>${node.jabatan}</p>
            </div>
        </a>
    `;
}

// [BARU] Fungsi untuk membangun bagan HIERARKI (Desktop)
function buildHierarchyChart(pengurusArray) {
  const nodes = pengurusArray.map((p) => ({ ...p, children: [] }));
  const root = nodes.find((p) => p.jabatan === "Ketua RW");
  if (!root) return null;

  const otherMembers = nodes.filter((p) => p.jabatan !== "Ketua RW");
  otherMembers.forEach((member) => {
    // Logika sederhana: semua adalah anak dari Ketua RW
    root.children.push(member);
  });

  function buildHTML(node) {
    let html = `<li>${createCardHTML(node)}`;
    if (node.children && node.children.length > 0) {
      html += "<ul>";
      for (const child of node.children) {
        html += buildHTML(child);
      }
      html += "</ul>";
    }
    html += "</li>";
    return html;
  }
  return `<div class="org-chart"><ul>${buildHTML(root)}</ul></div>`;
}

// [BARU] Fungsi untuk membangun tampilan BERJENJANG (Mobile)
function buildTieredLayout(pengurusArray) {
  const pimpinan = pengurusArray.filter(
    (p) => p.jabatan === "Ketua RW" || p.jabatan === "Wakil RW"
  );
  const inti = pengurusArray.filter(
    (p) => p.jabatan === "Sekertaris RW" || p.jabatan === "Bendahara RW"
  );
  const anggota = pengurusArray.filter((p) => p.jabatan.includes("Anggota"));

  let html = '<div class="org-container">';
  if (pimpinan.length > 0) {
    html += '<h2>Pimpinan</h2><div class="org-tier pimpinan">';
    pimpinan.forEach((p) => {
      html += createCardHTML(p);
    });
    html += "</div>";
  }
  if (inti.length > 0) {
    html += '<h2>Jajaran Inti</h2><div class="org-tier inti">';
    inti.forEach((p) => {
      html += createCardHTML(p);
    });
    html += "</div>";
  }
  if (anggota.length > 0) {
    html += '<h2>Anggota</h2><div class="org-tier anggota">';
    anggota.forEach((p) => {
      html += createCardHTML(p);
    });
    html += "</div>";
  }
  html += "</div>";
  return html;
}

// Fungsi utama yang berjalan saat halaman dimuat
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("org-chart-wrapper");
  if (!container) return;

  try {
    const docRef = doc(db, "struktur_organisasi", "rw");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().pengurus) {
      const pengurusArray = docSnap.data().pengurus;

      if (pengurusArray.length === 0) {
        container.innerHTML = "<p>Belum ada data pengurus.</p>";
        return;
      }

      // [KUNCI] Cek lebar layar dan gambar layout yang sesuai
      if (window.innerWidth <= 768) {
        container.innerHTML = buildTieredLayout(pengurusArray);
      } else {
        container.innerHTML = buildHierarchyChart(pengurusArray);
      }
    } else {
      container.innerHTML = "<p>Data struktur organisasi belum tersedia.</p>";
    }
  } catch (error) {
    console.error("Error memuat struktur RW: ", error);
    container.innerHTML = '<p style="color:red;">Gagal memuat data.</p>';
  }
});
