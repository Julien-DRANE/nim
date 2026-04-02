const gameModes = {
  line16: {
    label: "16 allumettes",
    piles: [16],
    takesLastWins: false,
    maxTake: 3,
    intro:
      "Répartis seize allumettes en ligne. Chaque joueur prend une, deux ou trois allumettes, et celui qui prend la dernière a perdu.",
    helper: "Version simple : une seule ligne, retrait limité à 1, 2 ou 3 allumettes.",
    rulesOutcome:
      "Les règles du jeu de Nim sont simples : répartir seize allumettes en ligne ; chaque joueur, à tour de rôle, va prendre une, deux ou trois allumettes ; celui qui prend la dernière allumette a perdu.",
    rulesVariant: "Mode actuel : 16 allumettes sur une seule ligne, avec retrait limité à 3 maximum par tour.",
    rulesStrategy:
      "Stratégie gagnante : le joueur qui laisse un nombre d'allumettes congru à 1 modulo 4, soit 1, 5, 9, 13, s'assure la victoire.",
  },
  classic: {
    label: "Nim classique",
    piles: [3, 5, 7],
    takesLastWins: true,
    maxTake: null,
    intro:
      "Retire une ou plusieurs allumettes d'un seul tas à ton tour. Celui qui prend la dernière gagne.",
    helper: "Version classique : prendre la dernière allumette fait gagner.",
    rulesOutcome: "Le gagnant est celui qui prend la dernière allumette.",
    rulesVariant: "Mode actuel : 3 tas de 3, 5 et 7 allumettes. L'ordinateur essaie de te laisser une position perdante.",
    rulesStrategy: "Stratégie : utiliser le nim-sum pour laisser une position perdante à l'adversaire.",
  },
  marienbad: {
    label: "Jeu de Marienbad",
    piles: [1, 3, 5, 7],
    takesLastWins: false,
    maxTake: null,
    intro:
      "Dans la variante Marienbad, il y a 4 tas de 1, 3, 5 et 7 allumettes, mais celui qui prend la dernière perd.",
    helper: "Variante Marienbad : prendre la dernière allumette fait perdre.",
    rulesOutcome:
      "Dans le jeu de Marienbad, il y a 4 tas contenant 1, 3, 5 et 7 allumettes, mais c'est celui qui prend la dernière allumette qui perd.",
    rulesVariant: "Mode actuel : configuration Marienbad avec règle inverse sur la dernière allumette.",
    rulesStrategy: "Stratégie : en fin de partie, il faut gérer la parité des tas d'une allumette pour éviter de prendre la dernière.",
  },
};

const state = {
  modeKey: "line16",
  opponentKey: "computer",
  piles: [...gameModes.line16.piles],
  selectedPile: 0,
  turn: "player1",
  gameOver: false,
};

const introText = document.getElementById("introText");
const modeSelect = document.getElementById("modeSelect");
const modeHelper = document.getElementById("modeHelper");
const opponentSelect = document.getElementById("opponentSelect");
const opponentHelper = document.getElementById("opponentHelper");
const pileSelect = document.getElementById("pileSelect");
const removeCountInput = document.getElementById("removeCount");
const playButton = document.getElementById("playButton");
const restartButton = document.getElementById("restartButton");
const pilesContainer = document.getElementById("piles");
const rulesOutcome = document.getElementById("rulesOutcome");
const rulesVariant = document.getElementById("rulesVariant");
const rulesStrategy = document.getElementById("rulesStrategy");
const turnLabel = document.getElementById("turnLabel");
const message = document.getElementById("message");
const hint = document.getElementById("hint");

function getCurrentMode() {
  return gameModes[state.modeKey];
}

function getActorLabel(actor = state.turn) {
  if (actor === "player1") {
    return "Joueur 1";
  }

  if (actor === "player2") {
    return "Joueur 2";
  }

  return "Ordinateur";
}

