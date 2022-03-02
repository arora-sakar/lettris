document.addEventListener('DOMContentLoaded', () => {
  let WordList = null;
  let Score = 0;
  let LetterBox = null;
  let GameOver = false;
  const LetterBoxSize = 4;
  const LetterBoxShapes = [
                            [
                              ['l', 'l', 'l', 'l'],
                              ['', '', '', ''],
                              ['', '', '', ''],
                              ['', '', '', '']
                            ],
                            [
                              ['l', '', '', ''],
                              ['l', '', '', ''],
                              ['l', '', '', ''],
                              ['l', '', '', '']
                            ],
                            [
                              ['l', 'l', '', ''],
                              ['l', 'l', '', ''],
                              ['', '', '', ''],
                              ['', '', '', '']
                            ]
                          ];
  const WordDisplay = document.querySelector('#worddisplay');
  WordDisplay.innerText = '';
  const [grid_width, grid_height] = get_grid_shape();
  const grid = document.querySelector('.grid');
  grid.style.width = grid_width.toString() + 'px';
  grid.style.height = grid_height.toString() + 'px';
  const startBtn = document.querySelector('#start-button');
  const submitBtn = document.querySelector('#submit-button');
  const clearBtn = document.querySelector('#clear-button');
  let timerid = null;
  let square_grid = new Array();
  let SquaresSelected = null;
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
  const vowels = "AEIOU";
  for (i = 0; i < 16 /*make this dynamic*/; i++) {
    square_row = new Array();
    for (j = 0; j < 10; j++) {
      let square = document.createElement("div");
      square.addEventListener('click', squareClickAction);
      square.r = i;
      square.c = j;
      square.selected = false;
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
    if (square.innerText == '')
      return false;
    for (r = 0; r < LetterBox.H; r++) {
      for (c = 0; c < LetterBox.W; c++) {
        //assert -> LetterBoxContent[r][c] != ''
        //console.log('X:' + (LetterBox.posY+r));
        //console.log('Y:' + (LetterBox.posX+c));
        if (square.r == (LetterBox.posY + r) && square.c == (LetterBox.posX + c)) {
          return false;
        }
      }
    }
    return true;
  }

  function getWordPoints(wordLength) {
    return wordLength;
  }

  function squareClickAction(evt) {
    //console.log("Square clicked " + this.innerText + " (" + this.r + "," + this.c + ")");
    if (this.selected == true)
      return;
    if (!isSquareClickValid(this))
      return;
    this.selected = true;
    this.style.border = "inset";
    WordDisplay.innerText = WordDisplay.innerText + this.innerText;
    if (SquaresSelected == null)
      SquaresSelected = new Array();
    SquaresSelected.push(this);
    if (isValidWord(WordDisplay.innerText)) {
      submitBtn.style.backgroundColor = '#179c43';
      submitBtn.innerText = Score.toString() + '+' + getWordPoints(WordDisplay.innerText.length).toString();
    }
    else {
      submitBtn.style.backgroundColor = '#c9c938';
      submitBtn.innerText = Score.toString() + '+0';
    }
  }

  function pickVowel() {
    if (Math.floor(Math.random() * 5) <= 2)
      return false;
    return true;
  }

  function createLetterBox() {
    let idx = Math.floor(Math.random() * LetterBoxShapes.length);
    let LetterBoxFilled = new Array();
    let maxWidth = 0;
    let maxHeight = 0;
    for (r = 0; r < LetterBoxSize; r++) {
      LetterBoxRow = new Array();
      for (c = 0; c < LetterBoxSize; c++) {
        if (LetterBoxShapes[idx][r][c] == 'l') {
          if (maxWidth < c+1)
            maxWidth = c+1;
          if (maxHeight < r+1)
            maxHeight = r+1;
          if (pickVowel()) {
            let idx = Math.floor(Math.random() * vowels.length);
            //console.log('vowels:' + idx.toString());
            LetterBoxRow.push(vowels[idx]);
            //LetterBoxShape[i][j] = vowels[idx];//Math.floor(Math.random() * vowels.length)];
          }
          else {
            let idx = Math.floor(Math.random() * consonants.length);
            //console.log('consonants:' + idx.toString());
            LetterBoxRow.push(consonants[idx]);
            //LetterBoxShape[i][j] = consonants[idx];//Math.floor(Math.random() * consonants.length)];
          }
        }
      }
      LetterBoxFilled.push(LetterBoxRow);
    }
    curX = Math.floor(Math.random() * (11 - maxWidth)); //TODO: Why 11?
    LetterBox = {content: LetterBoxFilled, posX: curX, posY: 0, H: maxHeight, W: maxWidth};
  }

  function isletterBoxSettled() {
    if (LetterBox == null)
      return true;
    if ((LetterBox.posY + LetterBox.H - 1) >= 15)
      return true;
    let settled = false;
    for (c = 0; c < LetterBox.W; c++) {
      square = square_grid[LetterBox.posY + LetterBox.H][LetterBox.posX+c];
      if (square.innerText != '') {
        //console.log(`${square.innerText}(${square.r},${square.c})`);
        settled = true;
        break;
      }
    }
    if (settled && LetterBox.posY == 0) {
      clearInterval(timerid);
      GameOver = true;
      LetterBox = null;
      alert("Game Over!!");
      startBtn.innerText = 'Restart';
    }
    return settled;
  }

  function drawLetterBox() {
    if (LetterBox == null)
      return;
    for (r = 0; r < LetterBox.H; r++) {
      for (c = 0; c < LetterBox.W; c++) {
        //assert -> LetterBoxContent[r][c] != ''
        //console.log('X:' + (LetterBox.posY+r));
        //console.log('Y:' + (LetterBox.posX+c));
        square = square_grid[LetterBox.posY+r][LetterBox.posX+c];
        square.innerText = LetterBox.content[r][c];
        square.style.border = "outset";
      }
    }
  }

  function eraseLetterBox() {
    if (LetterBox == null)
      return;
    for (r = 0; r < LetterBox.H; r++) {
      for (c = 0; c < LetterBox.W; c++) {
        //assert -> LetterBoxContent[r][c] != ''
        square = square_grid[LetterBox.posY+r][LetterBox.posX+c];
        square.innerText = '';
        square.style.border = "";
      }
    }
  }

  function moveLetterBoxDown() {
    if (isletterBoxSettled()) {
      if (!GameOver)
        createLetterBox();
    } else {
      eraseLetterBox();
      LetterBox.posY++;
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
    //sq_idx = Math.floor(Math.random() * 160);
    //square_array[sq_idx].style.border = "outset";
    //square_array[sq_idx].innerText = alphabet[Math.floor(Math.random() * 26)];
  }

  function cleanGameState() {
    for (i = 0; i < square_grid.length; i++) {
      for (j = 0; j < square_grid[i].length; j++) {
        square_grid[i][j].innerText = '';
        square_grid[i][j].style.border = 'none';
      }
    }
    clearInterval(timerid);
    timerid = null;
    GameOver = false;
    LetterBox = null;
    WordDisplay.innerText = '';
    Score = 0;
    submitBtn.innerText = '0';
    startBtn.innerText = 'Start/Pause';
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
    if (square.selected == false)
      return;
    let r = square.r;
    let c = square.c;

    while (r > 0 && square_grid[r-1][c].innerText != '') {
      console.log(square_grid[r-1][c].innerText + ',' + r);
      if (square_grid[r-1][c].selected == true)
        dropUpperSquares(square_grid[r-1][c]);
      square_grid[r][c].innerText = square_grid[r-1][c].innerText;
      square_grid[r][c].style.border = square_grid[r-1][c].style.border;
      r--;
    }
    square_grid[r][c].innerText = '';
    square_grid[r][c].style.border = '';
    square.selected = false;
  }


  submitBtn.addEventListener('click', () => {
    if (SquaresSelected == null)
      return;
    //for (i = 0; i < SquaresSelected.length; i++) {
    //  console.log(SquaresSelected[i].innerText);
    //  SquaresSelected[i].selected = false;
    //}
    if (isValidWord(WordDisplay.innerText)) {
      for (i = 0; i < SquaresSelected.length; i++) {
        dropUpperSquares(SquaresSelected[i]);
      }
      Score += getWordPoints(WordDisplay.innerText.length);
    } else {
      for (i = 0; i < SquaresSelected.length; i++) {
        SquaresSelected[i].selected = false;
        SquaresSelected[i].style.border = "outset";
      }
    }
    SquaresSelected = null;
    WordDisplay.innerText = '';
    submitBtn.style.backgroundColor = '#c9c938';
    submitBtn.innerText = Score.toString();
  })

  clearBtn.addEventListener('click', () => {
    if (SquaresSelected == null)
      return;
    for (i = 0; i < SquaresSelected.length; i++) {
      SquaresSelected[i].selected = false;
      SquaresSelected[i].style.border = "outset";
    }
    SquaresSelected = null;
    WordDisplay.innerText = '';
  })

  function moveLetterBoxLeft() {
    if (LetterBox.posX <= 0)
      return;
    let isLeftBlocked = false;
    for (r = 0; r < LetterBox.H; r++) {
      square = square_grid[LetterBox.posY + r][LetterBox.posX - 1];
      if (square.innerText != '') {
        isLeftBlocked = true;
        break;
      }
    }
    if (!isLeftBlocked) {
      eraseLetterBox();
      LetterBox.posX--;
      drawLetterBox();
    }
  }

  function moveLetterBoxRight() {
    if (LetterBox.posX + LetterBox.W >=  10)
      return;
    let isRightBlocked = false;
    for (r = 0; r < LetterBox.H; r++) {
      square = square_grid[LetterBox.posY + r][LetterBox.posX + LetterBox.W];
      if (square.innerText != '') {
        isRightBlocked = true;
        break;
      }
    }
    if (!isRightBlocked) {
      eraseLetterBox();
      LetterBox.posX++;
      drawLetterBox();
    }
  }

  //assign functions to keyCodes
  function control(e) {
    if(e.keyCode === 37) {
      moveLetterBoxLeft();
    } else if (e.keyCode === 39) {
      moveLetterBoxRight();
    } else if (e.keyCode === 40) {
      moveLetterBoxDown();
    }
  }
  document.addEventListener('keyup', control)

  function get_grid_shape() {
    return [250, 400];
  }
})  