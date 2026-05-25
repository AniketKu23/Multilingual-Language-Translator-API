const translate = require("google-translate-api-x");

const cache = require("../utils/cache");

const translateText = async (text, targetLanguage) => {
  if (!text || text.trim() === "") {
    return "";
  }

  const cacheKey = `${text}_${targetLanguage}`;

  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const result = await translate(text, {
      to: targetLanguage,
      forceBatch: false,
      rejectOnPartialFail: false,
    });

    const translatedText = result.text || text;

    cache.set(cacheKey, translatedText);

    return translatedText;
  } catch (error) {
    console.log(error.message);
    return text;
  }
};

module.exports = translateText;
