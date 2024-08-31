const conson = '[bcdfghjklmnñpqrstvwxyz]*';
const vowels = '[aeiouáéíóúü]+';
const prefix = '(\\s+)[aeyou]?(\\s+)';
const vowelsOpen = '[aeoáéó]';
const vowelsClose = '[iuíú]';

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

function getSyllables(word) {
  return (
    word
      .match(syllablePattern)
      .map((s) => s.trim())
      .filter((s) => !!s.length) || []
  );
}

function getMetricFeets(syllables, syllableIndex) {}

function countSinalefa(string) {
  const regSin = /[aeiouáéíóúy]\s(y\s)?(h?)[aeiouáéíóúy]/gi;
  const sinalefas = string.match(regSin) || [];
  return sinalefas.length;
}

function getPoetryLength(text, syllables, dataLastWord) {
  const syllablesNumber = syllables?.length || 0;
  const sinalefasNumber = countSinalefa(text);
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

  return acentuation;
}

function getPoetrySyllables(text, syllables, dataLastWord) {
  const acentuation = getPoetryLength(text, syllables, dataLastWord);

  return acentuation;
}

function findTonicity(word) {
  word = word.replace(/[^a-záéíóúü ]/gi, '');

  if (!word.trim().length) return;

  if (!/[aeiouáéíóúüy]/gi.test(word.trim()))
    return { error: 'The main part of a syllable is a vowel' };

  const syllables = getSyllables(word);

  let returned;

  if (/\s/gi.test(word.trim())) {
    const lastWord = word.trim().split(' ').at(-1);
    const syllablesLastWord = findTonicity(lastWord);

    const poetrySyllables = getPoetrySyllables(
      word,
      syllables,
      syllablesLastWord
    );

    returned = {
      tonicity: word.split(' ').map((str) => findTonicity(str)),
      poetrySyllables,
      string: word,
      syllables,
    };
    return returned;
  }

  const accentedVowelMatch = word.match(/[áéíóú]/gi);

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

  const poetrySyllables = getPoetrySyllables(word, syllables, returned);

  return { ...returned, poetrySyllables };
}


module.exports = findTonicity;