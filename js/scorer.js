// Fetch player names and match configuration
const playerNames = JSON.parse(sessionStorage.getItem("playerNames"))
const matchConfig = JSON.parse(sessionStorage.getItem("matchConfig"))

// Header of page
const type = matchConfig.type
const category = matchConfig.category
const header = `${category} ${type}`

const sectionHeader = document.querySelector(".scorer-heading")
sectionHeader.textContent = header

// Write player names in scoring interface and set-scores interface
const greenPlayerNames = document.querySelectorAll(".green-player")
greenPlayerNames.forEach(playerName => {
    playerName.textContent = playerNames.green
})

const orangePlayerNames = document.querySelectorAll(".orange-player")
orangePlayerNames.forEach(playerName => {
    playerName.textContent = playerNames.orange
})

// Array for recording events
const events = []
let redoStack = []
const EVENT_TYPES = {
    preGame: "pre-game",
    pause: "paused",
    point: "point",
    ongoing: "ongoing",
    setFinished: "set-finished",
    interval: "interval",
    gameUp: false
}

// Array to store results of sets: {set, greenScore, orangeScore, winner}
const results = []

// Game configurations
const pointsPerSet = matchConfig.pointsPerSet
const numSets = matchConfig.numOfSets
const setsToWin = Math.ceil(numSets / 2)
let totalDuration = 0

// Current state of match
const matchState = {
    status: EVENT_TYPES.preGame,
    currentSet: 1,
    greenSets: 0,
    orangeSets: 0,
    serve: "green",
    sidesSwapped: false,
    intervalOver: false,
    intervalPaused: false,
    setBreakPaused: false
}

// Prepare the scoring interface for a new set
function prepareScoringInterface() {
    // Initialise points to 0
    const points = document.querySelectorAll(".point")
    points.forEach(point => {
        point.textContent = 0
    })

    // Initialise timer
    totalDuration += setTime
    setTime = 0;

    // Set-scores for green and orange
    createSetScoresInterface("green")
    createSetScoresInterface("orange")
}

// Update set timer
let setTime = 0
const matchTimer = document.getElementById("match-timer")
setInterval(() => {
    const skipCondition =
        (matchState.status !== EVENT_TYPES.ongoing &&
            matchState.status !== EVENT_TYPES.preGame)

    setTime = updateTimer(
        setTime,
        matchTimer,
        skipCondition,
        "forward",
        "hh:mm:ss")
}, 1000)

// Update interval timer
let intervalTime = 60
const intervalTimer = document.getElementById("interval-timer")
setInterval(() => {
    const skipCondition =
        (matchState.status !== EVENT_TYPES.interval ||
            matchState.intervalPaused)

    intervalTime = updateTimer(
        intervalTime,
        intervalTimer,
        skipCondition,
        "backward",
        "mm:ss")

    if (intervalTime === 0) {
        endInterval()
    }
}, 1000)

// Update set break time 
let setBreakTime = 20
const setBreakTimer = document.getElementById("set-timer")
setInterval(() => {
    const skipCondition =
        (matchState.status !== EVENT_TYPES.setFinished ||
            matchState.setBreakPaused
        )

    setBreakTime = updateTimer(
        setBreakTime,
        setBreakTimer,
        skipCondition,
        "backward",
        "mm:ss")

    if (setBreakTime === 0) {
        prepareNextSet()
    }
}, 1000)


// Prepare scoring interface
prepareScoringInterface()

