function BlogImgFolderValidation(req, res, next) {
  if (req.query.folder !== "blogimg") {
    return res.status(409).json({ message: "Invalid folder name" });
  }
  next();
}

export default BlogImgFolderValidation;
