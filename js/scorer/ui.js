import {
    matchConfig,
    playerNames,
    teams,
    doublesState
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

function configurePlayerDisplay(type) {
    const isDoubles = type.toLowerCase() === "doubles"

    document
        .querySelectorAll("#green-player2-info, #orange-player2-info")
        .forEach(player => {
            player.classList.toggle("is-div-hidden", !isDoubles)
        })

    document.getElementById("singles-pre-game-controls")
        .classList.toggle("is-div-hidden", false)
    document.getElementById("doubles-pre-game-controls")
        .classList.toggle("is-div-hidden", !isDoubles)
}

function updatePlayerNames(type, greenPlayer, orangePlayer) {
    if (type === "singles") {
        // Write singles player names in the scoring and set-scores interfaces
        document.querySelectorAll(".green-player").forEach(playerName => {
            playerName.textContent = greenPlayer
        })

        document.querySelectorAll(".orange-player").forEach(playerName => {
            playerName.textContent = orangePlayer
        })
    } else if (type === "doubles") {
        // Write both player names in each team's set-score label
        document.querySelector(".player-name-in-set-score.green-player").textContent =
            greenPlayer.join(" / ")
        document.querySelector(".player-name-in-set-score.orange-player").textContent =
            orangePlayer.join(" / ")

        // Write individual player names in the scoring interface
        document.querySelectorAll(".player-name-in-match.green-player").forEach(
            (playerName, index) => {
                playerName.textContent = greenPlayer[index]
            }
        )

        document.querySelectorAll(".player-name-in-match.orange-player").forEach(
            (playerName, index) => {
                playerName.textContent = orangePlayer[index]
            }
        )
    }
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

export function showPreGameControls(isDoubles) {
    document.getElementById("singles-pre-game-controls").style.display = "flex"

    if (isDoubles) {
        document.getElementById("doubles-pre-game-controls").style.display = "flex"
    }
}

export function changePlayerSides() {
    const pointsInterface = document.querySelector(".points-interface")
    const playerSides = document.querySelectorAll(".player-side")
    const doublesCourtControls = document.getElementById(
        "doubles-pre-game-controls"
    )

    const greenPlayers = document.querySelectorAll(
        "#green-side .player-info"
    )
    const orangePlayers = document.querySelectorAll(
        "#orange-side .player-info"
    )

    const greenIsRight = document
        .querySelector("#green-player1-info")
        .classList.contains("player-on-right-side")

    const greenClass = greenIsRight
        ? "player-on-left-side"
        : "player-on-right-side"

    const orangeClass = greenIsRight
        ? "player-on-right-side"
        : "player-on-left-side"

    greenPlayers.forEach(player => {
        player.classList.remove(
            "player-on-left-side",
            "player-on-right-side"
        )
        player.classList.add(greenClass)
    })

    orangePlayers.forEach(player => {
        player.classList.remove(
            "player-on-left-side",
            "player-on-right-side"
        )
        player.classList.add(orangeClass)
    })

    pointsInterface.classList.toggle("change-sides")

    playerSides.forEach(side => {
        side.classList.toggle("change-sides")
    })

    // Keep each horizontal court-switch control beside its team after ends swap.
    doublesCourtControls.classList.toggle("change-sides")
}

export function changePlayerCourtPositions(courtPositions) {
    teams.forEach(team => {
        const rightPlayer = courtPositions[team].right

        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
            const playerInfo = document.getElementById(`${team}-player${playerIndex + 1}-info`)
            playerInfo.classList.remove("player-on-right-court", "player-on-left-court")
            playerInfo.classList.add(
                playerIndex === rightPlayer
                    ? "player-on-right-court"
                    : "player-on-left-court"
            )
        }
    })
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

export function updateServeDisplay(server, serverPlayer = 0) {
    document.querySelectorAll(".serve").forEach(marker => {
        marker.classList.remove("current-server")
    })

    const serverInfoElement = document.getElementById(
        `${server}-player${serverPlayer + 1}-info`
    )
    serverInfoElement?.querySelector(".serve")?.classList.add("current-server")
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
    const winnerName = playerNames[winnerTeamId].join(" / ")
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
export function newMatch() {
    window.href.location = "match-options.html"
}




// Set-scores for green and orange
createSetScoresInterface("green")
createSetScoresInterface("orange")

updateHeader(matchConfig.type, matchConfig.category)
updatePlayerNames(matchConfig.type.toLowerCase(), playerNames.green, playerNames.orange)
configurePlayerDisplay(matchConfig.type)
