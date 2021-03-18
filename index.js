const updateSpeed = 500;


Hooks.once("init", () => {
    /**
     * 首先檢查有沒有ONLINE 的GM 和GM以外的人
     * 
     * 
     * 
     */
    game.settings.register("game_time_clock", "log", {
        GMTime: Number,
        GMwithPlayerTime: Number
    });
    var playTime = game.settings.get("game_time_clock", "log");
    setInterval(
        doUpdates,
        updateSpeed
    );
});
const doUpdates = () => {
    try {

        let time = Date.now();
        let deltaS = time - lastSecond;
        lastTime = time;
        if (deltaS > 1000) {
            lastSecond += 1000;
            console.log('lastTime', lastTime)
            game.settings.set("game_time_clock", "log", {
                Time: lastTime
            })

        }

    } catch (e) {}
};