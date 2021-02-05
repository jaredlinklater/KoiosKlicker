// Custom user manager, retrieves users and checks passwords

const users = [
    {id: 1, username: "fred", password: "pass"}
];

class UserManager {
    findUserById(id, callback) {
        let user = null;
        for(let i = 0; i < users.length; i++) {
            if(users[i].id == id) {
                user = users[i];
                break;
            }
        }

        callback(user);
    }

    findUser(username, callback) {
        let user = null;
        for(let i = 0; i < users.length; i++) {
            if(users[i].username == username) {
                user = users[i];
                break;
            }
        }

        callback(user);
    }

    checkPassword(user, password) {
        return user.password == password;
    }
}

module.exports = new UserManager();