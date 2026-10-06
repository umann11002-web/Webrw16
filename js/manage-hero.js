import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
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

const CLOUDINARY_CLOUD_NAME = "do1ba7gkn";
const CLOUDINARY_UPLOAD_PRESET = "yd99selh";

document.addEventListener("DOMContentLoaded", () => {
  const heroDocRef = doc(db, "struktur_organisasi", "hero_carousel");
  let slidesData = [];

  const slidesGrid = document.getElementById("slides-grid");
  const slideTypeSelect = document.getElementById("slide-type-select");
  const slideFileInput = document.getElementById("slide-file-input");
  const uploadSlideBtn = document.getElementById("upload-slide-btn");
  const progressContainer = document.getElementById("slide-upload-progress");
  const progressBar = document.getElementById("slide-progress-bar");
  const uploadStatus = document.getElementById("slide-upload-status");
  const statusMessage = document.getElementById("slide-status-message");

  // Update file input accept based on type selection
  slideTypeSelect.addEventListener("change", () => {
    if (slideTypeSelect.value === "video") {
      slideFileInput.accept = "video/mp4,video/webm,video/*";
    } else {
      slideFileInput.accept = "image/*";
    }
    slideFileInput.value = "";
  });

  function showStatus(msg, isError = false) {
    statusMessage.textContent = msg;
    statusMessage.style.color = isError ? "#dc3545" : "#28a745";
    if (!isError) {
      setTimeout(() => { statusMessage.textContent = ""; }, 4000);
    }
  }

  // Load slides from Firestore
  async function loadSlides() {
    try {
      const docSnap = await getDoc(heroDocRef);
      if (docSnap.exists() && docSnap.data().slides) {
        slidesData = docSnap.data().slides;
      } else {
        slidesData = [];
      }
      renderSlides();
    } catch (error) {
      console.error("Error loading slides:", error);
      slidesGrid.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p style="color: #dc3545;">Gagal memuat data slides.</p></div>`;
    }
  }

  // Render slides grid
  function renderSlides() {
    if (slidesData.length === 0) {
      slidesGrid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><i class="fas fa-photo-video"></i><p>Belum ada slide. Upload gambar atau video untuk memulai.</p></div>`;
      return;
    }

    slidesGrid.innerHTML = slidesData.map((slide, index) => {
      const isVideo = slide.type === "video";
      const typeClass = isVideo ? "type-video" : "type-image";
      const typeLabel = isVideo ? "Video" : "Gambar";
      const typeIcon = isVideo ? "fa-video" : "fa-image";

      let preview;
      if (isVideo) {
        preview = `<video class="slide-preview" src="${slide.url}" muted playsinline preload="metadata"></video>`;
      } else {
        preview = `<img class="slide-preview" src="${slide.url}" alt="Slide ${index + 1}" />`;
      }

      return `
        <div class="hero-slide-card">
          <span class="slide-order">${index + 1}</span>
          ${preview}
          <div class="slide-info">
            <span class="slide-type ${typeClass}"><i class="fas ${typeIcon}"></i> ${typeLabel}</span>
            <div class="slide-actions">
              <button class="btn-delete-slide" data-index="${index}">
                <i class="fas fa-trash-alt"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Upload slide
  uploadSlideBtn.addEventListener("click", async () => {
    const file = slideFileInput.files[0];
    if (!file) {
      showStatus("Pilih file terlebih dahulu!", true);
      return;
    }

    const slideType = slideTypeSelect.value;
    const isVideo = slideType === "video";

    // Validate file type
    if (isVideo && !file.type.startsWith("video/")) {
      showStatus("File yang dipilih bukan video!", true);
      return;
    }
    if (!isVideo && !file.type.startsWith("image/")) {
      showStatus("File yang dipilih bukan gambar!", true);
      return;
    }

    // File size check (50MB for video, 10MB for image)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showStatus(`File terlalu besar! Maks ${isVideo ? "50MB" : "10MB"}.`, true);
      return;
    }

    uploadSlideBtn.disabled = true;
    uploadSlideBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    progressContainer.style.display = "block";
    progressBar.value = 10;
    uploadStatus.textContent = "Mengunggah ke Cloudinary...";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Use /video/upload for video, /image/upload for images
      const resourceType = isVideo ? "video" : "image";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 80) + 10;
            progressBar.value = pct;
            uploadStatus.textContent = `Mengunggah... ${Math.round((e.loaded / e.total) * 100)}%`;
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error?.message || "Upload gagal"));
            } catch {
              reject(new Error("Upload gagal"));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Koneksi gagal")));
        xhr.open("POST", uploadUrl);
        xhr.send(formData);
      });

      if (result.error) throw new Error(result.error.message);

      progressBar.value = 90;
      uploadStatus.textContent = "Menyimpan ke database...";

      // Add slide to array
      const newSlide = {
        url: result.secure_url,
        type: slideType,
        publicId: result.public_id || "",
        addedAt: new Date().toISOString(),
      };

      slidesData.push(newSlide);

      // Save to Firestore
      await setDoc(heroDocRef, { slides: slidesData }, { merge: true });

      progressBar.value = 100;
      uploadStatus.textContent = "Selesai!";
      showStatus("Slide berhasil ditambahkan!");
      slideFileInput.value = "";

      renderSlides();

      setTimeout(() => {
        progressContainer.style.display = "none";
      }, 2000);
    } catch (error) {
      console.error("Error uploading slide:", error);
      showStatus(`Gagal: ${error.message}`, true);
    } finally {
      uploadSlideBtn.disabled = false;
      uploadSlideBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Slide';
    }
  });

  // Delete slide
  slidesGrid.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".btn-delete-slide");
    if (!deleteBtn) return;

    if (!confirm("Hapus slide ini dari carousel?")) return;

    const index = parseInt(deleteBtn.dataset.index, 10);
    slidesData.splice(index, 1);

    try {
      await setDoc(heroDocRef, { slides: slidesData }, { merge: true });
      showStatus("Slide berhasil dihapus!");
      renderSlides();
    } catch (error) {
      console.error("Error deleting slide:", error);
      showStatus("Gagal menghapus slide.", true);
      loadSlides(); // Reload from DB
    }
  });

  loadSlides();
});