// Format time into hh:mm:ss
function formatTime(elapsedSeconds, format) {
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60

    // console.log(minutes, seconds)
    if (format === "hh:mm:ss") {
        const hours = Math.floor(seconds / 3600)
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

// Update timer
function updateTimer(timer, timerElement, skipCondition, direction, format) {
    // Skip if skip condition is true
    if (skipCondition) {
        return timer
    }
    // Increment/decrement timer
    if (direction === "forward") {
        timer++
    } else {
        timer--
    }

    // Update timerElement
    const timerContent = formatTime(timer, format)
    // console.log(timerContent)
    timerElement.textContent = timerContent
    // Return updated time
    return timer
}

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
pauseBtn.addEventListener("click", togglePauseMatch)

// Change-sides btn
const changeSidesBtn = document.getElementById("change-sides")
changeSidesBtn.addEventListener("click", changeSides)

// Change-serve btn
const changeServeBtn = document.getElementById("change-serve")
changeServeBtn.addEventListener("click", changeServe)

// Next-set btn
const nextSetBtn = document.getElementById("next-set-btn")
nextSetBtn.addEventListener("click", prepareNextSet)

// Game btns
const gameControlBtns = Array.from(document.querySelectorAll(".scoring-option-btn"))
const pointBtns = Array.from(document.querySelectorAll(".one-point"))
const btns = [...gameControlBtns, ...pointBtns]

// Set num and winner name in set message
const numSetElement = document.querySelector(".set-num")
const winnerNameElement = document.querySelector(".set-winner-name")

// Set overlay
const setOverlay = document.querySelector(".set-result-overlay")
// Interval overlay
const intervalOverlay = document.querySelector(".interval-overlay")

// Skip interval and continue to match
const continueBtn = document.getElementById("continue-btn")
continueBtn.addEventListener("click", endInterval)

// Pause interval
const intervalPauseBtn = document.getElementById("pause-interval-btn")
intervalPauseBtn.addEventListener("click", togglePauseInterval)
const intervalPauseIcon = document.getElementById("pause-interval-icon")

// Reset interval
const resetIntervalBtn = document.getElementById("reset-interval-btn")
resetIntervalBtn.addEventListener("click", () => {
    intervalTime = 60
})

// Pause set timer
const setTimePauseBtn = document.getElementById("pause-set-time-btn")
setTimePauseBtn.addEventListener("click", togglePauseSetBreak)
const setTimePauseIcon = document.getElementById("pause-set-time-icon")

// Reset set timer
const resetSetTimerBtn = document.getElementById("reset-set-time-btn")
resetSetTimerBtn.addEventListener("click", () => {
    setBreakTime = 120
})

// View scorecard
const viewScorecardBtn = document.getElementById("view-scorecard-btn")
viewScorecardBtn.addEventListener("click", showScorecard)

// Create set-scores UI at the top of the page
function createSetScoresInterface(teamId) {
    const setScores = document.getElementById(`${teamId}-set-scores`)
    const preGame = matchState.status === EVENT_TYPES.preGame
    setScores.innerHTML = ""

    for (let i = 0; i < numSets; i++) {
        // Create a set score element for a team
        const setScoreElement = document.createElement("div")
        setScoreElement.classList.add(`set-${i + 1}-score`)
        setScoreElement.classList.add(`set-score`)
        setScoreElement.id = `set-${i + 1}-${teamId}-score`

        if (preGame) {
            if (i == 0) {
                setScoreElement.textContent = 0
            } else {
                setScoreElement.textContent = "-"
            }
        } else {
            if (i < results.length) {
                let score, winnerOfSet
                winnerOfSet = results[i].winner
                // console.log(results[i])

                // Set score
                if (teamId === "green") {
                    score = results[i].greenScore
                } else {
                    score = results[i].orangeScore
                }
                // Color set score
                if (winnerOfSet === teamId) {
                    setScoreElement.classList.add(`${teamId}-set-winner`)
                }

                setScoreElement.textContent = score
            } else {
                setScoreElement.textContent = "-"
            }
        }

        setScores.appendChild(setScoreElement)
    }
}

// Function to add event when +1 is clicked
function recordPoint(side) {
    if (matchState.status === EVENT_TYPES.preGame) {
        startGame()
    }

    if (matchState.status === EVENT_TYPES.pause) {
        alert("Match is paused.")
        return
    }
    if (matchState.status === EVENT_TYPES.setFinished) {
        return;
    }

    redoStack = []
    const event = {
        type: "point",
        player: side,
        set: matchState.currentSet
    }

    events.push(event)
    matchState.serve = side

    updateScoreServe()
}

// Make in-match btns look disabled
function disableMatchBtns() {
    btns.forEach(btn => {
        btn.classList.add("match-locked")
    })
}
// Make in-match btns look enabled
function enableMatchBtns() {
    btns.forEach(btn => {
        btn.classList.remove("match-locked")
    })
}

// Toggle between pause and resume interval
function togglePauseInterval() {
    let status
    // If interval is ongoing
    if (matchState.intervalPaused) {
        matchState.intervalPaused = false
        status = "resume"
    }
    // If interval is paused
    else {
        matchState.intervalPaused = true
        status = "paused"
    }

    togglePauseIcon(intervalPauseBtn, intervalPauseIcon, status)
}

function startInterval() {
    // Show interval overlay
    intervalOverlay.classList.remove("is-div-hidden")
    // Disable match btns
    disableMatchBtns()
    // Change match status
    matchState.status = EVENT_TYPES.interval
}
// End interval
function endInterval() {
    // Hide interval overlay
    intervalOverlay.classList.add("is-div-hidden")
    // Enable match btns
    enableMatchBtns()
    // Make matchState ongoing
    matchState.status = EVENT_TYPES.ongoing
    // Interval is over for the set
    matchState.intervalOver = true
}

// Update points and server UI when point changes
function updateScoreServe() {
    // Update points
    const numSet = matchState.currentSet
    const scores = calculateScore()
    const [greenPoint, orangePoint] = scores

    const greenScore = document.getElementById(`green-point`)
    const orangeScore = document.getElementById(`orange-point`)
    const teamScores = [greenScore, orangeScore]

    const greenSetScore = document.getElementById(`set-${numSet}-green-score`)
    const orangeSetScore = document.getElementById(`set-${numSet}-orange-score`)
    const teamSetScores = [greenSetScore, orangeSetScore]

    for (let i = 0; i < teamScores.length; i++) {
        teamScores[i].textContent = scores[i];
        teamSetScores[i].textContent = scores[i];
    }

    // Update server
    const currentServer = matchState.serve

    if (currentServer === "green") {
        greenScore.parentElement.querySelector(".serve").classList.add("current-server")
        orangeScore.parentElement.querySelector(".serve").classList.remove("current-server")
    } else if (currentServer === "orange") {
        greenScore.parentElement.querySelector(".serve").classList.remove("current-server")
        orangeScore.parentElement.querySelector(".serve").classList.add("current-server")
    }

    const intervalPoints = Math.floor(pointsPerSet / 2)
    // Checking for interval
    if ((greenPoint === intervalPoints ||
        orangePoint === intervalPoints) &&
        !matchState.intervalOver) {
        startInterval()
    }

    // if some player reaches final points
    if (greenPoint >= pointsPerSet ||
        orangePoint >= pointsPerSet
    ) {
        // Normal game
        if (!matchConfig.allowDeuce) {
            endSet(greenPoint, orangePoint)
        } else {    // Deuce
            const diff = Math.abs(greenPoint - orangePoint)

            if (diff >= 2) {
                endSet(greenPoint, orangePoint)
            }
        }
    }
}

// Calculates current score based on events
function calculateScore() {
    if (events.length === 0) {
        return
    }

    let greenScore = 0
    let orangeScore = 0

    events.forEach(event => {
        if (event.type === "point" && event.set === matchState.currentSet) {
            if (event.player === "green") {
                greenScore++
            }
            else if (event.player === "orange") {
                orangeScore++
            }
        }
    })

    return [greenScore, orangeScore]
}

// Undo
function undo() {
    if (events.length === 0 ||
        matchState.status !== EVENT_TYPES.ongoing
    ) {
        return
    }
    const lastEvent = events.pop()
    redoStack.push(lastEvent)
    updateScoreServe()
}

// Redo
function redo() {
    if (redoStack.length === 0 ||
        matchState.status !== EVENT_TYPES.ongoing
    ) {
        return
    }

    const lastUndo = redoStack.pop()
    events.push(lastUndo)
    updateScoreServe()
}

// Toggle between pause and resume
function togglePauseMatch() {
    // Disable if set is finished or interval is going on
    if (matchState.status === EVENT_TYPES.setFinished ||
        matchState.status === EVENT_TYPES.interval
    ) {
        return
    }

    // If match is paused at the time of clicking, unpause
    if (matchState.status === EVENT_TYPES.pause) {
        matchState.status = EVENT_TYPES.ongoing
    } else {
        matchState.status = EVENT_TYPES.pause
    }

    togglePauseIcon(pauseBtn, pauseIcon, matchState.status)
}

// Toggle pause icon
function togglePauseIcon(btn, icon, status) {
    if (status !== "paused") {
        icon.src = "icons/pause.svg"
        icon.alt = "Pause"
        btn.classList.remove("is-paused")
    } else {
        icon.src = "icons/play.svg"
        icon.alt = "Resume"
        btn.classList.add("is-paused")
    }
}

function togglePauseSetBreak() {
    if (matchState.status !== EVENT_TYPES.setFinished) {
        return
    }

    let status
    if (matchState.setBreakPaused) {
        matchState.setBreakPaused = false
        status = "resume"
    } else {
        matchState.setBreakPaused = true
        status = "paused"
    }

    togglePauseIcon(setTimePauseBtn, setTimePauseIcon, status)
}

// When a set ends
function endSet(greenScore, orangeScore) {
    // Checking which team won
    let teamId
    if (greenScore > orangeScore) {
        teamId = "green"
    } else {
        teamId = "orange"
    }

    // Change match status to set-won
    matchState.status = EVENT_TYPES.setFinished
    const numSet = matchState.currentSet

    // Make btns look disabled
    disableMatchBtns()

    let winnerColorClass
    // Update greenSets and orangeSets
    if (teamId === "green") {
        matchState.greenSets++
        winnerColorClass = "green-set-winner"
    } else if (teamId === "orange") {
        matchState.orangeSets++
        winnerColorClass = "orange-set-winner"
    }

    // Change score bg color of set winner
    const winnerSetScore = document.getElementById(`set-${numSet}-${teamId}-score`)
    winnerSetScore.classList.add(winnerColorClass)

    // Update result
    const result = {
        set: numSet,
        greenScore: greenScore,
        orangeScore: orangeScore,
        winner: teamId,
        duration: setTime
    }
    results.push(result)

    // If some player has won the game
    if (matchState.greenSets === setsToWin ||
        matchState.orangeSets === setsToWin
    ) {
        endMatch()
        // If only set is won
    } else {
        showSetMessage()
    }
}

// Show message after set ends
function showSetMessage() {
    // Team which won the set
    const winnerTeamId = results.at(-1).winner

    document.querySelector(".set-result-overlay").classList.remove("is-div-hidden")

    // Winner name
    const winnerName = playerNames[winnerTeamId]
    const winnerColorClass = `${winnerTeamId}-player`

    // Set num
    const numSetMessage = `Set-${matchState.currentSet}`

    // Show winner message
    numSetElement.textContent = numSetMessage
    winnerNameElement.textContent = winnerName
    winnerNameElement.classList.add(winnerColorClass)
}

// Message to show when game ends
function gameEndMessage() {
    // Team which won the set
    const winnerTeamId = results.at(-1).winner

    // Show result overlay
    const resultOverlay = document.querySelector(".match-result-overlay")
    resultOverlay.classList.remove("is-div-hidden")

    // Fetch HTML elements
    const matchWinnerNameElement = document.querySelector(".match-winner-name")
    const greenSets = document.querySelector(".final-green-sets")
    const orangeSets = document.querySelector(".final-orange-sets")

    const winnerName = playerNames[winnerTeamId]
    const winnerColorClass = `${winnerTeamId}-player`

    // Match winner name and color
    matchWinnerNameElement.textContent = winnerName
    matchWinnerNameElement.classList.add(winnerColorClass)

    // Update set score
    greenSets.textContent = matchState.greenSets
    orangeSets.textContent = matchState.orangeSets
}

// Change sides before game starts
function changeSides() {
    if (matchState.status !== EVENT_TYPES.preGame) {
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
    if (matchState.status !== EVENT_TYPES.preGame) {
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
}

// Change match status to ongoing and hide pregame controls
function startGame() {
    matchState.status = EVENT_TYPES.ongoing
    document.querySelector(".pre-game-controls").style.display = "none"
}

// Prepare the UI for the next set
function prepareNextSet() {
    // Hide setWon message
    setOverlay.classList.add("is-div-hidden")

    // Remove color from winnerElement in set message
    winnerNameElement.classList.remove("orange-player")
    winnerNameElement.classList.remove("green-player")

    // Enable button view
    enableMatchBtns()

    // Update matchstate
    matchState.currentSet++
    matchState.status = EVENT_TYPES.ongoing
    matchState.serve = results.at(-1).winner
    matchState.intervalOver = false

    // Prepare new set interface
    prepareScoringInterface()
    updateScoreServe()
}

// Store match data when game finishes
function endMatch() {
    matchState.status = EVENT_TYPES.gameUp
    gameEndMessage()

    // Check match winning team
    let matchSummary
    if (matchState.greenSets === setsToWin) {
        matchSummary = {
            winner: "green"
        }
    } else {
        matchSummary = {
            winner: "orange"
        }
    }
    matchSummary.totalDuration = totalDuration
    results.push(matchSummary)

    // Store results
    sessionStorage.setItem(
        "results",
        JSON.stringify(results)
    )
    // Events
    sessionStorage.setItem(
        "events",
        JSON.stringify(events)
    )
}

function showScorecard() {
    window.location.href = "scorecard.html"
}