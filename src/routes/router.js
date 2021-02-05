const router = require("express").Router();

// Configure user authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserManager = require("../koios_modules/UserManager");
const connectEnsureLogin = require("connect-ensure-login");

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    UserManager.findById(id, (user) => {
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

// Ensure game is only accessed by authenticated users
router.get("/", connectEnsureLogin.ensureLoggedIn("/login"));

// Handle authentication
router.post("/login",
    passport.authenticate("local", {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login"
    }),
    (req, res) => {
        console.log("login valid");
        res.redirect("/");
    }
);

module.exports = router;