import {
    matchState,
    matchConfig,
    MATCH_STATUS,
    EVENT_TYPES,
    redoStack,
    events,
    setResults,
    doublesState,
} from "./state.js"

import {
    showSetMessage,
    updateScoreDisplay,
    updateServeDisplay,
    updateSetScore,
    showIntervalOverlay,
    hideIntervalOverlay,
    prepareNextSetUI,
    gameEndMessage,
    changePlayerSides,
    changePlayerCourtPositions
} from "./ui.js"

import {
    intervalTimer,
    matchTimer,
    setBreakTimer
} from "./timer.js"

// Game configurations
const pointsPerSet = matchConfig.pointsPerSet
const numSets = matchConfig.numOfSets
const setsToWin = Math.ceil(numSets / 2)

const pointsForInterval = Math.floor(pointsPerSet / 2) + 1

export function calculateScore() {
    let greenScore = 0
    let orangeScore = 0

    events.forEach(event => {

        if (
            event.type === EVENT_TYPES.POINT &&
            event.set === matchState.currentSet
        ) {
            if (event.player === "green") {
                greenScore++
            } else if (event.player === "orange") {
                orangeScore++
            }
        }
    })

    return [greenScore, orangeScore]
}

// Record a point
export function recordPoint(side) {
    if (matchState.status === MATCH_STATUS.PRE_GAME) {
        if (isDoubles() && doublesState.serverPlayer === null) {
            return
        }
        matchState.status = MATCH_STATUS.ONGOING
        document.querySelectorAll(".pre-game-controls").forEach(control => {
            control.style.display = "none"
        })
    }
    if (matchState.status !== MATCH_STATUS.ONGOING) {
        alert("Match is paused.")
        return
    }

    // A new point invalidates the redo history
    redoStack.length = 0

    const event = {
        type: EVENT_TYPES.POINT,
        player: side,
        set: matchState.currentSet,
        doublesBefore: isDoubles() ? snapshotDoublesState() : null
    }
    events.push(event)

    const [greenScore, orangeScore] = calculateScore()
    if (isDoubles()) {
        applyDoublesRally(side, greenScore, orangeScore)
    } else {
        // Winner of rally serves.
        matchState.serve = side
        updateSinglesCourtPosition(side, greenScore, orangeScore)
    }
    event.doublesAfter = isDoubles() ? snapshotDoublesState() : null

    // Update score UI
    updateScoreDisplay(
        matchState.currentSet,
        greenScore,
        orangeScore)
    // Update server display
    updateServeDisplay(matchState.serve, doublesState.serverPlayer)

    if ((greenScore === pointsForInterval ||
        orangeScore === pointsForInterval) &&
        !matchState.intervalOver
    ) {
        matchState.status = MATCH_STATUS.INTERVAL
        showIntervalOverlay()

        if (matchState.currentSet === matchConfig.numOfSets) {
            changePlayerSides()
        }
    }

    const winner = checkSetWinner(greenScore, orangeScore)

    if (winner) {
        finishSet(
            greenScore,
            orangeScore,
            winner,
            matchTimer.time
        )
    }
}

function updateSinglesCourtPosition(side, greenScore, orangeScore) {
    if (side === "green") {
        matchState.greenCourt =
            greenScore % 2 === 0
                ? "right"
                : "left"

        matchState.orangeCourt = matchState.greenCourt
    } else {
        matchState.orangeCourt =
            orangeScore % 2 === 0
                ? "right"
                : "left"

        matchState.greenCourt = matchState.orangeCourt
    }

    changePlayerCourtPositions({
        green: { right: matchState.greenCourt === "right" ? 0 : 1 },
        orange: { right: matchState.orangeCourt === "right" ? 0 : 1 }
    })
}
// Undo last point
export function undo() {
    if (
        events.length === 0 ||
        matchState.status !== MATCH_STATUS.ONGOING
    ) {
        return
    }

    const lastEvent = events.pop()
    redoStack.push(lastEvent)

    if (isDoubles()) {
        restoreDoublesState(lastEvent.doublesBefore)
    } else if (events.length === 0) {
        matchState.serve = matchState.initialServer
    } else {
        matchState.serve = events.at(-1).player
    }

    const [greenScore, orangeScore] = calculateScore()
    // console.log(greenScore, orangeScore)
    updateScoreDisplay(matchState.currentSet, greenScore, orangeScore)
    updateServeDisplay(matchState.serve, doublesState.serverPlayer)
    if (isDoubles()) {
        changePlayerCourtPositions(doublesState.courtPositions)
    }
}
// Redo last undone point
export function redo() {
    if (
        redoStack.length === 0 ||
        matchState.status !== MATCH_STATUS.ONGOING
    ) {
        return
    }

    const lastUndo = redoStack.pop()
    events.push(lastUndo)

    if (isDoubles()) {
        restoreDoublesState(lastUndo.doublesAfter)
    } else {
        matchState.serve = lastUndo.player
    }

    const [greenScore, orangeScore] = calculateScore()
    updateScoreDisplay(matchState.currentSet, greenScore, orangeScore)
    updateServeDisplay(matchState.serve, doublesState.serverPlayer)
    if (isDoubles()) {
        changePlayerCourtPositions(doublesState.courtPositions)
    }
}

// End interval
export function endInterval() {
    // Make matchState ongoing
    matchState.status = MATCH_STATUS.ONGOING
    // Interval is over for the set
    matchState.intervalOver = true

    intervalTimer.reset()
    hideIntervalOverlay()
}

