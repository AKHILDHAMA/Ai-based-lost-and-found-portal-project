const imghash = require("imghash");
const fs = require("fs");
const path = require("path");

// ---------------- TEXT MATCHING ---------------- //
function textMatchScore(titleA, descA, titleB, descB) {
  const textA = (titleA + " " + descA).toLowerCase();
  const textB = (titleB + " " + descB).toLowerCase();

  const wordsA = textA.split(" ");
  let score = 0;

  for (let w of wordsA) {
    if (w.length > 2 && textB.includes(w)) score++;
  }

  return score;
}

// ---------------- IMAGE HASH (SAFE WITH TIMEOUT) ---------------- //
async function getImageHash(filePath) {
  return new Promise(async (resolve) => {
    let timedOut = false;

    // Timeout after 2 seconds to prevent backend freeze
    const timer = setTimeout(() => {
      timedOut = true;
      console.log("⏳ Hashing timeout:", filePath);
      resolve(null);
    }, 2000);

    try {
      const hash = await imghash.hash(filePath, 16);

      if (!timedOut) {
        clearTimeout(timer);
        resolve(hash);
      }
    } catch (error) {
      console.log("❌ Image hash error:", error);
      clearTimeout(timer);
      resolve(null);
    }
  });
}

// ---------------- HAMMING DISTANCE ---------------- //
function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB) return 99999;

  let dist = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

// ---------------- IMAGE MATCHING ---------------- //
async function imageMatch(newImagePath, items) {
  const newHash = await getImageHash(newImagePath);
  if (!newHash) return null;

  let bestMatch = null;
  let bestScore = 99999;

  for (let item of items) {
    if (!item.image) continue;

    const imageUrlPath = item.image.replace("http://localhost:4000/", "");
    const fullPath = path.join(__dirname, "..", imageUrlPath);

    if (!fs.existsSync(fullPath)) continue;

    const existingHash = await getImageHash(fullPath);
    const distance = hammingDistance(newHash, existingHash);

    if (distance < bestScore) {
      bestScore = distance;
      bestMatch = item;
    }
  }

  return bestScore <= 15 ? bestMatch : null;
}

// ---------------- TEXT MATCH EXPORT ---------------- //
module.exports.findBestMatch = async (newItem, items) => {
  let highestScore = -1;
  let bestItem = null;

  for (let item of items) {
    const score = textMatchScore(
      newItem.title,
      newItem.description,
      item.title,
      item.description
    );

    if (score > highestScore) {
      highestScore = score;
      bestItem = item;
    }
  }

  return bestItem;
};

// ---------------- IMAGE MATCH EXPORT ---------------- //
module.exports.findImageMatch = async (newImagePath, items) => {
  return await imageMatch(newImagePath, items);
};
