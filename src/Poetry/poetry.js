import { io } from "socket.io-client";
import "./poetry.css";

const socket = io("http://localhost:3000/");
socket.on("connect", () => console.log("Connected in the client-side"));

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

  button.textContent = "Enviar línea";
  poetryGame.appendChild(input);
  poetryGame.appendChild(button);

  let poem = "";

  button.addEventListener("click", () => {
    const line = input.value;
    poem += line + "\n";
    socket.emit("line", line);
    input.value = "";
  });

  socket.on("line", (line) => {
    const p = document.createElement("p");
    p.textContent = line;
    poetryGame.insertBefore(p, input);
    window.scrollTo(0, window.innerHeight);
  });

  socket.on("evaluation", (evaluation) => {
    // console.log({evaluation});
    evaluationDialog.showModal();
    evaluationFeets.innerHTML = `
    <h3>Índices de Sílabas Tónicas:</h3>
    <div>${evaluation.returnedHtml}</div>`;
    evaluationPoints.innerHTML = `
            <p>Rima: ${evaluation.rhymeScore}</p>
            <p>Ritmo: ${evaluation.rhythmScore}</p>
            <p>Métrica: ${evaluation.meterScore}</p>
            <p>Originalidad: ${evaluation.originalityScore}</p>
            <p>Pies Métricos: ${evaluation.rhythmName}</p>
        `;
  });

  const evaluateButton = document.createElement("button");
  evaluateButton.textContent = "Evaluar Poema";
  poetryGame.appendChild(evaluateButton);
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
