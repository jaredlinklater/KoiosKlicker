function loadGame(gameID, username) {
    const game = new KoiosKlickerGameClient(gameID, username);
    game.showDisplay();
}

// Class for loading and running the Koios Klicker game
class KoiosKlickerGameClient {
    constructor(gameID, username) {
        this._socket = io(); // used to communicate with server
        this._gameID = gameID ? gameID : null; // gameID to send to server alongside scores
        this._username = username ? username : null; // username to greet the player with

        this._socket.emit("newGame", this._gameID); // let server know game was successfully started

        // Displayed text that may want to be changed from time to time.
        this._greetingLabel = "Hello, " + this._username + "! Are you ready to play?"; // only shown if username is given
        this._buttonLabel = "CLICK!";
        this._instructionsLabel = "Click the button as many times as you can in 5 seconds.";
        this._seeResultsLabel = "See results!";

        // Initialise game variables
        this._clicks = 0;
        this._remainingTime = 5000; // initial time allowed, in milliseconds
        this._timerUpdateInterval = 10; // timer update rate, in milliseconds
    }

    showDisplay() {
        // Initialise display
        this._display = document.createElement("div");
        this._display.classList.add("center");
        document.getElementById("clicker_game").appendChild(this._display);

        // Greeting display
        if(this._username) {
            const greetingLabel = document.createElement("p");
            greetingLabel.classList.add("clicker_text");
            greetingLabel.appendChild(document.createTextNode(this._greetingLabel));
            this._display.appendChild(greetingLabel);
        }
        
        // Instructions display
        const instructionsLabel = document.createElement("p");
        instructionsLabel.classList.add("clicker_text");
        instructionsLabel.appendChild(document.createTextNode(this._instructionsLabel));
        this._display.appendChild(instructionsLabel);

        // Timer display
        const timeDisplayLabel = document.createElement("p");
        timeDisplayLabel.classList.add("clicker_text");
        this._timeDisplay = document.createElement("span");
        this._updateTimerDisplay();

        timeDisplayLabel.appendChild(document.createTextNode("Time left: "));
        timeDisplayLabel.appendChild(this._timeDisplay);
        timeDisplayLabel.appendChild(document.createTextNode("s"));
        this._display.appendChild(timeDisplayLabel);

        // Click count display
        this._clickCountDisplay = document.createElement("span"); // updated on each button click
        this._clickCountDisplay.appendChild(document.createTextNode(this._clicks));
        const clickCountLabel = document.createElement("p");
        clickCountLabel.classList.add("clicker_text");
        clickCountLabel.appendChild(document.createTextNode("Clicks: "));
        clickCountLabel.appendChild(this._clickCountDisplay);
        this._display.appendChild(clickCountLabel);

        // Button display
        this._button = document.createElement("p");
        this._button.classList.add("clicker_button");
        this._firstClickHandler = () => this._startGame(); // need to assign so it can be removed from button later
        this._button.addEventListener("click", this._firstClickHandler);
        this._button.appendChild(document.createTextNode(this._buttonLabel));
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
        this._socket.emit("reportClick"); // Tell server button was clicked
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
    
    // Prevents clicks from being incremented, replaces button
    // with 'show results' button
    _endGame() {
        this._button.removeEventListener("click", this._gameClickHandler);
        this._socket.emit("endGame", this._clicks);
        this._showResultsLink();
    }

    // When game is finished, show link to navigate to results page
    _showResultsLink() {
        const resultsParagraph = document.createElement("p");
        resultsParagraph.classList.add("clicker_text");

        const resultsLink = document.createElement("a");
        resultsLink.innerHTML = this._seeResultsLabel;
        resultsLink.href = "/results";
        
        resultsParagraph.appendChild(resultsLink);
        this._display.appendChild(resultsParagraph);
    }

    // Formats time consistently
    _formatTime(milliseconds) {
        return (milliseconds/1000).toFixed(3);
    }
}