const teamIds = ["green", "orange"]
const ADD_PLAYER_VALUE = "__add-player__"

// Fetch the selected teams and match configuration from browser storage
const teamOverviewConfig = JSON.parse(
    sessionStorage.getItem("teamOverviewConfig") || "null"
)
const matchConfig = JSON.parse(
    sessionStorage.getItem("matchConfig") || "null"
)
const selectedTournament = JSON.parse(
    sessionStorage.getItem("selectedTournament") || "null"
)
const tournaments = JSON.parse(
    localStorage.getItem("tournaments") || "[]"
)
const tournament = tournaments.find(item => item.id === selectedTournament?.id)
const type = matchConfig?.type?.toLowerCase() || "singles"

// Extract team names from Team Overview
const greenTeam = teamOverviewConfig?.green || matchConfig?.green || ""
const orangeTeam = teamOverviewConfig?.orange || matchConfig?.orange || ""

function getTeamPlayers(teamName) {
    const team = tournament?.teams?.find(item => item.name === teamName)
    return team?.players || []
}

function getTeam(teamName) {
    return tournament?.teams?.find(item => item.name === teamName)
}

// Generate player selection interface based on match type
if (type === "singles") {
    playerInfoForTeams("singles")
}
else if (type === "doubles") {
    playerInfoForTeams("doubles")
}

// Event listener for start match button
const startMatchBtn = document.getElementById("start-match-btn")
startMatchBtn.addEventListener("click", recordPlayerNames)

// Creates a dropdown menu for selecting a player from the team
function createPlayerDropDown(teamId, num) {
    // Determine which team name to use
    let teamName
    if (teamId === "green") {
        teamName = greenTeam
    } else {
        teamName = orangeTeam
    }

    // Create wrapper container for the dropdown
    const wrapper = document.createElement("div")
    wrapper.classList.add("select-wrapper")

    // Create select element with appropriate classes and unique id
    const select = document.createElement("select")
    select.classList.add(`team-${teamId}-select`, `thin-${teamId}-border`, "dropdown", "player-drop-down")
    select.id = `team-${teamId}-player-dropdown-${num}`

    // Create placeholder option
    const placeholder = document.createElement("option")
    placeholder.value = ""
    placeholder.disabled = true
    placeholder.textContent = "Select a player..."
    placeholder.hidden = true
    placeholder.selected = true

    select.appendChild(placeholder)

    // Populate dropdown with available players from the team
    const playerList = getTeamPlayers(teamName)
    playerList.forEach(player => {
        const option = document.createElement("option")
        const playerName = typeof player === "string" ? player : player.name
        option.value = playerName
        option.textContent = playerName

        select.appendChild(option)
    });

    const addPlayerOption = document.createElement("option")
    addPlayerOption.value = ADD_PLAYER_VALUE
    addPlayerOption.textContent = "+ Add a Player"
    select.appendChild(addPlayerOption)

    select.addEventListener("change", () => {
        if (select.value === ADD_PLAYER_VALUE) {
            select.value = ""
            showAddPlayerForm(teamName, wrapper, select)
        }
    })

    wrapper.appendChild(select)
    return wrapper
}

function showAddPlayerForm(teamName, wrapper, select) {
    wrapper.querySelector(".player-add-form")?.remove()

    const addPlayerForm = document.createElement("div")
    addPlayerForm.className = "player-add-form"

    const input = document.createElement("input")
    input.className = "player-add-input"
    input.type = "text"
    input.placeholder = "Enter player name"
    input.autocomplete = "off"
    input.maxLength = 60

    const errorMessage = document.createElement("small")
    errorMessage.className = "player-add-error"
    errorMessage.hidden = true

    const actions = document.createElement("div")
    actions.className = "player-add-actions"

    const addButton = document.createElement("button")
    addButton.className = "primary-action-btn player-add-submit"
    addButton.type = "button"
    addButton.textContent = "Add Player"

    const cancelButton = document.createElement("button")
    cancelButton.className = "secondary-action-btn player-add-cancel"
    cancelButton.type = "button"
    cancelButton.textContent = "Cancel"

    addButton.addEventListener("click", () => {
        const playerName = input.value.trim()
        const normalizedName = playerName.toLowerCase()
        const team = getTeam(teamName)

        if (!playerName) {
            errorMessage.textContent = "Please enter a player name."
            errorMessage.hidden = false
            input.focus()
            return
        }

        if (team?.players.some(player => {
            const existingName = typeof player === "string" ? player : player.name
            return existingName.toLowerCase() === normalizedName
        })) {
            errorMessage.textContent = "A player with this name already exists."
            errorMessage.hidden = false
            input.focus()
            return
        }

        if (!team) {
            errorMessage.textContent = "The selected team could not be found."
            errorMessage.hidden = false
            return
        }

        const newPlayer = {
            id: crypto.randomUUID(),
            name: playerName
        }

        team.players.push(newPlayer)
        saveTournamentPlayers()

        const addPlayerOption = select.querySelector(`option[value="${ADD_PLAYER_VALUE}"]`)
        const playerOption = document.createElement("option")
        playerOption.value = playerName
        playerOption.textContent = playerName
        select.insertBefore(playerOption, addPlayerOption)
        select.value = playerName
        addPlayerForm.remove()
    })

    cancelButton.addEventListener("click", () => addPlayerForm.remove())
    input.addEventListener("input", () => {
        errorMessage.hidden = true
    })

    actions.append(addButton, cancelButton)
    addPlayerForm.append(input, errorMessage, actions)
    wrapper.appendChild(addPlayerForm)
    input.focus()
}

