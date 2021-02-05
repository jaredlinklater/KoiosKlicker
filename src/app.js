const createError = require("http-errors");
const express = require("express");
const path = require("path");
const router = require("./routes/router");
const app = express();
const session = require("express-session");
const passport = require("passport");

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "6giUOa4sd8g5W5dVds4dmgA",
    saveUninitialized: false,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", router);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render("error");
});

// Prepare web server
const server = require("http").Server(app);

// Attach socket.io to webserver
const io = require("socket.io")(server);

// Prepare KoiosKlicker server
const KoiosKlicker = require("./koios_modules/KoiosKlicker-server/ClickerGameServer")(io);

// Start web server
server.listen(3000);

module.exports = app;