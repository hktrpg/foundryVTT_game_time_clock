const updateSpeed = 1000;
var isGM = false;
var isNonGM = false;
var isTopGM = false;
var GMLastTIME = -1;
var nonGMLastTIME = -1;
var combatLastTIME = -1;
var innerHTML;
var innerHTMLGM;
var innerHTMLGMxPlayer;
var innerHTMLCombat;
var GMTimeplayTime = 0;
var GMwithPlayerTimeplayTime = 0;
var combatTimeplayTime = 0;
var startTime = null;
var isPaused = false;
var isV13 = false; // Flag to track FoundryVTT version

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
    game.settings.register("game_time_clock", "CombatTime", {
        name: "CombatTime",
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

    game.settings.register("game_time_clock", "forceFalseDebugMode", {
        name: game.i18n.localize("GMTimeClock.forceFalseDebugMode.name"),
        hint: game.i18n.localize("GMTimeClock.forceFalseDebugMode.hint"),
        scope: "client",
        config: true,
        default: false,
        type: Boolean
    });
});

Hooks.on("renderSettings", (dialog, html) => {
    console.log('HKTRPG - renderSettings', html);

    // Ensure html is a jQuery object
    const $html = html instanceof jQuery ? html : $(html);

    // Try to find the old structure first (ul#game-details) - v12
    innerHTML = $html.find(`ul#game-details`);

    if (innerHTML.length > 0) {
        console.log('HKTRPG - Found v12 structure (ul#game-details)');
        isV13 = false;
    } else {
        // If old structure not found, look for new structure - v13
        const infoSection = $html.find('section.info');
        if (infoSection.length > 0) {
            console.log('HKTRPG - Found v13 structure (section.info)');
            innerHTML = infoSection;
            isV13 = true;
        } else {
            console.log('HKTRPG - Neither v12 nor v13 structure found');
            innerHTML = null;
        }
    }
});

Hooks.once("ready", () => {
    GMTimeplayTime = game.settings.get("game_time_clock", "GMTime");
    GMwithPlayerTimeplayTime = game.settings.get("game_time_clock", "GMwithPlayerTime");
    combatTimeplayTime = game.settings.get("game_time_clock", "CombatTime");
    startTime = Date.now();

    setInterval(
        doUpdates,
        updateSpeed
    );
});

