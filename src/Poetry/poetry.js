import { io } from "socket.io-client";



document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    socket.connect();
    console.log("isActive", socket.active);
    socket.on("connect", () => console.log("Connected in the client-side"));
    
    
    const poetryGame = document.getElementById('poetry-game');
    const textarea = document.createElement('textarea');
    const button = document.createElement('button');
    const evaluationDiv = document.createElement('div');

    button.textContent = 'Enviar línea';
    poetryGame.appendChild(textarea);
    poetryGame.appendChild(button);
    poetryGame.appendChild(evaluationDiv);

    let poem = '';

    button.addEventListener('click', () => {
        const line = textarea.value;
        poem += line + '\n';
        socket.emit('line', line);
        textarea.value = '';
    });

    socket.on('line', (line) => {
        const p = document.createElement('p');
        p.textContent = line;
        poetryGame.insertBefore(p, textarea);
    });

    socket.on('evaluation', (evaluation) => {
        evaluationDiv.innerHTML = `
            <p>Rima: ${evaluation.rhymeScore.toFixed(2)}</p>
            <p>Ritmo: ${evaluation.rhythmScore.toFixed(2)}</p>
            <p>Métrica: ${evaluation.meterScore.toFixed(2)}</p>
            <p>Originalidad: ${evaluation.originalityScore.toFixed(2)}</p>
            <p>Pies Métricos: ${evaluation.feetCount}</p>
            <p>Índices de Sílabas Tónicas: ${evaluation.tonicIndices.join(', ')}</p>
        `;
    });

    const evaluateButton = document.createElement('button');
    evaluateButton.textContent = 'Evaluar Poema';
    poetryGame.appendChild(evaluateButton);

    evaluateButton.addEventListener('click', () => {
        socket.emit('evaluate', poem);
    });
});
