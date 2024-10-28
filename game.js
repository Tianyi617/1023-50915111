const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// 加載音樂和音效
const backgroundMusic = new Audio('background.mp3');
const hitSound = new Audio('hit.mp3');

// 在你的變量聲明之前
// 定義背景主題的變量
let currentBackground = 'night'; // 默認背景主題

// 分數系統
let score = 0;
let lives = 3; // 初始生命次數

// 擋板
const paddle = {
    width: 100,
    height: 20,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    speed: 10,
    dx: 0
};
const backgroundImages = {
    night: new Image(),
    forest: new Image()
};

backgroundImages.night.src = 'background_night.jpg';
backgroundImages.forest.src = 'background_forest.jpg';

// 繪製背景函數
function drawBackground() {
    ctx.drawImage(backgroundImages[currentBackground], 0, 0, canvas.width, canvas.height);
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#00008B'; // 將擋板顏色改為深藍色
    ctx.fill();
    ctx.closePath();
}

function movePaddle() {
    paddle.x += paddle.dx;

    // 防止擋板超出邊界
    if (paddle.x < 0) {
        paddle.x = 0;
    } else if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}
// 設置背景主題的函數
function setBackground(theme) {
    if (backgroundImages[theme]) {
        currentBackground = theme; // 設置當前主題
    }
}

// 設置網頁背景顏色的函數
function setBodyBackgroundColor(color) {
    document.body.style.backgroundColor = color;
}
// 鍵盤控制擋板
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'ArrowLeft') {
        paddle.dx = -paddle.speed;
    }
});

// 添加滑鼠移動事件來控制擋板
canvas.addEventListener('mousemove', (event) => {
    const mousePos = getMousePos(canvas, event);
    paddle.x = mousePos.x - paddle.width / 2; // 設置擋板為滑鼠位置的中心

    // 確保擋板不會超出邊界
    if (paddle.x < 0) {
        paddle.x = 0;
    } else if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
});

// 獲取滑鼠位置
function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
document.addEventListener('keyup', () => {
    paddle.dx = 0;
});

// 磚塊
const brickWidth = 70;
// 磚塊設置
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 35;

// 計算可以放置的列數
let brickColumnCount = Math.floor((canvas.width - brickOffsetLeft * 2 + brickPadding) / (brickWidth + brickPadding));
let brickRowCount = 5; // 你可以根據需要修改行數

// 修改磚塊生成函數
function createBricks() {
    bricks = []; // 重置磚塊
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            let hitPoints = Math.floor(Math.random() * 3) + 1; // 隨機生成生命值
            bricks[c][r] = { x: 0, y: 0, status: 1, hitPoints: hitPoints }; // 設置磚塊的生命值
        }
    }
}



// 更新 drawBricks 函數以使用新的磚塊寬度
function drawBricks() {
    const actualBrickWidth = (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) / brickColumnCount; // 計算磚塊的實際寬度
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                let brickX = c * (actualBrickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;

                // 根據磚塊的生命值設置顏色
                if (b.hitPoints === 3) {
                    ctx.fillStyle = '#FF0000'; // 紅色，表示需要3次擊打
                } else if (b.hitPoints === 2) {
                    ctx.fillStyle = '#FFA500'; // 橙色，表示需要2次擊打
                } else {
                    ctx.fillStyle = '#0095DD'; // 藍色，表示普通磚塊，只需1次擊打
                }

                // 繪製磚塊
                ctx.beginPath();
                ctx.rect(b.x, b.y, actualBrickWidth, brickHeight);
                ctx.fill();
                ctx.closePath();

                // 在磚塊上顯示剩餘擊打次數
                ctx.font = '16px Arial';
                ctx.fillStyle = '#fff';
                ctx.fillText(b.hitPoints, b.x + actualBrickWidth / 2 - 5, b.y + brickHeight / 2 + 5);
            }
        }
    }
}


// 檢查是否所有磚塊都已被擊破
function checkWin() {
    let allBricksBroken = true;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                allBricksBroken = false;
                break; // 如果找到未被擊破的磚塊，就不需要繼續檢查
            }
        }
    }
    if (allBricksBroken) {
        displayWinAnimation(); // 顯示過關動畫
    }
}

