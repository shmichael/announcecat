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

let bpmInput = document.getElementById('bpm');
let randomizeButton = document.getElementById('randomize');
let aaabButton = document.getElementById('aaab');
let ababButton = document.getElementById('abab');
let asisButton = document.getElementById('asis');
let playButton = document.getElementById('play');
let stopButton = document.getElementById('stop');
let resetButton = document.getElementById('reset');
let playmodeArea = document.getElementById('playmode');
let generationArea = document.getElementById('generation');
let sequenceArea = document.getElementById('sequence');
let moveListTextArea = document.getElementById('moveList');

// Timer for the periodic speech output. Set on play.
let timer;

// Sequence of moves. Generated when button clicked.
let sequence;
let terms;
let sequenceInitialHeight;
let noSleep = new NoSleep();

let player = new TermPlayer();

function updateTerms() {
  terms = moveListTextArea.value.replace(/^\s*[\r\n]|\n^$/gm, "").split('\n');
}

function switchToPlayMode(newSequence) {
  // Prime the speech synthesis.
  player.play(' ');

  // Swap the controls.
  generationArea.style.display = 'none';
  sequenceArea.style.display = null;
  playmodeArea.style.display = null;

  // Collect the terms. Removes blank lines.
  terms = moveListTextArea.value.replace(/^\s*[\r\n]|\n^$/gm, "").split('\n');

  // Generate the sequence. Clear any previous sequence.
  sequence = [];
  while (sequenceArea.firstChild) {
    sequenceArea.removeChild(sequenceArea.firstChild);
  }

  for (termIndex in newSequence) {
    addTerm(newSequence[termIndex], termIndex);
  }

  sequenceInitialHeight = document.getElementById('term_2').offsetTop;

  saveState(true);
}

function switchToSetupMode() {
  stop();
  // Swap the controls.
  generationArea.style.display = null;
  sequenceArea.style.display = 'none';
  playmodeArea.style.display = 'none';
}

function getSequenceLength() {
  return parseInt(document.getElementById('moves').value, 10);
}

function addTerm(term, index) {
  sequence.push(term);
  let termDiv = document.createElement('div');
  termDiv.innerText = term;
  termDiv.id = "term_" + index;
  sequenceArea.append(termDiv);
}

function saveState(playMode) {
  if (!playMode) {
    updateUrlParameter('terms', btoa(JSON.stringify(terms)), true);
  } else {
    updateUrlParameter('sequence', btoa(JSON.stringify(sequence)), true);
  }
}

randomizeButton.addEventListener('click', () => {
  newSequence = [];

  for (let i = 0; i < getSequenceLength(); i++) {
    let randomIndex = Math.floor(Math.random() * terms.length);
    newSequence.push(terms[randomIndex]);
  }

  switchToPlayMode(newSequence);
});

aaabButton.addEventListener('click', () => {
  newSequence = [];

  for (let i = 0; i < getSequenceLength()/4; i++) {
    let randomIndex = Math.floor(Math.random() * terms.length);
    let randomIndexB = Math.floor(Math.random() * (terms.length - 1));
    if (randomIndex == randomIndexB) {
      randomIndexB = terms.length - 1;
    }
    newSequence.push(
        terms[randomIndex],
        terms[randomIndex],
        terms[randomIndex],
        terms[randomIndexB],
    );
  }

  switchToPlayMode(newSequence);
});

ababButton.addEventListener('click', () => {
  newSequence = [];

  for (let i = 0; i < getSequenceLength()/4; i++) {
    let randomIndex = Math.floor(Math.random() * terms.length);
    let randomIndexB = Math.floor(Math.random() * (terms.length - 1));
    if (randomIndex == randomIndexB) {
      randomIndexB = terms.length - 1;
    }
    newSequence.push(
        terms[randomIndex],
        terms[randomIndexB],
        terms[randomIndex],
        terms[randomIndexB]
    );
  }

  switchToPlayMode(newSequence);
});

asisButton.addEventListener('click', () => {
  newSequence = [];

  for (let i in terms) {
    newSequence.push(terms[i]);
  }

  switchToPlayMode(newSequence);
});

function stop() {
    clearInterval(timer);
    stopButton.disabled = true;
    playButton.disabled = false;
    noSleep.disable();

    // Clean up any highlighted term.
    let currents = document.getElementsByClassName('current');
    for (el in currents) {
      currents[el].classList = '';
    }
    
    saveState(false);
}

stopButton.addEventListener('click', () => {
    stop();
});

playButton.addEventListener('click', () => {
    playButton.disabled = true;
    stopButton.disabled = false;
    noSleep.enable();

    let currentTerm = 0;
    let playNext = () => {
        if (currentTerm > 0) {
          document.getElementById('term_' + (currentTerm - 1)).classList.remove('current');
        }
        let termElement = document.getElementById('term_' + currentTerm);
        termElement.classList.add('current');
        // Scroll down, but keep at least 2 terms above.
        if (currentTerm > 2) {
          window.scrollTo(0, termElement.offsetTop - sequenceInitialHeight);
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

moveListTextArea.addEventListener('keyup', () => {
    updateTerms();
    saveState(false);
});

resetButton.addEventListener('click', () => {
  switchToSetupMode();
});

try {
  terms = JSON.parse(atob(getUrlParameter('terms')));
} catch {}

if (!terms) {
  try {
    sequence = JSON.parse(atob(getUrlParameter('sequence')));
  } catch {}
}
// Display checkboxes for moves.
let initialText = '';

terms = terms || defaultTerms;
for (let term in terms) {
  initialText += terms[term] + "\n";
}
moveListTextArea.value = initialText;

if (sequence) {
  switchToPlayMode(sequence);
}
