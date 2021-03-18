const updateSpeed = 250;
let lastSecond = Date.now();
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
        console.log('WORK')
        let time = Date.now();
        let deltaS = time - lastSecond;
        lastTime = time;
        if (deltaS > 1000) {
            lastSecond += 1000;
            console.log(lastTime)
            let a = game.settings.get("game_time_clock", "log")
            game.settings.set("game_time_clock", "log", {
                Time: lastTime
            })
            console.log(a)
        }

    } catch (e) {}
};