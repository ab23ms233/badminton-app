const teams = {
    "22MS": ["Shashank", "Aviyank"],
    "23MS": ["Arya", "Giri"],
    "24MS": ["Sanjib", "Suchir"]
}

const matchConfig = JSON.parse(sessionStorage.getItem("matchConfig"))
const type = matchConfig.type.toLowerCase()
// console.log(type)

const greenTeam = matchConfig.greenTeam
const orangeTeam = matchConfig.orangeTeam

// console.log(greenTeam)
// console.log(orangeTeam)

if (type === "singles") {
    playerInfoForTeams("singles")
}
else if (type === "doubles") {
    playerInfoForTeams("doubles")
}

const startMatchBtn = document.getElementById("start-match-btn")
startMatchBtn.addEventListener("click", recordPlayerNames)

function createPlayerDropDown(teamId, team, num) {
    const wrapper = document.createElement("div")
    wrapper.classList.add("select-wrapper")

    const select = document.createElement("select")
    select.classList.add(`${teamId}-select`, "dropdown", "player-drop-down")
    select.id = `${teamId}-player-dropdown-${num}`

    const placeholder = document.createElement("option")
    placeholder.value = ""
    placeholder.disabled = true
    placeholder.textContent = "Select a player..."
    placeholder.hidden = true
    placeholder.selected = true

    select.appendChild(placeholder)

    const playerList = teams[team]
    playerList.forEach(player => {
        const option = document.createElement("option")
        option.value = player
        option.textContent = player

        select.appendChild(option)
    });

    wrapper.appendChild(select)
    return wrapper
}

function playerInfoForTeams(type) {
    const greenPlayerForm = document.getElementById("team-green-player-form")
    const orangePlayerForm = document.getElementById("team-orange-player-form")

    const greenHeader = document.querySelector(".team-green-header")
    greenHeader.textContent = greenTeam

    const orangeHeader = document.querySelector(".team-orange-header")
    orangeHeader.textContent = orangeTeam

    if (type === "singles") {
        const greenPlayer = playerInfo(type, 1, "team-green", greenTeam)
        greenPlayerForm.appendChild(greenPlayer)
        greenPlayerForm.classList.add("option")

        const orangePlayer = playerInfo(type, 2, "team-orange", orangeTeam)
        orangePlayerForm.appendChild(orangePlayer)
        orangePlayerForm.classList.add("option")
    }
    else if (type === "doubles") {
        const greenPlayer1 = playerInfo(type, 1, "team-green", greenTeam)
        const greenPlayer2 = playerInfo(type, 2, "team-green", greenTeam)

        greenPlayer1.classList.add("option")
        greenPlayer2.classList.add("option")

        greenPlayerForm.appendChild(greenPlayer1)
        greenPlayerForm.appendChild(greenPlayer2)
        
        const orangePlayer1 = playerInfo(type, 1, "team-orange", orangeTeam)
        const orangePlayer2 = playerInfo(type, 2, "team-orange", orangeTeam)

        orangePlayer1.classList.add("option")
        orangePlayer2.classList.add("option")

        orangePlayerForm.appendChild(orangePlayer1)
        orangePlayerForm.appendChild(orangePlayer2)   
    }

}

function playerInfo(type, num, teamId, team) {
    const playerInfoOption = document.createElement("div")
    playerInfoOption.classList.add("option")

    const playerInfoHeader = document.createElement("div")
    playerInfoHeader.classList.add("header")

    const dropDown = createPlayerDropDown(teamId, team, num)

    if (type === "doubles") {
        playerInfoHeader.textContent = `Player ${num}`
        playerInfoOption.appendChild(playerInfoHeader)
    }

    playerInfoOption.appendChild(dropDown)
    return playerInfoOption
}

function recordPlayerNames() {
    let greenPlayer = document.getElementById("team-green-player-dropdown-1")
    let orangePlayer = document.getElementById("team-orange-player-dropdown-2")

    if (!greenPlayer.value || !orangePlayer.value) {
        alert("Please select player names for all players.")
        return
    }

    greenPlayer = greenPlayer.value.trim()
    orangePlayer = orangePlayer.value.trim()

    const playerNames = {
        greenTeam: greenPlayer,
        orangeTeam: orangePlayer
    }

    // Save in browser storage
    sessionStorage.setItem(
        "playerNames",
        JSON.stringify(playerNames)
    )

    window.location.href = "scorer.html"
}