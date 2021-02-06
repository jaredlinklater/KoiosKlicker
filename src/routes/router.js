const router = require("express").Router();

/*** USER AUTHENTICATION CONFIGURATION ***/
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserManager = require("../koios_modules/UserManager");
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;

// Serialisation used by passport for sessions
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    UserManager.findUserById(id, (user) => {
        done(null, user);
    });
});

// User authentication function
passport.use(new LocalStrategy(
    (username, password, done) => {
        UserManager.findUser(username, (user) => {
            if(!user) {
                return done(null, false, { message: "Incorrect username." });
            }
            if(!UserManager.checkPassword(user, password)) {
                return done(null, false, { message: "Incorrect password." });
            }
            return done(null, user);
        });
    }
));


/*** ROUTES ***/
// Handle authentication
router.post("/login",
    passport.authenticate("local", {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login"
    })
);

// Ensure game is only accessed by authenticated users
router.get("/", ensureLoggedIn("/login"));

module.exports = router;