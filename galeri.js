import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
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

const galleryGridContainer = document.getElementById("gallery-grid-container");

async function tampilkanGaleri() {
  try {
    const q = query(collection(db, "galeri"), orderBy("diunggahPada", "desc"));
    const querySnapshot = await getDocs(q);

    galleryGridContainer.innerHTML = "";

    if (querySnapshot.empty) {
      galleryGridContainer.innerHTML = "<p>Belum ada foto di galeri.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const foto = doc.data();

      const itemHTML = `
                <div class="gallery-item">
                    <img src="${foto.imageUrl}" alt="${foto.judul}">
                    <div class="overlay">${foto.judul}</div>
                </div>
            `;
      galleryGridContainer.innerHTML += itemHTML;
    });
  } catch (error) {
    console.error("Error mengambil data galeri: ", error);
    galleryGridContainer.innerHTML =
      '<p style="color: red;">Gagal memuat galeri.</p>';
  }
}

document.addEventListener("DOMContentLoaded", tampilkanGaleri);
