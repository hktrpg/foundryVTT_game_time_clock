const updateSpeed = 1000;
var isGM = false;
var isNonGM = false;
var isTopGM = false;
var GMLastTIME = -1;
var nonGMLastTIME = -1;
var isExist = false;
var innerHTML = ""
var GMTimeplayTime = 0;
var GMwithPlayerTimeplayTime = 0;
var time = null;
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
    GMTimeplayTime = game.settings.get("game_time_clock", "GMTime");
    GMwithPlayerTimeplayTime = game.settings.get("game_time_clock", "GMwithPlayerTime");
    time = Date.now();
    setInterval(
        doUpdates,
        updateSpeed
    );

});
const doUpdates = () => {
    try {
        isTopGM = ((game.users.filter(user => user.active && user.isGM).length > 0) && (game.users.filter(user => user.active && user.isGM)[0].id == game.user.id)) ? true : false;
        isGM = (game.users.filter(user => user.active && user.isGM).length > 0) ? true : false;
        isNonGM = (game.users.filter(user => user.active && !user.isGM).length > 0) ? true : false;
        if (isTopGM) {
            if (GMLastTIME > 0) {
                game.settings.set("game_time_clock", "GMTime",
                    Number((Number(GMTimeplayTime) - time + GMLastTIME))
                )
            }
            GMLastTIME = Date.now();
            if (isNonGM && isGM) {
                if (nonGMLastTIME > 0) {
                    game.settings.set("game_time_clock", "GMwithPlayerTime",
                        Number(Number(GMwithPlayerTimeplayTime) - time + nonGMLastTIME)
                    )
                }
                nonGMLastTIME = Date.now();
            } else nonGMLastTIME = time;
        } else {
            if (isGM) {
                GMLastTIME = Date.now();
            } else GMLastTIME = time;
            if (isNonGM && isGM) {
                nonGMLastTIME = Date.now();
            } else nonGMLastTIME = time;
        }


        let GMTimeplayTimeSec = Number((Number(GMTimeplayTime) - time + GMLastTIME) / 1000);
        let h = Math.floor(GMTimeplayTimeSec / 3600);
        if (h < 10) h = '0' + h;
        let m = Math.floor(GMTimeplayTimeSec % 3600 / 60);
        let s = Math.floor(GMTimeplayTimeSec % 3600 % 60);


        let GMwithPlayerTimeplayTimeSec = Number((Number(GMwithPlayerTimeplayTime) - time + nonGMLastTIME)) / 1000;
        let h2 = Math.floor(GMwithPlayerTimeplayTimeSec / 3600);
        if (h2 < 10) h2 = '0' + h2;
        let m2 = Math.floor(GMwithPlayerTimeplayTimeSec % 3600 / 60);
        let s2 = Math.floor(GMwithPlayerTimeplayTimeSec % 3600 % 60);
        if (isExist) {
            let org = innerHTML[0].innerHTML.replace(RegExp(`<li>${game.i18n.localize("gametime.GM")}<span>\\d+:\\d+:\\d+</span></li>`), `<li>${game.i18n.localize("gametime.GM")}<span>${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}</span></li>`).replace(RegExp(`<li>${game.i18n.localize("gametime.GMWithPlayer")}<span>\\d+:\\d+:\\d+</span></li>`), `<li>${game.i18n.localize("gametime.GMWithPlayer")}<span>${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}</span></li>`)
            innerHTML[0].innerHTML = org;
        }
        //<li>GM online time<span>03:06:54</span></li>
        //<li>Player and GM online time<span>00:09:30</span></li>
        Hooks.on("renderSettings", (dialog, html) => {
            if (isExist) return;
            if (html.find(`ul#game-details`)) {
                let GMwithPlayerTimeTEXT = `<li>${game.i18n.localize("gametime.GMWithPlayer")}<span>${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}</span></li>`;
                let GMTEXT = `<li>${game.i18n.localize("gametime.GM")}<span>${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}</span></li>`;
                html.find(`ul#game-details`).prepend(GMwithPlayerTimeTEXT);
                innerHTML = html.find(`ul#game-details`).prepend(GMTEXT);
                isExist = true;
            }
        });

    } catch (e) {
        console.log('ERROR element.find(`[id=game-d', e)
    }
};