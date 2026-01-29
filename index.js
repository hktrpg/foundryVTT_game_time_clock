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

// Helper function to safely update settings with permission checks
const safeUpdateSetting = (module, key, value) => {
    try {
        // Only allow GMs to update world-scoped settings
        if (game.user.isGM) {
            game.settings.set(module, key, value);
        }
    } catch (error) {
        console.warn(`Game Time Clock: Failed to update setting ${key}:`, error);
    }
};

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

    // Settings menu entry that exposes a reset button inside the Game Settings UI
    if (game.settings.registerMenu) {
        class GameTimeClockResetMenu extends FormApplication {
            static get defaultOptions() {
                const options = super.defaultOptions;
                options.id = "game-time-clock-reset-menu";
                options.title = game.i18n.localize("GMTimeClock.resetMenu.title");
                options.template = "modules/game_time_clock/templates/reset-menu.html";
                options.width = 480;
                return options;
            }

            getData() {
                return {};
            }

            activateListeners(html) {
                super.activateListeners(html);
                html.find('button[data-action="open-reset-dialog"]').on("click", ev => {
                    ev.preventDefault();
                    openResetDialog();
                    this.close();
                });
            }
        }

        game.settings.registerMenu("game_time_clock", "resetMenu", {
            name: game.i18n.localize("GMTimeClock.resetMenu.name"),
            label: game.i18n.localize("GMTimeClock.resetMenu.label"),
            hint: game.i18n.localize("GMTimeClock.resetMenu.hint"),
            icon: "fas fa-undo",
            type: GameTimeClockResetMenu,
            restricted: true
        });
    }
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

function setupResetDialogHandlers() {
    if (!innerHTMLGM || !innerHTMLGM.length) return;

    const elements = [innerHTMLGM, innerHTMLGMxPlayer, innerHTMLCombat];

    for (let el of elements) {
        if (!el || !el.length) continue;

        let valueSpan = el.find('.value');
        if (!valueSpan.length) {
            // v12 structure - use last span inside the element
            valueSpan = el.find('span').last();
        }
        if (!valueSpan.length) continue;

        if (valueSpan.data('gametime-click-bound')) continue;

        valueSpan.data('gametime-click-bound', true);
        valueSpan.css('cursor', 'pointer');
        valueSpan.on('click', () => {
            openResetDialog();
        });
    }
}

function performReset(choice) {
    if (!game.user.isGM) {
        ui.notifications?.warn(game.i18n.localize("GMTimeClock.resetDialog.onlyGM"));
        return;
    }

    switch (choice) {
        case "gm":
            GMTimeplayTime = 0;
            GMLastTIME = -1;
            safeUpdateSetting("game_time_clock", "GMTime", 0);
            break;
        case "gmWithPlayer":
            GMwithPlayerTimeplayTime = 0;
            nonGMLastTIME = -1;
            safeUpdateSetting("game_time_clock", "GMwithPlayerTime", 0);
            break;
        case "combat":
            combatTimeplayTime = 0;
            combatLastTIME = -1;
            safeUpdateSetting("game_time_clock", "CombatTime", 0);
            break;
        case "all":
            GMTimeplayTime = 0;
            GMwithPlayerTimeplayTime = 0;
            combatTimeplayTime = 0;
            GMLastTIME = -1;
            nonGMLastTIME = -1;
            combatLastTIME = -1;
            safeUpdateSetting("game_time_clock", "GMTime", 0);
            safeUpdateSetting("game_time_clock", "GMwithPlayerTime", 0);
            safeUpdateSetting("game_time_clock", "CombatTime", 0);
            break;
        default:
            return;
    }

    refreshDisplay();
}

