class ClickerGame {
    constructor(parentNode) {
        this._parentNode = parentNode;

        // Initialise game variables
        this._clicks = 0;
        this._allowedTime = 5000; // milliseconds
        this._remainingTime = this._allowedTime;
        this._timerUpdateInterval = 10; // milliseconds
    }

    initDisplay() {
        // Initialise display
        this._display = document.createElement("div");
        this._parentNode.appendChild(this._display);

        // Timer display
        this._timeDisplay = document.createElement("span");
        this._timeDisplay.appendChild(document.createTextNode(this._formatTime(this._allowedTime)));
        const timeDisplayLabel = document.createElement("p");
        timeDisplayLabel.classList.add("clicker_stat");
        timeDisplayLabel.appendChild(document.createTextNode("Time left: "));
        timeDisplayLabel.appendChild(this._timeDisplay);
        this._display.appendChild(timeDisplayLabel);

        // Click count display
        this._clickCountDisplay = document.createElement("span"); // updated on each button click
        this._clickCountDisplay.appendChild(document.createTextNode(this._clicks));
        const clickCountLabel = document.createElement("p");
        clickCountLabel.classList.add("clicker_stat");
        clickCountLabel.appendChild(document.createTextNode("Clicks: "));
        clickCountLabel.appendChild(this._clickCountDisplay);
        this._display.appendChild(clickCountLabel);

        // Button display
        this._button = document.createElement("a");
        this._button.classList.add("clicker_button");
        this._firstClickHandler = () => this._startGame(); // need to assign so it can be removed from button later
        this._button.addEventListener("click", this._firstClickHandler);
        this._button.appendChild(document.createTextNode("CLICK!"));
        this._display.appendChild(this._button);
    }
    
    // Game is started when button is first clicked.
    // Removes game start handler, attaches active-game handler, starts timer.
    _startGame() {
        this._button.removeEventListener("click", this._firstClickHandler);

        this._startTimer();
        this._gameClickHandler = () => this._recordClick();
        this._button.addEventListener("click", this._gameClickHandler);
        this._recordClick(); // record click that started game
    }

    // Increments the game's click counter and calls for a display update
    _recordClick() {
        this._clicks++;
        this._updateClickCountDisplay();
    }

    // Updates click counter display on webpage
    _updateClickCountDisplay() {
        this._clickCountDisplay.innerHTML = "";
        this._clickCountDisplay.appendChild(document.createTextNode(this._clicks));
    }

    // Starts game timer
    _startTimer() {
        this._timerLoop();
    }

    // Repetitively ticks and updates display until it hits 0, then calls end game function 
    _timerLoop() {
        this._previousTimeMilliseconds = new Date();

        setTimeout(() => {
            const delta = new Date() - this._previousTimeMilliseconds;
            this._remainingTime -= delta;
            this._updateTimerDisplay();

            if(this._remainingTime > 0) {
                this._timerLoop();
            } else {
                this._remainingTime = 0; // can overshoot 0 by a few milliseconds
                this._updateTimerDisplay();
                this._endGame();
            }
        }, this._timerUpdateInterval);
    }

    // Updates timer display on webpage
    _updateTimerDisplay() {
        this._timeDisplay.innerHTML = "";
        this._timeDisplay.appendChild(document.createTextNode(this._formatTime(this._remainingTime)));
    }
    
    _endGame() {
        this._button.removeEventListener("click", this._gameClickHandler);
    }

    // Formats time consistently
    _formatTime(milliseconds) {
        return (milliseconds/1000).toFixed(3);
    }
}