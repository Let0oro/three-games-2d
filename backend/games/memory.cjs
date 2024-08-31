const axios = require("axios");

async function memoryserver(req, res) {
  try {
    const { data } = await axios.get(
      "https://api.thecatapi.com/v1/images/search?limit=3",
      {
        headers: {
          "x-api-key": process.env.API_KEY_CATS,
        },
      }
    );
    let images = data.map((cat) => cat.url);
    images.length = 3;
    const cards = [...images, ...images];

    res.json({ cards });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).send("Error fetching images");
  }
}

module.exports = { memoryserver };
