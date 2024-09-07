require("dotenv").config();
// const OpenAI = require("openai");
// const openai = new OpenAI({ apiKey: process.env.API_KEY_OPENAI });

const evaluateOriginality = async (poem) => {
  
    return Math.random();
  
//!  This was the legal way
  // await openai.chat.completions.create({
  //   model: "gpt-3.5-mini",
  //   messages: [
  //     {
  //       role: "system",
  //       content: "You are a very helpful linguistics teacher.",
  //     },
  //     {
  //       role: "user",
  //       content: `Evaluate between 0 and 1 the originality and rhetorical devices in this poem: ${poem}`,
  //     },
  //   ],
  // });
};

module.exports = evaluateOriginality;
