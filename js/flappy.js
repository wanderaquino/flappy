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
    const element = Element('div', position === 'up' ? 'barrer-up' : 'barrer-down');
    element.appendChild(Element('div', position === 'up' ? 'barrer-up-end' : 'barrer-down-end'));
    this.setHeight = height => element.style.height = `${height}px`;

    this.getDomElement = () => {return element};
};

function BarrerPair (height, openess, xAxis) {

    const frame = new BarrerFrame();
    const upperBarrer = new Barrer('up');
    const downBarrer = new Barrer('down');

    frame.appendChild(upperBarrer.getDomElement());
    frame.appendChild(downBarrer.getDomElement());

    this.calcOpeness = () => {
        const superHeight = (Math.random() * (height - openess)).toFixed(2);
        const downHeight = (height - openess - superHeight).toFixed(2);

        upperBarrer.setHeight(superHeight);
        downBarrer.setHeight(downHeight);

    }

    this.getX = () => {return parseInt(frame.style.left.split('px')[0])};
    this.setX = x => {frame.style.left = `${x}px`};
    this.getWidth = () => {return frame.clientWidth};

    this.getFrameDomElement = () => {return frame};
    this.getUpperBarrerDomElement = () => {return upperBarrer.getDomElement()};
    this.getDownBarrerDomElement = () => {return downBarrer.getDomElement()};

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
            const crossMiddle = (pair.getX() + displace) >= middle &&
                pair.getX() < middle

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
    
    console.log(heightGame);
    console.log(widthGame);

    const scoreRank = new GameScore();
    const barrers = new BarrerGame(heightGame, widthGame, 400, 100, () =>{
        scoreRank.updateScore(++score);
    });
    const flappy = new Flappy(heightGame);

    areaGame.appendChild(scoreRank.gameScore);
    areaGame.appendChild(flappy.flappy);
    barrers.barrerArray.forEach((barrer) => {
        areaGame.appendChild(barrer.getFrameDomElement());
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
            const upperBarrer = barrerPair.getUpperBarrerDomElement();
            const downBarrer = barrerPair.getDownBarrerDomElement();
            collision = calculateCollision(bird.flappy,upperBarrer) || calculateCollision(bird.flappy,downBarrer);
        }
    });
    return collision;
}

new Game().start();

