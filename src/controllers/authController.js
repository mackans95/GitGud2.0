exports.protect = async (req, _res, next) => {
  // Getting token and check if its there
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(Error("Not Validated"));
  }

  // Validate the token (Verification)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SIGNINGKEY);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError("The user this token belongs to no longer exists", 401)
    );

  console.log(currentUser);
  // Grant access to protected route
  req.user = currentUser;
  next();
};
