const updateSpeed = 250;
let lastSecond = Date.now();
let lastTime = Date.now();
Hooks.once("init", () => {
    game.settings.register("game_time_clock", "log", {
        Time: Number
    });
    setInterval(
        doUpdates,
        updateSpeed
    );
});
const doUpdates = () => {
    try {
        let a = game.settings.get("game_time_clock", "log")
        console.log('log', a)
        let time = Date.now();
        let deltaS = time - lastSecond;
        lastTime = time;
        if (true) {
            lastSecond += 1000;
            console.log('lastTime', lastTime)
            game.settings.set("game_time_clock", "log", {
                Time: lastTime
            })

        }

    } catch (e) {}
};