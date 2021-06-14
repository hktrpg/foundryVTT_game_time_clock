const updateSpeed = 1000;
var isGM = false;
var isNonGM = false;
var isTopGM = false;
var GMLastTIME = -1;
var nonGMLastTIME = -1;
var innerHTML = ""
var GMTimeplayTime = 0;
var GMwithPlayerTimeplayTime = 0;
var startTime = null;
var isPaused = false;
Hooks.once("init", () => {
    game.settings.register("game_time_clock", "GMTime", {
        name: "GMTime",
        scope: "world",
        type: Number,
        default: 0
    });
    game.settings.register("game_time_clock", "GMwithPlayerTime", {
        name: "GMwithPlayerTime",
        scope: "world",
        type: Number,
        default: 0
    });

    game.settings.register("game_time_clock", "moduleSettingsPaused", {
        name: game.i18n.localize("GMTimeClock.moduleSettingsPaused.name"),
        hint: game.i18n.localize("GMTimeClock.moduleSettingsPaused.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });



});
Hooks.on("renderSettings", (dialog, html) => {
    innerHTML = html.find(`ul#game-details`);
});
Hooks.once("ready", () => {
    GMTimeplayTime = game.settings.get("game_time_clock", "GMTime");
    GMwithPlayerTimeplayTime = game.settings.get("game_time_clock", "GMwithPlayerTime");
    startTime = Date.now();
    setInterval(
        doUpdates,
        updateSpeed
    );
})
const doUpdates = () => {
    try {
        isPaused = (game.paused && game.settings.get("game_time_clock", "moduleSettingsPaused")) ? true : false;
        isTopGM = ((game.users.filter(user => user.active && user.isGM).length > 0) && (game.users.filter(user => user.active && user.isGM)[0].id == game.user.id)) ? true : false;
        isGM = (game.users.filter(user => user.active && user.isGM).length > 0) ? true : false;
        isNonGM = (game.users.filter(user => user.active && !user.isGM).length > 0) ? true : false;
        switch (true) {
            case isPaused:
                (GMLastTIME > 0) ? GMTimeplayTime = Number((Number(GMTimeplayTime) - startTime + GMLastTIME)) : null;
                (nonGMLastTIME > 0) ? GMwithPlayerTimeplayTime = Number(Number(GMwithPlayerTimeplayTime) - startTime + nonGMLastTIME) : null;
                nonGMLastTIME = -1;
                GMLastTIME = -1;
                startTime = Date.now();
                break;
            case isTopGM:
                if (GMLastTIME > 0) {
                    game.settings.set("game_time_clock", "GMTime",
                        Number((Number(GMTimeplayTime) - startTime + GMLastTIME))
                    )
                }
                GMLastTIME = Date.now();
                if (isNonGM) {
                    if (nonGMLastTIME > 0) {
                        game.settings.set("game_time_clock", "GMwithPlayerTime",
                            Number(Number(GMwithPlayerTimeplayTime) - startTime + nonGMLastTIME)
                        )
                    }
                    nonGMLastTIME = Date.now();
                } else nonGMLastTIME = startTime;
                refresh();
                break;
            default:
                if (isGM) {
                    GMLastTIME = Date.now();
                } else GMLastTIME = startTime;
                if (isNonGM && isGM) {
                    nonGMLastTIME = Date.now();
                } else nonGMLastTIME = startTime;
                refresh();
                break;

        }

    } catch (e) {
        console.log('ERROR element.find(`[id=game-d', e)
    }

    function refresh() {
        let GMTimeplayTimeSec = (GMLastTIME > 1) ? (Number(GMTimeplayTime) - startTime + GMLastTIME) / 1000 : Number(GMTimeplayTime) / 1000;
        let GMwithPlayerTimeplayTimeSec = (nonGMLastTIME > 1) ? (Number(GMwithPlayerTimeplayTime) - startTime + nonGMLastTIME) / 1000 : Number(GMwithPlayerTimeplayTime) / 1000;

        let h = Math.floor(GMTimeplayTimeSec / 3600);
        if (h < 10) h = '0' + h;
        let m = Math.floor(GMTimeplayTimeSec % 3600 / 60);
        let s = Math.floor(GMTimeplayTimeSec % 3600 % 60);

        let h2 = Math.floor(GMwithPlayerTimeplayTimeSec / 3600);
        if (h2 < 10) h2 = '0' + h2;
        let m2 = Math.floor(GMwithPlayerTimeplayTimeSec % 3600 / 60);
        let s2 = Math.floor(GMwithPlayerTimeplayTimeSec % 3600 % 60);
        if (innerHTML && innerHTML[0].innerHTML.match(game.i18n.localize("gametime.GM"))) {
            let org = innerHTML[0].innerHTML.replace(RegExp(`<li>${game.i18n.localize("gametime.GM")}<span>\\d+:\\d+:\\d+</span></li>`), `<li>${game.i18n.localize("gametime.GM")}<span>${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}</span></li>`).replace(RegExp(`<li>${game.i18n.localize("gametime.GMWithPlayer")}<span>\\d+:\\d+:\\d+</span></li>`), `<li>${game.i18n.localize("gametime.GMWithPlayer")}<span>${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}</span></li>`)
            innerHTML[0].innerHTML = org;
        } else if (innerHTML) {
            let GMwithPlayerTimeTEXT = `<li>${game.i18n.localize("gametime.GMWithPlayer")}<span>${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}</span></li>`;
            let GMTEXT = `<li>${game.i18n.localize("gametime.GM")}<span>${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}</span></li>`;
            innerHTML.prepend(GMwithPlayerTimeTEXT);
            innerHTML = innerHTML.prepend(GMTEXT);
        }
    }
};