function getPileLabel(index) {
  return state.piles.length === 1 ? "la ligne" : `le tas ${index + 1}`;
}

function isHumanTurn() {
  return state.turn === "player1" || state.turn === "player2";
}

function getNextActor(actor = state.turn) {
  if (state.opponentKey === "human") {
    return actor === "player1" ? "player2" : "player1";
  }

  return actor === "player1" ? "computer" : "player1";
}

function updateTurnLabel(text = getActorLabel()) {
  turnLabel.textContent = text;
}

function getSelectedRemoveCount() {
  const mode = getCurrentMode();
  const selectedCount = state.piles[state.selectedPile] || 0;
  const inputValue = Number(removeCountInput.value);
  const maxAllowed = mode.maxTake ? Math.min(selectedCount, mode.maxTake) : selectedCount;

  if (!Number.isInteger(inputValue) || inputValue < 1) {
    return maxAllowed > 0 ? 1 : 0;
  }

  return Math.min(inputValue, maxAllowed);
}

function renderPileOptions() {
  pileSelect.innerHTML = "";

  state.piles.forEach((count, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = state.piles.length === 1 ? `Ligne (${count})` : `Tas ${index + 1} (${count})`;
    option.disabled = count === 0;
    pileSelect.appendChild(option);
  });

  if (state.piles[state.selectedPile] === 0) {
    const nextPlayable = state.piles.findIndex((count) => count > 0);
    state.selectedPile = nextPlayable >= 0 ? nextPlayable : 0;
  }

  pileSelect.value = String(state.selectedPile);
}

function renderModeTexts() {
  const mode = getCurrentMode();

  modeSelect.value = state.modeKey;
  opponentSelect.value = state.opponentKey;
  introText.textContent = mode.intro;
  modeHelper.textContent = mode.helper;
  opponentHelper.textContent = state.opponentKey === "human"
    ? "Deux humains jouent chacun leur tour sur le même écran."
    : "Joueur 1 affronte l'ordinateur.";
  rulesOutcome.textContent = mode.rulesOutcome;
  rulesVariant.textContent = mode.rulesVariant;
  rulesStrategy.textContent = mode.rulesStrategy;
}

function renderPiles() {
  pilesContainer.innerHTML = "";

  state.piles.forEach((count, index) => {
    const pile = document.createElement("div");
    pile.className = "pile";
    pile.setAttribute("aria-label", `Tas ${index + 1}, ${count} allumette${count > 1 ? "s" : ""}`);
    pile.tabIndex = count > 0 && !state.gameOver && isHumanTurn() ? 0 : -1;

    if (index === state.selectedPile) {
      pile.classList.add("selected");
    }

    if (count === 0) {
      pile.classList.add("empty");
    }

    const pileHead = document.createElement("div");
    pileHead.className = "pile-head";

    const title = document.createElement("strong");
    title.textContent = state.piles.length === 1 ? "Ligne" : `Tas ${index + 1}`;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = count;

    pileHead.append(title, badge);

    const matches = document.createElement("div");
    matches.className = "matches";

    if (count === 0) {
      const emptyLabel = document.createElement("p");
      emptyLabel.textContent = "Vide";
      matches.appendChild(emptyLabel);
    } else {
      const previewRemoveCount = index === state.selectedPile ? getSelectedRemoveCount() : 0;
      const maxClickable = getCurrentMode().maxTake ? Math.min(count, getCurrentMode().maxTake) : count;

      for (let i = 0; i < count; i += 1) {
        const match = document.createElement("button");
        const removeCount = count - i;

        match.type = "button";
        match.className = "match";
        match.title = `Retirer ${removeCount} allumette${removeCount > 1 ? "s" : ""}`;
        match.setAttribute(
          "aria-label",
          `Choisir ${removeCount} allumette${removeCount > 1 ? "s" : ""} sur le tas ${index + 1}`,
        );
        match.disabled = state.gameOver || !isHumanTurn() || removeCount > maxClickable;

        if (removeCount <= previewRemoveCount) {
          match.classList.add("preview");
        }

        match.addEventListener("click", (event) => {
          event.stopPropagation();

          if (state.gameOver || !isHumanTurn()) {
            return;
          }

          state.selectedPile = index;
          removeCountInput.value = String(removeCount);
          pileSelect.value = String(index);
          setMessage(
            `${removeCount} allumette${removeCount > 1 ? "s" : ""} sélectionnée${removeCount > 1 ? "s" : ""} sur ${getPileLabel(index)}.`,
          );
          hint.textContent = "Appuie sur Jouer pour valider ou clique sur une autre allumette.";
          syncControls();
          render();
        });

        matches.appendChild(match);
      }
    }

    pile.append(pileHead, matches);

    pile.addEventListener("click", () => {
      if (state.gameOver || count === 0 || !isHumanTurn()) {
        return;
      }

      state.selectedPile = index;
      pileSelect.value = String(index);
      syncControls();
      render();
    });

    pile.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      pile.click();
    });

    pilesContainer.appendChild(pile);
  });
}

