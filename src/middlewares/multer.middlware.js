import multer from "multer";
import { extenstions } from "../utils/fileExtenstions.js";
import ApiError from "../utils/apiError.js";

export const multerHost = ({ allowedExtesions = extenstions.Images }) => {
  const storage = multer.diskStorage({});
  function fileFilter(req, file, cb) {
    if (allowedExtesions.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(`Invalid file type, only ${allowedExtesions}`, 404),
        false
      );
    }
  }

  return multer({
    storage,
    fileFilter,
  });
};