function saveTournamentPlayers() {
    if (!tournament) {
        return
    }

    const tournamentIndex = tournaments.findIndex(item => item.id === tournament.id)
    tournaments[tournamentIndex].teams = tournament.teams
    tournaments[tournamentIndex].updatedAt = new Date().toISOString()
    localStorage.setItem("tournaments", JSON.stringify(tournaments))
}


// Generates player selection interface based on match type (singles or doubles)
function playerInfoForTeams(type) {
    // Fetch player form sections for both teams
    const greenPlayerForm = document.getElementById("team-green-player-form")
    const orangePlayerForm = document.getElementById("team-orange-player-form")

    // Update team headers with team names
    const greenHeader = document.getElementById("team-green-header")
    greenHeader.textContent = greenTeam

    const orangeHeader = document.getElementById("team-orange-header")
    orangeHeader.textContent = orangeTeam

    // Create player selection UI based on match type
    if (type === "singles") {
        // For singles: one player per team
        const greenPlayer = playerInfo(type, 1, "green")
        greenPlayerForm.appendChild(greenPlayer)
        greenPlayerForm.classList.add("option")

        const orangePlayer = playerInfo(type, 1, "orange")
        orangePlayerForm.appendChild(orangePlayer)
        orangePlayerForm.classList.add("option")
    }
    else if (type === "doubles") {
        // For doubles: two players per team
        const greenPlayer1 = playerInfo(type, 1, "green")
        const greenPlayer2 = playerInfo(type, 2, "green")

        greenPlayer1.classList.add("option")
        greenPlayer2.classList.add("option")

        greenPlayerForm.appendChild(greenPlayer1)
        greenPlayerForm.appendChild(greenPlayer2)

        const orangePlayer1 = playerInfo(type, 1, "orange")
        const orangePlayer2 = playerInfo(type, 2, "orange")

        orangePlayer1.classList.add("option")
        orangePlayer2.classList.add("option")

        orangePlayerForm.appendChild(orangePlayer1)
        orangePlayerForm.appendChild(orangePlayer2)
    }
}

// Creates a single player selection option with label and dropdown
function playerInfo(type, num, teamId) {
    // Create container for player option
    const playerInfoOption = document.createElement("div")
    playerInfoOption.classList.add("option")

    // Create header label for player
    const playerInfoHeader = document.createElement("div")
    playerInfoHeader.classList.add("header")

    // Create player dropdown
    const dropDown = createPlayerDropDown(teamId, num)

    // Add player number label for doubles matches only
    if (type === "doubles") {
        playerInfoHeader.textContent = `Player ${num}`
        playerInfoOption.appendChild(playerInfoHeader)
    }

    playerInfoOption.appendChild(dropDown)
    return playerInfoOption
}

// Collects selected player names and validates before proceeding to scorer
function recordPlayerNames() {
    let players = []

    if (type === "singles") {
        for (let teamId of teamIds) {
            const player = document.getElementById(`team-${teamId}-player-dropdown-1`)

            if (!player.value) {
                alert("Please select player names for all players.")
                return
            }

            players.push(player.value.trim())
        }
    } else if (type === "doubles") {
        for (let teamId of teamIds) {
            for (let i = 0; i < 2; i++) {
                const player = document.getElementById(`team-${teamId}-player-dropdown-${i + 1}`)

                if (!player.value) {
                    alert("Please select player names for all players.")
                    return
                }

                players.push(player.value.trim())
            }
        }
    }

    // Create player names object
    let playerNames
    if (type === "singles") {
        playerNames = {
            green: players[0],
            orange: players[1]
        }
    } else if (type === "doubles") {
        playerNames = {
            green: [players[0], players[1]],
            orange: [players[2], players[3]]
        }
    }

    // Save player names to browser session storage
    sessionStorage.setItem(
        "playerNames",
        JSON.stringify(playerNames)
    )

    // Navigate to scorer page
    window.location.href = "scorer.html"
}