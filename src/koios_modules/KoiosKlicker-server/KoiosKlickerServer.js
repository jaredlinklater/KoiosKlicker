const nanoid = require("nanoid").nanoid;
const ServerSideStorage = require("../ServerSideStorage");

class KoiosKlickerServer {
    constructor() {
        // Holds IDs generated by the server, that clients can use to validly send results.
        // This helps to prevent fraudulent score submissions.
        this._validIDPairs = [];
        
        // Amount of time user can spend clicking the button, in milliseconds.
        // This should match KoiosKlickerGameClient's '_remainingTime' property
        // and will be used to verify and calculate CPS (clicks per second).
        this._allocatedTime = 5000;
    }

    registerServer(server) {
        // Attach socket.io to webserver
        this._io = require("socket.io")(server);

        const self = this;
        // Manages individual connections
        this._io.on("connection", socket => {

            // GAME PAGE TOPICS
            // Confirm that client received and started game with issued ID
            socket.on("newGame", gameID => {
                self._verifyGameID(gameID);
                socket.gameID = gameID;
                socket.clicks = 0; // For server-client validation
            });

            // Records a user's click server-side
            socket.on("reportClick", () => {
                socket.clicks++;
            });

            // Verifies score integrity before recording results
            socket.on("endGame", clicks => {
                // TODO: Verify time between first click and 
                // last click is the allowed ~5 seconds

                // Verify client-side and server-side click count matches
                if(socket.clicks != clicks) return;
                
                self._recordResults(socket.gameID, clicks);
            });


            // RESULTS PAGE TOPICS
            // Verifies score integrity before recording results
            socket.on("getGameResults", gameID => {
                socket.emit("gameResults", self._getGameResults(gameID));
            });

            socket.on("getLeaderboard", () => {
                socket.emit("hiscoreData", self._getHiscores(6));
            });

            // Cleans up IDs of users who disconnect without playing
            socket.on("disconnect", () => {
                self._deleteID(socket.gameID);
            });
        });
    }

    // Generates and return a unique ID for a user; server
    // will pass ID to client to report back with.
    generateGameID(user) {
        const newPair = new UserGameIDPair(user);
        this._validIDPairs.push(newPair);
        return newPair.gameID;
    }

    // Deletes IDPair from valid IDs list
    _deleteID(gameID) {
        this._validIDPairs = this._validIDPairs.filter(el => el.gameID !== gameID);
    }

    // Checks if a gameID is valid
    _verifyGameID(gameID) {
        for(let i = 0; i < this._validIDPairs.length; i++) {
            if(this._validIDPairs[i].gameID == gameID) return true;
        }
        return false;
    }

    _getUserIDByGameID(gameID) {
        const pair = this._validIDPairs.find(el => el.gameID == gameID);
        return pair.userID;
    }

    /*_getUserResultsByGameID(gameID) {
        ServerSideStorage.getResultsByUserID(
            this._getUserIDByGameID(gameID)
        );
    }*/

    // Get results of a single game
    _getGameResults(gameID) {
        return ServerSideStorage.getGameResult(gameID);
    }

    // Get top 'topX' users with the highest CPS, in descending order
    _getHiscores(topX) {
        const hiscores = ServerSideStorage.getTopUserCPS(topX);
        return hiscores.map(el => {
            return {
                username: ServerSideStorage.findUserById(el.userID).username,
                score: el.CPS
            }
        });
    }

    // Stores user's result in server-side storage
    _recordResults(gameID, clicks) {
        const userID = this._getUserIDByGameID(gameID);
        const CPS = clicks / (this._allocatedTime / 1000);

        // Update user's highest CPS
        const usersCurrentHighestCPS = ServerSideStorage.getCPSByUserID(userID)[0];
        if(usersCurrentHighestCPS === undefined) { // User's first game
            ServerSideStorage.addNewCPS(new KoiosKlickerUserCPSModel(userID, CPS));
        } else if(CPS > usersCurrentHighestCPS.CPS) { // Update new hi-score
            ServerSideStorage.updateUserCPS(userID, CPS);
        }

        // Add individual game results
        const resultsModel = new KoiosKlickerResultsModel(userID, gameID, CPS);
        ServerSideStorage.addResults(resultsModel);

        // Cleanup
        this._deleteID(gameID);
    }
}

// Used to keep track of which IDs are assigned to which users
class UserGameIDPair {
    constructor(user) {
        this.userID = user.id;
        this.gameID = nanoid();
    }
}

// Model of user CPS to be store
class KoiosKlickerUserCPSModel {
    constructor(userID, CPS) {
        this.userID = userID;
        this.CPS = CPS;
    }
}

// Model of game results to be stored
class KoiosKlickerResultsModel {
    constructor(userID, gameID, CPS) {
        this.userID = userID;
        this.gameID = gameID;
        this.CPS = CPS;

        this.time = Date.now();
    }
}

module.exports = new KoiosKlickerServer();