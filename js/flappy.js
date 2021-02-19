function Element (elementType, className) {
    const element = document.createElement(elementType);
    element.className = className;
    return element;
};

function BarrerFrame () {
    const element = Element('div','barrer');
    element.style.height = '100%';
    return element;
};

function Barrer (position) {
    this.barrer = Element('div', position === 'up' ? 'barrer-up' : 'barrer-down');
    this.barrer.appendChild(Element('div', position === 'up' ? 'barrer-up-end' : 'barrer-down-end'));
    this.setHeight = height => this.barrer.style.height = `${height}px`;
};

function BarrerPair (height, openess, xAxis) {

    this.frame = new BarrerFrame();
    this.upperBarrer = new Barrer('up');
    this.downBarrer = new Barrer('down');

    this.frame.appendChild(this.upperBarrer.barrer);
    this.frame.appendChild(this.downBarrer.barrer);

    this.calcOpeness = () => {
        const superHeight = (Math.random() * (height - openess)).toFixed(2);
        const downHeight = (height - openess - superHeight).toFixed(2);

        this.upperBarrer .setHeight(superHeight);
        this.downBarrer.setHeight(downHeight);

    }

    this.getX = () => {return parseInt(this.frame.style.left.split('px')[0])};
    this.setX = x => {this.frame.style.left = `${x}px`};
    this.getWidth = () => {return this.frame.clientWidth};

    this.calcOpeness();
    this.setX(xAxis);
};

function BarrerGame (heightGame, widthGame, spaceBetween, openess, increasePoint) {
    this.barrerArray = [
        new BarrerPair(heightGame, openess, widthGame),
        new BarrerPair(heightGame, openess, widthGame + spaceBetween),
        new BarrerPair(heightGame, openess, widthGame + spaceBetween * 2),
        new BarrerPair(heightGame, openess, widthGame + spaceBetween * 3)
    ];
    const displace = 3;

    this.animate = () => {
        this.barrerArray.forEach(pair => {
            pair.setX(pair.getX()-displace);

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + spaceBetween * this.barrerArray.length)
                pair.calcOpeness();
            }

            const middle = widthGame / 2;
            const crossMiddle = (pair.getX() + displace) >= middle && pair.getX() < middle

            crossMiddle && increasePoint();
        });
    }
};

function Flappy (heightGame) {
    let flying = false;
        this.flappy = Element('img','flappy-bird');
        this.flappy.src = 'imgs/passaro.png';

        this.getY = () => parseInt(this.flappy.style.bottom.split('px')[0]);
        this.setY = (y) => this.flappy.style.bottom = `${y}px`;

        window.onkeydown = e => flying = true;
        window.ontouchstart = e => flying = true;
        window.onkeyup = e => flying = false;
        window.ontouchend = e => flying = false;


        this.fly = () => {
            const newY = this.getY() + (flying ? 6 : -5);
            const maxHeight = heightGame - this.flappy.clientHeight;

                if (newY <= 0) {this.setY(0);} 
                else if (newY >= maxHeight) {this.setY(maxHeight)}
                else {this.setY(newY)}
        }
    
        this.setY(heightGame / 2);
}

function GameScore() {
    this.gameScore = Element('span', 'rank');

    this.updateScore = score => {
        this.gameScore.innerHTML = score;
    };
    this.updateScore(0);
}

function Game() {
    let score = 0;
    const areaGame = document.querySelector("[wm-flappy]");
    const heightGame = areaGame.clientHeight;
    const widthGame = areaGame.clientWidth;
    
    const scoreRank = new GameScore();
    const barrers = new BarrerGame(heightGame, widthGame, 400, 100, () =>{
        scoreRank.updateScore(++score);
    });
    const flappy = new Flappy(heightGame);

    areaGame.appendChild(scoreRank.gameScore);
    areaGame.appendChild(flappy.flappy);
    barrers.barrerArray.forEach((barrer) => {
        areaGame.appendChild(barrer.frame);
    });
    
    this.start = () => {
        const timing = setInterval(() => {
            barrers.animate();
            flappy.fly();
            if(checkCollision(flappy,barrers)){
                console.log("Ouch!");
                clearInterval(timing);
            }
        },20);
    }
}

function calculateCollision (bird, barrer) {
    const birdData = bird.getBoundingClientRect();
    const barrerData = barrer.getBoundingClientRect();

    horizontalCollision = birdData.left + birdData.width >= barrerData.left && barrerData.left + barrerData.width >= birdData.left;
    verticalCollision = birdData.top + birdData.height >= barrerData.top && barrerData.top + barrerData.height >= birdData.top;

    return horizontalCollision && verticalCollision;
}

function checkCollision(bird,barrer) {
    let collision = false;
    
    barrer.barrerArray.forEach(barrerPair => {
        if(!collision) { 
            collision = calculateCollision(bird.flappy,barrerPair.upperBarrer.barrer) || calculateCollision(bird.flappy,barrerPair.downBarrer.barrer);
        }
    });
    return collision;
}

new Game().start();

