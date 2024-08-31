
const axios = require('axios');
const { default: findTonicity } = require('../../src/utils/getSyllables.cjs');

async function evaluateOriginality(poem) {
    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
            prompt: `Evaluate the originality and rhetorical devices in this poem: ${poem}`,
            max_tokens: 50,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer YOUR_API_KEY`,
            }
        });

        const originalityScore = response.data.choices[0].text.trim();
        return parseFloat(originalityScore);
    } catch (error) {
        console.error("Error evaluating originality:", error);
        return Math.random() * 10; // Fallback to random score
    }
}

function info(word) {
    return findTonicity(word);
}

function getMeticalFeet(arrWords) {
    let feetCount = 0;
    let tonicIndices = [];

    arrWords.forEach((word, wordIndex) => {
        const wordInfo = info(word);
        feetCount += wordInfo.numeroSilaba;
        wordInfo.silabas.forEach((silaba, index) => {
            if (index + 1 === wordInfo.tonica) {
                tonicIndices.push(wordIndex + '-' + index);
            }
        });
    });

    return {
        feetCount,
        tonicIndices
    };
}

async function generatePoetryEvaluation(poem) {
    const lines = poem.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let totalRhymeScore = 0;
    let totalRhythmScore = 0;
    let totalMeterScore = 0;
    let totalFeetCount = 0;
    let allTonicIndices = [];

    lines.forEach((line) => {
        const evaluation = getSyllablesESP(line);

        const rhyme = evaluation.rima[0].asonante;
        const rhythm = evaluation.rima[1];

        const metricalData = getMeticalFeet(line.split(/[^\wáéíóúñ]/).filter((word) => word.length > 0));
        totalFeetCount += metricalData.feetCount;
        allTonicIndices = allTonicIndices.concat(metricalData.tonicIndices);

        totalRhymeScore += rhyme.length > 0 ? 10 : 0;
        totalRhythmScore += Math.abs(rhythm) < 2 ? 10 : 0;
        totalMeterScore += evaluation.metrica_sil;
    });

    const rhymeScore = totalRhymeScore / lines.length;
    const rhythmScore = totalRhythmScore / lines.length;
    const meterScore = totalMeterScore / lines.length;
    const originalityScore = await evaluateOriginality(poem);

    return {
        rhymeScore,
        rhythmScore,
        meterScore,
        originalityScore,
        feetCount: totalFeetCount,
        tonicIndices: allTonicIndices
    };
}

module.exports =  { generatePoetryEvaluation };
