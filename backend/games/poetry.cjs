const axios = require("axios");
const findTonicity = require("../../src/utils/getSyllables.cjs");

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

const rhythmScore = (metric) => {
  const maxMetricLine = Math.max(...metric.map((l) => l.length));

  const averageMetricLines =
    metric.reduce((a, c) => a + c.filter((v) => v).length, 0) / metric.length;

  const prepareBits = metric.map((l) =>
    l.join("").padEnd(maxMetricLine, 0).split("")
  );

  console.log({ prepareBits });

  const rhytmNames = {
    dos: { troqueo: [1, 0], yambo: [0, 1] },
    tres: { dactilo: [1, 0, 0], anfibraco: [0, 1, 0], anapesto: [0, 0, 1] },
  };

  /*
  Por el pan
  Baila el can


  Troqueo/Yambo -> dividir por 2, eliminar lo anterior si impar o aumentar hasta par;
  Dact/Anf/Anap -> dividir en 3 y a cada sección darle uno: 

  - Dos funciones -> una para tripletes y otra para dobles
  - Tripletes: a cada cual dale uno

  001 -> 
  101

  Ejemplo: [1, 0, 1, 0, 1, 0].map((v, i, a) => !((i+1) % 3) && [...a].splice(i-2, i+1))
  */

  const transformLength = (arr, number) =>
    arr.map((mArr, i) => {
      if (mArr.length % number)
        mArr = mArr.splice(0, mArr.length - (mArr.length % number));
      console.log(mArr);
      return mArr;
    });

  const divideIntoNumber = (arr, num) =>
    arr
      .map((v, i) => {
        if (v.length == num) return v;
        if (Array.isArray(v)) return divideIntoNumber(v, num);
        if (!((i + 1) % num)) {
          const newIndexSubst = i - (num - 1) < 0 ? 0 : i - (num - 1);
          const returned = [...arr].slice(newIndexSubst, i + 1);
          return returned;
        }
        return undefined;
      })
      .filter((v) => v);

  const compareRhytmWithArr = (arrComp, objComp) => {
    return arrComp.map((line) =>
      line
        .map((feet) =>
          Object.values(objComp)
            .map(
              (v, ix) => v.join("") == feet.join("") && Object.keys(objComp)[ix]
            )
            .filter((v) => v)
        )
        .map((arr) => (arr.length ? arr[0] : "--"))
    );
  };

  const twoFeets = (arr) => {
    console.log("TWO");
    const lengthFilteredArr = transformLength(arr, 2);
    console.log("lengthFilteredArr");
    console.log(lengthFilteredArr);
    const twoArr = divideIntoNumber(lengthFilteredArr, 2);
    console.log("two arr");
    console.log(twoArr);
    const resultKeys = compareRhytmWithArr(twoArr, rhytmNames.dos);
    console.log("resultKeys");
    console.log(resultKeys);
    return resultKeys;
  };

  // const threeFeets = (arr) => {
  //   console.log("THREE");
  //   if (arr.length % 3) arr = arr.splice(0, arr.length - (arr.length % 3));
  //   const threeArr = divideIntoNumber(arr, 3);
  //   const resultKeys = compareRhytmWithArr(threeArr, rhytmNames.tres);
  //   console.log({ threeArr, resultKeys });
  // };

  const namesTwo = twoFeets(prepareBits);
  // threeFeets(prepareBits);

  const calcBits = prepareBits
    .reduce(
      (a, c) => (a[0] = a.map((b, i) => b & c[i])),
      Array(maxMetricLine).fill(1)
    )
    .filter((v) => v).length;

  return { points: calcBits / averageMetricLines, name: namesTwo };
};

const meterScore = (meters) => {
  const idealChangeMeterTime = 3;
  const numEqualMeters = meters.length - [...new Set(meters)].length;
  return numEqualMeters / (meters.length / idealChangeMeterTime);
};

async function evaluateOriginality(poem) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci/completions",
      {
        prompt: `Evaluate between 0 and 1 the originality and rhetorical devices in this poem: ${poem}`,
        max_tokens: 50,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY_OPENAI}`,
        },
      }
    );

    const originalityScore = response.data.choices[0].text.trim();
    return parseFloat(originalityScore);
  } catch (error) {
    console.error("Error evaluating originality:", error.message);
    return "--";
  }
}

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
    // console.log({ evaluation });

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