function openSecondConfirm(choice) {
    const choiceKeyMap = {
        "gm": "GMTimeClock.resetDialog.optionGM",
        "gmWithPlayer": "GMTimeClock.resetDialog.optionGMWithPlayer",
        "combat": "GMTimeClock.resetDialog.optionCombat",
        "all": "GMTimeClock.resetDialog.optionAll"
    };

    const choiceLabelKey = choiceKeyMap[choice];
    if (!choiceLabelKey) return;

    const choiceLabel = game.i18n.localize(choiceLabelKey);

    const content = `
        <p>${game.i18n.localize("GMTimeClock.resetDialog.step2Warning")}</p>
        <p><strong>${game.i18n.format("GMTimeClock.resetDialog.step2Choice", { choice: choiceLabel })}</strong></p>
    `;

    new Dialog({
        title: game.i18n.localize("GMTimeClock.resetDialog.step2Title"),
        content,
        buttons: {
            confirm: {
                label: game.i18n.localize("GMTimeClock.resetDialog.step2Confirm"),
                icon: '<i class="fas fa-check"></i>',
                callback: () => performReset(choice)
            },
            back: {
                label: game.i18n.localize("GMTimeClock.resetDialog.step2Back"),
                icon: '<i class="fas fa-times"></i>'
            }
        },
        default: "back"
    }).render(true);
}

function openResetDialog() {
    if (!game.user.isGM) {
        ui.notifications?.warn(game.i18n.localize("GMTimeClock.resetDialog.onlyGM"));
        return;
    }

    const content = `
        <form>
            <p>${game.i18n.localize("GMTimeClock.resetDialog.step1Label")}</p>
            <div class="form-group">
                <label>
                    <input type="radio" name="reset-type" value="gm">
                    ${game.i18n.localize("GMTimeClock.resetDialog.optionGM")}
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="radio" name="reset-type" value="gmWithPlayer">
                    ${game.i18n.localize("GMTimeClock.resetDialog.optionGMWithPlayer")}
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="radio" name="reset-type" value="combat">
                    ${game.i18n.localize("GMTimeClock.resetDialog.optionCombat")}
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="radio" name="reset-type" value="all">
                    ${game.i18n.localize("GMTimeClock.resetDialog.optionAll")}
                </label>
            </div>
        </form>
    `;

    new Dialog({
        title: game.i18n.localize("GMTimeClock.resetDialog.title"),
        content,
        buttons: {
            reset: {
                label: game.i18n.localize("GMTimeClock.resetDialog.step1Confirm"),
                icon: '<i class="fas fa-undo"></i>',
                callback: html => {
                    const choice = html.find('input[name="reset-type"]:checked').val();
                    if (!choice) return;
                    openSecondConfirm(choice);
                }
            },
            cancel: {
                label: game.i18n.localize("GMTimeClock.resetDialog.cancel"),
                icon: '<i class="fas fa-times"></i>'
            }
        },
        default: "cancel"
    }).render(true);
}

