const time_DOM = document.querySelector('time');
const paragraph_DOM = document.querySelector('p');
const input_DOM = document.querySelector('input');
const progressBar_DOM = document.getElementById('progress-bar'); // Nueva línea

const INITIAL_TIME = 10; 
const TEXT = 'Typing tests are a great way to enhance your keyboard skills. By practicing regularly, you can increase your speed, accuracy, and overall efficiency. Keep challenging yourself and track your progress to see improvements over time.';

let words = [];
let current_time = INITIAL_TIME;
let timerStarted = false;
let intervalTime;

startGame();
startEvents();

function startGame() {
    words = TEXT.split(' ').slice(0, 35);
    current_time = INITIAL_TIME;
    time_DOM.textContent = formatTime(current_time);
    timerStarted = false; 

    progressBar_DOM.style.width = '100%';
    progressBar_DOM.classList.remove('warning');
    progressBar_DOM.classList.remove('alert');

    paragraph_DOM.innerHTML = words.map((word, index) => {
        const letters = word.split('');
        return `<x-word>${letters.map(letter => `<x-letter>${letter}</x-letter>`).join('')}</x-word>`;
    }).join('');

    const fWord = paragraph_DOM.querySelector('x-word');
    fWord.classList.add('active');
    fWord.querySelector('x-letter').classList.add('active');
}

function startEvents() {
    document.addEventListener('touchstart', () => {
        input_DOM.focus();
    });

    document.addEventListener('keydown', () => {
        input_DOM.focus();
    });
    input_DOM.addEventListener('keydown', onKeyDown);
    input_DOM.addEventListener('keyup', onKeyUp);
}


function onKeyDown(event) {
    const currentWord_DOM = paragraph_DOM.querySelector('x-word.active');
    const currentLetter_DOM = paragraph_DOM.querySelector('x-letter.active');

    const { key } = event;
    if (key == ' ') {
        event.preventDefault();
        const nextWord_DOM = currentWord_DOM.nextElementSibling;
        const nextLetter_DOM = nextWord_DOM.querySelector('x-letter');

        currentWord_DOM.classList.remove('active');
        currentLetter_DOM.classList.remove('active');

        nextWord_DOM.classList.add('active');
        nextLetter_DOM.classList.add('active');
        input_DOM.value = '';

        const hasMissedLetters = currentWord_DOM.querySelectorAll('x-letter:not(.correct)').length <= 0;
        const classToAdd = hasMissedLetters ? 'correct' : 'underlined';
        currentWord_DOM.classList.add(classToAdd);
    }

    if (key == 'Backspace') {
        const prevWord_DOM = currentWord_DOM?.previousElementSibling;
        const prevLetter_DOM = currentLetter_DOM?.previousElementSibling;

        if (!prevLetter_DOM && !prevWord_DOM) {
            event.preventDefault();
            return;
        }

        const wordMarked_DOM = paragraph_DOM.querySelector('x-word.underlined');
        if (wordMarked_DOM && !prevLetter_DOM) {
            event.preventDefault();
            prevWord_DOM.classList.remove('underlined');
            prevWord_DOM.classList.add('active');

            const letterToGo = prevWord_DOM.querySelector('x-letter:last-child');

            currentLetter_DOM.classList.remove('active');
            letterToGo.classList.add('active');

            input_DOM.value = [
                ...prevWord_DOM.querySelectorAll('x-letter.correct', 'x-letter.incorrect')
            ].map(pl => {
                return pl.classList.contains('correct') ? pl.innerText : '*';
            }).join('');
        }
    }
}

function onKeyUp() {
    if (!timerStarted) {
        timerStarted = true;
        intervalTime = setInterval(() => {
            current_time--;
            time_DOM.textContent = formatTime(current_time);


            const elapsed_time = INITIAL_TIME - current_time;
            const progressPercentage = (elapsed_time / INITIAL_TIME) * 100;
            progressBar_DOM.style.width = `${100 - progressPercentage}%`;

            if (current_time <= (INITIAL_TIME * 0.5)) {
                progressBar_DOM.classList.add('warning');
            }

            if (current_time <= (INITIAL_TIME * 0.2)) {
                progressBar_DOM.classList.remove('warning');
                progressBar_DOM.classList.add('alert');
            }

            if (current_time <= 0 && progressBar_DOM.style.width == "0%") {
                clearInterval(intervalTime);
                setTimeout(() => {
                    gameOver();
                }, 1000);
            }
        }, 1000);
    }

    const currentWord_DOM = paragraph_DOM.querySelector('x-word.active');
    const currentLetter_DOM = paragraph_DOM.querySelector('x-letter.active');

    const currentWord = currentWord_DOM.innerText.trim();
    input_DOM.maxLength = currentWord.length;

    const allLetters_DOM = currentWord_DOM.querySelectorAll('x-letter');
    allLetters_DOM.forEach(letter_DOM => letter_DOM.classList.remove('correct', 'incorrect'));

    input_DOM.value.split('').forEach((character, index) => {
        const letter_DOM = allLetters_DOM[index];
        const letterToCheck = currentWord[index];

        const letterCorrect = character == letterToCheck;
        const letterClass = letterCorrect ? 'correct' : 'incorrect';
        letter_DOM.classList.add(letterClass);
    });

    currentLetter_DOM.classList.remove('active', 'is-last');

    const inputLength = input_DOM.value.length;
    const nextActiveLetter_DOM = allLetters_DOM[inputLength];

    if (nextActiveLetter_DOM) {
        nextActiveLetter_DOM.classList.add('active');
        currentLetter_DOM.style.transform = `translateX(${inputLength * 100}%);`; // Mover el cursor
    } else {
        currentLetter_DOM.classList.add('active', 'is-last');
        currentLetter_DOM.style.transform = `translateX(100%);`; // Mover el cursor al final
    }
}

function gameOver() {
    clearInterval(intervalTime); // Asegurarse de que el intervalo se detenga
    input_DOM.disabled = true;
    input_DOM.removeEventListener('keydown', onKeyDown);
    input_DOM.removeEventListener('keyup', onKeyUp);

    const totalWords = paragraph_DOM.querySelectorAll('x-word').length;
    const correctWords = paragraph_DOM.querySelectorAll('x-word.correct').length;
    const incorrectWords = totalWords - correctWords;
    const wordsPerMinute = Math.round((correctWords / INITIAL_TIME) * 60);
    const totalLettersTyped = Array.from(paragraph_DOM.querySelectorAll('x-letter'))
        .filter(letter => letter.classList.contains('correct') || letter.classList.contains('incorrect'))
        .length;
    const correctLetters = paragraph_DOM.querySelectorAll('x-letter.correct').length;
    const accuracy = Math.round((correctLetters / totalLettersTyped) * 100);

    const results_DOM = document.getElementById('results');
    results_DOM.innerHTML = `
        <h2>Game Over</h2>
        <p>Correct Words: ${correctWords}</p>
        <p>Incorrect/Pending Words: ${incorrectWords}</p>
        <p>Words Per Minute: ${wordsPerMinute}</p>
        <p>Accuracy: ${accuracy}%</p>
        <button id="restart">Restart</button>
    `;

    const restartButton = document.getElementById('restart');
    restartButton.addEventListener('click', () => {
        results_DOM.innerHTML = '';
        input_DOM.disabled = false;
        input_DOM.value = '';
        startGame();
        startEvents();
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}