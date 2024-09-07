const conson = '[bcdfghjklmnñpqrstvwxyz]*';
const vowels = '[aeiouáéíóúü]+';
const prefix = '(\\s+)[aeyou]?(\\s+)';
const vowelsOpen = '[aeoáéó]';
const vowelsClose = '[iuíú]';
const prepsProns =
  'a, ante, bajo, cabe, con, contra, de, desde, durante, en, entre, hacia, hasta, mediante, para, por, según, sin, so, sobre, tras, versus, vía, el, lo, la, le, se, los, las, les, lo'.split(
    ', '
  );

const condReg = (pre, pos) => `[${pre}](?=(${pos}))`;

const hiatoPattern = `(${vowelsOpen}(?=${vowelsOpen})|${vowelsOpen}${vowelsClose}(?=(${vowelsClose}))|[aeo](?=[íú])|[íú](?=[aeo])|${vowels})`;

const bilabialLabiodental = 'mpbf';
const dentalAlveolar = 'tdnsrl';
const palatalVelar = 'ñchkgyx';

const condComplexCons = condReg(
  `${bilabialLabiodental}${dentalAlveolar}${palatalVelar}`,
  `[${bilabialLabiodental}${dentalAlveolar}${palatalVelar}]|$|\\s`
);

const syllablePattern = new RegExp(
  `(${conson}${hiatoPattern}(${condComplexCons})?|(${prefix})?|${hiatoPattern}(${condComplexCons})?)`,
  'gi'
);

function getRhyme(syllables) {
  let finalSyl = syllables.splice(-2);
  const type = {
    assonant: finalSyl.join('-').replace(/[^aeiouáéíóú\-]/gi, ''),
    consonant: finalSyl.join('-'),
  };
  return type;
}

function sinalefaMetric(
  currentSyllable,
  accumulatorSyllable,
  arraySyllablesPhrase,
  indexSyllables
) {
  return currentSyllable.reduce(
    (a, c, ix, array) => {
      const target = Number(accumulatorSyllable.sinalef[0]);
      const end = a.len + c.length;
      const singleFeet = [];
      if (target <= end && a.len <= target) {
        singleFeet.push(c);
        if (array.length - 1 == ix) {
          const nextArr = arraySyllablesPhrase[indexSyllables + 1];
          const { syllables: nextSyllables, word: nextWord } = nextArr;
          const next = nextSyllables[0] || nextWord;
          singleFeet.push(next);
          a.removerForFeets++;
          const sylNextWord =
            arraySyllablesPhrase[indexSyllables + 2]?.syllables;

          if (
            sylNextWord &&
            !(sylNextWord.length - 1) &&
            !(sylNextWord.at(-1).length - 1) &&
            RegExp(vowels).test(sylNextWord[0][0])
          ) {
            const nextArr = arraySyllablesPhrase[indexSyllables + 2];
            const { syllables: nextSyllables, word: nextWord } = nextArr;
            const next = nextSyllables[0] || nextWord;
            singleFeet.push(next);
            a.removerForFeets++;
            const sylNextWord =
              arraySyllablesPhrase[indexSyllables + 3]?.syllables;

            if (
              sylNextWord &&
              !(sylNextWord.length - 1) &&
              !(sylNextWord.at(-1).length - 1) &&
              RegExp(vowels).test(sylNextWord[0][0])
            ) {
              const nextArr = arraySyllablesPhrase[indexSyllables + 3];
              const { syllables: nextSyllables, word: nextWord } = nextArr;
              const next = nextSyllables[0] || nextWord;
              singleFeet.push(next);
              a.removerForFeets++;
            }
          }
        }
      }
      return {
        len: end + !!ix,
        indexAcc: a.indexAcc + array.length,
        removerForFeets: a.removerForFeets,
        finalSyl: singleFeet,
      };
    },
    { len: 0, indexAcc: 0, removerForFeets: 0, finalSyl: [] }
  );
}

function getSyllables(word) {
  if (word.length == 1 && word.trim() == 'y') return ['y'];
  return (
    word
      .match(syllablePattern)
      .map((s) => s.trim())
      .filter((s) => !!s.length) || []
  );
}

function getMetricFeets(
  text,
  syllables,
  syllablesSinalefa,
  indexSinalefa,
  syllablesWords
) {
  let feets;
  // if (indexSinalefa != null) {
  feets = syllablesWords.reduce(
    (
      acc,
      { syllableIndex: indexCurr, syllables: sylCurr, word: wordCurr },
      i,
      arr
    ) => {
      let sinSilCurr;
      if (acc.removerForFeets) {
        sinSilCurr = [...sylCurr].slice(acc.removerForFeets);
      }
      if (indexCurr != null) {
        let newFeetStart = [...sylCurr].slice(0, indexCurr - 1);
        if (newFeetStart.length) {
          newFeetStart = newFeetStart.reduce((a, c) => a + c.length, 0);
        } else {
          newFeetStart = 0;
        }
        let newFeetFinish =
          newFeetStart + sylCurr[indexCurr - 1]?.length || wordCurr.length;
        acc.arrFeetsPos.push([
          acc.currLength + newFeetStart,
          acc.currLength + newFeetFinish,
        ]);
      }

      acc.currLength = acc.currLength + wordCurr.length + (arr.length - 1 != i);
      const newTonicSyl = (sinSilCurr || sylCurr).map((s, i) =>
        i == indexCurr - 1 - (acc.removerForFeets || 0) ? 1 : 0
      );
      acc.removerForFeets = 0;
      acc.metricFeets.push(newTonicSyl.flat());
      if (acc?.sinalef?.length && acc.currLength > acc.sinalef[0]) {
        const detailedSyl = sinalefaMetric(sylCurr, acc, arr, i);

        acc.sinalef.shift();
        const { finalSyl, removerForFeets } = detailedSyl;
        acc.newSyl.push(finalSyl);
        acc.removerForFeets = removerForFeets;
      }

      return acc;
    },
    {
      currLength: 0,
      arrFeetsPos: [],
      metricFeets: [],
      sinalef: indexSinalefa,
      newSyl: [],
      removerForFeets: 0,
    }
  );
  const { arrFeetsPos, currLength, metricFeets } = feets;

  feets = { arrFeetsPos, currLength, metricFeets: metricFeets.flat() };
  return feets;
}

