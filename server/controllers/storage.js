import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const ALLOWED_FOLDERS = new Set(["projectsimg", "aboutimg", "logo", "mycv"]);

const ALLOWED_MIME_TYPES_BY_FOLDER = {
  projectsimg: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  aboutimg: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  logo: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  mycv: new Set(["application/pdf"]),
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = String(req.query.folder || "");

    if (!ALLOWED_FOLDERS.has(folder)) {
      throw new Error("Invalid upload folder");
    }

    const normalizedBaseName = String(file.originalname || "asset")
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    return {
      folder: "portfolio_assets",
      resource_type: "auto",
      public_id: `${folder}-${Date.now()}-${normalizedBaseName || "asset"}`,
    };
  },
});

const baseUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const folder = String(req.query.folder || "");
    const allowedMimeTypes = ALLOWED_MIME_TYPES_BY_FOLDER[folder];

    if (!allowedMimeTypes) {
      return cb(new Error("Invalid upload folder"));
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Invalid file type for selected upload folder"));
    }

    return cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

function withValidation(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, async (error) => {
      if (error) {
        if (
          error instanceof multer.MulterError &&
          error.code === "LIMIT_FILE_SIZE"
        ) {
          return res.status(400).json({ message: "File exceeds 10MB limit" });
        }

        if (error.message === "Invalid upload folder") {
          return res.status(400).json({ message: error.message });
        }

        if (error.message === "Invalid file type for selected upload folder") {
          return res.status(400).json({ message: error.message });
        }

        return res.status(400).json({ message: "File upload failed" });
      }

      if (!req.file) {
        return next();
      }

      return next();
    });
  };
}

function getCloudinaryPublicIdFromUrl(assetUrl) {
  if (!assetUrl || typeof assetUrl !== "string") {
    return null;
  }

  if (!assetUrl.includes("res.cloudinary.com")) {
    return null;
  }

  const normalizedUrl = assetUrl.split("?")[0];
  const urlSegments = normalizedUrl.split("/");
  const uploadSegmentIndex = urlSegments.findIndex(
    (segment) => segment === "upload"
  );

  if (uploadSegmentIndex === -1) {
    return null;
  }

  let publicIdSegments = urlSegments.slice(uploadSegmentIndex + 1);

  if (/^v\d+$/.test(publicIdSegments[0] || "")) {
    publicIdSegments = publicIdSegments.slice(1);
  }

  if (publicIdSegments.length === 0) {
    return null;
  }

  const lastSegmentIndex = publicIdSegments.length - 1;
  const lastSegment = publicIdSegments[lastSegmentIndex];
  const extensionIndex = lastSegment.lastIndexOf(".");

  if (extensionIndex > 0) {
    publicIdSegments[lastSegmentIndex] = lastSegment.slice(0, extensionIndex);
  }

  return publicIdSegments.join("/");
}

export async function removeCloudinaryAsset(assetUrl) {
  const publicId = getCloudinaryPublicIdFromUrl(assetUrl);

  if (!publicId) {
    return;
  }

  const resourceTypes = ["image", "raw", "video"];

  for (const resourceType of resourceTypes) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result?.result === "ok" || result?.result === "not found") {
        return;
      }
    } catch {
      // try the next resource type
    }
  }
}

export const upload = {
  single(fieldName) {
    return withValidation(baseUpload.single(fieldName));
  },
};
