
import "./controls.js"
import "./timer.js"
import "./ui.js"


// // Update points and server UI when point changes
// function updateScoreServe() {
//     // Update points
//     const numSet = matchState.currentSet
//     const scores = calculateScore()
//     const [greenPoint, orangePoint] = scores

//     const greenScore = document.getElementById(`green-point`)
//     const orangeScore = document.getElementById(`orange-point`)
//     const teamScores = [greenScore, orangeScore]

//     const greenSetScore = document.getElementById(`set-${numSet}-green-score`)
//     const orangeSetScore = document.getElementById(`set-${numSet}-orange-score`)
//     const teamSetScores = [greenSetScore, orangeSetScore]

//     for (let i = 0; i < teamScores.length; i++) {
//         teamScores[i].textContent = scores[i];
//         teamSetScores[i].textContent = scores[i];
//     }

//     // Update server
//     const currentServer = matchState.serve

//     if (currentServer === "green") {
//         greenScore.parentElement.querySelector(".serve").classList.add("current-server")
//         orangeScore.parentElement.querySelector(".serve").classList.remove("current-server")
//     } else if (currentServer === "orange") {
//         greenScore.parentElement.querySelector(".serve").classList.remove("current-server")
//         orangeScore.parentElement.querySelector(".serve").classList.add("current-server")
//     }

//     const intervalPoints = Math.floor(pointsPerSet / 2)
//     // Checking for interval
//     if ((greenPoint === intervalPoints ||
//         orangePoint === intervalPoints) &&
//         !matchState.intervalOver) {
//         startInterval()
//     }

//     // if some player reaches final points
//     if (greenPoint >= pointsPerSet ||
//         orangePoint >= pointsPerSet
//     ) {
//         // Normal game
//         if (!matchConfig.allowDeuce) {
//             endSet(greenPoint, orangePoint)
//         } else {    // Deuce
//             const diff = Math.abs(greenPoint - orangePoint)

//             if (diff >= 2) {
//                 endSet(greenPoint, orangePoint)
//             }
//         }
//     }
// }

// // Calculates current score based on events
// function calculateScore() {
//     if (events.length === 0) {
//         return
//     }

//     let greenScore = 0
//     let orangeScore = 0

//     events.forEach(event => {
//         if (event.type === "point" && event.set === matchState.currentSet) {
//             if (event.player === "green") {
//                 greenScore++
//             }
//             else if (event.player === "orange") {
//                 orangeScore++
//             }
//         }
//     })

//     return [greenScore, orangeScore]
// }

// // Undo
// function undo() {
//     if (events.length === 0 ||
//         matchState.status !== EVENT_TYPES.ongoing
//     ) {
//         return
//     }
//     const lastEvent = events.pop()
//     redoStack.push(lastEvent)
//     updateScoreServe()
// }

// // Redo
// function redo() {
//     if (redoStack.length === 0 ||
//         matchState.status !== EVENT_TYPES.ongoing
//     ) {
//         return
//     }

//     const lastUndo = redoStack.pop()
//     events.push(lastUndo)
//     updateScoreServe()
// }

// // Toggle between pause and resume
// function togglePauseMatch() {
//     // Disable if set is finished or interval is going on
//     if (matchState.status === EVENT_TYPES.setFinished ||
//         matchState.status === EVENT_TYPES.interval
//     ) {
//         return
//     }

//     // If match is paused at the time of clicking, unpause
//     if (matchState.status === EVENT_TYPES.pause) {
//         matchState.status = EVENT_TYPES.ongoing
//     } else {
//         matchState.status = EVENT_TYPES.pause
//     }

//     togglePauseIcon(pauseBtn, pauseIcon, matchState.status)
// }

// function togglePauseSetBreak() {
//     if (matchState.status !== EVENT_TYPES.setFinished) {
//         return
//     }

//     let status
//     if (matchState.setBreakPaused) {
//         matchState.setBreakPaused = false
//         status = "resume"
//     } else {
//         matchState.setBreakPaused = true
//         status = "paused"
//     }

//     togglePauseIcon(setTimePauseBtn, setTimePauseIcon, status)
// }

// // When a set ends
// function endSet(greenScore, orangeScore) {
//     // Checking which team won
//     let teamId
//     if (greenScore > orangeScore) {
//         teamId = "green"
//     } else {
//         teamId = "orange"
//     }

//     // Change match status to set-won
//     matchState.status = EVENT_TYPES.setFinished
//     const numSet = matchState.currentSet

//     // Make btns look disabled
//     disableMatchBtns()

//     let winnerColorClass
//     // Update greenSets and orangeSets
//     if (teamId === "green") {
//         matchState.greenSets++
//         winnerColorClass = "green-set-winner"
//     } else if (teamId === "orange") {
//         matchState.orangeSets++
//         winnerColorClass = "orange-set-winner"
//     }

//     // Change score bg color of set winner
//     const winnerSetScore = document.getElementById(`set-${numSet}-${teamId}-score`)
//     winnerSetScore.classList.add(winnerColorClass)

//     // Update result
//     const result = {
//         set: numSet,
//         greenScore: greenScore,
//         orangeScore: orangeScore,
//         winner: teamId,
//         duration: setTime
//     }
//     results.push(result)

//     // If some player has won the game
//     if (matchState.greenSets === setsToWin ||
//         matchState.orangeSets === setsToWin
//     ) {
//         endMatch()
//         // If only set is won
//     } else {
//         showSetMessage()
//     }
// }


// // Change match status to ongoing and hide pregame controls
// function startGame() {
//     matchState.status = EVENT_TYPES.ongoing
//     document.querySelector(".pre-game-controls").style.display = "none"
// }

// // Store match data when game finishes
// function endMatch() {
//     matchState.status = EVENT_TYPES.gameUp
//     gameEndMessage()

//     // Check match winning team
//     let matchSummary
//     if (matchState.greenSets === setsToWin) {
//         matchSummary = {
//             winner: "green"
//         }
//     } else {
//         matchSummary = {
//             winner: "orange"
//         }
//     }
//     matchSummary.totalDuration = totalDuration
//     results.push(matchSummary)

//     // Store results
//     sessionStorage.setItem(
//         "results",
//         JSON.stringify(results)
//     )
//     // Events
//     sessionStorage.setItem(
//         "events",
//         JSON.stringify(events)
//     )
// }

