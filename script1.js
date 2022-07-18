// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

//Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

//Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

//Scroll
let valueY = 0;
//Refresh splash page to Dom
function bestScoresToDom() {
  bestScores.forEach((best, index) => {
    const bestEl = best;
    bestEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
}

// Check Local Storage for Best Scores, set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.getItem("bestScores"));
  } else {
    bestScoreArray = [
      {
        questions: 10,
        bestScore: finalTime,
      },
      {
        questions: 25,
        bestScore: finalTime,
      },
      {
        questions: 50,
        bestScore: finalTime,
      },
      {
        questions: 99,
        bestScore: finalTime,
      },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }
  bestScoresToDom();
}

//Update Best Score Array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    //Select correct Best Score to update
    if (questionAmount == score.questions) {
      const SavedBestScores = Number(bestScoreArray[index].bestScore);
      console.log(SavedBestScores);
      // Update if the new final Score is less or replacing zero
      if (SavedBestScores === 0 || SavedBestScores < finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  //save back to dom
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  // Update our splash page
  bestScoresToDom();
}

//Reset Game
function reset() {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
  questionAmount = 0;
}

//ShowScore page
function showScorePage() {
  //showPlayAgain button
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 3000);
  gamePage.hidden = true;
  scorePage.hidden = false;
}

//Format & Display Time in Dom
function scoresToDom() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  itemContainer.scrollTo({
    top: 0,
    behavior: "instant",
  });

  showScorePage();
}

//Stop timer process results, go to score page
function checkTime() {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);
    // Check for wrong guesses, add penalty time
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {
      } else {
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    scoresToDom();
  }
}

//Add a tenth to time played
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

//start timer when game page is clicked
function startTimer() {
  //Reset times
  timePlayed = 0;
  baseTime = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 1000);
  gamePage.removeEventListener("click", startTimer);
}

//Scroll, store user selection in playerGuessArray
function select(guessTrue) {
  //Scroll 80 pixels
  valueY += 80;
  itemContainer.scroll(0, valueY);
  //   Add player guess to array
  if (
    playerGuessArray.length == 0 ||
    playerGuessArray.length < questionAmount
  ) {
    return guessTrue
      ? playerGuessArray.push("true")
      : playerGuessArray.push("false");
  }
}

// Display Game Page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

//Get Random Number up to a max Number
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(+questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(50);
    secondNumber = getRandomInt(50);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDom();
  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

// Add Equations to Dom
function equationsToDom() {
  equationsArray.forEach((question) => {
    // Item
    const item = document.createElement("div");
    item.classList.add("item");

    // Equation Text
    const equationText = document.createElement("h1");
    equationText.textContent = question.value;
    //Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

//Displays 3, 2, 1,
function Countdown() {
  let count = 5;
  countdown.textContent = count;
  const countDown = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = "Go!🤝";
    } else if (count === -1) {
      showGamePage();
      clearInterval(countDown);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
}

//Navigate from splash Page to CountDown Page
function showCountDown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  populateGamePage();
  Countdown();
}

// Get value from selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radios) => {
    if (radios.checked) {
      radioValue = radios.value;
    }
  });
  return radioValue;
}

//Form that decides amount of questions
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  questionAmount && showCountDown();
}

startForm.addEventListener("click", () => {
  radioContainers.forEach((radio) => {
    // Remove Selected Label Styling
    radio.classList.remove("selected-label");
    //Add it if radio input is checked
    if (radio.children[1].checked) {
      radio.classList.add("selected-label");
    }
  });
});

//Event listeners
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);

//on load
getSavedBestScores();