// 顯示過關動畫
function displayWinAnimation() {
    isPaused = true; // 設置遊戲為暫停狀態
    let animationFrame = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空畫布
        drawBackground(); // 繪製背景

        // 設置過關動畫的文本顏色和大小
        ctx.font = `${40 + animationFrame}px Arial`;
        ctx.fillStyle = '#00FF00';
        ctx.fillText('Level Complete!', canvas.width / 2 - 120, canvas.height / 2 - 20);

        // 設置動畫效果
        if (animationFrame < 30) {
            animationFrame++; // 增加動畫幀
            requestAnimationFrame(animate); // 繼續動畫
        } else {
            ctx.font = '20px Arial';
            ctx.fillText('Press R to Restart', canvas.width / 2 - 100, canvas.height / 2 + 20);
        }
    }

    animate(); // 開始動畫
}





// 顯示「你贏了」訊息
function youWin() {
    isGameOver = true;
    ctx.font = '40px Arial';
    ctx.fillStyle = '#00FF00';
    ctx.fillText('You Win!', canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillText('Press R to Restart', canvas.width / 2 - 170, canvas.height / 2 + 50);

    // 停止遊戲循環
    cancelAnimationFrame(animationId);
}
createBricks(); // 不要傳遞任何參數

// 球的初始速度和方向隨機化
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    radius: 10,
    dx: getRandomDirection(), // 隨機生成水平速度
    dy: getRandomDirection(), // 隨機生成垂直速度
    speed: 5
};
// 隨機生成一個正或負的速度
function getRandomDirection() {
    let direction = Math.random() < 0.5 ? -1 : 1; // 隨機選擇正或負
    return direction * (Math.random() * 2 + 3); // 隨機速度範圍在3到5之間
}


function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0000FF'; // 將球的顏色改為藍色
    ctx.fill();
    ctx.closePath();

    // 繪製尾跡
    for (let i = 1; i <= 10; i++) { // 增加尾跡的層數到 10 層
        ctx.beginPath();
        ctx.arc(ball.x - ball.dx * i * 0.5, ball.y - ball.dy * i * 0.5, ball.radius * (1 - i * 0.1), 0, Math.PI * 2); // 繪製尾跡
        ctx.fillStyle = `rgba(0, 0, 255, ${0.5 - i * 0.05})`; // 將尾跡顏色改為更透明的藍色
        ctx.fill();
        ctx.closePath();
    }
}


function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 左右邊界反彈
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    // 上邊界反彈
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // 碰到擋板
    if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.speed;
    }

    // 下邊界減少生命
    if (ball.y + ball.radius > canvas.height) {
        lives--; // 減少生命
        if (lives <= 0) {
            gameOver(); // 如果生命用完，結束遊戲
        } else {
            resetBall(); // 重置球的位置
        }
    }
    const actualBrickWidth = (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) / brickColumnCount;

    // 碰到磚塊
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                // 檢查球是否碰到磚塊的四周
                if (
                    ball.x + ball.radius > b.x &&
                    ball.x - ball.radius < b.x + actualBrickWidth &&
                    ball.y + ball.radius > b.y &&
                    ball.y - ball.radius < b.y + brickHeight
                ) {
                    // 計算碰撞的方向
                    let overlapLeft = ball.x + ball.radius - b.x;
                    let overlapRight = b.x + brickWidth - (ball.x - ball.radius);
                    let overlapTop = ball.y + ball.radius - b.y;
                    let overlapBottom = b.y + brickHeight - (ball.y - ball.radius);

                    // 判斷最小的重疊方向
                    if (overlapLeft < overlapRight && overlapLeft < overlapTop && overlapLeft < overlapBottom) {
                        ball.dx = -ball.dx; // 反彈方向
                        ball.x = b.x - ball.radius; // 修正位置
                    } else if (overlapRight < overlapLeft && overlapRight < overlapTop && overlapRight < overlapBottom) {
                        ball.dx = -ball.dx; // 反彈方向
                        ball.x = b.x + brickWidth + ball.radius; // 修正位置
                    } else if (overlapTop < overlapLeft && overlapTop < overlapRight && overlapTop < overlapBottom) {
                        ball.dy = -ball.dy; // 反彈方向
                        ball.y = b.y - ball.radius; // 修正位置
                    } else if (overlapBottom < overlapLeft && overlapBottom < overlapRight && overlapBottom < overlapTop) {
                        ball.dy = -ball.dy; // 反彈方向
                        ball.y = b.y + brickHeight + ball.radius; // 修正位置
                    }

                    hitSound.currentTime = 0;
                    hitSound.play();
                    b.hitPoints--;

                    if (b.hitPoints <= 0) {
                        b.status = 0; // 磚塊被擊破
                        score += 10; // 增加分數
                    } else {
                        score += 5; // 增加部分分數
                    }

                    checkWin(); // 檢查是否獲勝
                }
            }
        }
    }


}
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 40;
    ball.dx = getRandomDirection() * ball.speed;
    ball.dy = -ball.speed; // 讓球一開始向上運動
}


