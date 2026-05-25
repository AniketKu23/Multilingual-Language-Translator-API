const express = require("express");

const jwt = require("jsonwebtoken");

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Generate JWT token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: JWT token generated successfully
 */

router.post("/login", (req, res) => {
  const user = {
    id: 1,
    username: "admin",
  };

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({
    success: true,
    token,
  });
});

module.exports = router;
