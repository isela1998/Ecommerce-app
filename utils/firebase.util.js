const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');

// Models
const { ProductImg } = require('../models/productImg.model');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

// Storage service
const storage = getStorage(firebaseApp);

const saveProductImages = async (imgs, productId) => {
  try {
    // Map async
    const receivedImages = imgs.map(async (img) => {
      // Create unique filename
      const [filename, ext] = img.originalname.split('.');
      const nameImage = `${
        process.env.NODE_ENV
      }/products/${productId}/${filename}-${Date.now()}.${ext}`;

      // Create reference
      const reference = ref(storage, nameImage);

      // Upload img
      const uploadImgs = await uploadBytes(reference, img.buffer);

      return await ProductImg.create({
        productId,
        imgUrl: uploadImgs.metadata.fullPath,
      });
    });

    await Promise.all(receivedImages);
  } catch (e) {
    console.log(e);
  }
};

module.exports = { storage, saveProductImages };
