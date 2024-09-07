import { io } from "socket.io-client";
import "./poetry.css";

let myTurn;
let turnPlayers = 0;

const socket = io("http://localhost:3000/");
socket.on("connect", () => {
  console.log("Connected in the client-side");
  socket.emit("newPlayer");
  socket.emit("myTurn");
});

const createEl = (tag, className) => {
  const el = document.createElement(tag);
  el.className = className || "";
  return el;
};

document.addEventListener("DOMContentLoaded", async () => {
  const poetryGame = document.getElementById("poetry-game");
  const input = createEl("input");
  const button = createEl("button");
  const evaluationDialog = document.querySelector("dialog.evaluation");
  const evaluationPoints = document.querySelector(".evaluation_points");
  const evaluationFeets = document.querySelector(".evaluation_feets");
  const dialogButton = document.querySelector("dialog button");
  const evaluateButton = document.createElement("button");
  evaluateButton.textContent = "Evaluar Poema";
  
  button.textContent = "Enviar línea";
  poetryGame.appendChild(input);
  poetryGame.appendChild(button);
  poetryGame.appendChild(evaluateButton);
  
  let poem = "";

  button.addEventListener("click", () => {
    const line = input.value;
    poem += line + "\n";
    socket.emit("line", line);
    input.value = "";
    input.disabled = true;
    button.disabled = true;
    evaluateButton.disabled = true;
  });

  socket.emit("myTurn");
  socket.on("myTurn", (number) => {
    myTurn = myTurn != null ? myTurn : number;
    if (myTurn !== turnPlayers) {
      input.disabled = true;
      button.disabled = true;
      evaluateButton.disabled = true;
    }
  });

  socket.on("getTurn", (turn) => {
    turnPlayers = turn;
    if (turnPlayers == myTurn) {
      input.disabled = false;
      button.disabled = false;
      evaluateButton.disabled = false;
    }
  });

  socket.on("line", (line) => {
    const p = document.createElement("p");
    p.textContent = line;
    poetryGame.insertBefore(p, input);
    window.scrollTo(0, window.innerHeight);
    socket.emit("getTurn");
  });

  socket.on("evaluation", (evaluation) => {
    const {
      returnedHtml,
      rhythmName,
      rhymeScore,
      rhythmScore,
      meterScore,
      originalityScore,
    } = evaluation;
    evaluationDialog.showModal();
    evaluationFeets.innerHTML = `
    <h3>Índices de Sílabas Tónicas:</h3>
    <div>${returnedHtml}</div>
    <br/>
    <h3>Pies Métricos:</h3> 
    <div>${rhythmName.map((feet) => `<p>${feet.join(" / ")}</p>`).join("")}</div>
    `;

    const sumPoints =
      Number(rhymeScore) +
      Number(rhythmScore) +
      Number(meterScore) +
      Number(originalityScore);

    evaluationPoints.innerHTML = `
            <h3>Puntos:</h3> 
            <p>Rima: ${rhymeScore}</p>
            <p>Ritmo: ${rhythmScore}</p>
            <p>Métrica: ${meterScore}</p>
            <p>Originalidad: ${originalityScore.toFixed(2)}</p>
            <p><b>Total: </b><span class="hig">${(sumPoints / 0.4).toFixed(2)} / 10</span></p>
        `;
  });


  dialogButton.addEventListener("click", () => evaluationDialog.close());

  evaluateButton.addEventListener("click", () => {
    socket.emit(
      "evaluate",
      poem ||
        `Por el pan baila el can
      Baila el can por el pan`
    );
  });
});
