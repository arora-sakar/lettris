document.addEventListener('DOMContentLoaded', () => {
  let WordList = null;
  let Score = 0;
  let LetterBox = null;
  let GameOver = false;
  const NumRows = 16;
  const NumCols = 10;
  const LetterBoxSize = NumCols;
  const WordDisplay = document.querySelector('#worddisplay');
  WordDisplay.innerText = '';
  const grid = document.querySelector('.grid-container');
  const startBtn = document.querySelector('#start-button');
  const submitBtn = document.querySelector('#submit-button');
  const clearBtn = document.querySelector('#clear-button');
  const backBtn = document.querySelector('#back-button');
  const ScoreDisplay = document.querySelector('#score');
  let timerid = null;
  let square_grid = new Array();
  let SquaresSelected = null;
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
  const vowels = "AEIOU";
  for (i = 0; i < NumRows; i++) {
    square_row = new Array();
    for (j = 0; j < NumCols; j++) {
      let square = document.createElement("div");
      square.addEventListener('click', squareClickAction);
      square.r = i;
      square.c = j;
      square.selected = -1;
      square.letter = '';
      square_row.push(square);
      grid.appendChild(square);
    }
    square_grid.push(square_row);
    const url = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
    fetch(url)
       .then(response => response.text() )
       .then(data => {
         WordList = new Array();
         let tmpList =  data.split("\n");
         for (i = 0; i < tmpList.length; i++) {
           let word = tmpList[i].replace("\r","").toUpperCase();
           if (word.length >= 3)
            WordList.push(word);
         }
        });
  }

  function isSquareClickValid(square) {
    console.log(square.selected);
    if (GameOver || square.selected >= 0 || square.letter === '')
      return false;
    return true;
  }

  function getWordPoints(wordLength) {
    return wordLength * (wordLength-1)/2;
  }

  function squareClickAction(evt) {
    //console.log("Square clicked " + this.innerText + " (" + this.r + "," + this.c + ")");
    if (!isSquareClickValid(this))
      return;
    this.style.border = "inset";
    WordDisplay.innerText = WordDisplay.innerText + this.innerText;
    if (SquaresSelected == null)
      SquaresSelected = new Array();
    this.selected = SquaresSelected.push(this) - 1;
    if (isValidWord(WordDisplay.innerText)) {
      submitBtn.style.backgroundColor = '#179c43';
    }
    else {
      submitBtn.style.backgroundColor = '#ebf1f7';
    }
  }

  function pickVowel() {
    if (Math.floor(Math.random() * 5) <= 2)
      return false;
    return true;
  }

  function createLetterBox() {
    LetterBox = new Array();
    let l = null;
    for (i = 0; i < LetterBoxSize; i++) {
      square = square_grid[0][i];
      if (square.innerText === '') {
        if (pickVowel()) {
          let idx = Math.floor(Math.random() * vowels.length);
          //l = {letter: vowels[idx], posY: 0};
          square.letter = vowels[idx];
        }
        else {
          let idx = Math.floor(Math.random() * consonants.length);
          //console.log('consonants:' + idx.toString());
          //LetterBoxRow.push(consonants[idx]);
          //LetterBoxShape[i][j] = consonants[idx];//Math.floor(Math.random() * consonants.length)];
          //l = {letter: consonants[idx], posY: 0};
          square.letter = consonants[idx];
        }
        LetterBox.push(square);
      }
      else {
        GameOver = true;
        break;
      }
    }
    if (GameOver) {
      clearInterval(timerid);
      LetterBox = null;
      alert("Game Over!!");
      startBtn.innerText = '\u23EE';
    }
  }

  function isletterBoxSettled() {
    if (LetterBox == null)
      return true;

    for (i = 0; i < LetterBoxSize; i++) {
      if (LetterBox[i].r < 15) {
        square = square_grid[LetterBox[i].r+1][i];
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
      if (square.selected >= 0)
        square.style.border = "inset";
      else
        square.style.border = "outset";
    }
  }

  function eraseLetterBox() {
    if (LetterBox == null)
      return;
    for (i = 0; i < LetterBoxSize; i++) {
      square = LetterBox[i];
      square.innerText = '';
      square.style.border = "none";
    }
  }

  function isLetterSettled(r, c) {
    if (r >= 15)
      return true;

    if (square_grid[r+1][c].letter === '')
      return false;

    return true;
  }

  function moveLetterBoxDown() {
    if (isletterBoxSettled()) {
        createLetterBox();
    } else {
      eraseLetterBox();
      for (i = 0; i < LetterBoxSize; i++) {
        if (!isLetterSettled(LetterBox[i].r, LetterBox[i].c)) {
          let current_square = LetterBox[i];
          let below_square = square_grid[LetterBox[i].r+1][LetterBox[i].c];
          below_square.letter = current_square.letter;
          current_square.letter = '';
          if (current_square.selected >= 0) {
            below_square.selected = current_square.selected;
            current_square.selected = -1;
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
    for (i = 0; i < square_grid.length; i++) {
      for (j = 0; j < square_grid[i].length; j++) {
        square_grid[i][j].selected = -1;
        square_grid[i][j].letter = '';
        square_grid[i][j].innerText = '';
        square_grid[i][j].style.border = 'none';
      }
    }
    SquaresSelected = null;
    clearInterval(timerid);
    timerid = null;
    GameOver = false;
    LetterBox = null;
    WordDisplay.innerText = '';
    Score = 0;
    ScoreDisplay.innerText = "Score: " + Score;
    startBtn.innerText = '\u23EF';
  }

  startBtn.addEventListener('click', () => {
    if (GameOver)
      cleanGameState();
    if (LetterBox == null)
      createLetterBox();
    if (timerid) {
      clearInterval(timerid);
      timerid = null;
    } else
      timerid = setInterval(gameplay, 1000);
  })

  function isValidWord(word) {
    return WordList.includes(word);
  }

  function dropUpperSquares(square) {
    if (square.selected == -1)
      return;
    let r = square.r;
    let c = square.c;

    while (r > 0 && square_grid[r-1][c].innerText != '') {
      //console.log(square_grid[r-1][c].innerText + ',' + r);
      if (square_grid[r-1][c].selected >= 0)
        dropUpperSquares(square_grid[r-1][c]);
      square_grid[r][c].letter = square_grid[r-1][c].letter;
      square_grid[r][c].innerText = square_grid[r-1][c].innerText;
      square_grid[r][c].style.border = square_grid[r-1][c].style.border;
      r--;
    }
    square_grid[r][c].letter = '';
    square_grid[r][c].innerText = '';
    square_grid[r][c].style.border = '';
    square.selected = -1;
  }


  submitBtn.addEventListener('click', () => {
    if (SquaresSelected == null)
      return;

    if (!isValidWord(WordDisplay.innerText))
      return;

    for (i = 0; i < SquaresSelected.length; i++) {
      dropUpperSquares(SquaresSelected[i]);
    }
    Score += getWordPoints(WordDisplay.innerText.length);
    SquaresSelected = null;
    WordDisplay.innerText = '';
    submitBtn.style.backgroundColor = '#ebf1f7';
    ScoreDisplay.innerText = "Score: " + Score;
  })

  clearBtn.addEventListener('click', () => {
    if (SquaresSelected == null)
      return;
    for (i = 0; i < SquaresSelected.length; i++) {
      SquaresSelected[i].selected = -1;
      SquaresSelected[i].style.border = "outset";
    }
    SquaresSelected = null;
    WordDisplay.innerText = '';
  })

  //assign functions to keyCodes
  function control(e) {
    if (e.keyCode === 40) {
      moveLetterBoxDown();
    }
  }
  document.addEventListener('keyup', control)

  backBtn.addEventListener('click', () => {
    if (SquaresSelected == null)
      return;
    square = SquaresSelected.pop();
    if (square && square.selected >= 0) {
      square.style.border = "outset";
      square.selected = -1;
      let word = WordDisplay.innerText;
      let newWord = '';
      for (i = 0; i < word.length - 1; i++) {
        newWord = newWord + word[i];
      }
      WordDisplay.innerText = newWord;
      if (isValidWord(WordDisplay.innerText)) {
        submitBtn.style.backgroundColor = '#179c43';
      }
      else {
        submitBtn.style.backgroundColor = '#ebf1f7';
      }
    }
  })
})  