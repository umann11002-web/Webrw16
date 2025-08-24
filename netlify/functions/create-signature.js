const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

exports.handler = async (event, context) => {
  try {
    // Ambil SEMUA parameter yang dikirim dari browser
    const body = JSON.parse(event.body);
    const paramsToSign = body.params_to_sign;

    // Buat signature berdasarkan SEMUA parameter tersebut
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ signature }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