export function checkSetWinner(greenScore, orangeScore) {
    const target = pointsPerSet

    // No one has reached the target yet
    if (greenScore < target && orangeScore < target) {
        return null
    }

    // Deuce is not allowed
    if (!matchConfig.allowDeuce) {
        if (greenScore >= target) {
            return "green"
        }

        if (orangeScore >= target) {
            return "orange"
        }
    }

    // Deuce is allowed
    if (matchConfig.allowDeuce) {
        // 30-point limit
        if (greenScore === 30) {
            return "green"
        }

        if (orangeScore === 30) {
            return "orange"
        }

        // Someone must have at least 2 points more
        const difference = Math.abs(greenScore - orangeScore)

        if (
            (greenScore >= target || orangeScore >= target) &&
            difference >= 2
        ) {
            return greenScore > orangeScore
                ? "green"
                : "orange"
        }

        // Still in deuce
        return null
    }

    return null
}

export function finishSet(greenScore, orangeScore, winner, duration) {
    // Update number of sets won
    if (winner === "green") {
        matchState.greenSets++
    } else {
        matchState.orangeSets++
    }

    // Store result of this set
    saveSetResult(
        matchState.currentSet,
        greenScore,
        orangeScore,
        winner,
        duration
    )

    // Check whether the match is over
    if (
        matchState.greenSets === setsToWin ||
        matchState.orangeSets === setsToWin
    ) {
        finishMatch(winner)
        return
    }

    // Set is over, but match continues
    matchState.status = MATCH_STATUS.SET_FINISHED

    updateSetScore(
        matchState.currentSet,
        greenScore,
        orangeScore,
        winner
    )
    showSetMessage(
        matchState.currentSet,
        winner
    )
}

export function prepareNextSet() {
    // Update matchstate
    matchState.currentSet++
    matchState.serve = setResults.at(-1).winner
    matchState.intervalOver = false

    matchTimer.reset()
    setBreakTimer.reset()

    prepareNextSetUI()

    if (isDoubles()) {
        matchState.status = MATCH_STATUS.PRE_GAME
        doublesState.serverPlayer = null
        document.dispatchEvent(new CustomEvent("doubles-set-setup", {
            detail: { servingTeam: matchState.serve }
        }))
    } else {
        matchState.status = MATCH_STATUS.ONGOING
    }
}

export function initialiseDoublesSet(initialServer = "green", serverPlayer = 0, receiverPlayer = 0) {
    const receivingTeam = initialServer === "green" ? "orange" : "green"

    matchState.initialServer = initialServer
    matchState.serve = initialServer
    doublesState.serverPlayer = Number(serverPlayer)
    doublesState.courtPositions.green.right = initialServer === "green"
        ? Number(serverPlayer)
        : Number(receiverPlayer)
    doublesState.courtPositions.orange.right = initialServer === "orange"
        ? Number(serverPlayer)
        : Number(receiverPlayer)
    doublesState.initialState = snapshotDoublesState()

    changePlayerCourtPositions(doublesState.courtPositions)
    updateServeDisplay(initialServer, doublesState.serverPlayer)
}

function applyDoublesRally(winner, greenScore, orangeScore) {
    const servingTeam = matchState.serve
    if (winner !== servingTeam) {
        // On a service change the receiving pair remains in place. The player
        // in the court matching the new score becomes the server.
        const winnerScore = winner === "green" ? greenScore : orangeScore
        doublesState.serverPlayer = winnerScore % 2 === 0
            ? doublesState.courtPositions[winner].right
            : 1 - doublesState.courtPositions[winner].right
    } else {
        // The serving pair won: the same player keeps the serve and the pair
        // exchanges service courts for the new score parity.
        doublesState.courtPositions[winner].right =
            1 - doublesState.courtPositions[winner].right
    }

    matchState.serve = winner
    changePlayerCourtPositions(doublesState.courtPositions)
}

function snapshotDoublesState() {
    return {
        serve: matchState.serve,
        serverPlayer: doublesState.serverPlayer,
        courtPositions: {
            green: { right: doublesState.courtPositions.green.right },
            orange: { right: doublesState.courtPositions.orange.right }
        }
    }
}

function restoreDoublesState(snapshot) {
    if (!snapshot) {
        return
    }

    matchState.serve = snapshot.serve
    doublesState.serverPlayer = snapshot.serverPlayer
    doublesState.courtPositions.green.right = snapshot.courtPositions.green.right
    doublesState.courtPositions.orange.right = snapshot.courtPositions.orange.right
}

function isDoubles() {
    return matchConfig.type.toLowerCase() === "doubles"
}

function saveSetResult(
    set,
    greenScore,
    orangeScore,
    winner,
    duration
) {
    const result = {
        set: set,
        greenScore: greenScore,
        orangeScore: orangeScore,
        winner: winner,
        duration: duration
    }
    setResults.push(result)
}

function finishMatch(winner) {
    matchState.status = MATCH_STATUS.GAME_UP

    const totalDuration = setResults.reduce(
        (total, result) => total + result.duration,
        0
    )

    const matchStats = {
        winner: winner,
        duration: totalDuration
    }

    sessionStorage.setItem(
        "setResults",
        JSON.stringify(setResults)
    )

    sessionStorage.setItem(
        "events",
        JSON.stringify(events)
    )

    sessionStorage.setItem(
        "matchStats",
        JSON.stringify(matchStats)
    )

    gameEndMessage(
        matchState.greenSets,
        matchState.orangeSets,
        winner
    )
    console.log("Match winner:", winner)
}