// 分數顯示
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#f0e';
    ctx.fillText('Score: ' + score, 8, 20);
    ctx.fillText('Lives: ' + lives, canvas.width - 80, 20); // 顯示生命數量
}


// 遊戲結束
let isGameOver = false;

// 修改遊戲結束函數
function gameOver() {
    isGameOver = true;
    ctx.font = '40px Arial';
    ctx.fillStyle = '#ff0000';
    ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
    ctx.fillText('Press R to Restart', canvas.width / 2 - 170, canvas.height / 2 + 50);

    // 停止遊戲循環
    cancelAnimationFrame(animationId);
}
// 添加重啟提示的函數
function drawRestartHint() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ff0000';
    ctx.fillText('Press R to Restart', canvas.width - 160, canvas.height - 20);
}
/// 重啟遊戲函數
function restartGame() {
    // 重置遊戲狀態
    isPaused = false; // 將暫停狀態設為 false
    // 重置磚塊狀態
    resetBricks(); // 假設有一個函數用於重置磚塊
    // 重置球的位置、速度等
    resetBall(); // 假設有一個函數用於重置球
    // 重新開始遊戲循環
    requestAnimationFrame(gameLoop); // 假設有一個遊戲循環函數
}
// 鍵盤重啟遊戲控制
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        if (isGameOver || isDifficultySelected) {
            resetGame();
        }
    }
});

// 假設這是一個重置磚塊的函數
function resetBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1; // 重新設置所有磚塊的狀態為可見
        }
    }
}




let isDifficultySelected = false; // 添加一個變量來檢查難度是否選擇

// 在頁面加載時顯示難度選擇界面
showDifficultySelection();
// 遊戲更新循環
let animationId;

// 在遊戲更新循環中繪製背景
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布

    if (!isDifficultySelected) {
        showDifficultySelection(); // 如果未選擇難度，顯示難度選擇界面
    } else if (!isPaused) { // 如果遊戲未暫停
        drawBackground(); // 繪製背景
        movePaddle();
        moveBall(); // 在這裡運動球的位置
        drawPaddle();
        drawBricks();
        drawBall(); // 繪製球及其尾跡
        drawScore(); // 顯示分數
        drawRestartHint(); // 顯示重啟提示

        // 檢查遊戲是否結束
        if (!isGameOver) {
            animationId = requestAnimationFrame(update);
        }
    }
}


// 設置背景主題的函數
function setBackground(theme) {
    if (backgroundImages[theme]) {
        currentBackground = theme; // 設置當前主題
    }
}
let difficulty = ''; // 保存玩家選擇的難度

// 顯示難度選擇畫面
function showDifficultySelection() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Select Difficulty:', canvas.width / 2 - 150, canvas.height / 2 - 50);

    ctx.font = '24px Arial';
    ctx.fillText('Click: Easy', canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillText('Click: Medium', canvas.width / 2 - 100, canvas.height / 2 + 40);
    ctx.fillText('Click: Hard', canvas.width / 2 - 100, canvas.height / 2 + 80);
}

// 添加滑鼠點擊事件來選擇難度
canvas.addEventListener('click', function selectDifficulty(event) {
    const mousePos = getMousePos(canvas, event);
    const difficultyY = canvas.height / 2;
    console.log(mousePos); // 輸出滑鼠位置以供檢查

    if (mousePos.y > difficultyY - 20 && mousePos.y < difficultyY + 20) {
        difficulty = 'easy';
        isDifficultySelected = true; // 設置為已選擇
        initGame();
        canvas.removeEventListener('click', selectDifficulty); // 移除事件監聽器
    } else if (mousePos.y > difficultyY + 20 && mousePos.y < difficultyY + 60) {
        difficulty = 'medium';
        isDifficultySelected = true; // 設置為已選擇
        initGame();
        canvas.removeEventListener('click', selectDifficulty); // 移除事件監聽器
    } else if (mousePos.y > difficultyY + 60 && mousePos.y < difficultyY + 100) {
        difficulty = 'hard';
        isDifficultySelected = true; // 設置為已選擇
        initGame();
        canvas.removeEventListener('click', selectDifficulty); // 移除事件監聽器
    }
});


// 獲取滑鼠位置
function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// 隨機生成一個正或負的速度
function getRandomDirection() {
    let direction = Math.random() < 0.5 ? -1 : 1; // 隨機選擇正或負
    return direction; // 只返回方向
}
let currentLevel = 1; // 當前關卡
const totalLevels = 3; // 總共關卡數量

