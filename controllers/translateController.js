const fs = require("fs");

const { Parser } = require("json2csv");

const translateText = require("../services/translationService");

const translateFile = async (req, res) => {
  try {
    const { Code, LanguageCode, filetype } = req.body;

    // VALIDATIONS

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "JSON file required",
      });
    }

    if (!Code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    if (!LanguageCode) {
      return res.status(400).json({
        success: false,
        message: "LanguageCode is required",
      });
    }

    if (!filetype) {
      return res.status(400).json({
        success: false,
        message: "filetype is required",
      });
    }

    if (filetype !== "json" && filetype !== "csv") {
      return res.status(400).json({
        success: false,
        message: "filetype must be json or csv",
      });
    }

    // READ FILE

    const fileData = req.file.buffer.toString("utf-8");

    const jsonData = JSON.parse(fileData);

    // GROUP DUPLICATE TEXTS

    const uniqueTexts = {};

    for (const key in jsonData) {
      const text = jsonData[key];

      if (!text || text.trim() === "") {
        continue;
      }

      if (!uniqueTexts[text]) {
        uniqueTexts[text] = [];
      }

      uniqueTexts[text].push(key);
    }

    const texts = Object.keys(uniqueTexts);

    const translatedArray = [];

    const batchSize = 5;

    // TRANSLATE IN BATCHES

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (text) => {
          const translatedText = await translateText(text, LanguageCode);

          return uniqueTexts[text].map((key) => ({
            Code,
            LanguageCode,
            ContentKey: key,
            ContentDesc: translatedText,
          }));
        }),
      );

      translatedArray.push(...batchResults.flat());

      console.log(
        `Completed ${Math.min(i + batchSize, texts.length)} / ${texts.length}`,
      );
    }

    // DELETE UPLOADED FILE (No-op in memoryStorage)

    // JSON RESPONSE

    if (filetype === "json") {
      return res.status(200).json({
        success: true,
        count: translatedArray.length,
        data: translatedArray,
      });
    }

    // CSV RESPONSE

    const parser = new Parser();

    const csv = parser.parse(translatedArray);

    res.header("Content-Type", "text/csv");

    res.attachment("translated.csv");

    return res.send(csv);
  } catch (error) {
    console.log("CONTROLLER ERROR:");

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  translateFile,
};
