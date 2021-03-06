const router = require("express").Router();

/*** USER AUTHENTICATION CONFIGURATION ***/
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserManager = require("../koios_modules/UserManager");
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const KoiosKlickerServer = require("../koios_modules/KoiosKlicker-server/KoiosKlickerServer");

// Serialisation used by passport for sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserManager.findUserById(id, (user) => { // Will not fail unless user can delete accounts
        done(null, user);
    });
});

// User authentication function
passport.use(new LocalStrategy(
    (username, submittedPassword, done) => {
        UserManager.findUserByUsername(username, (user) => {
            if(!user) {
                return done(null, false, {message: "Incorrect username."});
            }
            if(!UserManager.checkPassword(user, submittedPassword)) {
                return done(null, false, {message: "Incorrect password."});
            }
            return done(null, user);
        });
    }
));


/*** ROUTES ***/
// Handle registration
router.post("/register", (req, res, next) => {
    //Data validation

    const user = UserManager.addUser(
        req.body.username,
        req.body.fname,
        req.body.lname,
        req.body.password,
    );

    req.logIn(user, function(err) { // Log in newly registered user
        if(err) {
            return next(err);
        }
        return res.redirect("/");
    });
});

// Handle authentication
router.post("/login",
    passport.authenticate("local", {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login"
    })
);

// Handles logging out
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

// Login/Register views
router.get("/register", (req, res, next) => {
    res.render("register");
});

router.get("/login", (req, res, next) => {
    res.render("login");
});

// Ensure game/results is only accessed by authenticated users
// Passes logged-in user's first name and valid gameID to game page
router.get("/", ensureLoggedIn("/login"), (req, res, next) => {
    req.user.gameID = KoiosKlickerServer.generateGameID(req.user);
    res.render("game", {firstName: req.user.firstName, gameID: req.user.gameID});
});

// Passes user's game ID to results page
router.get("/results", ensureLoggedIn("/login"), (req, res, next) => {
    res.render("results", {firstName: req.user.firstName, gameID: req.user.gameID});
});

module.exports = router;