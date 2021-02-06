// Performs server-side, local JSON storage operations using the 'lowdb' module
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const LowDB = require('lowdb')(adapter);

class ServerSideStorage {
    // Creates new db if it doesn't exist
    constructor() {
        this._db = LowDB;
        this._db.defaults({users: [], userCount: 0 })
                .write();
    }

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
    
    // Loads test accounts
    loadTestAccounts() {
        this.addUser("admin", "Admin", "Istrator", "password");
        this.addUser("fredb", "Fred", "Bean", "pass");

        console.log("Added test accounts");
    }

    // Drops all users
    dropUsers() {
        this._db.get('users')
                .remove()
                .write();

        this._db.set('userCount', 0)
                .write();
    }
}

module.exports = new ServerSideStorage();