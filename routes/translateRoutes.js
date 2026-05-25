const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const upload = require("../utils/multer");

const { translateFile } = require("../controllers/translateController");

/**
 * @swagger
 * /api/translate:
 *   post:
 *     summary: Translate uploaded JSON language file
 *     tags:
 *       - Translation
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - Code
 *               - LanguageCode
 *               - filetype
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               Code:
 *                 type: string
 *                 example: shared
 *               LanguageCode:
 *                 type: string
 *                 example: ar
 *               filetype:
 *                 type: string
 *                 enum:
 *                   - json
 *                   - csv
 *
 *     responses:
 *       200:
 *         description: Translation successful
 */

router.post("/translate", auth, upload.single("file"), translateFile);

module.exports = router;
