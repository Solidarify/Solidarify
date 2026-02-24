const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ message: "Auth fallida: Token no proporcionado" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trim();
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userData = { 
      email: decodedToken.email, 
      userId: decodedToken.id, 
      roles: decodedToken.roles 
    };

    next();

  } catch (error) {
    res.status(401).json({ message: "Auth fallida: Token inválido" });
  }
};
