// utils/duplicateDetector.js

const stopWords = [
  "the","is","at","which","on","a","an","and","or","of","in","to","with"
];

function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter(word => word && !stopWords.includes(word));
}

function similarityScore(text1, text2) {
  const t1 = new Set(tokenize(text1));
  const t2 = new Set(tokenize(text2));

  if (t1.size === 0 || t2.size === 0) return 0;

  let common = 0;
  t1.forEach(word => {
    if (t2.has(word)) common++;
  });

  return common / Math.max(t1.size, t2.size);
}

module.exports = { similarityScore };
