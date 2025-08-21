// Mengambil elemen yang dibutuhkan
const hamburgerMenu = document.getElementById("hamburger-menu");
const navbar = document.querySelector(".navbar");

// Menambahkan event listener 'click' pada tombol hamburger
hamburgerMenu.addEventListener("click", () => {
  // Toggle class 'active' pada navbar
  // Jika class 'active' ada, maka akan dihapus. Jika tidak ada, akan ditambahkan.
  navbar.classList.toggle("active");
});
