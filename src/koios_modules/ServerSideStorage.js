// Performs server-side, local JSON storage operations using the 'lowdb' module
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const LowDB = require('lowdb')(adapter);

class ServerSideStorage {
    // Creates new db with needed tables/values if it doesn't exist
    constructor() {
        this._db = LowDB;
        this._db.defaults({
                    users: [],
                    userCount: 0,
                    cpsResults: [],
                    results: []
                })
                .write();
    }

    /*** USER MANAGEMENT OPERATIONS ***/
    // Adds a new user to the JSON db and returns it
    addUser(username, fname, lname, password) {
        const newUserCount = this._db.get('userCount')
                                     .value() + 1;
        
        const newUser = {
            id: newUserCount,
            username: username,
            firstName: fname,
            lastName: lname,
            password: password
        }

        this._db.get('users')
                .push(newUser)
                .write();

        this._db.set('userCount', newUserCount)
                .write();

        return newUser;
    }

    findUserById(id) {
        return this._db.get('users')
                       .find({id: id})
                       .value();
    }

    findUserByUsername(username) {
        return this._db.get('users')
                       .find({username: username})
                       .value();
    }
    
    // Loads test accounts into db
    loadTestAccounts() {
        this.addUser("admin", "Admin", "Istrator", "password");
        this.addUser("fredb", "Fred", "Bean", "pass");

        console.log("Added test accounts");
    }

    // Drops 'users' table and resets 'userCount' to 0
    dropUsers() {
        this._db.get('users')
                .remove()
                .write();

        this._db.set('userCount', 0)
                .write();
    }



    /*** KOIOS KLICKER OPERATIONS ***/
    // Add game results to storage
    addResults(resultsModel) {
        this._db.get('results')
                .push(resultsModel)
                .write();
    }

    // Add a user's first CPS to game
    addNewCPS(cpsModel) {
        this._db.get('cpsResults')
                .push(cpsModel)
                .write();
    }

    updateUserCPS(userID, CPS) {
        this._db.get('cpsResults')
                .find({userID: userID})
                .assign({CPS: CPS})
                .write();
    }

    // Gets user's current CPS record
    getCPSByUserID(userID) {
        return this._db.get('cpsResults')
                       .filter({userID: userID})
                       .value();
    }

    // Get top 'topX' users with the highest CPS, in descending order
    getTopUserCPS(topX) {
        return this._db.get('cpsResults')
                       .orderBy('CPS', 'desc')
                       .take(topX)
                       .value();
    }

    // Gets all of a user's previous results
    getResultsByUserID(userID) {
        return this._db.get('results')
                       .filter({userID: userID})
                       .value();
    }

    // Get a game result
    getGameResult(gameID) {
        return this._db.get('results')
                       .find({gameID: gameID})
                       .value();
    }
}

module.exports = new ServerSideStorage();