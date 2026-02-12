# foundryVTT game time clock
![demo](https://user-images.githubusercontent.com/23254376/111742237-bc5a4e80-88c2-11eb-8b77-31aa9726ffed.png)

<p align="center">
    <a href="https://discord.gg/vx4kcm7" title="GitHub all releases!"><img src="https://img.shields.io/github/downloads/hktrpg/foundryVTT_game_time_clock/total" alt="GitHub all releases" /></a>
    <a href="https://discord.gg/vx4kcm7" title="Join the discord server!"><img src="https://img.shields.io/discord/278202347165974529?logo=discord" alt="Discord invite button" /></a>
    <a href="https://patreon.com/HKTRPG" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-red.svg" alt="Patreon donate button" /></a>
</p>

<p align="center">
    If you love it, you can <a href="https://patreon.com/HKTRPG" title="Support on Patreon">buy me a tea</a> 🍵
</p>

## Features

- It can count how much time the GM and players spend in the game.
- It shows three separate timers:
  - GM online time
  - GM and players online time
  - Total combat time
- Timers are displayed in the Game Settings window (compatible with Foundry VTT v10–v13).
- Supports pausing the timers while the game is paused (configurable).

### Resetting timers

Timers are stored as world settings and can be reset in two ways:

1. **From the Game Settings screen**
   - Open **Configure Settings → Module Settings → Game Time Clock**.
   - Use the **“Reset Game Time Clock”** menu entry.
   - Click **“Open reset dialog”** and follow the two-step confirmation dialog.

2. **By clicking the time display**
   - Open **Configure Settings → Game Settings**.
   - Click on any of the time values for:
     - GM online time
     - GM and players online time
     - Total combat time
   - A two-step confirmation dialog will appear, allowing you to reset:
     - GM online time only
     - GM and players online time only
     - Combat time only
     - **All timers**

> Only GMs can reset timers. Resetting is **permanent** and **cannot be undone**.

## TO DO LIST

- [x] Update the time every second (DONE)
- [x] Debug of some mod effect setting tab (DONE)
- [x] Timer on active Encounters <-- a special timer for Combat only? (DONE)
- [x] Game clock setting - Stop timers when Game is Paused (DONE)
- [x] Provide UI to reset timers from Game Settings and Module Settings (DONE)
