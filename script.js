let move_speed = 10, gravity = 0.5;
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');
let sound_heart = new Audio('sounds effect/heart.mp3');

let lives = 3;
let hearts = document.querySelector('.hearts');
for (let i = 0; i < lives; i++) {
    let heart = document.createElement('img');
    heart.src = 'images/heart.png';
    heart.className = 'heart';
    hearts.appendChild(heart);
}

let bird_props = bird.getBoundingClientRect();
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

// Yüksek skorun gösterileceği sol alt köşe elemanı
let high_score_display = document.createElement('div');
high_score_display.className = 'high-score';
high_score_display.style.position = 'fixed';
high_score_display.style.bottom = '10px';
high_score_display.style.left = '10px';
high_score_display.style.fontSize = '20px';
high_score_display.style.color = 'white';
high_score_display.innerHTML = `High Score: ${localStorage.getItem('highScore') || 0}`;
document.body.appendChild(high_score_display);

let game_state = 'Start';
img.style.display = 'none';
message.classList.add('messageStyle');

let timer = document.querySelector('.timer');
let startTime;
let difficultyTimer;

let redScreen = document.createElement('div');
redScreen.className = 'red-screen';
redScreen.style.position = 'fixed';
redScreen.style.top = '0';
redScreen.style.left = '0';
redScreen.style.width = '100vw';
redScreen.style.height = '100vh';
redScreen.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
redScreen.style.display = 'none';
document.body.appendChild(redScreen);

let pipesPassed = 0; // Geçilen engellerin sayısı

function updateTime() {
    let now = new Date();
    let elapsed = Math.floor((now - startTime) / 1000);
    let minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    let seconds = String(elapsed % 60).padStart(2, '0');
    timer.innerHTML = `${minutes}:${seconds}`;
    if (game_state === 'Play') requestAnimationFrame(updateTime);
}

function resetGame() {
    // Skoru sıfırla
    score_val.innerHTML = '0';
    pipesPassed = 0;

    // Eski engelleri temizle
    document.querySelectorAll('.pipe_sprite, .heart_sprite').forEach((e) => e.remove());

    img.style.display = 'block';
    bird.style.top = '40vh';
    game_state = 'Play';
    message.innerHTML = '';
    score_title.innerHTML = 'Score : ';

    message.classList.remove('messageStyle');
    lives = 3;
    hearts.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        let heart = document.createElement('img');
        heart.src = 'images/heart.png';
        heart.className = 'heart';
        hearts.appendChild(heart);
    }
    move_speed = 10;
    startTime = new Date();
    clearInterval(difficultyTimer);
    difficultyTimer = setInterval(() => {
        move_speed += 0.5;
    }, 2000);
    requestAnimationFrame(updateTime);
    play();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && game_state !== 'Play') {
        resetGame();
    }
});

function play() {
    function move() {
        if (game_state != 'Play') return;

        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        let heart_sprite = document.querySelectorAll('.heart_sprite');

        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                if (
                    bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
                    bird_props.left + bird_props.width > pipe_sprite_props.left &&
                    bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
                    bird_props.top + bird_props.height > pipe_sprite_props.top
                ) {
                    if (!element.collided) {
                        lives--;
                        hearts.removeChild(hearts.lastChild);
                        element.collided = true;
                        if (lives === 0) {
                            // En yüksek skoru güncelle
                            let currentScore = parseInt(score_val.innerHTML);
                            let highScore = parseInt(localStorage.getItem('highScore')) || 0;
                            if (currentScore > highScore) {
                                localStorage.setItem('highScore', currentScore);
                                high_score_display.innerHTML = `High Score: ${currentScore}`;
                            }

                            game_state = 'End';
                            message.innerHTML =
                                'Game Over'.fontcolor('red') + '<br>Press Enter To Restart';
                            message.classList.add('messageStyle');
                            img.style.display = 'none';
                            sound_die.play();
                            clearInterval(difficultyTimer);
                            return;
                        }

                        redScreen.style.display = 'block';
                        setTimeout(() => {
                            redScreen.style.display = 'none';
                        }, 200);
                    }
                }

                element.style.left = pipe_sprite_props.left - move_speed + 'px';

                // Check if bird has passed through the gap
                if (pipe_sprite_props.right < bird_props.left && !element.passed) {
                    let upper_pipe = element.previousElementSibling;
                    if (bird_props.top > upper_pipe.getBoundingClientRect().bottom && bird_props.bottom < pipe_sprite_props.top) {
                        pipesPassed++;
                        score_val.innerHTML = pipesPassed;
                        sound_point.play();
                    }
                    element.passed = true;
                }
            }
        });

        heart_sprite.forEach((element) => {
            let heart_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if (heart_sprite_props.right <= 0) {
                element.remove();
            } else {
                if (
                    bird_props.left < heart_sprite_props.left + heart_sprite_props.width &&
                    bird_props.left + bird_props.width > heart_sprite_props.left &&
                    bird_props.top < heart_sprite_props.top + heart_sprite_props.height &&
                    bird_props.top + bird_props.height > heart_sprite_props.top
                ) {
                    if (lives < 3) {
                        lives++;
                        let heart = document.createElement('img');
                        heart.src = 'images/heart.png';
                        heart.className = 'heart';
                        hearts.appendChild(heart);
                        sound_heart.play();
                    }
                    element.remove();
                } else {
                    element.style.left = heart_sprite_props.left - move_speed + 'px';
                }
            }
        });

        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    let bird_dy = 0;
    function apply_gravity() {
        if (game_state != 'Play') return;
        bird_dy += gravity;
        document.addEventListener('keydown', (e) => {
            if (e.key == 'ArrowUp' || e.key == ' ') {
                img.src = 'images/Bird-2.png';
                bird_dy = -7.6;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key == 'ArrowUp' || e.key == ' ') {
                img.src = 'images/Bird.png';
            }
        });

        if (bird_props.top + bird_dy <= 0) {
            bird.style.top = '0px';
            bird_dy = 0;
        } else if (bird_props.bottom + bird_dy >= background.bottom) {
            bird.style.top = background.bottom - bird_props.height + 'px';
            bird_dy = 0;
        } else {
            bird.style.top = bird_props.top + bird_dy + 'px';
        }
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_seperation = 0;
    let pipe_gap = 40;

    function create_pipe() {
        if (game_state != 'Play') return;

        if (pipe_seperation > 60) {
            pipe_seperation = 0;

            let pipe_posi = Math.floor(Math.random() * 43) + 8;
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';
            pipe_sprite_inv.isMoving = true;
            document.body.appendChild(pipe_sprite_inv);

            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.isMoving = true;
            document.body.appendChild(pipe_sprite);

            if (Math.random() > 0.5) {
                let heart_sprite = document.createElement('div');
                heart_sprite.className = 'heart_sprite';
                heart_sprite.style.top = pipe_posi + (pipe_gap / 2) + 'vh';
                heart_sprite.style.left = '100vw';
                heart_sprite.style.backgroundImage = 'url(images/heart.png)';
                heart_sprite.style.width = '30px';
                heart_sprite.style.height = '30px';
                heart_sprite.style.position = 'fixed';
                heart_sprite.style.backgroundSize = 'contain';
                heart_sprite.style.backgroundRepeat = 'no-repeat';
                document.body.appendChild(heart_sprite);
            }
        }
        pipe_seperation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}