function countSinalefa(string) {
  const regSin = /[aeiouáéíóúy]\s(y\s)?(h?)[aeiouáéíóúy]/gi;
  const sinalefas = string.match(regSin) || [];
  if (/\s/gi.test(string)) {
    const indexSinalefa = string
      .replace(regSin, (v, $1, $2, i) => i)
      .match(/\d+/gi);
    return { sinalefasNumber: sinalefas.length, indexSinalefa };
  }
  return { sinalefasNumber: sinalefas.length };
}

function getPoetryLength(text, syllables, dataLastWord) {
  const syllablesNumber = syllables?.length || 0;
  const { sinalefasNumber, indexSinalefa } = countSinalefa(text);
  const { syllableIndex } = dataLastWord;
  let syllablesLastWord;
  if (/\s/gi.test(text)) {
    syllablesLastWord = dataLastWord.syllables;
  } else {
    syllablesLastWord = syllables;
  }

  const syllablesSinalefa = syllablesNumber - sinalefasNumber;
  if (!syllablesLastWord) return syllablesSinalefa;

  let acentuation = syllablesLastWord.length - syllableIndex;
  acentuation = acentuation ? (!(acentuation - 1) ? 0 : -1) : 1;
  acentuation = syllablesSinalefa + acentuation;

  if (/\s/gi.test(text)) {
    return { acentuation, syllablesSinalefa, indexSinalefa };
  } else {
    return { acentuation, syllablesSinalefa };
  }
}

function getPoetrySyllables(text, syllables, dataLastWord) {
  const { acentuation, syllablesSinalefa, indexSinalefa } = getPoetryLength(
    text,
    syllables,
    dataLastWord
  );

  return { acentuation, syllablesSinalefa, indexSinalefa };
}

function findTonicity(word) {
  word = word.replace(/[^a-záéíóúü ]/gi, '');

  if (!word.trim().length) return;

  if (!/[aeiouáéíóúüy]/gi.test(word.trim()))
    return { error: 'The main part of a syllable is a vowel' };

  const syllables = getSyllables(word);

  // console.log({ syllables });

  let returned;

  if (/\s/gi.test(word.trim())) {
    const words = word.trim().split(' ');
    const syllablesWords = words.map((w) => findTonicity(w));
    const syllablesLastWord = syllablesWords.at(-1);

    const {
      acentuation: poetrySyllables,
      syllablesSinalefa,
      indexSinalefa,
    } = getPoetrySyllables(word, syllables, syllablesLastWord);

    const metricFeets = getMetricFeets(
      word,
      syllables,
      syllablesSinalefa,
      indexSinalefa,
      syllablesWords
    );

    const rhyme = getRhyme(syllables);

    returned = {
      tonicity: word.split(' ').map((str) => findTonicity(str)),
      poetrySyllables,
      string: word,
      syllables,
      rhyme,
      metric: metricFeets,
    };
    return returned;
  }

  const accentedVowelMatch = word.match(/[áéíóú]/gi);

  if (prepsProns.includes(word)) {
    return {
      tonicSyllable: '',
      syllableIndex: null,
      word,
      syllables,
    };
  } else {
    if (accentedVowelMatch) {
      const accentedVowel = accentedVowelMatch[0];
      for (let i = 0; i < syllables.length; i++) {
        if (syllables[i].includes(accentedVowel)) {
          returned = {
            tonicSyllable: syllables[i],
            syllableIndex: i + 1,
            word,
            syllables,
          };
        }
      }
    } else {
      const lastLetter = word[word.length - 1];
      const isLlana = ['n', 's', 'a', 'e', 'i', 'o', 'u'].includes(lastLetter);

      if (syllables.length > 0 && syllables.length == 1) {
        returned = {
          tonicSyllable: syllables[0],
          syllableIndex: 1,
          word,
          syllables,
        };
      } else {
        if (isLlana) {
          returned = {
            tonicSyllable: syllables[syllables.length - 2],
            syllableIndex: syllables.length - 1,
            word,
            syllables,
          };
        } else {
          returned = {
            tonicSyllable: syllables[syllables.length - 1],
            syllableIndex: syllables.length,
            word,
            syllables,
          };
        }
      }
    }
  }

  const {
    acentuation: poetrySyllables,
    syllablesSinalefa,
    indexSinalefa,
  } = getPoetrySyllables(word, syllables, returned);

  return { ...returned, poetrySyllables };
}

module.exports = findTonicity;