module.exports = io => {
    class ClickerGameServer {
        constructor(io) {
            // Attach socket.io to web server
            this.io = io;

            this.io.on("connection", socket => {
                socket.on("test", console.log);
            });
            
            console.log("ClickerGame server ready");
        }
    }

    return new ClickerGameServer(io);
}