document.addEventListener('DOMContentLoaded', () => {
  const NumRows = 16;
  const NumCols = 10;
  const BackColor = '#5cdb95';
  const FrontColor = '#41b3a3';
  const DisplayColor = '#8ee4af';
  const Unselected = -1;
  const SelectedSquareBorder = "inset";
  const UnselectedSquareBorder = "outset";

  const WordList = new Array();
  let Score = 0;
  let LetterBox = null;
  let GameOver = false;
  const LetterBoxSize = NumCols;
  const Display = document.querySelector('#display');
  const StartBtn = document.querySelector('#start-button');
  const BackBtn = document.querySelector('#back-button');
  let TimerId = null;
  let SquareGrid = new Array();
  let SquaresSelected = null;
  const WeightedLetters = "EEEEEEEEEEAAAAAAAARRRRRRRIIIIIIIOOOOOOOTTTTTTTNNNNNNNSSSSSSLLLLLCCCCCUUUUDDDPPPMMMHHHGGBBFFYYWKVXZJQ";
  const grid = document.querySelector('.grid-container');
  for (i = 0; i < NumRows; i++) {
    const square_row = new Array();
    for (j = 0; j < NumCols; j++) {
      let square = document.createElement("div");
      square.addEventListener('click', squareClickAction);
      square.r = i;
      square.c = j;
      square.selected = Unselected;
      square.letter = '';
      square_row.push(square);
      grid.appendChild(square);
    }
    SquareGrid.push(square_row);
  }

  async function loadWords(url) {
    const response = await fetch(url);
    const data = await response.text();
    let tmpList =  data.split("\n");
    for (i = 0; i < tmpList.length; i++) {
      WordList.push(tmpList[i].replace("\r", ""));
    }
  }

  loadWords("/words3.txt");

  function isSquareClickValid(square) {
    //console.log(square.selected);
    if (GameOver || square.selected != Unselected || square.letter === '' || TimerId == null)
      return false;
    return true;
  }

  function getWordPoints(wordLength) {
    return wordLength * (wordLength-1)/2;
  }

  function squareClickAction(evt) {
    if (!isSquareClickValid(this))
      return;
    this.style.border = SelectedSquareBorder;
    this.style.backgroundColor = BackColor;
    if (SquaresSelected == null) {
      SquaresSelected = new Array();
      Display.innerText = '';
    }
    Display.innerText = Display.innerText + this.innerText;
    this.selected = SquaresSelected.push(this) - 1;
    if (isValidWord(Display.innerText)) {
      Display.style.border = UnselectedSquareBorder;
      Display.style.backgroundColor = FrontColor;
    }
    else {
      Display.style.border = SelectedSquareBorder;
      Display.style.backgroundColor = DisplayColor;
    }
  }

  function createLetterBox() {
    LetterBox = new Array();
    let l = null;
    for (i = 0; i < LetterBoxSize; i++) {
      square = SquareGrid[0][i];
      if (square.innerText === '') {
        idx = Math.floor(Math.random() * WeightedLetters.length);
        square.letter = WeightedLetters[idx];
        LetterBox.push(square);
      }
      else {
        GameOver = true;
        break;
      }
    }
    if (GameOver) {
      clearInterval(TimerId);
      LetterBox = null;
      alert("Game Over!!");
      StartBtn.innerText = 'START';
    }
  }

  function isLetterBoxSettled() {
    if (LetterBox == null)
      return true;

    for (i = 0; i < LetterBoxSize; i++) {
      if (LetterBox[i].r < (NumRows - 1)) {
        square = SquareGrid[LetterBox[i].r+1][i];
        if (square.letter === '')
          return false;
      }
    }
    return true;
  }

  function drawLetterBox() {
    if (LetterBox == null)
      return;
    for (i = 0; i < LetterBoxSize; i++) {
      square = LetterBox[i];
      if (square.letter === '')
        continue;
      square.innerText = square.letter;

      if (square.selected != Unselected) {
        square.style.border = SelectedSquareBorder;
        square.style.backgroundColor = BackColor;
      }
      else {
        square.style.border = UnselectedSquareBorder;
        square.style.backgroundColor = FrontColor;
      }
    }
  }

  function eraseLetterBox() {
    if (LetterBox == null)
      return;
    for (i = 0; i < LetterBoxSize; i++) {
      square = LetterBox[i];
      square.innerText = '';
      square.style.border = '';
      square.style.backgroundColor = BackColor;
    }
  }

  function isLetterSettled(r, c) {
    if (r >= (NumRows - 1))
      return true;

    if (SquareGrid[r+1][c].letter === '')
      return false;

    return true;
  }

  function moveLetterBoxDown() {
    if (isLetterBoxSettled()) {
        createLetterBox();
    } else {
      eraseLetterBox();
      for (i = 0; i < LetterBoxSize; i++) {
        if (!isLetterSettled(LetterBox[i].r, LetterBox[i].c)) {
          let current_square = LetterBox[i];
          let below_square = SquareGrid[LetterBox[i].r+1][LetterBox[i].c];
          below_square.letter = current_square.letter;
          current_square.letter = '';
          if (current_square.selected != Unselected) {
            below_square.selected = current_square.selected;
            current_square.selected = Unselected;
            SquaresSelected[below_square.selected] = below_square;
          }
          LetterBox[i] = below_square;
        }
      }
    }
    if (!GameOver)
      drawLetterBox();
  }

  function gameplay() {
    // Game play actions - order TBD
    //- move floating letter bar(s) down
    moveLetterBoxDown();
    //- check settled letters for valid words
    //- swap letters, if requested by user
    //- pop vowels out of consonants after a settlement time threshold
  }

  function cleanGameState() {
    for (i = 0; i < SquareGrid.length; i++) {
      for (j = 0; j < SquareGrid[i].length; j++) {
        SquareGrid[i][j].selected = Unselected;
        SquareGrid[i][j].letter = '';
        SquareGrid[i][j].innerText = '';
        SquareGrid[i][j].style.border = '';
        SquareGrid[i][j].style.backgroundColor = BackColor;
      }
    }
    SquaresSelected = null;
    clearInterval(TimerId);
    TimerId = null;
    GameOver = false;
    LetterBox = null;
    Display.innerText = '';
    Score = 0;
    Display.innerText = "Score: " + Score;
    StartBtn.innerText = 'START';
  }

  StartBtn.addEventListener('click', () => {
    if (GameOver)
      cleanGameState();
    if (TimerId) {
      clearInterval(TimerId);
      TimerId = null;
      StartBtn.innerText = 'START';
    } else {
      TimerId = setInterval(gameplay, 1000);
      StartBtn.innerText = 'PAUSE';
    }
  })

  function isValidWord(word) {
    return WordList.includes(word);
  }

  function dropUpperSquares(square) {
    if (square.selected == Unselected)
      return;
    let r = square.r;
    let c = square.c;

    while (r > 0 && SquareGrid[r-1][c].innerText != '') {
      //console.log(SquareGrid[r-1][c].innerText + ',' + r);
      if (SquareGrid[r-1][c].selected != Unselected)
        dropUpperSquares(SquareGrid[r-1][c]);
      SquareGrid[r][c].letter = SquareGrid[r-1][c].letter;
      SquareGrid[r][c].innerText = SquareGrid[r-1][c].innerText;
      SquareGrid[r][c].style.border = SquareGrid[r-1][c].style.border;
      SquareGrid[r][c].style.backgroundColor = SquareGrid[r-1][c].style.backgroundColor;
      r--;
    }
    SquareGrid[r][c].letter = '';
    SquareGrid[r][c].innerText = '';
    SquareGrid[r][c].style.border = '';
    SquareGrid[r][c].style.backgroundColor = BackColor;
    square.selected = Unselected;
  }

  Display.addEventListener('click', () => {
    if (SquaresSelected == null)
      return;

    if (!isValidWord(Display.innerText))
      return;

    for (i = 0; i < SquaresSelected.length; i++) {
      dropUpperSquares(SquaresSelected[i]);
    }
    Score += getWordPoints(Display.innerText.length);
    SquaresSelected = null;
    Display.innerText = '';
    Display.style.backgroundColor = DisplayColor;
    Display.style.border = SelectedSquareBorder;
    Display.innerText = "Score: " + Score;
  })

  //assign functions to keyCodes
  function control(e) {
    if (TimerId == null)
      return;
    if (e.keyCode === 40) {
      moveLetterBoxDown();
    }
  }
  document.addEventListener('keyup', control)

  BackBtn.addEventListener('click', () => {
    if (SquaresSelected == null)
      return;
    square = SquaresSelected.pop();
    if (square && square.selected != Unselected) {
      square.style.border = UnselectedSquareBorder;
      square.style.backgroundColor = FrontColor;
      square.selected = Unselected;
      let word = Display.innerText;
      let newWord = '';
      for (i = 0; i < word.length - 1; i++) {
        newWord = newWord + word[i];
      }
      Display.innerText = newWord;
      if (isValidWord(Display.innerText)) {
        Display.style.border = UnselectedSquareBorder;
        Display.style.backgroundColor = FrontColor;
      }
      else {
        Display.style.border = SelectedSquareBorder;
        Display.style.backgroundColor = DisplayColor;
      }
    }
  })
})  