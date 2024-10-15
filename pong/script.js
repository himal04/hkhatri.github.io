const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;
const enhancedPlayerSpeed = 7; // Increased player paddle speed
const initialBallSpeed = 5; // Set initial ball speed
const winningScore = 11;

let player1Score = 0;
let player2Score = 0;

const player1ScoreDisplay = document.getElementById("player1Score");
const player2ScoreDisplay = document.getElementById("player2Score");
const winnerDisplay = document.getElementById("winnerDisplay");
const restartButton = document.getElementById("restartButton");
const mainMenuButton = document.getElementById("mainMenuButton");
const menu = document.getElementById("menu");
const difficultyMenu = document.getElementById("difficultyMenu");
const singlePlayerButton = document.getElementById("singlePlayerButton");
const twoPlayerButton = document.getElementById("twoPlayerButton");
const easyButton = document.getElementById("easyButton");
const mediumButton = document.getElementById("mediumButton");
const hardButton = document.getElementById("hardButton");
const scoreboard = document.getElementById("scoreboard");
const controls = document.getElementById("controls");

let player1 = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

let player2 = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    dx: initialBallSpeed * (Math.random() > 0.5 ? 1 : -1),
    dy: initialBallSpeed * (Math.random() > 0.5 ? 1 : -1)
};

let isSinglePlayer = false;
let difficulty = "medium";  // Default difficulty

// Computer speed settings based on difficulty
let computerSpeed = {
    easy: 3,
    medium: 5,
    hard: 7
};

// Reaction delay to make the computer beatable
let computerDelay = {
    easy: 0.4,  // Less responsive
    medium: 0.6, // Moderate response
    hard: 1      // Very responsive
};

let gameInterval;
let isGameActive = false; // Track if the game is currently active

function drawPaddle(paddle) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function movePaddle(paddle) {
    paddle.y += paddle.dy;

    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddle.height > canvas.height) paddle.y = canvas.height - paddle.height;
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    if (
        (ball.x - ball.radius < player1.x + player1.width && ball.y > player1.y && ball.y < player1.y + player1.height) ||
        (ball.x + ball.radius > player2.x && ball.y > player2.y && ball.y < player2.y + player2.height)
    ) {
        ball.dx *= -1;
    }

    // Ball goes out of bounds (scoring)
    if (ball.x - ball.radius < 0) {
        player2Score++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player1Score++;
        updateScore();
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Keep ball speed constant
    ball.dx = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
}

function updateScore() {
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;

    if (player1Score === winningScore || player2Score === winningScore) {
        endGame();
    }
}

function endGame() {
    const winner = player1Score === winningScore ? "Player 1" : (isSinglePlayer ? "Computer" : "Player 2");
    winnerDisplay.textContent = `${winner} Wins!`;
    winnerDisplay.classList.remove("hidden");
    ball.dx = 0; // Stop the ball
    ball.dy = 0; // Stop the ball
    clearInterval(gameInterval); // Stop the game loop
    isGameActive = false; // Mark game as inactive
    controls.classList.remove("hidden"); // Show controls only after the game ends
}

function restartGame() {
    player1Score = 0;
    player2Score = 0;
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
    winnerDisplay.classList.add("hidden");
    resetBall(); // Reset ball position
    controls.classList.add("hidden"); // Hide controls after restarting the game
    startGame(); // Start a new game
}

function computerMovement() {
    const paddleCenter = player2.y + player2.height / 2;

    // Adjust response time and paddle speed based on difficulty
    if (ball.y < paddleCenter - ballRadius * computerDelay[difficulty]) {
        player2.dy = -computerSpeed[difficulty];
    } else if (ball.y > paddleCenter + ballRadius * computerDelay[difficulty]) {
        player2.dy = computerSpeed[difficulty];
    } else {
        player2.dy = 0;
    }
}

function update() {
    movePaddle(player1);
    movePaddle(player2);
    moveBall();

    if (isSinglePlayer) {
        computerMovement();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(player1);
    drawPaddle(player2);
    drawBall();
}

function gameLoop() {
    update();
    draw();
}

function startGame() {
    difficultyMenu.classList.add("hidden");
    canvas.classList.remove("hidden");
    scoreboard.classList.remove("hidden");
    controls.classList.add("hidden"); // Hide controls at the start of the game
    winnerDisplay.classList.add("hidden"); // Hide winner display at the start of the game
    resetBall(); // Reset the ball to center before starting the game
    isGameActive = true; // Mark game as active
    gameInterval = setInterval(gameLoop, 1000 / 60); // Start the game loop
}

document.addEventListener("keydown", (e) => {
    if (e.key === "w") player1.dy = -enhancedPlayerSpeed;  // Increased player 1 speed
    if (e.key === "s") player1.dy = enhancedPlayerSpeed;

    if (!isSinglePlayer) {
        if (e.key === "ArrowUp") player2.dy = -enhancedPlayerSpeed;  // Increased player 2 speed in multiplayer
        if (e.key === "ArrowDown") player2.dy = enhancedPlayerSpeed;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "s") player1.dy = 0;
    if (!isSinglePlayer) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") player2.dy = 0;
    }
});

restartButton.addEventListener("click", () => {
    restartGame();
});

mainMenuButton.addEventListener("click", () => {
    window.location.reload(); // Reload the page to return to the main menu
});

singlePlayerButton.addEventListener("click", () => {
    menu.classList.add("hidden");
    difficultyMenu.classList.remove("hidden");
});

twoPlayerButton.addEventListener("click", () => {
    isSinglePlayer = false;
    menu.classList.add("hidden");
    startGame();
});

easyButton.addEventListener("click", () => {
    difficulty = "easy";
    isSinglePlayer = true;
    startGame();
});

mediumButton.addEventListener("click", () => {
    difficulty = "medium";
    isSinglePlayer = true;
    startGame();
});

hardButton.addEventListener("click", () => {
    difficulty = "hard";
    isSinglePlayer = true;
    startGame();
});

