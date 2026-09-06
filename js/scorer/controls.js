import {
    recordPoint,
    undo,
    redo,
    endInterval,
    prepareNextSet,
    initialiseDoublesSet
} from "./scoring.js"

import { 
    matchTimer,
    intervalTimer,
    setBreakTimer,
} from "./timer.js"

import { 
    togglePauseIcon,
    showScorecard,
    changePlayerSides,
    newMatch,
    showPreGameControls
} from "./ui.js"

import { 
    MATCH_STATUS,
    matchState,
    matchConfig,
    doublesState
} from "./state.js"

// Listen to +1 btn events
const greenPointBtn = document.getElementById("green-one-point")
greenPointBtn.addEventListener("click", () => { recordPoint("green") })

const orangePointBtn = document.getElementById("orange-one-point")
orangePointBtn.addEventListener("click", () => { recordPoint("orange") })

// Undo
const undoBtn = document.getElementById("undo")
undoBtn.addEventListener("click", undo)
// Redo
const redoBtn = document.getElementById("redo")
redoBtn.addEventListener("click", redo)

// Pause
const pauseBtn = document.getElementById("pause")
const pauseIcon = document.getElementById("pause-icon")
pauseBtn.addEventListener("click", () => {
    matchTimer.togglePause()
    matchState.status = 
    matchState.status === MATCH_STATUS.PAUSED
    ? MATCH_STATUS.ONGOING
    : MATCH_STATUS.PAUSED

    togglePauseIcon(
        pauseBtn,
        pauseIcon,
        matchTimer.paused
    )
})

// Change-sides btn
const changeSidesBtn = document.getElementById("change-sides")
changeSidesBtn.addEventListener("click", changeSidesInPregame)

// Change-serve btn
const changeServeBtn = document.getElementById("change-serve")
changeServeBtn.addEventListener("click", changeServe)

// Next-set btn
const nextSetBtn = document.getElementById("next-set-btn")
nextSetBtn.addEventListener("click", prepareNextSet)

// Skip interval and continue to match
const continueBtn = document.getElementById("continue-btn")
continueBtn.addEventListener("click", endInterval)

// Pause interval
const intervalPauseBtn = document.getElementById("pause-interval-btn")
const intervalPauseIcon = document.getElementById("pause-interval-icon")
intervalPauseBtn.addEventListener("click", () => {
    intervalTimer.togglePause()

    togglePauseIcon(
        intervalPauseBtn,
        intervalPauseIcon,
        intervalTimer.paused
    )
} )

// Reset interval
const resetIntervalBtn = document.getElementById("reset-interval-btn")
resetIntervalBtn.addEventListener("click", () => {intervalTimer.reset()})

// Pause set timer
const setTimePauseBtn = document.getElementById("pause-set-time-btn")
const setTimePauseIcon = document.getElementById("pause-set-time-icon")
setTimePauseBtn.addEventListener("click", () => {
    setBreakTimer.togglePause()

    togglePauseIcon(
        setTimePauseBtn,
        setTimePauseIcon,
        setBreakTimer.paused
    )
})

// Reset set timer
const resetSetTimerBtn = document.getElementById("reset-set-time-btn")
resetSetTimerBtn.addEventListener("click", () => {setBreakTimer.reset()})

// View scorecard
const viewScorecardBtn = document.getElementById("view-scorecard-btn")
viewScorecardBtn.addEventListener("click", showScorecard)

const newMatchBtn = document.getElementById("new-match-btn")
newMatchBtn.addEventListener("click", newMatch)

const greenCourtBtn = document.getElementById("change-courts-green")
const orangeCourtBtn = document.getElementById("change-courts-orange")

if (matchConfig.type.toLowerCase() === "doubles") {
    initialiseDoublesSet("green", 0, 0)
    greenCourtBtn.addEventListener("click", () => swapDoublesCourts("green"))
    orangeCourtBtn.addEventListener("click", () => swapDoublesCourts("orange"))

    document.addEventListener("doubles-set-setup", event => {
        // The previous set's winner must serve first. The horizontal controls
        // still let the scorer choose the starting server and receiver.
        initialiseDoublesSet(
            event.detail.servingTeam,
            doublesState.courtPositions[event.detail.servingTeam].right,
            doublesState.courtPositions[
                event.detail.servingTeam === "green" ? "orange" : "green"
            ].right
        )
        showPreGameControls(true)
        changeServeBtn.classList.add("is-btn-hidden")
    })
}

function swapDoublesCourts(team) {
    if (matchState.status !== MATCH_STATUS.PRE_GAME) {
        return
    }

    doublesState.courtPositions[team].right =
        1 - doublesState.courtPositions[team].right

    const receivingTeam = matchState.initialServer === "green" ? "orange" : "green"
    initialiseDoublesSet(
        matchState.initialServer,
        doublesState.courtPositions[matchState.initialServer].right,
        doublesState.courtPositions[receivingTeam].right
    )
}
// Change sides before game starts
function changeSidesInPregame() {
    if (matchState.status !== MATCH_STATUS.PRE_GAME) {
        return
    }

    matchState.sidesSwapped = !matchState.sidesSwapped
    changePlayerSides()
}

// Change serve before game starts
function changeServe() {
    if (matchState.status !== MATCH_STATUS.PRE_GAME) {
        return
    }

    if (matchConfig.type.toLowerCase() === "doubles") {
        // Badminton requires the previous set's winning side to serve first.
        if (matchState.currentSet > 1) {
            return
        }

        const nextServer = matchState.initialServer === "green" ? "orange" : "green"
        const receiver = nextServer === "green" ? "orange" : "green"
        initialiseDoublesSet(
            nextServer,
            doublesState.courtPositions[nextServer].right,
            doublesState.courtPositions[receiver].right
        )
        return
    }

    // Change server
    matchState.initialServer = 
    matchState.initialServer === "green"
    ? "orange"
    : "green"

    matchState.serve = matchState.initialServer
}
