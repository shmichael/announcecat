const defaultTerms = [
  'Apple Jacks',
  'Boogie Back',
  'Boogie forward',
  'Break step',
  'Fall off the log',
  'Fish tails',
  'Half Breaks',
  'Hallelujah',
  'Shorty George',
  'Suzy Q',
]

class TermPlayer {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
  }

  play(term) {
    var msg = new SpeechSynthesisUtterance(term);
    msg.rate = 2;
    window.speechSynthesis.speak(msg);
  }
}

// Display checkboxes for moves.
let moveListTextArea = document.getElementById('moveList');
let initialText = '';
for (let term in defaultTerms) {
  initialText += defaultTerms[term] + "\n";
}
moveListTextArea.value = initialText;

let bpmInput = document.getElementById('bpm');
let randomizeButton = document.getElementById('randomize');
let aaabButton = document.getElementById('aaab');
let ababButton = document.getElementById('abab');
let asisButton = document.getElementById('asis');
let playButton = document.getElementById('play');
let stopButton = document.getElementById('stop');
let resetButton = document.getElementById('reset');
let controlsArea = document.getElementById('controls');
let selectionArea = document.getElementById('selection');
let sequenceArea = document.getElementById('sequence');

// Timer for the periodic speech output. Set on play.
let timer;

// Sequence of moves. Generated when button clicked.
let sequence;
let terms;

let player = new TermPlayer();

function switchToPlayMode() {
  // Prime the speech synthesis.
  player.play(' ');

  // Swap the controls.
  selectionArea.style.display = 'none';
  sequenceArea.style.display = null;
  controlsArea.style.display = null;

  // Collect the terms. Removes blank lines.
  terms = moveListTextArea.value.replace(/^\s*[\r\n]|\n^$/gm, "").split('\n');

  // Generate the sequence. Clear any previous sequence.
  sequence = [];
  while (sequenceArea.firstChild) {
    sequenceArea.removeChild(sequenceArea.firstChild);
  }
}

function switchToSetupMode() {
  stop();
  // Swap the controls.
  selectionArea.style.display = null;
  sequenceArea.style.display = 'none';
  controlsArea.style.display = 'none';
}

function getSequenceLength() {
  let bpm = parseInt(bpmInput.value, 10);
  let minutes = parseInt(document.getElementById('minutes').value, 10);
  let seconds = parseInt(document.getElementById('seconds').value, 10);
  let totalSongMinutes = minutes + seconds/60;
  let totalBeats = totalSongMinutes * bpm;
  // Sequence is one move per 8 beats.
  return(parseInt(totalBeats / 8, 10));
}

function addTerm(term, index) {
  sequence.push(term);
  let termDiv = document.createElement('div');
  termDiv.innerText = term;
  termDiv.id = "term_" + index;
  sequenceArea.append(termDiv);
}

randomizeButton.addEventListener('click', () => {
  switchToPlayMode();

  for (let i = 0; i < getSequenceLength(); i++) {
    let randomIndex = Math.floor(Math.random() * terms.length);
    addTerm(terms[randomIndex], i);
  }
});

aaabButton.addEventListener('click', () => {
  switchToPlayMode();
  console.log(terms);

  for (let i = 0; i < getSequenceLength()/4; i++) {
    let randomIndex = Math.floor(Math.random() * terms.length);
    let randomIndexB = Math.floor(Math.random() * (terms.length - 1));
    if (randomIndex == randomIndexB) {
      randomIndexB = terms.length - 1;
    }
    console.log("adding aaab " + randomIndex + ":" + terms[randomIndex] + ", " + randomIndexB + ":" + terms[randomIndexB]);
    addTerm(terms[randomIndex], i*4);
    addTerm(terms[randomIndex], i*4 + 1);
    addTerm(terms[randomIndex], i*4 + 2);
    addTerm(terms[randomIndexB], i*4 + 3);
  }
});

ababButton.addEventListener('click', () => {
  switchToPlayMode();

  for (let i = 0; i < getSequenceLength()/4; i++) {
    let randomIndex = Math.floor(Math.random() * terms.length);
    let randomIndexB = Math.floor(Math.random() * (terms.length - 1));
    if (randomIndex == randomIndexB) {
      randomIndexB = terms.length - 1;
    }
    addTerm(terms[randomIndex], i*4);
    addTerm(terms[randomIndexB], i*4 + 1);
    addTerm(terms[randomIndex], i*4 + 2);
    addTerm(terms[randomIndexB], i*4 + 3);
  }
});

asisButton.addEventListener('click', () => {
  switchToPlayMode();

  for (let i in terms) {
    addTerm(terms[i], i);
  }
});

function stop() {
    clearInterval(timer);
    stopButton.disabled = true;
    playButton.disabled = false;

    // TODO: remove "current" class.
}

stopButton.addEventListener('click', () => {
    stop();
});

playButton.addEventListener('click', () => {
    playButton.disabled = true;
    stopButton.disabled = false;

    let currentTerm = 0;
    let playNext = () => {
        if (currentTerm > 0) {
          document.getElementById('term_' + (currentTerm - 1)).classList.remove('current');
        }
        document.getElementById('term_' + currentTerm).classList.add('current');
        // Scroll down, but keep at least 2 terms above.
        if (currentTerm > 1) {
          location.href='#term_' + (currentTerm - 2);
        }
        player.play(sequence[currentTerm]);
        currentTerm++;
        if (currentTerm == sequence.length) {
          stop();
        }
    }

    let bpm = parseInt(bpmInput.value, 10);
    let delayValue = 60*8*1000/bpm;
    timer = setInterval(playNext, delayValue);
    playNext();
});

resetButton.addEventListener('click', () => {
  switchToSetupMode();
});
