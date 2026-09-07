const ADD_TEAM_VALUE = "__add-team__"

const selectedTournament = JSON.parse(
    sessionStorage.getItem("selectedTournament") || "null"
)

const tournaments = JSON.parse(
    localStorage.getItem("tournaments") || "[]"
)

const tournament = tournaments.find(item => item.id === selectedTournament?.id)
const teams = tournament?.teams || []
const teamOverviewForm = document.getElementById("team-overview-section")
const overviewError = document.getElementById("team-overview-error")

function createTeamDropDown(teamId) {
    const wrapper = document.createElement("div")
    const select = document.createElement("select")
    select.id = `team-${teamId}-select`
    select.classList.add(
        `team-${teamId}-select`,
        `thin-${teamId}-border`,
        "dropdown",
        "team-select-dropdown"
    )

    const placeholder = document.createElement("option")
    placeholder.value = ""
    placeholder.textContent = "Choose a team"
    placeholder.disabled = true
    placeholder.selected = true
    placeholder.hidden = true
    select.appendChild(placeholder)
    select.required = true

    populateTeamOptions(select)

    select.addEventListener("change", () => {
        if (select.value === ADD_TEAM_VALUE) {
            select.value = ""
            showAddTeamForm(teamId, wrapper)
            return
        }

        refreshTeamDropdowns()
    })

    wrapper.appendChild(select)
    return wrapper
}

function populateTeamOptions(select, excludedTeamName = "") {
    const selectedTeamName = select.value
    const placeholder = document.createElement("option")
    placeholder.value = ""
    placeholder.textContent = "Choose a team"
    placeholder.disabled = true
    placeholder.hidden = true

    select.replaceChildren(placeholder)

    teams.forEach(team => {
        if (team.name === excludedTeamName) {
            return
        }

        const option = document.createElement("option")
        option.value = team.name
        option.textContent = team.name
        select.appendChild(option)
    })

    const addTeamOption = document.createElement("option")
    addTeamOption.value = ADD_TEAM_VALUE
    addTeamOption.textContent = "+ Add a Team"
    select.appendChild(addTeamOption)

    if (selectedTeamName && selectedTeamName !== excludedTeamName) {
        select.value = selectedTeamName
    } else {
        select.value = ""
        placeholder.selected = true
    }
}

function refreshTeamDropdowns() {
    const teamGreen = document.getElementById("team-green-select")
    const teamOrange = document.getElementById("team-orange-select")

    populateTeamOptions(teamGreen, teamOrange.value)
    populateTeamOptions(teamOrange, teamGreen.value)
}

function showAddTeamForm(teamId, wrapper) {
    wrapper.querySelector(".team-add-form")?.remove()

    const addTeamForm = document.createElement("div")
    addTeamForm.className = "add-item-form team-add-form"

    const input = document.createElement("input")
    input.className = "add-item-input"
    input.type = "text"
    input.placeholder = "Enter team name"
    input.autocomplete = "off"
    input.maxLength = 60

    const addButton = document.createElement("button")
    addButton.className = "add-item-submit"
    addButton.type = "button"
    addButton.textContent = "Add Team"

    const cancelButton = document.createElement("button")
    cancelButton.className = "secondary-action-btn overview-cancel"
    cancelButton.type = "button"
    cancelButton.textContent = "Cancel"

    const actions = document.createElement("div")
    actions.className = "team-add-actions"
    actions.append(addButton, cancelButton)

    const errorMessage = document.createElement("small")
    errorMessage.className = "team-add-error"
    errorMessage.hidden = true

    addButton.addEventListener("click", () => {
        const teamName = input.value.trim()
        const normalizedName = teamName.toLowerCase()

        if (!teamName) {
            errorMessage.textContent = "Please enter a team name."
            errorMessage.hidden = false
            input.focus()
            return
        }

        if (teams.some(team => team.name.toLowerCase() === normalizedName)) {
            errorMessage.textContent = "A team with this name already exists."
            errorMessage.hidden = false
            input.focus()
            return
        }

        const newTeam = {
            id: crypto.randomUUID(),
            name: teamName,
            players: []
        }

        teams.push(newTeam)
        saveTournamentTeams()
        const select = wrapper.querySelector("select")
        const addTeamOption = select.querySelector(`option[value="${ADD_TEAM_VALUE}"]`)
        const teamOption = document.createElement("option")
        teamOption.value = teamName
        teamOption.textContent = teamName
        select.insertBefore(teamOption, addTeamOption)
        select.value = teamName
        refreshTeamDropdowns()
        addTeamForm.remove()
    })

    cancelButton.addEventListener("click", () => addTeamForm.remove())
    input.addEventListener("input", () => {
        errorMessage.hidden = true
    })

    addTeamForm.append(input, errorMessage, actions)
    wrapper.appendChild(addTeamForm)
    input.focus()
}

function saveTournamentTeams() {
    if (!tournament) {
        return
    }

    const tournamentIndex = tournaments.findIndex(item => item.id === tournament.id)
    tournaments[tournamentIndex].teams = teams
    tournaments[tournamentIndex].updatedAt = new Date().toISOString()
    localStorage.setItem("tournaments", JSON.stringify(tournaments))
}

function showOverviewError(message) {
    overviewError.textContent = message
    overviewError.hidden = false
}

teamOverviewForm.addEventListener("submit", event => {
    event.preventDefault()
    overviewError.hidden = true

    const teamGreen = document.getElementById("team-green-select")
    const teamOrange = document.getElementById("team-orange-select")
    const numberOfMatches = Number(document.getElementById("number-of-matches").value)

    if (!teamGreen.value || !teamOrange.value) {
        showOverviewError("Please select both teams.")
        return
    }

    if (teamGreen.value === teamOrange.value) {
        showOverviewError("Please select two different teams.")
        return
    }

    if (!Number.isInteger(numberOfMatches) || numberOfMatches < 1) {
        showOverviewError("Enter a whole number of matches greater than zero.")
        return
    }

    sessionStorage.setItem(
        "teamOverviewConfig",
        JSON.stringify({
            green: teamGreen.value,
            orange: teamOrange.value,
            numberOfMatches
        })
    )

    window.location.href = "match-options.html"
})

document.getElementById("team-green-option").appendChild(createTeamDropDown("green"))
document.getElementById("team-orange-option").appendChild(createTeamDropDown("orange"))
