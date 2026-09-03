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

// Current state of match
// Current match state
const matchState = {
    status: MATCH_STATUS.PRE_GAME,

    currentSet: 1,

    greenSets: 0,
    orangeSets: 0,

    initialServer: "green",
    serve: "green",

    sidesSwapped: false,

    intervalOver: false,
    intervalPaused: false,

    setBreakPaused: false
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
    matchState
}