function syncControls() {
  const mode = getCurrentMode();
  const selectedCount = state.piles[state.selectedPile] || 0;
  const limit = Math.max(mode.maxTake ? Math.min(selectedCount, mode.maxTake) : selectedCount, 1);

  removeCountInput.max = String(limit);
  removeCountInput.min = "1";

  if (Number(removeCountInput.value) > limit) {
    removeCountInput.value = String(limit);
  }

  if (Number(removeCountInput.value) < 1) {
    removeCountInput.value = "1";
  }

  playButton.disabled = state.gameOver || !isHumanTurn() || selectedCount === 0;
}

function setMessage(text) {
  message.textContent = text;
}

function setWinner(winner, reason) {
  state.gameOver = true;
  updateTurnLabel(`${getActorLabel(winner)} gagne`);
  setMessage(reason);
  hint.textContent = "Relance une partie pour rejouer.";
  syncControls();
}

function sumPiles() {
  return state.piles.reduce((total, count) => total + count, 0);
}

function applyMove(pileIndex, removeCount) {
  state.piles[pileIndex] -= removeCount;
}

function finishGameForActor(actor) {
  const mode = getCurrentMode();
  const winner = mode.takesLastWins ? actor : getNextActor(actor);
  const actorLabel = getActorLabel(actor);
  const winnerLabel = getActorLabel(winner);

  if (mode.takesLastWins) {
    setWinner(winner, `${actorLabel} prend la dernière allumette et gagne.`);
    return;
  }

  setWinner(winner, `${actorLabel} prend la dernière allumette et perd. ${winnerLabel} gagne.`);
}

function playerMove() {
  if (state.gameOver || !isHumanTurn()) {
    return;
  }

  const actor = state.turn;
  const pileIndex = Number(pileSelect.value);
  const removeCount = getSelectedRemoveCount();
  const available = state.piles[pileIndex];

  if (!Number.isInteger(removeCount) || removeCount < 1) {
    setMessage("Entre un nombre valide.");
    return;
  }

  if (available === 0) {
    setMessage("Ce tas est vide.");
    return;
  }

  if (removeCount > available) {
    setMessage("Tu ne peux pas retirer plus d'allumettes qu'il n'en reste.");
    return;
  }

  state.selectedPile = pileIndex;
  applyMove(pileIndex, removeCount);
  render();

  if (sumPiles() === 0) {
    finishGameForActor(actor);
    return;
  }

  const nextActor = getNextActor(actor);
  state.turn = nextActor;
  updateTurnLabel();

  if (nextActor === "computer") {
    setMessage(`${getActorLabel(actor)} retire ${removeCount} sur ${getPileLabel(pileIndex)}. L'ordinateur réfléchit...`);
    hint.textContent = "Patiente un instant.";
    syncControls();
    window.setTimeout(computerMove, 700);
    return;
  }

  setMessage(`${getActorLabel(actor)} retire ${removeCount} sur ${getPileLabel(pileIndex)}. Au tour de ${getActorLabel(nextActor)}.`);
  hint.textContent = "Passe la main puis choisis un tas ou des allumettes.";
  syncControls();
}

