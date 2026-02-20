import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || typeof localFilePath !== "string") {
      console.error("Invalid file path provided.");
      return null;
    }

      const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File uploaded successfully
    // console.log("File uploaded successfully to Cloudinary:", response.secure_url);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);

    // Safely remove the local file
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log("Temporary file deleted locally.");
      }
    } catch (unlinkError) {
      console.error("Error removing local file:", unlinkError);
    }

    return null;
  }
};

export { uploadOnCloudinary };