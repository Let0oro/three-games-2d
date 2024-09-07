const findTonicity = require("../../src/utils/getSyllables.cjs");
const evaluateOriginality = require("../../src/utils/evaluateOriginality.cjs");
const rhythmScore = require("../../src/utils/RhytmScore.cjs");

const rhymeScore = (rhymes) => {
  const assonantRhymes = new Set(rhymes.map(({ assonant }) => assonant));
  const consonantRhymes = new Set(rhymes.map(({ consonant }) => consonant));

  if (rhymes.length - [...consonantRhymes].length > 0) {
    return 10;
  } else if (rhymes.length - [...assonantRhymes].length > 0) {
    return 5;
  }
  return 0;
};

const meterScore = (meters) => {
  const idealChangeMeterTime = 3;
  const numEqualMeters = meters.length - [...new Set(meters)].length;
  return numEqualMeters / (meters.length / Math.min(idealChangeMeterTime, meters.length));
};

const htmlToReturn = (tonic) =>
  tonic
    .map(
      ({ tonicity }) =>
        `<p>${tonicity
          .map(({ tonicSyllable, syllables, syllableIndex, word }) =>
            tonicSyllable.length
              ? syllables
                  .map(
                    (syl, i) =>
                      `<span ${syllableIndex && i == syllableIndex - 1 ? "class='hig'" : ""}>${syl}</span>`
                  )
                  .join("")
              : word
          )
          .join(" ")}</p>`
    )
    .join("");

async function generatePoetryEvaluation(poem) {
  const lines = poem
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length);
  const rhymes = [];
  const rhythms = [];
  const meters = [];
  const forHtml = [];

  lines.forEach((line) => {
    const evaluation = findTonicity(line);
    const { metric, poetrySyllables, rhyme, string, syllables, tonicity } =
      evaluation;

    rhymes.push(rhyme);
    rhythms.push(metric.metricFeets);
    meters.push(poetrySyllables);
    forHtml.push({ string, syllables, tonicity });
  });

  const { points, name } = rhythmScore(rhythms);

  const rhymeScoreAverage = rhymeScore(rhymes) / 10;
  const rhythmScoreAverage = points;
  const meterScoreAverage = meterScore(meters);
  const returnedHtml = htmlToReturn(forHtml);
  const originalityScore = await evaluateOriginality(poem);

  return {
    rhymeScore: rhymeScoreAverage.toFixed(2) || 0,
    rhythmScore: rhythmScoreAverage.toFixed(2) || 0,
    rhythmName: name || "",
    meterScore: meterScoreAverage.toFixed(2) || 0,
    originalityScore: originalityScore || 0,
    returnedHtml: returnedHtml || "",
  };
}

module.exports = { generatePoetryEvaluation };