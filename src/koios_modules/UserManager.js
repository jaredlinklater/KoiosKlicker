const ServerSideStorage = require("./ServerSideStorage");

// Dump current users, and replace with test accounts
//ServerSideStorage.dropUsers();
//ServerSideStorage.loadTestAccounts();

// Custom user manager; wrapper class for adding and retrieving
// users from server-side local storage, and checks passwords
class UserManager {
    // Adds user to server-side local storage
    addUser(username, fname, lname, password) {
        return ServerSideStorage.addUser(username, fname, lname, password);
    }

    // Finds user in server-side local storage by given ID.
    findUserById(id, callback) {
        const user = ServerSideStorage.findUserById(id);
        if(callback) callback(user);
    }

    // Finds user in server-side local storage by given username.
    findUserByUsername(username, callback) {
        const user = ServerSideStorage.findUserByUsername(username);
        if(callback) callback(user);
    }

    // Checks a user's password against a given string. Should hash
    // the given string in a secure system.
    checkPassword(user, password) {
        return user.password == password;
    }
}

module.exports = new UserManager();