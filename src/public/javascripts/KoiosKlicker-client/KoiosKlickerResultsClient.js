function loadResults(gameID, username) {
    const results = new KoiosKlickerResultsClient(gameID, username);
    results.showDisplay();
    results.loadResultsFromServer();
}

// Class for showing results of Koios Klicker results
class KoiosKlickerResultsClient {
    constructor(gameID, username) {
        this._socket = io(); // used to communicate with server
        this._gameID = gameID ? gameID : null; // gameID to show results for
        this._username = username ? username : null; // username to greet the player with
    }

    showDisplay() {
        // Initialise display
        this._display = document.createElement("div");
        document.getElementById("clicker_results").appendChild(this._display);

        const resultsText = document.createElement("div");
        resultsText.classList.add("results_text_div");

        // Personal results display, populated once result comes in
        this._gameResultDisplay = document.createElement("div");
        resultsText.appendChild(this._gameResultDisplay);

        
        this._display.appendChild(resultsText);

        // Leaderboard display, populated once results come in
        const leaderboardDisplay = document.createElement("div");
        leaderboardDisplay.classList.add("leaderboard_div");
        this._leaderboardTable = document.createElement("table");
        this._leaderboardTable.classList.add("leaderboard_table");

        const leaderboardTitleRow = document.createElement("tr");
        leaderboardTitleRow.classList.add("leaderboard_table_headers");
        const leaderboardTitle = document.createElement("td");
        leaderboardTitle.colSpan = 2;
        leaderboardTitleRow.appendChild(leaderboardTitle);

        const leaderboardHeaderRow = document.createElement("tr");
        leaderboardHeaderRow.classList.add("leaderboard_table_headers");
        const usernameHeader = document.createElement("td");
        const CPSHeader = document.createElement("td");

        leaderboardTitle.appendChild(document.createTextNode("HISCORES"));
        usernameHeader.appendChild(document.createTextNode("Username"));
        CPSHeader.appendChild(document.createTextNode("CPS (Clicks per second)"));
        leaderboardHeaderRow.appendChild(usernameHeader);
        leaderboardHeaderRow.appendChild(CPSHeader);

        this._leaderboardTable.appendChild(leaderboardTitleRow);
        this._leaderboardTable.appendChild(leaderboardHeaderRow);
        leaderboardDisplay.appendChild(this._leaderboardTable);
        this._display.appendChild(leaderboardDisplay);

        // Try again link, leads back to game
        const tryAgainDiv = document.createElement("div");
        tryAgainDiv.classList.add("try_again_div", "results_text");
        const tryAgainLink = document.createElement("a");
        tryAgainLink.innerHTML = "Try again";
        tryAgainLink.href = "/";
        tryAgainDiv.appendChild(tryAgainLink);
        this._display.appendChild(tryAgainDiv);


        // Setup responses to server sending data
        this._socket.on("gameResults", gameResults => {
            this._populateGameResults(gameResults);
        });

        this._socket.on("hiscoreData", hiscoreData => {
            this._populateLeaderboardTable(hiscoreData);
        });
    }

    loadResultsFromServer() {
        if(this._display == null) {
            console.log("Call showDisplay() first");
            return;
        }

        this._socket.emit("getGameResults", this._gameID);
        this._socket.emit("getLeaderboard");
    }

    _populateGameResults(gameResults) {
        if(!gameResults) return;
        const scoreDisplay = document.createElement("p");
        scoreDisplay.classList.add("results_text");
        scoreDisplay.appendChild(document.createTextNode("You clicked the button " + gameResults.CPS + " times per second!"))
        this._gameResultDisplay.appendChild(scoreDisplay);
    }

    _populateLeaderboardTable(hiscoreData) {
        hiscoreData.forEach(userData => {
            const row = document.createElement("tr");
            const usernameCell = document.createElement("td");
            const scoreCell = document.createElement("td");

            usernameCell.appendChild(document.createTextNode(userData.username));
            scoreCell.appendChild(document.createTextNode(userData.score));
            row.appendChild(usernameCell);
            row.appendChild(scoreCell);
            this._leaderboardTable.appendChild(row);
        });
    }
}