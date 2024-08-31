import "./tictactoe.css";

const tilesRowTicTacToe = (parent) => {
  const parentRowsEls = [...parent.querySelectorAll(".row")];
  const rowsTilesText = parentRowsEls.map((row) => row.textContent);
  return {
    parentRowsEls,
    rowsTilesText,
  };
};

const signalWin = (type, location, parentRowsEls, parent) =>
  ({
    row: () => {
      [...parentRowsEls[location].children].forEach((tile) => {
        tile.style.backgroundColor = "#4e4";
      });
    },
    column: () => {
      parent
        .querySelectorAll(`.tile[aria-data-column="${location}"]`)
        .forEach((tile) => (tile.style.backgroundColor = "#4e4"));
    },
    diagonal: () => {
      const selector = (t) =>
        `.tile[aria-data-row="${t[0]}"][aria-data-column="${t[1]}"]`;
      ({
        right: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
        left: [
          [0, 2],
          [1, 1],
          [2, 0],
        ],
      })[location].forEach((t) => {
        document.querySelector(selector(t)).style.backgroundColor = "#4c4";
      });
    },
  })[type]();


const winnerCombinations = (parent, symbol) => {
  const { parentRowsEls, rowsTilesText } = tilesRowTicTacToe(parent);
  let rowWin, columnWin, diagonalWin;

  if (
    !rowsTilesText.every(
      (row) => row[0] == " " || row[1] == " " || row[2] == " "
    )
  ) {
    rowWin = rowsTilesText.map((row, i) => ["XXX", "OOO"].includes(row) && i);
    rowWin = rowWin.find((c) => /[0-9]/gi.test(String(c)));
  }

  if (rowsTilesText[0] != "   ") {
    columnWin = rowsTilesText.map((y, i, arr) =>
      y
        .split("")
        .map((_, j) => arr[j][i])
        .join("")
    );
    columnWin = columnWin.map((row, i) => ["XXX", "OOO"].includes(row) && i);
    columnWin = columnWin.find((c) => /[0-9]/gi.test(String(c)));
  }

  if (rowsTilesText[1][1] != " ") {
    diagonalWin = {
      right: rowsTilesText.map((row, i) => row[i]).join(""),
      left: rowsTilesText.map((row, i) => row[row.length - i - 1]).join(""),
    };
    const values = Object.values(diagonalWin);
    const keys = Object.keys(diagonalWin);
    diagonalWin = values
      .map((d, i) => ["XXX", "OOO"].includes(d) && keys[i])
      .filter((d) => d);
  }

  if (columnWin != undefined || rowWin != undefined || diagonalWin.length) {
    if (columnWin != undefined)
      signalWin("column", columnWin, parentRowsEls, parent);
    if (rowWin != undefined) signalWin("row", rowWin, parentRowsEls, parent);
    if (diagonalWin.length)
      signalWin("diagonal", diagonalWin, parentRowsEls, parent);
    alert(`${symbol} wins!`);
    return true;
  }
};

const badEffect = (self) => {
  self.style.backgroundColor = "#c33";
  setTimeout(() => {
    self.style.backgroundColor = "#fff";
  }, 400);
  return;
};

document.addEventListener("DOMContentLoaded", () => {
  const parent = document.getElementById("tictactoe-game");
  const showTurn = document.getElementById("tictactoe-turn");
  const showMovs = document.getElementById("tictactoe-movements");
  let turn = 1;
  let finished;

  const div = document.createElement("div");
  div.className = "tile";
  const arrDivs = Array(3).fill(Array(3).fill(div));

  parent.innerHTML = `
    ${arrDivs
      .map((row, y) => {
        const divRow = document.createElement("div");
        divRow.className = "row";

        divRow.innerHTML = row
          .map((tile, x) => {
            tile.setAttribute("aria-data-row", y);
            tile.setAttribute("aria-data-column", x);
            tile.innerHTML = " ";
            return tile.outerHTML;
          })
          .join("");

        return divRow.outerHTML;
      })
      .join("")}
    `;

  parent.querySelectorAll(".tile").forEach((tile) =>
    tile.addEventListener("click", function () {
      const text = this.innerHTML;
      const currentTurnSymbol = turn & 1 ? "O" : "X";
      const { rowsTilesText: prevArr } = tilesRowTicTacToe(parent);

      if (finished && confirm("The game is finished, reload?")) {
        return parent.querySelectorAll(".tile").forEach(tile => {
            tile.innerHTML = " ";
            tile.removeAttribute("aria-data-player");
            tile.style.backgroundColor = "#f0f0f0"
            finished = false;
            turn = 1;
            showTurn.innerHTML = "Turn: "
            showMovs.innerHTML = "Movements: "
        })
      }

      if (/\s+/gi.test(prevArr.join("")) && text.trim()) return badEffect(this);
      if (text == currentTurnSymbol) return badEffect(this);

      this.innerHTML = currentTurnSymbol;
      this.setAttribute("aria-data-player", this.innerHTML);
      if (turn > 4) finished = winnerCombinations(parent, currentTurnSymbol);

      showTurn.innerHTML = "Turn: " + ((turn + 1) & 1 ? "O" : "X");
      showMovs.innerHTML = "Movements: " + turn;

      turn++;
    })
  );
});