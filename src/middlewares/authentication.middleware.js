import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import User from "../db/models/user.model.js";
import { asyncHandler } from "./errorHandler.middleware.js";
const auth = () => {
  return asyncHandler(async (req, res, next) => {
    const { token } = req.headers;

    // check token exists
    if (!token) {
      return next(new ApiError("You are not login please login first", 401));
    }

    // check bearer token key word
    console.log(token);
    if (!token.startsWith(process.env.TOKEN_BEARER)) {
      return next(new ApiError("Invalid token", 400));
    }
    // extract token
    let originalToken = token.split(" ")[1];
    const decoded = jwt.verify(originalToken, process.env.TOKEN_SECRET);

    // check payload in the token
    if (!decoded?.userId) {
      return next(new ApiError("Invalid token payload", 401));
    }

    //get the user data
    const currentUser = await User.findById(decoded.userId);

    // next nedd to check token date created if change password

    req.user = currentUser;
    next();
  });
};
export default auth;
