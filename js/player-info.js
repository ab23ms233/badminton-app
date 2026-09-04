// Database of available players for each team
const teams = {
    "22MS": ["Shashank", "Aviyank"],
    "23MS": ["Arya", "Giri"],
    "24MS": ["Sanjib", "Suchir"]
}
const teamIds = ["green", "orange"]

// Fetch match configurations from session storage
const matchConfig = JSON.parse(sessionStorage.getItem("matchConfig"))
const type = matchConfig.type.toLowerCase()

// Extract team names from match configuration
const greenTeam = matchConfig.green
const orangeTeam = matchConfig.orange

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
    const playerList = teams[teamName]
    playerList.forEach(player => {
        const option = document.createElement("option")
        option.value = player
        option.textContent = player

        select.appendChild(option)
    });

    wrapper.appendChild(select)
    return wrapper
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