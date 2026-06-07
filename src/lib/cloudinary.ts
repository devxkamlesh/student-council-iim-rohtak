import "server-only";
import { v2 as cloudinary } from "cloudinary";

// Configure the Cloudinary SDK from environment variables. The API secret stays
// server-side only — this module is never bundled into the client.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/** Folder where all gallery images are stored in Cloudinary. */
export const GALLERY_FOLDER = "student-council/gallery";
