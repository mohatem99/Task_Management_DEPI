import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import User from "../db/models/user.model.js";
import { asyncHandler } from "./errorHandler.middleware.js";
const auth = () => {
  return asyncHandler(async (req, res, next) => {
    let token;

    if (
      req.headers.token &&
      req.headers.token.startsWith(process.env.TOKEN_BEARER)
    ) {
      token = req.headers.token.split(" ")[1];
    }
    if (!token) {
      // check token exists
      return next(new ApiError("You are not login please login first", 401));
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    // check payload in the token
    if (!decoded?.userId) {
      return next(new ApiError("Invalid token payload", 401));
    }

    //get the user data
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError(
          "The user that belong to this token does no longer exist",
          401
        )
      );
    }

    // check if User change password after token created
    if (currentUser?.passwordChangedAt) {
      // next nedd to check token date created if change password

      const passChangedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );
      if (passChangedTimestamp > decoded.iat) {
        return next(
          new ApiError(
            "User recently changed his password. please login again!.",
            401
          )
        );
      }
    }

    req.user = currentUser;

    next();
  });
};
export default auth;
