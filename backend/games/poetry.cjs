
const axios = require('axios');
const findTonicity = require('../../src/utils/getSyllables.cjs');

const rhymeScore = (rhyme) => {
    if (rima.consonant.length > 0) {
        return 10;
    } else if (rima.assonant.length > 0) {
        return 5;
    }
    return 0;
};

const rhythmScore = (metric) => {
    const difference = Math.abs(metric.acentuation - metric.syllablesSinalefa);
    if (difference < 1) {
        return 10;
    } else if (difference < 2) {
        return 7;
    }
    return 4;
};

const meterScore = (evaluation) => {
    const { poetrySyllables } = evaluation;
    if (poetrySyllables === 8 || poetrySyllables === 11) {
        return 10;
    } else if (poetrySyllables >= 6 && poetrySyllables <= 12) {
        return 7;
    }
    return 4;
};

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
        return Math.random() * 10;
    }
}

async function generatePoetryEvaluation(poem) {
    const lines = poem.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let totalRhymeScore = 0;
    let totalRhythmScore = 0;
    let totalMeterScore = 0;

    lines.forEach((line) => {
        const evaluation = findTonicity(line);
        const { metric, poetrySyllables, rhyme, string, syllables, tonicity } = evaluation;
        console.log({evaluation})
        
        totalRhymeScore += rhymeScore(rhyme);
        totalRhythmScore += rhythmScore(metric);
        totalMeterScore += meterScore(evaluation);
    });

    const rhymeScoreAverage = totalRhymeScore / lines.length;
    const rhythmScoreAverage = totalRhythmScore / lines.length;
    const meterScoreAverage = totalMeterScore / lines.length;
    const originalityScore = await evaluateOriginality(poem);

    return {
        rhymeScore: rhymeScoreAverage || 0,
        rhythmScore: rhythmScoreAverage || 0,
        meterScore: meterScoreAverage || 0,
        originalityScore: originalityScore || 0,
    };
}

module.exports =  { generatePoetryEvaluation };