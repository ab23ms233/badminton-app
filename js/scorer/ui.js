import {
    matchConfig,
    playerNames,
    teams
} from "./state.js";

const matchButtons = document.querySelectorAll(
    ".scoring-option-btn, .one-point"
)

// Set num and winner name in set message
const numSetElement = document.querySelector(".set-num")
const winnerNameElement = document.querySelector(".set-winner-name")

// Set overlay
const setOverlay = document.querySelector(".set-result-overlay")
// Interval overlay
const intervalOverlay = document.querySelector(".interval-overlay")

function updatePlayerNames(greenPlayer, orangePlayer) {
    // Write player names in scoring interface and set - scores interface
    const greenPlayerNames = document.querySelectorAll(".green-player")
    greenPlayerNames.forEach(playerName => {
        playerName.textContent = greenPlayer
    })

    const orangePlayerNames = document.querySelectorAll(".orange-player")
    orangePlayerNames.forEach(playerName => {
        playerName.textContent = orangePlayer
    })

}

function updateHeader(type, category) {
    // Header of page
    const header = `${category} ${type}`

    const sectionHeader = document.querySelector(".scorer-heading")
    sectionHeader.textContent = header
}

// Create set-scores UI at the top of the page
function createSetScoresInterface(teamId) {
    const setScores = document.getElementById(`${teamId}-set-scores`)
    setScores.innerHTML = ""
    const numSets = matchConfig.numOfSets
    // console.log(numSets)

    for (let i = 0; i < numSets; i++) {
        // Create a set score element for a team
        const setScoreElement = document.createElement("div")
        setScoreElement.classList.add(`set-${i + 1}-score`)
        setScoreElement.classList.add(`set-score`)
        setScoreElement.id = `set-${i + 1}-${teamId}-score`

        if (i == 0) {
            setScoreElement.textContent = 0
        } else {
            setScoreElement.textContent = "-"
        }

        setScores.appendChild(setScoreElement)
    }
}

// Make in-match btns look disabled
function disableMatchBtns() {
    matchButtons.forEach(btn => {
        btn.classList.add("match-locked")
    })
}
// Make in-match btns look enabled
function enableMatchBtns() {
    matchButtons.forEach(btn => {
        btn.classList.remove("match-locked")
    })
}

// Prepare the UI for the next set
export function prepareNextSetUI() {
    // Hide setWon message
    setOverlay.classList.add("is-div-hidden")

    // Remove color from winnerElement in set message
    winnerNameElement.classList.remove("orange-player")
    winnerNameElement.classList.remove("green-player")

    // Enable button view
    enableMatchBtns()
    changePlayerSides()
}

export function changePlayerSides() {
    const pointsInterface = document.querySelector(".points-interface")
    const playerSides = document.querySelectorAll(".player-side")

    const playerOnRight = document.querySelector(".player-on-right")
    const playerOnLeft = document.querySelector(".player-on-left")

    playerOnRight.classList.remove("player-on-right")
    playerOnRight.classList.add("player-on-left")

    playerOnLeft.classList.remove("player-on-left")
    playerOnLeft.classList.add("player-on-right")

    if (pointsInterface.classList.contains("change-sides")) {
        pointsInterface.classList.remove("change-sides")
        playerSides.forEach(side => {
            side.classList.remove("change-sides")
        })
    } else {
        pointsInterface.classList.add("change-sides")
        playerSides.forEach(side => {
            side.classList.add("change-sides")
        })
    }
}

export function updateScoreDisplay(
    currentSet,
    greenScore,
    orangeScore) {
    for (let team of teams) {
        const setScoreElement = document.getElementById(`set-${currentSet}-${team}-score`)
        const score =
            team === "green"
                ? greenScore
                : orangeScore

        setScoreElement.textContent = score
    }
}

