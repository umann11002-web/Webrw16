import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
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

function getRtIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // e.g., 'rt01'
}

function populateOrgCard(elementId, pengurusData) {
  const card = document.getElementById(elementId);
  if (card && pengurusData) {
    card.querySelector("img").src =
      pengurusData.fotoUrl || "https://placehold.co/100x100/eee/ccc?text=Foto";
    card.querySelector("h3").textContent = pengurusData.nama;
  } else if (card) {
    card.style.display = "none";
  }
}

async function tampilkanDetailRT() {
  const rtId = getRtIdFromUrl();
  if (!rtId) {
    document.body.innerHTML = "<h1>ID RT tidak ditemukan.</h1>";
    return;
  }

  const rtNumber = rtId.replace("rt", "RT ").toUpperCase();
  document.title = `Struktur ${rtNumber} - RW 16`;
  document.getElementById("rt-sidebar-title").textContent = rtNumber;

  try {
    // --- PROSES 1: Ambil data statis dan pengurus ---
    const docRef = doc(db, "struktur_organisasi", rtId);
    const docSnap = await getDoc(docRef);
    let wargaTetap = 0;
    let wargaSementara = 0;

    if (docSnap.exists()) {
      const data = docSnap.data();
      wargaTetap = data.wargaTetap || 0;
      wargaSementara = data.wargaSementara || 0;
      const pengurus = data.pengurus || [];

      // Mengisi Bagan Desktop
      const ketua = pengurus.find((p) =>
        p.jabatan.toLowerCase().includes("ketua")
      );
      const sekretaris = pengurus.find((p) =>
        p.jabatan.toLowerCase().includes("sekretaris")
      );
      const bendahara = pengurus.find((p) =>
        p.jabatan.toLowerCase().includes("bendahara")
      );
      // [PENTING] Pastikan ID di HTML juga sesuai
      populateOrgCard("ketua-rt-desktop", ketua);
      populateOrgCard("sekretaris-rt-desktop", sekretaris);
      populateOrgCard("bendahara-rt-desktop", bendahara);

      // Mengisi Swiper Mobile
      const swiperWrapper = document.getElementById("pengurus-swiper-wrapper");
      let slidesHTML = "";
      pengurus.forEach((p) => {
        slidesHTML += `<div class="swiper-slide"><div class="org-card"><img src="${
          p.fotoUrl || "https://placehold.co/100x100/eee/ccc?text=Foto"
        }" alt="Foto ${p.jabatan}"><h3>${p.nama}</h3><p>${
          p.jabatan
        }</p></div></div>`;
      });
      swiperWrapper.innerHTML = slidesHTML;
      new Swiper(".swiper-container", {
        slidesPerView: "auto",
        spaceBetween: 15,
        centeredSlides: true,
        loop: false,
        pagination: { el: ".swiper-pagination", clickable: true },
      });
    } else {
      console.log(`Dokumen untuk ${rtId} tidak ditemukan.`);
    }

    // --- PROSES 2: Hitung data dinamis dari koleksi /penduduk ---
    const pendudukRef = collection(db, "penduduk");
    // PENTING: Pastikan di koleksi /penduduk Anda ada field 'rtId' yang isinya 'rt01', 'rt02', dst.
    const q = query(pendudukRef, where("rtId", "==", rtId));
    const querySnapshot = await getDocs(q);

    let jumlahLaki = 0;
    let jumlahPerempuan = 0;
    let jumlahKK = 0;

    querySnapshot.forEach((doc) => {
      const warga = doc.data();
      // Hitung gender (sesuaikan 'jenisKelamin' jika nama field Anda berbeda)
      if (
        warga.jenisKelamin &&
        warga.jenisKelamin.toLowerCase().includes("laki")
      ) {
        jumlahLaki++;
      } else if (
        warga.jenisKelamin &&
        warga.jenisKelamin.toLowerCase().includes("perempuan")
      ) {
        jumlahPerempuan++;
      }
      // [BARU] Hitung Kepala Keluarga
      // PENTING: Asumsi Anda punya field 'statusDiKeluarga' yang isinya 'Kepala Keluarga'
      if (
        warga.statusDiKeluarga &&
        warga.statusDiKeluarga.toLowerCase() === "kepala keluarga"
      ) {
        jumlahKK++;
      }
    });

    // --- PROSES 3: Tampilkan semua data ke HTML ---
    document.getElementById("stat-tetap").textContent = wargaTetap;
    document.getElementById("stat-sementara").textContent = wargaSementara;
    document.getElementById("stat-laki").textContent = jumlahLaki;
    document.getElementById("stat-perempuan").textContent = jumlahPerempuan;
    document.getElementById("stat-kk").textContent = jumlahKK; // Data baru
    document.getElementById("stat-total").textContent =
      wargaTetap + wargaSementara;
  } catch (error) {
    console.error("Gagal memuat data RT: ", error);
  }
}

document.addEventListener("DOMContentLoaded", tampilkanDetailRT);