const doUpdates = () => {
    try {
        (game.settings.get("game_time_clock", "forceFalseDebugMode") && CONFIG.debug.hooks) ? CONFIG.debug.hooks = false : null;
        isPaused = (game.paused && game.settings.get("game_time_clock", "moduleSettingsPaused")) ? true : false;
        isTopGM = ((game.users.filter(user => user.active && user.isGM).length > 0) && (game.users.filter(user => user.active && user.isGM)[0].id == game.user.id)) ? true : false;
        isGM = (game.users.filter(user => user.active && user.isGM).length > 0) ? true : false;
        isNonGM = (game.users.filter(user => user.active && !user.isGM).length > 0) ? true : false;
        
        // Read latest time values from settings
        GMTimeplayTime = game.settings.get("game_time_clock", "GMTime");
        GMwithPlayerTimeplayTime = game.settings.get("game_time_clock", "GMwithPlayerTime");
        combatTimeplayTime = game.settings.get("game_time_clock", "CombatTime");
        
        switch (true) {
            case isPaused:
                (GMLastTIME > 0) ? GMTimeplayTime = Number((Number(GMTimeplayTime) - startTime + GMLastTIME)) : null;
                (nonGMLastTIME > 0) ? GMwithPlayerTimeplayTime = Number(Number(GMwithPlayerTimeplayTime) - startTime + nonGMLastTIME) : null;
                (combatLastTIME > 0) ? combatTimeplayTime = Number(Number(combatTimeplayTime) - startTime + combatLastTIME) : null;
                nonGMLastTIME = -1;
                GMLastTIME = -1;
                combatLastTIME = -1;
                startTime = Date.now();
                break;
            case isTopGM:
                if (GMLastTIME > 0) {
                    // Calculate time difference from last update to now
                    let timeDiff = Date.now() - GMLastTIME;
                    GMTimeplayTime += timeDiff;
                    game.settings.set("game_time_clock", "GMTime", GMTimeplayTime);
                }
                GMLastTIME = Date.now();
                if (isNonGM) {
                    if (nonGMLastTIME > 0) {
                        // Calculate time difference from last update to now
                        let timeDiff = Date.now() - nonGMLastTIME;
                        GMwithPlayerTimeplayTime += timeDiff;
                        game.settings.set("game_time_clock", "GMwithPlayerTime", GMwithPlayerTimeplayTime);
                    }
                    nonGMLastTIME = Date.now();
                } else nonGMLastTIME = startTime;
                
                // Check combat status and calculate combat time
                if (game.combats.active?.started) {
                    if (combatLastTIME > 0) {
                        // Calculate time difference from last update to now
                        let timeDiff = Date.now() - combatLastTIME;
                        combatTimeplayTime += timeDiff;
                        game.settings.set("game_time_clock", "CombatTime", combatTimeplayTime);
                    }
                    combatLastTIME = Date.now();
                } else {
                    if (combatLastTIME > 0) {
                        // Combat ended, calculate final time difference
                        let timeDiff = Date.now() - combatLastTIME;
                        combatTimeplayTime += timeDiff;
                        game.settings.set("game_time_clock", "CombatTime", combatTimeplayTime);
                        combatLastTIME = -1;
                    }
                }
                refresh();
                break;
            default:
                if (isGM) {
                    GMLastTIME = Date.now();
                } else GMLastTIME = startTime;
                if (isNonGM && isGM) {
                    nonGMLastTIME = Date.now();
                } else nonGMLastTIME = startTime;
                
                // Check combat status and calculate combat time
                if (game.combats.active?.started) {
                    if (combatLastTIME > 0) {
                        // Calculate time difference from last update to now
                        let timeDiff = Date.now() - combatLastTIME;
                        combatTimeplayTime += timeDiff;
                        game.settings.set("game_time_clock", "CombatTime", combatTimeplayTime);
                    }
                    combatLastTIME = Date.now();
                } else {
                    if (combatLastTIME > 0) {
                        // Combat ended, calculate final time difference
                        let timeDiff = Date.now() - combatLastTIME;
                        combatTimeplayTime += timeDiff;
                        game.settings.set("game_time_clock", "CombatTime", combatTimeplayTime);
                        combatLastTIME = -1;
                    }
                }
                refresh();
                break;
        }

    } catch (e) {
        console.log('ERROR in doUpdates:', e)
    }

    function refresh() {
        // Check if we have a valid container to work with
        if (!innerHTML || innerHTML.length === 0) {
            console.log('HKTRPG - No valid container found for game time display');
            return;
        }

        let GMTimeplayTimeSec = Number(GMTimeplayTime) / 1000;
        let GMwithPlayerTimeplayTimeSec = Number(GMwithPlayerTimeplayTime) / 1000;
        let combatTimeplayTimeSec = Number(combatTimeplayTime) / 1000;

        let h = Math.floor(GMTimeplayTimeSec / 3600);
        if (h < 10) h = '0' + h;
        let m = Math.floor(GMTimeplayTimeSec % 3600 / 60);
        let s = Math.floor(GMTimeplayTimeSec % 3600 % 60);

        let h2 = Math.floor(GMwithPlayerTimeplayTimeSec / 3600);
        if (h2 < 10) h2 = '0' + h2;
        let m2 = Math.floor(GMwithPlayerTimeplayTimeSec % 3600 / 60);
        let s2 = Math.floor(GMwithPlayerTimeplayTimeSec % 3600 % 60);

        let h3 = Math.floor(combatTimeplayTimeSec / 3600);
        if (h3 < 10) h3 = '0' + h3;
        let m3 = Math.floor(combatTimeplayTimeSec % 3600 / 60);
        let s3 = Math.floor(combatTimeplayTimeSec % 3600 % 60);

        if (!innerHTMLGM || !innerHTMLGMxPlayer || !innerHTMLCombat) {
            if (isV13) {
                // v13 structure - use div with build class
                let GMwithPlayerTimeTEXT = `<div class="build" id="game-time-GMxPlayer">
        <span class="label">${game.i18n.localize("gametime.GMWithPlayer")}</span>
        <span class="value">${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}</span>
    </div>`;
                let GMTEXT = `<div class="build" id="game-time-GM-only">
        <span class="label">${game.i18n.localize("gametime.GM")}</span>
        <span class="value">${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}</span>
    </div>`;
                let CombatTEXT = `<div class="build" id="game-time-combat">
        <span class="label">${game.i18n.localize("gametime.Combat")}</span>
        <span class="value">${`${h3}`}:${`00${m3}`.slice(-2)}:${`00${s3}`.slice(-2)}</span>
    </div>`;
                innerHTML.append(GMTEXT);
                innerHTML.append(GMwithPlayerTimeTEXT);
                innerHTML.append(CombatTEXT);
                innerHTMLGM = innerHTML.find(`div#game-time-GM-only`);
                innerHTMLGMxPlayer = innerHTML.find(`div#game-time-GMxPlayer`);
                innerHTMLCombat = innerHTML.find(`div#game-time-combat`);
            } else {
                // v12 structure - use li elements
                let GMwithPlayerTimeTEXT = `<li id="game-time-GMxPlayer">${game.i18n.localize("gametime.GMWithPlayer")}<span>${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}</span></li>`;
                let GMTEXT = `<li id="game-time-GM-only">${game.i18n.localize("gametime.GM")}<span>${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}</span></li>`;
                let CombatTEXT = `<li id="game-time-combat">${game.i18n.localize("gametime.Combat")}<span>${`${h3}`}:${`00${m3}`.slice(-2)}:${`00${s3}`.slice(-2)}</span></li>`;
                innerHTML.prepend(CombatTEXT);
                innerHTML.prepend(GMwithPlayerTimeTEXT);
                innerHTML.prepend(GMTEXT);
                innerHTMLGM = innerHTML.find(`li#game-time-GM-only`);
                innerHTMLGMxPlayer = innerHTML.find(`li#game-time-GMxPlayer`);
                innerHTMLCombat = innerHTML.find(`li#game-time-combat`);
            }
            console.log('HKTRPG - Game Time Clock Setup Done :D')
        }

        if (innerHTMLGM && innerHTMLGM.length > 0) {
            if (isV13) {
                // v13 - update the value spans directly
                innerHTMLGM.find('.value').text(`${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}`);
                innerHTMLGMxPlayer.find('.value').text(`${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}`);
                innerHTMLCombat.find('.value').text(`${`${h3}`}:${`00${m3}`.slice(-2)}:${`00${s3}`.slice(-2)}`);
            } else {
                // v12 - update innerHTML with regex replacement
                innerHTMLGM[0].innerHTML = innerHTMLGM[0].innerHTML
                    .replace(/\d+:\d+:\d+/, `${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}`);
                innerHTMLGMxPlayer[0].innerHTML = innerHTMLGMxPlayer[0].innerHTML
                    .replace(/\d+:\d+:\d+/, `${`${h2}`}:${`00${m2}`.slice(-2)}:${`00${s2}`.slice(-2)}`);
                innerHTMLCombat[0].innerHTML = innerHTMLCombat[0].innerHTML
                    .replace(/\d+:\d+:\d+/, `${`${h3}`}:${`00${m3}`.slice(-2)}:${`00${s3}`.slice(-2)}`);
            }
        }
    }
};