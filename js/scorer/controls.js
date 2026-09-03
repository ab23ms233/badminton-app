import {
    recordPoint,
    undo,
    redo,
    endInterval,
    prepareNextSet
} from "./scoring.js"

import { 
    matchTimer,
    intervalTimer,
    setBreakTimer,
} from "./timer.js"

import { 
    togglePauseIcon,
    showScorecard
} from "./ui.js"

import { 
    MATCH_STATUS,
    matchState
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
changeSidesBtn.addEventListener("click", changeSides)

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



// Change sides before game starts
function changeSides() {
    if (matchState.status !== MATCH_STATUS.PRE_GAME) {
        return
    }

    const pointsInterface = document.querySelector(".points-interface")
    const playerSides = document.querySelectorAll(".player-side")

    if (matchState.sidesSwapped === false) {
        pointsInterface.classList.add("change-sides")
        playerSides.forEach(side => {
            side.classList.add("change-sides")
        })
        matchState.sidesSwapped = true
    } else {
        pointsInterface.classList.remove("change-sides")
        playerSides.forEach(side => {
            side.classList.remove("change-sides")
        })
        matchState.sidesSwapped = false
    }
}

// Change serve before game starts
function changeServe() {
    if (matchState.status !== MATCH_STATUS.PRE_GAME) {
        return
    }

    const servers = document.querySelectorAll(".serve")
    servers.forEach(server => {
        if (server.classList.contains("current-server")) {
            server.classList.remove("current-server")
        } else {
            server.classList.add("current-server")
        }
    })

    // Change server
    matchState.initialServer = 
    matchState.initialServer === "green"
    ? "orange"
    : "green"

    matchState.serve = matchState.initialServer
}