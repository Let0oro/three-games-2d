localStorage.debug = "socket.io-client:socket";
import "./src/Tictactoe/tictactoe.js";
import "./src/Poetry/poetry.js";
import "./src/Memory/memory.js";

const noneDisplays = (...elems) => {
  const message = document.querySelector(".message");
  [...elems, message].forEach((el) => (el.style.display = "none"));
};

document.addEventListener("DOMContentLoaded", () => {
  const memoryLink = document.querySelector('a[href="#memory"]');
  const tictactoeLink = document.querySelector('a[href="#tictactoe"]');
  const poetryLink = document.querySelector('a[href="#poetry"]');

  const memorySection = document.querySelector("#memory");
  const poetrySection = document.querySelector("#poetry");
  const tictactoeSection = document.querySelector("#tictactoe");

  memoryLink.addEventListener("click", () => {
    noneDisplays(poetrySection, tictactoeSection);
    memorySection.style.display = "block";

  });
  tictactoeLink.addEventListener("click", () => {
    noneDisplays(poetrySection, memorySection);
    tictactoeSection.style.display = "block";

  });
  poetryLink.addEventListener("click", () => {
    noneDisplays(memorySection, tictactoeSection);
    poetrySection.style.display = "block";

  });
});
