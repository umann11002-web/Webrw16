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

function slugify(nama, jabatan) {
  const combined = `${nama} ${jabatan}`;
  return combined
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

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

      const hierarchy = buildHierarchy(pengurusArray);

      if (hierarchy) {
        const chartHTML = `<div class="org-chart"><ul>${buildChartHTML(
          hierarchy
        )}</ul></div>`;
        container.innerHTML = chartHTML;
      } else {
        container.innerHTML =
          "<p>Struktur tidak valid (Ketua RW tidak ditemukan dalam data).</p>";
      }
    } else {
      container.innerHTML = "<p>Data struktur organisasi belum tersedia.</p>";
    }
  } catch (error) {
    console.error("Error memuat struktur RW: ", error);
    container.innerHTML = '<p style="color:red;">Gagal memuat data.</p>';
  }
});

function buildHierarchy(pengurusArray) {
  const pengurusMap = new Map(
    pengurusArray.map((p) => [p.jabatan, { ...p, children: [] }])
  );

  const root = pengurusMap.get("Ketua RW");
  if (!root) {
    console.error("Ketua RW tidak ditemukan dalam data.");
    return null;
  } // [PERBAIKAN] Ejaan "Sekertaris" diubah menjadi "Sekertaris"

  const directReports = [
    "Wakil RW",
    "Sekertaris RW",
    "Bendahara RW",
    "Anggota",
  ];
  directReports.forEach((jabatan) => {
    if (pengurusMap.has(jabatan) && jabatan !== "Ketua RW") {
      root.children.push(pengurusMap.get(jabatan));
    }
  }); // [PERBAIKAN] Ejaan di sini juga diubah

  const sekNode = root.children.find(
    (child) => child.jabatan === "Sekertaris RW"
  );
  if (sekNode) {
    const sekReports = ["Wakil Sekertaris"]; // Pastikan ejaan ini juga benar
    sekReports.forEach((jabatan) => {
      if (pengurusMap.has(jabatan)) {
        sekNode.children.push(pengurusMap.get(jabatan));
      }
    });
  }
  return root;
}

function buildChartHTML(node) {
  const linkId = slugify(node.nama, node.jabatan);

  let html = `
        <li>
            <a href="detail-pengurus.html?id=${linkId}" class="org-card-link">
                <div class="org-card">
                    <img src="${
    node.fotoUrl || "https://placehold.co/100x100/ccc/333?text=Foto"
  }" alt="Foto ${
    node.nama
  }" onerror="this.src='https://placehold.co/100x100/ccc/333?text=Error';">
                    <h3>${node.nama}</h3>
                    <p>${node.jabatan}</p>
                </div>
            </a>
    `;

  if (node.children && node.children.length > 0) {
    html += "<ul>";
    for (const child of node.children) {
      html += buildChartHTML(child);
    }
    html += "</ul>";
  }

  html += "</li>";
  return html;
}
