import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.error("No public ID provided.");
      return null;
    }

    const response = await cloudinary.uploader.destroy(publicId);
    
    if (response.result === "ok") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};

export { deleteFromCloudinary };