const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

exports.handler = async (event, context) => {
  try {
    // Petugas rahasia sekarang yang membuat timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "persyaratan";

    // Buat signature berdasarkan parameter yang dibuat di sini
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    // Kirim kembali semua yang dibutuhkan oleh browser
    return {
      statusCode: 200,
      body: JSON.stringify({
        signature: signature,
        timestamp: timestamp,
        folder: folder,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
