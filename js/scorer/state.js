// Fetch player names and match configuration
const playerNames = JSON.parse(sessionStorage.getItem("playerNames"))
const matchConfig = JSON.parse(sessionStorage.getItem("matchConfig"))

// Array for recording events
const events = []
let redoStack = []

// Array to store results of sets: {set, greenScore, orangeScore, winner, duration}
const setResults = []

// Match status
const MATCH_STATUS = {
    PRE_GAME: "pre-game",
    ONGOING: "ongoing",
    PAUSED: "paused",
    INTERVAL: "interval",
    SET_FINISHED: "set-finished",
    GAME_UP: "game-up"
}

// Scoring events
const EVENT_TYPES = {
    POINT: "point"
}

// Current match state
const matchState = {
    status: MATCH_STATUS.PRE_GAME,

    currentSet: 1,

    greenSets: 0,
    orangeSets: 0,

    initialServer: "green",
    serve: "green",

    greenCourt: "right",
    orangeCourt: "right",

    sidesSwapped: false,

    intervalOver: false,
    intervalPaused: false,

    setBreakPaused: false
}

const doublesState = {
    // The index (0 or 1) of the player standing in the right service court.
    // The other player is therefore in the left service court.
    courtPositions: {
        green: { right: 0 },
        orange: { right: 0 }
    },
    serverPlayer: null,
    initialState: null
}

const teams = ["green", "orange"]

export {
    playerNames,
    matchConfig,
    teams,

    MATCH_STATUS,
    EVENT_TYPES,

    events,
    redoStack,

    setResults,
    matchState,
    doublesState
}
