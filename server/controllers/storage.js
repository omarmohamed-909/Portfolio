import multer from "multer";
import fs from "fs";
import path from "path";
import { unlink } from "fs/promises";
import { fileTypeFromFile } from "file-type";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

const ALLOWED_FOLDERS = new Set(["projectsimg", "aboutimg", "logo", "mycv"]);

const ALLOWED_MIME_TYPES_BY_FOLDER = {
  projectsimg: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  aboutimg: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  logo: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  mycv: new Set(["application/pdf"]),
};

function resolveUploadDir(folder) {
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error("Invalid upload folder");
  }

  const dir = path.resolve(UPLOAD_ROOT, folder);
  if (!dir.startsWith(`${UPLOAD_ROOT}${path.sep}`) && dir !== UPLOAD_ROOT) {
    throw new Error("Invalid upload folder");
  }

  return dir;
}

async function validateFileSignature(filePath, folder) {
  const allowedMimeTypes = ALLOWED_MIME_TYPES_BY_FOLDER[folder];

  if (!allowedMimeTypes) {
    throw new Error("Invalid upload folder");
  }

  const detectedType = await fileTypeFromFile(filePath);
  if (!detectedType || !allowedMimeTypes.has(detectedType.mime)) {
    throw new Error("Invalid file type for selected upload folder");
  }
}

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folder = String(req.query.folder || "");
      const dir = resolveUploadDir(folder);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const baseUpload = multer({
  storage: Storage,
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

        return res.status(400).json({ message: "File upload failed" });
      }

      if (!req.file) {
        return next();
      }

      const folder = String(req.query.folder || "");
      try {
        await validateFileSignature(req.file.path, folder);
        return next();
      } catch (validationError) {
        try {
          await unlink(req.file.path);
        } catch {
          // ignore cleanup errors
        }

        return res.status(400).json({
          message: validationError.message || "Invalid uploaded file",
        });
      }
    });
  };
}

export const upload = {
  single(fieldName) {
    return withValidation(baseUpload.single(fieldName));
  },
};