function computeBestMove() {
  const mode = getCurrentMode();

  if (mode.maxTake) {
    const remaining = state.piles[0];
    const target = ((remaining - 1) % (mode.maxTake + 1) + (mode.maxTake + 1)) % (mode.maxTake + 1);
    const removeCount = target === 0 ? 1 : target;

    return {
      pileIndex: 0,
      removeCount: Math.min(removeCount, remaining, mode.maxTake),
    };
  }

  const nonEmptyPiles = state.piles.filter((count) => count > 0);
  const largePiles = nonEmptyPiles.filter((count) => count > 1);
  const nimSum = state.piles.reduce((result, count) => result ^ count, 0);

  if (!mode.takesLastWins) {
    if (largePiles.length === 0) {
      const firstPlayable = state.piles.findIndex((count) => count > 0);
      return { pileIndex: firstPlayable, removeCount: 1 };
    }

    if (largePiles.length === 1) {
      const pileIndex = state.piles.findIndex((count) => count > 1);
      const oneCount = state.piles.filter((count) => count === 1).length;
      const target = oneCount % 2 === 0 ? 1 : 0;

      return {
        pileIndex,
        removeCount: state.piles[pileIndex] - target,
      };
    }
  }

  if (nimSum === 0) {
    const firstPlayable = state.piles.findIndex((count) => count > 0);
    return { pileIndex: firstPlayable, removeCount: 1 };
  }

  for (let index = 0; index < state.piles.length; index += 1) {
    const count = state.piles[index];
    const target = count ^ nimSum;

    if (target < count) {
      return {
        pileIndex: index,
        removeCount: count - target,
      };
    }
  }

  const fallback = state.piles.findIndex((count) => count > 0);
  return { pileIndex: fallback, removeCount: 1 };
}

function computerMove() {
  if (state.gameOver || state.turn !== "computer") {
    return;
  }

  const { pileIndex, removeCount } = computeBestMove();
  state.selectedPile = pileIndex;
  applyMove(pileIndex, removeCount);
  render();

  if (sumPiles() === 0) {
    finishGameForActor("computer");
    return;
  }

  state.turn = getNextActor("computer");
  updateTurnLabel();
  setMessage(`L'ordinateur retire ${removeCount} sur ${getPileLabel(pileIndex)}. À toi de jouer.`);
  hint.textContent = "Clique sur un tas ou directement sur les allumettes.";
  syncControls();
}

function restartGame() {
  state.piles = [...getCurrentMode().piles];
  state.selectedPile = 0;
  state.turn = "player1";
  state.gameOver = false;
  updateTurnLabel();
  setMessage(state.opponentKey === "human"
    ? "Joueur 1 commence. Choisis un tas puis retire des allumettes."
    : "Joueur 1 commence contre l'ordinateur. Choisis un tas puis retire des allumettes.");
  hint.textContent = "Clique sur un tas ou directement sur les allumettes.";
  removeCountInput.value = "1";
  render();
}

function render() {
  renderModeTexts();
  renderPileOptions();
  renderPiles();
  syncControls();
}

modeSelect.addEventListener("change", (event) => {
  state.modeKey = event.target.value;
  restartGame();
});

opponentSelect.addEventListener("change", (event) => {
  state.opponentKey = event.target.value;
  restartGame();
});

pileSelect.addEventListener("change", (event) => {
  state.selectedPile = Number(event.target.value);
  syncControls();
  render();
});

removeCountInput.addEventListener("input", () => {
  syncControls();
  render();
});

playButton.addEventListener("click", playerMove);
restartButton.addEventListener("click", restartGame);

render();
