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

// Timer for the periodic speech output. Set on play.
let timer;

let player = new TermPlayer();

primeButton.addEventListener('click', () => {
  // Prime the speech synthesis.
  player.play(' ');
  document.getElementById('controls').style.display = null;
  primeButton.style.display = 'none';
  return false;
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

stopButton.addEventListener('click', () => {
    clearInterval(timer);
    stopButton.disabled = true;
    playButton.disabled = false;
});

playButton.addEventListener('click', () => {
    let activeSounds = [];
    let bpm = parseInt(bpmInput.value, 10);
    let delayValue = 60*8*1000/bpm;
    player.play('Starting');
    timer = setInterval(() => {
        let index = Math.floor(Math.random() * selectedTerms.length);
        player.play(selectedTerms[index]);
        }, delayValue);
    playButton.disabled = true;
    stopButton.disabled = false;
});