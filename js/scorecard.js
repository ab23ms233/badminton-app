const results = JSON.parse(sessionStorage.getItem("results"))
const events = JSON.parse(sessionStorage.getItem("events"))
const playerNames = JSON.parse(sessionStorage.getItem("playerNames"))
const matchConfig = JSON.parse(sessionStorage.getItem("matchConfig"))

const winnerTeam = results.at(-1).winner
const winnerPlayer = playerNames[winnerTeam]
const teams = ["green", "orange"]

// console.log(winnerTeam)
// console.log(playerNames)
// console.log(matchConfig)

// Set player names
function setPlayerNames() {
    for (let team of teams) {
        const playerName = document.getElementById(`${team}-player-name`)
        playerName.textContent = playerNames[team]
        console.log(playerNames[team])
    }
}

// Set team names
function setTeamNames() {
    for (let team of teams) {
        const teamName = document.getElementById(`${team}-team-name`)
        teamName.textContent = matchConfig[team]
    }
}

// Create results
function createSetScores() {
    const teams = ["green", "orange"]
    const numSets = results.length - 1
    const resultsCont = document.querySelector(".results-cont")

    let setWinnerTeam
    for (let i = 0; i < numSets; i++) {
        const setScoresDiv = document.createElement("div");
        setScoresDiv.classList.add("set-scores")
        setScoresDiv.id = `set-${i + 1}-score`

        setWinnerTeam = results[i].winner
        setScoresDiv.classList.add(`${setWinnerTeam}-bg`)

        for (let team of teams) {
            const setScoreDiv = document.createElement("div")
            setScoreDiv.classList.add("set-score", `${team}-set-score`)

            if (team === setWinnerTeam) {
                setScoreDiv.classList.add(`${setWinnerTeam}-player`)
            }
            setScoreDiv.id = `${team}-set-${i + 1}-score`

            let score
            if (team === "green") {
                score = results[i].greenScore
            } else {
                score = results[i].orangeScore
            }
            setScoreDiv.textContent = score

            setScoresDiv.appendChild(setScoreDiv)
        }

        const dashDiv = document.createElement("div")
        dashDiv.classList.add("dash")
        dashDiv.textContent = "-"

        const lastSetScore = setScoresDiv.lastElementChild
        setScoresDiv.insertBefore(dashDiv, lastSetScore)

        resultsCont.appendChild(setScoresDiv)
    }
}

// Set winner name and team
function setWinnerSection() {
    const winnerSection = document.querySelector(".winner-section")
    winnerSection.classList.add(`${winnerTeam}-bg`, `thick-${winnerTeam}-border`)

    const winnerPlayerSpan = document.getElementById("winner-player-name")
    winnerPlayerSpan.textContent = winnerPlayer

    const winnerTeamSpan = document.getElementById("winner-team-name")
    winnerTeamSpan.textContent = `(${matchConfig[winnerTeam]})`
    winnerTeamSpan.classList.add(`${winnerTeam}-player`)
}

setPlayerNames()
setTeamNames()
createSetScores()
setWinnerSection()