// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Ambil elemen yang dibutuhkan
  const hamburgerBtn = document.getElementById("admin-hamburger-btn");
  const navLinks = document.getElementById("admin-nav-links");

  // Pastikan elemennya ada di halaman ini sebelum menambahkan fungsi
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener("click", () => {
      // Toggle kelas 'active' untuk menampilkan/menyembunyikan menu
      navLinks.classList.toggle("active");
    });
  }

  // NOTE: Kode logout dari admin.js bisa dipindahkan ke sini agar terpusat
  // Contoh:
  // import { getAuth, signOut } from "...";
  // const auth = getAuth();
  // const logoutBtn = document.getElementById('logout-btn');
  // if(logoutBtn) {
  //   logoutBtn.addEventListener('click', () => signOut(auth));
  // }
});
