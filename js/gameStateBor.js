//add gamestates and corresponding functions
const GAMESTATE_MENU =                     "menu";
const GAMESTATE_HOWTO =                    "howToPlay";
const GAMESTATE_CREDITS =                  "credits";
const GAMESTATE_GAME =                     "game";
    
var currentGameState = 1;
var currentGameStateFunction = null;

function switchGameState(newState) {
    console.log("switchGameState to newState:" + newState);
    currentGameState = newState;

    switch (currentGameState) {

        case GAMESTATE_MENU:
            currentGameStateFunction = menu;
        break;

        case GAMESTATE_HOWTO:
            currentGameStateFunction = howToPlay;
        break;

        case GAMESTATE_CREDITS:
            currentGameStateFunction = credits;
        break;

        case GAMESTATE_GAME:
            currentGameStateFunction = game; // or play
        break;

    }
    currentGameStateFunction(); // after checking what gamestate you're in this will use the correspoding function
};

// currentGameState = GAMESTATE_MENU;