function refreshDisplay() {
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

    setupResetDialogHandlers();

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

Hooks.once("ready", () => {
    // Only initialize if the game is ready and user has proper permissions
    if (!game.user) {
        console.warn("Game Time Clock: User not available, skipping initialization");
        return;
    }

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
        // Check if game and user are available
        if (!game || !game.user) {
            return;
        }

        try {
            (game.settings.get("game_time_clock", "forceFalseDebugMode") && CONFIG.debug.hooks) ? CONFIG.debug.hooks = false : null;
            isPaused = (game.paused && game.settings.get("game_time_clock", "moduleSettingsPaused")) ? true : false;
        } catch (error) {
            console.warn("Game Time Clock: Failed to read module settings:", error);
            isPaused = false;
        }
        isTopGM = ((game.users.filter(user => user.active && user.isGM).length > 0) && (game.users.filter(user => user.active && user.isGM)[0].id == game.user.id)) ? true : false;
        isGM = (game.users.filter(user => user.active && user.isGM).length > 0) ? true : false;
        isNonGM = (game.users.filter(user => user.active && !user.isGM).length > 0) ? true : false;
        
        // Read latest time values from settings (only if accessible)
        try {
            GMTimeplayTime = game.settings.get("game_time_clock", "GMTime");
            GMwithPlayerTimeplayTime = game.settings.get("game_time_clock", "GMwithPlayerTime");
            combatTimeplayTime = game.settings.get("game_time_clock", "CombatTime");
        } catch (error) {
            console.warn("Game Time Clock: Failed to read settings:", error);
            // Use default values if settings are not accessible
            GMTimeplayTime = GMTimeplayTime || 0;
            GMwithPlayerTimeplayTime = GMwithPlayerTimeplayTime || 0;
            combatTimeplayTime = combatTimeplayTime || 0;
        }
        
        switch (true) {
            case isPaused:
                // When game is paused and pause time doesn't count, just reset tracking variables
                // Don't modify the accumulated time values
                nonGMLastTIME = -1;
                GMLastTIME = -1;
                combatLastTIME = -1;
                startTime = Date.now();
                refreshDisplay();
                break;
            case isTopGM:
                // Initialize tracking variables if they are -1 (from pause state)
                if (GMLastTIME === -1) {
                    GMLastTIME = Date.now();
                } else if (GMLastTIME > 0) {
                    // Calculate time difference from last update to now
                    let timeDiff = Date.now() - GMLastTIME;
                    GMTimeplayTime += timeDiff;
                    safeUpdateSetting("game_time_clock", "GMTime", GMTimeplayTime);
                }
                GMLastTIME = Date.now();
                
                if (isNonGM) {
                    if (nonGMLastTIME === -1) {
                        nonGMLastTIME = Date.now();
                    } else if (nonGMLastTIME > 0) {
                        // Calculate time difference from last update to now
                        let timeDiff = Date.now() - nonGMLastTIME;
                        GMwithPlayerTimeplayTime += timeDiff;
                        safeUpdateSetting("game_time_clock", "GMwithPlayerTime", GMwithPlayerTimeplayTime);
                    }
                    nonGMLastTIME = Date.now();
                } else {
                    nonGMLastTIME = -1; // Reset if no non-GM players
                }
                
                // Check combat status and calculate combat time
                if (game.combats.active?.started) {
                    if (combatLastTIME === -1) {
                        combatLastTIME = Date.now();
                    } else if (combatLastTIME > 0) {
                        // Calculate time difference from last update to now
                        let timeDiff = Date.now() - combatLastTIME;
                        combatTimeplayTime += timeDiff;
                        safeUpdateSetting("game_time_clock", "CombatTime", combatTimeplayTime);
                    }
                    combatLastTIME = Date.now();
                } else {
                    if (combatLastTIME > 0) {
                        // Combat ended, calculate final time difference
                        let timeDiff = Date.now() - combatLastTIME;
                        combatTimeplayTime += timeDiff;
                        safeUpdateSetting("game_time_clock", "CombatTime", combatTimeplayTime);
                        combatLastTIME = -1;
                    }
                }
                refreshDisplay();
                break;
            default:
                // Initialize tracking variables if they are -1 (from pause state)
                if (GMLastTIME === -1) {
                    GMLastTIME = Date.now();
                }
                if (nonGMLastTIME === -1) {
                    nonGMLastTIME = Date.now();
                }
                if (combatLastTIME === -1 && game.combats.active?.started) {
                    combatLastTIME = Date.now();
                }
                
                // Only GMs can update settings - non-GMs just track time locally
                if (game.user.isGM) {
                    // Check combat status and calculate combat time
                    if (game.combats.active?.started) {
                        if (combatLastTIME === -1) {
                            combatLastTIME = Date.now();
                        } else if (combatLastTIME > 0) {
                            // Calculate time difference from last update to now
                            let timeDiff = Date.now() - combatLastTIME;
                            combatTimeplayTime += timeDiff;
                            safeUpdateSetting("game_time_clock", "CombatTime", combatTimeplayTime);
                        }
                        combatLastTIME = Date.now();
                    } else {
                        if (combatLastTIME > 0) {
                            // Combat ended, calculate final time difference
                            let timeDiff = Date.now() - combatLastTIME;
                            combatTimeplayTime += timeDiff;
                            safeUpdateSetting("game_time_clock", "CombatTime", combatTimeplayTime);
                            combatLastTIME = -1;
                        }
                    }
                } else {
                    // Non-GM users just track combat time locally without updating settings
                    if (game.combats.active?.started) {
                        if (combatLastTIME === -1) {
                            combatLastTIME = Date.now();
                        } else if (combatLastTIME > 0) {
                            // Calculate time difference from last update to now
                            let timeDiff = Date.now() - combatLastTIME;
                            combatTimeplayTime += timeDiff;
                        }
                        combatLastTIME = Date.now();
                    } else {
                        if (combatLastTIME > 0) {
                            // Combat ended, calculate final time difference
                            let timeDiff = Date.now() - combatLastTIME;
                            combatTimeplayTime += timeDiff;
                            combatLastTIME = -1;
                        }
                    }
                }
                refreshDisplay();
                break;
        }

    } catch (e) {
        console.log('ERROR in doUpdates:', e)
    }
};