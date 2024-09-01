import { io } from "socket.io-client";

const socket = io("http://localhost:3000/");
socket.on("connect", () => console.log("Connected in the client-side"));

const createEl = (tag, className) => {
  const el = document.createElement(tag);
  el.className = className || "";
  return el;
};

document.addEventListener("DOMContentLoaded", async () => {


  const poetryGame = document.getElementById("poetry-game");
  const textarea = createEl("textarea");
  const button = createEl("button");
  const evaluationDiv = createEl("div");

  button.textContent = "Enviar línea";
  poetryGame.appendChild(textarea);
  poetryGame.appendChild(button);
  poetryGame.appendChild(evaluationDiv);

  let poem = "";

  button.addEventListener("click", () => {
    const line = textarea.value;
    poem += line + "\n";
    socket.emit("line", line);
    textarea.value = "";
  });

  socket.on("line", (line) => {
    const p = document.createElement("p");
    p.textContent = line;
    poetryGame.insertBefore(p, textarea);
  });

  socket.on("evaluation", (evaluation) => {
    console.log({evaluation})
    // evaluationDiv.innerHTML = `
    //         <p>Rima: ${evaluation.rhymeScore.toFixed(2)}</p>
    //         <p>Ritmo: ${evaluation.rhythmScore.toFixed(2)}</p>
    //         <p>Métrica: ${evaluation.meterScore.toFixed(2)}</p>
    //         <p>Originalidad: ${evaluation.originalityScore.toFixed(2)}</p>
    //         <p>Pies Métricos: ${evaluation.feetCount}</p>
    //         <p>Índices de Sílabas Tónicas: ${evaluation.tonicIndices.join(", ")}</p>
    //     `;
  });

  const evaluateButton = document.createElement("button");
  evaluateButton.textContent = "Evaluar Poema";
  poetryGame.appendChild(evaluateButton);

  evaluateButton.addEventListener("click", () => {
    socket.emit("evaluate", poem);
  });
});