let isPaused = false; // 新增變量來控制遊戲是否暫停

function levelCompleteAnimation() {
    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製背景
    drawBackground();

    // 顯示過關訊息
    ctx.font = '40px Arial';
    ctx.fillStyle = '#00FF00';
    ctx.fillText('Level Complete!', canvas.width / 2 - 120, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Next Level in 3 seconds...', canvas.width / 2 - 100, canvas.height / 2 + 20);

    // 等待3秒後才進入下一關
    setTimeout(() => {
        currentLevel++; // 增加關卡
        if (currentLevel <= totalLevels) {
            resetGame(); // 重置遊戲以進入下一關
        } else {
            gameWin(); // 所有關卡完成
        }
    }, 3000);

    // 停止遊戲循環
    cancelAnimationFrame(animationId);
}


function gameWin() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空畫布
    ctx.font = '40px Arial';
    ctx.fillStyle = '#00FF00';
    ctx.fillText('Congratulations! You Win!', canvas.width / 2 - 180, canvas.height / 2);
}

function resetGame() {
    lives = 3; // 重置生命
    score = 0; // 重置分數
    isPaused = false; // 將暫停狀態設為 false
    isGameOver = false; // 重置遊戲結束狀態
    isDifficultySelected = false; // 重置難度選擇狀態

    // 重置磚塊狀態
    createBricks(); // 重新生成磚塊

    // 重置球的位置、速度等
    resetBall(); // 假設有一個函數用於重置球

    // 顯示難度選擇畫面
    showDifficultySelection();

    // 重新添加難度選擇監聽器
    addDifficultySelectionListener();
}
// 假設這是一個重置磚塊的函數
function resetBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1; // 重新設置所有磚塊的狀態為可見
        }
    }
}
// 假設這是一個重置球的函數
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 40;
    ball.dx = getRandomDirection() * ballSpeed;
    ball.dy = -ballSpeed; // 讓球一開始向上運動
}
function addDifficultySelectionListener() {
    canvas.addEventListener('click', function selectDifficulty(event) {
        const mousePos = getMousePos(canvas, event);
        const difficultyY = canvas.height / 2;
        console.log(mousePos); // 輸出滑鼠位置以供檢查

        if (mousePos.y > difficultyY - 20 && mousePos.y < difficultyY + 20) {
            difficulty = 'easy';
            isDifficultySelected = true; // 設置為已選擇
            startGame();
            canvas.removeEventListener('click', selectDifficulty); // 移除事件監聽器
        } else if (mousePos.y > difficultyY + 20 && mousePos.y < difficultyY + 60) {
            difficulty = 'medium';
            isDifficultySelected = true; // 設置為已選擇
            startGame();
            canvas.removeEventListener('click', selectDifficulty); // 移除事件監聽器
        } else if (mousePos.y > difficultyY + 60 && mousePos.y < difficultyY + 100) {
            difficulty = 'hard';
            isDifficultySelected = true; // 設置為已選擇
            startGame();
            canvas.removeEventListener('click', selectDifficulty); // 移除事件監聽器
        }
    });
}
// 在遊戲初始化時添加難度選擇監聽器
addDifficultySelectionListener();
// 修改 initGame 函數以確保正確調用 createBricks
function initGame() {
    // 播放背景音樂
    backgroundMusic.loop = true; // 設置循環播放
    backgroundMusic.play(); // 播放音樂

    // 根據難度調整遊戲參數
    if (difficulty === 'easy') {
        ballSpeed = 3; // 簡單模式，球速較慢
        brickRowCount = 3; // 設置行數
        brickColumnCount = 5; // 設置列數
    } else if (difficulty === 'medium') {
        ballSpeed = 4; // 中等模式，球速中等
        brickRowCount = 5; // 設置行數
        brickColumnCount = 7; // 設置列數
    } else if (difficulty === 'hard') {
        ballSpeed = 6; // 困難模式，球速較快
        brickRowCount = 6; // 設置行數
        brickColumnCount = 9; // 設置列數
    }

    // 初始化球的速度
    ball.dx = getRandomDirection() * ballSpeed;
    ball.dy = -ballSpeed; // 讓球一開始向上運動

    createBricks(); // 重新生成磚塊
    update(); // 開始遊戲循環
}
function startGame() {
    initGame(); // 初始化遊戲
}



// 在頁面加載時顯示難度選擇界面
showDifficultySelection();


update();
