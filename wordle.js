let targetWord = "";
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let board = [];
let keyStates = {};

const keyboardLayout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

async function getWordsOfWisdom() {
    let i = getId();
    try {
        const response = await fetch(`/.netlify/functions/in_the_begining_were_the_words?i=${i}`); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        targetWord = data.word;
        console.log('Palabra del Wordle cargada (oculta):', targetWord);

    } catch (error) {
        console.error('Error al obtener la palabra del Wordle:', error);
        messageDiv.textContent = 'Error al cargar el Wordle. Inténtalo de nuevo.';
    }
}

// Inicializar el juego
function initGame() {

    getWordsOfWisdom();
    console.log("Palabra secreta:", targetWord); // Para debugging
    
    // Inicializar tablero
    board = Array(6).fill().map(() => Array(5).fill(""));
    currentRow = 0;
    currentCol = 0;
    gameOver = false;
    keyStates = {};
    
    createGameBoard();
    createKeyboard();
}

// Crear tablero de juego
function createGameBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'board-row';
        
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        
        gameBoard.appendChild(row);
    }
}

// Crear teclado
function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    
    keyboardLayout.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyButton = document.createElement('button');
            keyButton.className = `key ${key === "ENTER" || key === "⌫" ? "key-large" : ""}`;
            keyButton.textContent = key;
            keyButton.id = `key-${key}`;
            
            keyButton.addEventListener('click', () => handleKeyPress(key));
            
            keyboardRow.appendChild(keyButton);
        });
        
        keyboard.appendChild(keyboardRow);
    });
}

function getId() {
    const urlParams = new URLSearchParams(window.location.search);
    const indexStr = urlParams.get('i');
    if (indexStr) {
        const index = parseInt(indexStr, 10); 
        if (!isNaN(index) && index >= 0) {
            return index;
        }
    }
    return null;
}

// Manejar presión de teclas
function handleKeyPress(key) {
    if (gameOver) return;

    if (key === "ENTER") {
        submitGuess();
    } else if (key === "⌫") {
        deleteLetter();
    } else if (key.length === 1 && currentCol < 5) {
        addLetter(key);
    }
}

// Agregar letra
function addLetter(letter) {
    if (currentCol < 5) {
        board[currentRow][currentCol] = letter;
        const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
        tile.textContent = letter;
        tile.classList.add('filled');
        currentCol++;
    }
}

// Borrar letra
function deleteLetter() {
    if (currentCol > 0) {
        currentCol--;
        board[currentRow][currentCol] = "";
        const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
        tile.textContent = "";
        tile.classList.remove('filled');
    }
}

// Enviar intento
function submitGuess() {
    if (currentCol !== 5) {
        showMessage("Palabra incompleta");
        shakeRow(currentRow);
        return;
    }

    const guess = board[currentRow].join("");

    // Evaluar el intento
    evaluateGuess(guess);
    
    // Verificar si ganó
    if (guess === targetWord) {
        gameOver = true;
        showMessage("¡Felicidades! ¡Ganaste!");
        return;
    }

    // Pasar a la siguiente fila
    currentRow++;
    currentCol = 0;

    // Verificar si perdió
    if (currentRow >= 6) {
        gameOver = true;
        showMessage(`Perdiste. La palabra era: ${targetWord}`);
    }
}

// Evaluar intento
function evaluateGuess(guess) {
    const targetArray = targetWord.split("");
    const guessArray = guess.split("");
    const result = Array(5).fill("absent");
    const targetUsed = Array(5).fill(false);
    const guessUsed = Array(5).fill(false);

    // Primera pasada: marcar letras correctas
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] === targetArray[i]) {
            result[i] = "correct";
            targetUsed[i] = true;
            guessUsed[i] = true;
        }
    }

    // Segunda pasada: marcar letras presentes
    for (let i = 0; i < 5; i++) {
        if (!guessUsed[i]) {
            for (let j = 0; j < 5; j++) {
                if (guessArray[i] === targetArray[j]) {
                    result[i] = "present";
                    if(!targetUsed[j]) {
                        targetUsed[j] = true;
                    }
                    break;
                }
            }
        }
    }

    // Aplicar colores a las casillas
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        const letter = guessArray[i];
        
        setTimeout(() => {
            tile.classList.add(result[i]);
            updateKeyState(letter, result[i]);
        }, i * 100);
    }
}

// Actualizar estado de las teclas
function updateKeyState(letter, state) {
    const currentState = keyStates[letter];
    
    if (!currentState || 
        (currentState === "absent" && state !== "absent") ||
        (currentState === "present" && state === "correct")) {
        keyStates[letter] = state;
        
        const keyElement = document.getElementById(`key-${letter}`);
        if (keyElement) {
            keyElement.className = `key ${state}`;
        }
    }
}

// Mostrar mensaje
function showMessage(text) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.classList.add('show');
    
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 2000);
}

//********************************************************* FALTA EXPLICACION DE ESTO ******************************************************************/
// Animar fila inválida
function shakeRow(row) {
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${row}-${i}`);
        tile.classList.add('invalid');
        setTimeout(() => {
            tile.classList.remove('invalid');
        }, 500);
    }
}

// Nuevo juego
function startNewGame() {
    initGame();
}

// Manejar teclado físico
document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    
    if (key === "ENTER") {
        handleKeyPress("ENTER");
    } else if (key === "BACKSPACE") {
        handleKeyPress("⌫");
    } else if (key.match(/[A-Z]/) && key.length === 1) {
        handleKeyPress(key);
    }
});

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initGame);