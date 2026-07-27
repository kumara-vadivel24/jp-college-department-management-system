import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Upload a file to Firebase Storage
 * @param {File} file File object to upload
 * @param {string} folder Target folder path in storage (e.g., 'students/photos')
 * @returns {Promise<string>} Download URL of the uploaded file
 */
export const uploadFile = async (file, folder = 'uploads') => {
  if (!file) return null;
  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${folder}/${filename}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress monitoring can be hooked up here if needed
      },
      (error) => {
        console.error('File upload error:', error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Delete a file from Firebase Storage using its full URL
 * @param {string} fileUrl Full download URL of file
 */
export const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file from storage:', error);
  }
};
