const time_DOM = document.querySelector('time');
const paragraph_DOM = document.querySelector('p');
const input_DOM = document.querySelector('input');

const INITIAL_TIME = 30

const TEXT = 'Typing tests are a great way to enhance your keyboard skills. By practicing regularly, you can increase your speed, accuracy, and overall efficiency. Keep challenging yourself and track your progress to see improvements over time.'

let words = [];
let current_time = INITIAL_TIME;

startGame()
startEvents()

function startGame() {
    words = TEXT.split(' ').slice(0,35) 
    current_time = INITIAL_TIME
    time_DOM.textContent = current_time

    paragraph_DOM.innerHTML = words.map((word, index)=>{
        const letters = word.split('')
        //*         created custom elements in HTML x-word and x-letter         *//
        return `<x-word>${letters.map( letter => `<x-letter>${letter}</x-letter>`).join('')}</x-word>` 
    }).join('')

    const fWord=paragraph_DOM.querySelector('x-word')
    fWord.classList.add('active')
    fWord.querySelector('x-letter').classList.add('active')

    //*         Timer Logic         *//
    const intervalTime = setInterval(()=>{
        current_time--
        time_DOM.textContent = current_time

        if (current_time == 0) {
            gameOver()
            clearInterval(intervalTime)
        }
    }, 1000)
}

function startEvents() {

    //*         Actual-active word/letter will be recovered here          *//

    document.addEventListener('keydown', ()=>{
        input_DOM.focus()
    })
    input_DOM.addEventListener('keydown', onKeyDown)
    input_DOM.addEventListener('keyup', onKeyUp)

    function onKeyDown(event) {
        const currentWord_DOM = paragraph_DOM.querySelector('x-word.active')
        const currentLetter_DOM = paragraph_DOM.querySelector('x-letter.active')

        const {key} = event
        if (key == ' ') {
            console.log("Spacebar")
            event.preventDefault()
            const nextWord_DOM = currentWord_DOM.nextElementSibling
            const nextLetter_DOM = nextWord_DOM.querySelector('x-letter')
            
            currentWord_DOM.classList.remove('active')
            currentLetter_DOM.classList.remove('active')

            nextWord_DOM.classList.add('active')
            nextLetter_DOM.classList.add('active')
            input_DOM.value = ''

            const hasMissedLetters = currentWord_DOM.querySelectorAll('x-letter:not(.correct)').length <= 0
            const classToAdd = hasMissedLetters ? 'correct' : 'underlined'
            currentWord_DOM.classList.add(classToAdd)

        }

        if (key == 'Backspace') {
            const prevWord_DOM = currentWord_DOM?.previousElementSibling
            const prevLetter_DOM = currentLetter_DOM?.previousElementSibling

            if (!prevLetter_DOM && !prevWord_DOM) {
                event.preventDefault()
                return
            }

            const wordMarked_DOM = paragraph_DOM.querySelector('x-word.underlined')
            if (wordMarked_DOM && !prevLetter_DOM) {
                event.preventDefault()
                prevWord_DOM.classList.remove('underlined')
                prevWord_DOM.classList.add('active')

                const letterToGo = prevWord_DOM.querySelector('x-letter:last-child')
                
                currentLetter_DOM.classList.remove('active')
                letterToGo.classList.add('active')

                input_DOM.value = [
                    ...prevWord_DOM.querySelectorAll('x-letter.correct','x-letter.incorrect')
                ].map(pl => {
                    return pl.classList.contains('correct') ? pl.innerText : '*'
                }).join('')
            }
        }
    }
    function onKeyUp() {
        const currentWord_DOM = paragraph_DOM.querySelector('x-word.active')
        const currentLetter_DOM = paragraph_DOM.querySelector('x-letter.active')

        const currentWord = currentWord_DOM.innerText.trim()
        input_DOM.maxLength = currentWord.length;
        console.log({value: input_DOM.value, currentWord})

        const allLetters_DOM = currentWord_DOM.querySelectorAll('x-letter')


        allLetters_DOM.forEach(letter_DOM => letter_DOM.classList.remove('correct','incorrect'))

        input_DOM.value.split('').forEach((character, index)=>{
            const letter_DOM = allLetters_DOM[index]
            const letterToCheck = currentWord[index]

            //*         Correct and incorrect words             *//

            const letterCorrect = character == letterToCheck
            const letterClass = letterCorrect ? 'correct' : 'incorrect' 
            letter_DOM.classList.add(letterClass)
        })

        currentLetter_DOM.classList.remove('active', 'is-last')

        const inputLength = input_DOM.value.length
        const nextActiveLetter_DOM = allLetters_DOM[inputLength]

        if (nextActiveLetter_DOM) {
            nextActiveLetter_DOM.classList.add('active')
        }
        else{
            currentLetter_DOM.classList.add('active', 'is-last')
        }
        
    }
}

function gameOver() {
    console.log("Game Over")
    alert("Game Over")
}