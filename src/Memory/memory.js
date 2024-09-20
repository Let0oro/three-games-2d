import axios from "axios";
import "./memory.css";

document.addEventListener("DOMContentLoaded", () => {
  const memoryGame = document.getElementById("memory-game");
  let firstCard, secondCard;
  let lockBoard = false;

  async function getCatImages() {
    try {
      const { data } = await axios.get("http://localhost:3000/memory");
      return data.cards;
    } catch (error) {
      console.error("Error fetching cat images:", error);
    }
  }

  async function createBoard() {
    const cards = await getCatImages();
    shuffle(cards);
    cards.forEach((card) => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.dataset.value = card;

      const cardInner = document.createElement("div");
      cardInner.classList.add("card-inner");

      const cardFront = document.createElement("div");
      cardFront.classList.add("card-front");

      const cardBack = document.createElement("div");
      cardBack.classList.add("card-back");
      cardBack.innerHTML = `<img src="${card}" alt="Cat Image" />`;

      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      div.appendChild(cardInner);

      div.addEventListener("click", flipCard);
      memoryGame.appendChild(div);
    });
  }

  function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }

  function flipCard() {
    if (lockBoard) return;
    this.classList.add("flipped");
    if (!firstCard) {
      firstCard = this;
      return;
    }
    secondCard = this;
    checkForMatch();
  }

  function checkForMatch() {
    if (firstCard.dataset.value === secondCard.dataset.value) {
      const areAllFlipped = [...memoryGame.children].every((div) =>
        div.classList.contains("flipped")
      );
      if (areAllFlipped) {
        alert("Congratulations, the game is finished!, restarting...");

        setTimeout(() => {
          memoryGame.innerHTML = "";
          createBoard();
        }, 1000);
      } else resetBoard();
    } else {
      lockBoard = true;
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
      }, 1000);
    }
  }

  function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  createBoard();
});
