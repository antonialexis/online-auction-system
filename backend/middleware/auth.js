function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access Denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("DEBUG: Token invalid:", err); // ADD THIS
      return res.status(403).json({ error: "Invalid Token" });
    }

    console.log("DEBUG: User ID found:", decoded.id); // ADD THIS
    req.user = decoded;
    next();
  });
}