export function updateServeDisplay(server) {
    const greenInfoElement =
        document.getElementById("green-player-info")
    const orangeInfoElement =
        document.getElementById("orange-player-info")

    const greenServe =
        greenInfoElement.querySelector(".serve")
    const orangeServe =
        orangeInfoElement.querySelector(".serve")

    if (server === "green") {
        greenServe.classList.add("current-server")
        orangeServe.classList.remove("current-server")
    }

    else if (server === "orange") {
        greenServe.classList.remove("current-server")
        orangeServe.classList.add("current-server")
    }
}

export function updateSetScore(
    set,
    greenScore,
    orangeScore,
    winner
) {
    const winnerColorClass = `${winner}-bg`

    for (let team of teams) {
        const setScoreElement = document.getElementById(`set-${set}-${team}-score`)

        if (setScoreElement) {
            const setScore =
                team === "green"
                    ? greenScore
                    : orangeScore

            setScoreElement.textContent = setScore
            if (team === winner) {
                setScoreElement.classList.add(winnerColorClass)
            }
        } else {
            console.log(`Could not find set-${set}-${team}-score`)
        }
    }
}

// Show message after set ends
export function showSetMessage(
    currentSet,
    winnerTeamId
) {
    document.querySelector(".set-result-overlay").classList.remove("is-div-hidden")

    disableMatchBtns()

    // Winner name
    const winnerName = playerNames[winnerTeamId]
    const winnerColorClass = `${winnerTeamId}-player`

    // Set num
    const numSetMessage = `Set-${currentSet}`


    // Show winner message
    numSetElement.textContent = numSetMessage
    winnerNameElement.textContent = winnerName
    winnerNameElement.classList.add(winnerColorClass)
}

// Format time into hh:mm:ss
export function formatTime(elapsedSeconds, format) {
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60

    // console.log(minutes, seconds)
    if (format === "hh:mm:ss") {
        const hours = Math.floor(elapsedSeconds / 3600)
        return `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`
    } else if (format === "mm:ss") {
        return `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`
    } else {
        return `${String(seconds).padStart(2, "0")}`
    }
}

// Toggle pause icon
export function togglePauseIcon(btn, icon, paused) {
    if (!paused) {
        icon.src = "icons/pause.svg"
        icon.alt = "Pause"
        btn.classList.remove("is-paused")
    } else {
        icon.src = "icons/play.svg"
        icon.alt = "Resume"
        btn.classList.add("is-paused")
    }
}

export function showIntervalOverlay() {
    // Show interval overlay
    intervalOverlay.classList.remove("is-div-hidden")
    // Disable match btns
    disableMatchBtns()
}
export function hideIntervalOverlay() {
    // Hide interval overlay
    intervalOverlay.classList.add("is-div-hidden")
    // Enable match btns
    enableMatchBtns()
}

// Message to show when game ends
export function gameEndMessage(
    greenSets,
    orangeSets,
    winnerTeamId
) {
    // Show result overlay
    const resultOverlay = document.querySelector(".match-result-overlay")
    resultOverlay.classList.remove("is-div-hidden")

    // Fetch HTML elements
    const matchWinnerNameElement = document.querySelector(".match-winner-name")
    const greenSetsElement = document.querySelector(".final-green-sets")
    const orangeSetsElement = document.querySelector(".final-orange-sets")

    const winnerName = playerNames[winnerTeamId]
    const winnerColorClass = `${winnerTeamId}-player`

    // Match winner name and color
    matchWinnerNameElement.textContent = winnerName
    matchWinnerNameElement.classList.add(winnerColorClass)

    // Update set score
    greenSetsElement.textContent = greenSets
    orangeSetsElement.textContent = orangeSets
}

export function showScorecard() {
    window.location.href = "scorecard.html"
}




// Set-scores for green and orange
createSetScoresInterface("green")
createSetScoresInterface("orange")

updateHeader(matchConfig.type, matchConfig.category)
updatePlayerNames(playerNames.green, playerNames.orange)