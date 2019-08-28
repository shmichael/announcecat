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

// Copy the default terms. Maybe we don't need defaults at all.
selectedTerms = defaultTerms.slice()

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
let moveList = document.getElementById('moveList');
for (let term in defaultTerms) {
  // Create checkboxes.
  let checkboxContainer = document.createElement('div');
  let checkbox = document.createElement('input');
  checkbox.name = defaultTerms[term];
  checkbox.type = 'checkbox';
  checkbox.checked = 1;
  checkbox.classList.add('round-checkbox');
  checkbox.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  checkbox.onchange = () => {
    if (checkbox.checked) {
      selectedTerms.push(checkbox.name);
    } else {
      let index = selectedSounds.indexOf(checkbox.name);
      if (index > -1) {
        selectedTerms.splice(index, 1);
      }
    }
  };

  // Add checkbox labels.
  let label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.appendChild(document.createElement('span'));
  label.appendChild(document.createTextNode(defaultTerms[term]));
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  moveList.appendChild(checkboxContainer);

}

let bpmInput = document.getElementById('bpm');
let primeButton = document.getElementById('prime');
let clearButton = document.getElementById('clear');
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

let player = new TermPlayer();

primeButton.addEventListener('click', () => {
  // Prime the speech synthesis.
  player.play(' ');

  // Swap the controls.
  selectionArea.style.display = 'none';
  sequenceArea.style.display = null;
  controlsArea.style.display = null;

  // Generate the sequence. Clear any previous sequence.
  sequence = [];
  sequenceArea.innerHtml = '';
  while (sequenceArea.firstChild) {
    sequenceArea.removeChild(sequenceArea.firstChild);
  }

  let bpm = parseInt(bpmInput.value, 10);
  let minutes = parseInt(document.getElementById('minutes').value, 10);
  let seconds = parseInt(document.getElementById('seconds').value, 10);
  let totalSongMinutes = minutes + seconds/60;
  let totalBeats = totalSongMinutes * bpm;
  // Sequence is one move per 8 beats. The first move will be "starting", so remove 1.
  let lengthOfSequence = parseInt(totalBeats / 8 - 1, 10);
  for (let i = 0; i < lengthOfSequence; i++) {
    let randomIndex = Math.floor(Math.random() * selectedTerms.length);
    sequence.push(selectedTerms[randomIndex]);
    let termDiv = document.createElement('div');
    termDiv.innerText = selectedTerms[randomIndex];
    termDiv.id = "term_" + i;
    sequenceArea.append(termDiv);
  }
});

clear.addEventListener('click', () => {
    let moveListCollection = Array.prototype.slice.call( moveList.children );
    moveListCollection.filter(
        el => {
          return el &&
          el.children &&
          el.children[0] &&
          el.children[0].type &&
          el.children[0].type == 'checkbox';
        }).map(el => {
          el.children[0].checked = false;
        });
});

function stop() {
    clearInterval(timer);
    stopButton.disabled = true;
    playButton.disabled = false;
}

stopButton.addEventListener('click', () => {
    stop();
});

playButton.addEventListener('click', () => {
    let activeSounds = [];
    let bpm = parseInt(bpmInput.value, 10);
    let delayValue = 60*8*1000/bpm;
    let currentTerm = 0;
    player.play('Starting');
    timer = setInterval(() => {
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
    }, delayValue);
    playButton.disabled = true;
    stopButton.disabled = false;
});

resetButton.addEventListener('click', () => {
  stop();
  // Swap the controls.
  selectionArea.style.display = null;
  sequenceArea.style.display = 'none';
  controlsArea.style.display = 'none';
});
