const defaultTerms = [
  'Boogie Back',
  'Boogie forward',
  'Fall off the log',
  'Half Breaks',
  'Shorty George',
  'Suzy Q',
]

class CymbalPlayer {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.brush = null;
    this.hihat = null;
    this.loadFile('brush.wav', (buffer) => this.brush = buffer);
    this.loadFile('hh.wav', (buffer) => this.hihat = buffer);
    this.loadFile('sd2.wav', (buffer) => this.sidedrum = buffer);
  }

  loadFile(file, callback) {
    let request = new XMLHttpRequest();
    request.open('GET',file, true);
    request.responseType='arraybuffer';
    request.onload = () => {
      this.context.decodeAudioData(request.response).then(callback);
    };
    request.send();
  }

  playSound(sound, time) {
    let source = this.context.createBufferSource();
    source.buffer = sound;
    source.connect(this.context.destination);
    source.start(time);
  }

  playSwingPhrase(beatLength) {
    setTimeout(() => {
      if (!this.shouldPlay) {
	return;
      }
      let baseTime = this.audioResumeTime + this.bar * 8 * beatLength;
      for (let i = 0; i < 4; i++) {
	this.playSound(this.brush, baseTime + beatLength * 2 * i);
	this.playSound(this.brush, baseTime + beatLength * (0.66 + 2 * i));
	this.playSound(this.brush, baseTime + beatLength * (1 + 2 * i));
      }
      this.playSound(this.hihat, baseTime + beatLength * 1);
      this.playSound(this.hihat, baseTime + beatLength * 5);
      this.playSound(this.sidedrum, baseTime + beatLength * 8);
      this.bar++;
      this.playSwingPhrase(beatLength);
    }, beatLength * 8000);
  }
  

  start(bpm) {
    this.audioResumeTime = this.context.currentTime;
    let timing = 60/bpm;
    this.shouldPlay = true;
    this.bar = 0;
    this.playSwingPhrase(timing);
  }

  stop() {
    this.shouldPlay = false;
  }
}

class TermPlayer {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
  }

  play(term) {
    let msg = new SpeechSynthesisUtterance(term);
    msg.volume = 1.2;
    msg.rate = 1.2;
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
let cymbalsCheckbox = document.getElementById('cymbals');
let movedelayArea = document.getElementById('movedelay');
let delayInput = document.getElementById('delay');

// Timer for the periodic speech output. Set on play.
let timer;

// Sequence of moves. Generated when button clicked.
let sequence;
let terms;
let sequenceInitialHeight;
let noSleep = new NoSleep();

let player = new TermPlayer();
let cymbals = new CymbalPlayer();

function updateTerms() {
  terms = moveListTextArea.value.replace(/^\s*[\r\n]|\n^$/gm, "").split('\n');
}

function switchToPlayMode(newSequence) {
  // Prime the speech synthesis.
  player.play(' ');

  // Swap the controls.
  generationArea.style.display = 'none';
  moveListTextArea.style.display = 'none';
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
  window.scrollTo(0, 0);

  saveState(true /* playmode */);
}

function switchToSetupMode() {
  stop();
  // Swap the controls.
  generationArea.style.display = null;
  moveListTextArea.style.display = null;
  sequenceArea.style.display = 'none';
  playmodeArea.style.display = 'none';
  window.scrollTo(0, 0);

  saveState(false /* playmode */);
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

cymbalsCheckbox.addEventListener('click', () => {
  if (!cymbalsCheckbox.checked) {
    movedelayArea.style.display = 'none';
  } else {
    movedelayArea.style.display = null;
  }
});

function stop() {
    cymbals.stop();
    clearInterval(timer);
    stopButton.disabled = true;
    playButton.disabled = false;
    noSleep.disable();

    // Clean up any highlighted term.
    let currents = document.getElementsByClassName('current');
    for (el in currents) {
      currents[el].classList = '';
    }
    
    saveState(false /* playmode */);
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
    let singleBeatDelay = 60000/bpm;
    let moveDelay = 0;
    if (cymbalsCheckbox.checked) {
      cymbals.start(bpm);
      moveDelay = delayInput.value;
    }
    setTimeout(() => {
      timer = setInterval(playNext, singleBeatDelay*8);
      playNext();
    }, moveDelay * singleBeatDelay);
});

moveListTextArea.addEventListener('keyup', () => {
    updateTerms();
    saveState(false /* playmode */);
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
