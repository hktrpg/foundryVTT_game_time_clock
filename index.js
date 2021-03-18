const updateSpeed = 1000;
var isGM = false;
var isNonGM = false;
var GMLastTIME = -1;
var nonGMLastTIME = -1;
var isExist = false;
Hooks.once("init", () => {
    game.settings.register("game_time_clock", "GMTime", {
        name: "GMTime",
        type: Number,
        default: 0
    });
    game.settings.register("game_time_clock", "GMwithPlayerTime", {
        name: "GMwithPlayerTime",
        type: Number,
        default: 0
    });

    setInterval(
        doUpdates,
        updateSpeed
    );

});
const doUpdates = () => {
    try {
        let GMTimeplayTime = game.settings.get("game_time_clock", "GMTime");
        let GMwithPlayerTimeplayTime = game.settings.get("game_time_clock", "GMwithPlayerTime");
        isGM = (game.users.filter(user => user.active && user.isGM).length > 0) ? true : false;
        isNonGM = (game.users.filter(user => user.active && !user.isGM).length > 0) ? true : false;
        let time = Date.now();
        if (isGM) {
            if (GMLastTIME > 0) {
                game.settings.set("game_time_clock", "GMTime",
                    Number(GMTimeplayTime) + time - GMLastTIME
                )
            }
            GMLastTIME = Date.now();
        } else GMLastTIME = -1;
        if (isNonGM && isGM) {
            if (nonGMLastTIME > 0) {
                game.settings.set("game_time_clock", "GMwithPlayerTime",
                    Number(GMwithPlayerTimeplayTime) + time - nonGMLastTIME
                )
            }
            nonGMLastTIME = Date.now();
        } else nonGMLastTIME = -1;
        let GMTimeplayTimeSec = GMTimeplayTime / 1000;
        let h = Math.floor(GMTimeplayTimeSec / 3600);
        if (h < 10) h = '0' + h;
        let m = Math.floor((GMTimeplayTimeSec - (h * 60)) / 60);
        let s = Math.floor(GMTimeplayTimeSec % 60);


        let GMwithPlayerTimeplayTimeSec = GMwithPlayerTimeplayTime / 1000;
        let h2 = Math.floor(GMwithPlayerTimeplayTimeSec / 3600);
        if (h2 < 10) h2 = '0' + h2;
        let m2 = Math.floor((GMwithPlayerTimeplayTimeSec - (h2 * 60)) / 60);
        let s2 = Math.floor(GMwithPlayerTimeplayTimeSec % 60);

        Hooks.on("renderSettings", (dialog, html) => {
            if (isExist) return;
            if (html.find(`ul#game-details`)) {
                let GMwithPlayerTimeTEXT = `<li>${game.i18n.localize("gametime.GMWithPlayer")}<span>${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}</span></li>`;
                let GMTEXT = `<li>${game.i18n.localize("gametime.GM")}<span>${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}</span></li>`;
                html.find(`ul#game-details`).prepend(GMwithPlayerTimeTEXT);
                html.find(`ul#game-details`).prepend(GMTEXT);
                isExist = true;
            }
        });

    } catch (e) {
        console.log('ERROR element.find(`[id=game-d', e)
    }
};