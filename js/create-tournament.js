const backButton = document.getElementById("back-btn")
const tournamentForm = document.getElementById("tournament-form")
const tournamentNameInput = document.getElementById("tournament-name")

const startDateButton = document.getElementById("start-date")
const dateValue = document.getElementById("date-value")
const calendarPicker = document.getElementById("calendar-picker")
const calendarMonth = document.getElementById("calendar-month")
const calendarDays = document.getElementById("calendar-days")
const previousMonthButton = document.getElementById("previous-month")
const nextMonthButton = document.getElementById("next-month")
const tournamentTypeCards = document.querySelectorAll(".tournament-type-card")

const teamsList = document.getElementById("teams-list")
const addTeamContainer = document.getElementById("add-team-container")
const addTeamButton = document.getElementById("add-team-btn")

const today = new Date()

let selectedDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
)

let calendarMonthDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
)

const teams = []
let selectedTournamentType = "Team based"

function pad(value) {
    return String(value).padStart(2, "0")
}

function toISODate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDisplayDate(date) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date)
}

function updateDateField() {
    dateValue.textContent = formatDisplayDate(selectedDate)
}

function renderCalendar() {
    const year = calendarMonthDate.getFullYear()
    const month = calendarMonthDate.getMonth()

    calendarMonth.textContent = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric"
    }).format(calendarMonthDate)

    calendarDays.replaceChildren()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPreviousMonth = new Date(year, month, 0).getDate()

    for (let i = firstDay - 1; i >= 0; i--) {
        const dayNumber = daysInPreviousMonth - i
        const date = new Date(year, month - 1, dayNumber)
        calendarDays.appendChild(createCalendarDay(date, true))
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        calendarDays.appendChild(createCalendarDay(date, false))
    }

    const cellsUsed = firstDay + daysInMonth
    const remainingCells = (7 - (cellsUsed % 7)) % 7

    for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day)
        calendarDays.appendChild(createCalendarDay(date, true))
    }
}

function createCalendarDay(date, isOtherMonth) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "calendar-day"
    button.textContent = date.getDate()

    if (isOtherMonth) {
        button.classList.add("other-month")
    }

    if (toISODate(date) === toISODate(today)) {
        button.classList.add("today")
    }

    if (toISODate(date) === toISODate(selectedDate)) {
        button.classList.add("selected")
    }

    button.addEventListener("click", () => {
        selectedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        )

        updateDateField()
        closeCalendar()
    })

    return button
}

function openCalendar() {
    calendarMonthDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
    )

    renderCalendar()
    calendarPicker.hidden = false
    startDateButton.setAttribute("aria-expanded", "true")
}

function closeCalendar() {
    calendarPicker.hidden = true
    startDateButton.setAttribute("aria-expanded", "false")
}

function toggleCalendar() {
    if (calendarPicker.hidden) {
        openCalendar()
    } else {
        closeCalendar()
    }
}

function createAddForm(type, onSubmit, placeholder, onCancel) {
    const form = document.createElement("form")
    const hasActions = type === "team" || onCancel
    form.className = `add-item-form${hasActions ? " add-item-form-with-actions" : ""}`

    const input = document.createElement("input")
    input.className = "add-item-input"
    input.type = "text"
    input.placeholder = placeholder
    input.autocomplete = "off"
    input.maxLength = 60

    const field = document.createElement("div")
    field.className = "add-item-field"

    const errorMessage = document.createElement("small")
    errorMessage.className = "add-item-error"
    errorMessage.hidden = true

    const submitButton = document.createElement("button")
    submitButton.className = "add-item-submit"
    submitButton.type = "submit"
    submitButton.textContent = type === "team" ? "Add Team" : "Add Player"

    field.append(input, errorMessage)

    if (hasActions) {
        const actions = document.createElement("div")
        actions.className = "add-item-actions"

        const cancelButton = document.createElement("button")
        cancelButton.className = "secondary-action-btn add-item-cancel"
        cancelButton.type = "button"
        cancelButton.textContent = "Cancel"
        cancelButton.addEventListener("click", () => {
            if (type === "team") {
                resetAddTeamButton()
            } else {
                onCancel()
            }
        })

        actions.append(submitButton, cancelButton)
        form.append(field, actions)
    } else {
        form.append(field, submitButton)
    }

    form.addEventListener("submit", event => {
        event.preventDefault()

        const name = input.value.trim()

        if (!name) {
            input.focus()
            input.classList.add("input-error")
            errorMessage.textContent = "Please enter a name."
            errorMessage.hidden = false
            return
        }

        const normalizedName = name.toLowerCase()
        const duplicateTeam =
            type === "team" &&
            teams.some(team => team.name.toLowerCase() === normalizedName)
        const duplicatePlayer =
            type === "player" &&
            teams.some(team =>
                team.players.some(player =>
                    player.name.toLowerCase() === normalizedName
                )
            )

        if (duplicateTeam || duplicatePlayer) {
            input.focus()
            input.classList.add("input-error")
            errorMessage.textContent =
                type === "team"
                    ? "A team with this name already exists."
                    : "This player is already in a team."
            errorMessage.hidden = false
            return
        }

        input.classList.remove("input-error")
        errorMessage.hidden = true
        onSubmit(name)
    })

    input.addEventListener("input", () => {
        input.classList.remove("input-error")
        errorMessage.hidden = true

        submitButton.textContent =
            type === "team" ? "Add Team" : "Add Player"
    })

    return form
}

function createAddTeamForm() {
    addTeamContainer.replaceChildren(
        createAddForm(
            "team",
            name => addTeam(name),
            "Enter team name"
        )
    )

    addTeamContainer.querySelector("input").focus()
}

function resetAddTeamButton() {
    const button = document.createElement("button")
    button.className = "add-item-btn"
    button.id = "add-team-btn"
    button.type = "button"

    const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    )
    icon.setAttribute("viewBox", "0 0 24 24")
    icon.setAttribute("aria-hidden", "true")

    const vertical = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    )
    vertical.setAttribute("d", "M12 5v14")

    const horizontal = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    )
    horizontal.setAttribute("d", "M5 12h14")

    icon.append(vertical, horizontal)

    const text = document.createElement("span")
    text.textContent = "Add a team"

    button.append(icon, text)
    button.addEventListener("click", createAddTeamForm)

    addTeamContainer.replaceChildren(button)
}

function addTeam(name) {
    const team = {
        id: crypto.randomUUID(),
        name,
        players: []
    }

    teams.push(team)
    renderTeams()
    resetAddTeamButton()
}

function createPlayerIcon() {
    const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    )

    icon.setAttribute("viewBox", "0 0 24 24")
    icon.setAttribute("aria-hidden", "true")

    const head = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    )
    head.setAttribute("cx", "12")
    head.setAttribute("cy", "8")
    head.setAttribute("r", "3")

    const body = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    )
    body.setAttribute("d", "M5 21a7 7 0 0 1 14 0")

    icon.append(head, body)

    return icon
}

function createAddPlayerButton(team) {
    const button = document.createElement("button")
    button.className = "add-item-btn"
    button.type = "button"

    const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    )
    icon.setAttribute("viewBox", "0 0 24 24")
    icon.setAttribute("aria-hidden", "true")

    const vertical = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    )
    vertical.setAttribute("d", "M12 5v14")

    const horizontal = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    )
    horizontal.setAttribute("d", "M5 12h14")

    icon.append(vertical, horizontal)

    const text = document.createElement("span")
    text.textContent = "Add a player"

    button.append(icon, text)

    button.addEventListener("click", () => {
        const container = button.parentElement

        container.replaceChildren(
            createAddForm(
                "player",
                name => {
                    team.players.push({
                        id: crypto.randomUUID(),
                        name
                    })

                    renderTeams()
                },
                "Enter player name",
                () => container.replaceChildren(createAddPlayerButton(team))
            )
        )

        container.querySelector("input").focus()
    })

    return button
}

function renderTeams() {
    teamsList.replaceChildren()

    teams.forEach(team => {
        const card = document.createElement("article")
        card.className = "team-card"

        const header = document.createElement("div")
        header.className = "team-header"

        const teamName = document.createElement("span")
        teamName.className = "team-name"
        teamName.textContent = team.name

        header.appendChild(teamName)

        const playersList = document.createElement("div")
        playersList.className = "players-list"

        team.players.forEach(player => {
            const playerRow = document.createElement("div")
            playerRow.className = "player-row"

            playerRow.append(
                createPlayerIcon(),
                document.createTextNode(player.name)
            )

            playersList.appendChild(playerRow)
        })

        const addPlayerContainer = document.createElement("div")
        addPlayerContainer.className = "add-item-container"
        addPlayerContainer.appendChild(createAddPlayerButton(team))

        card.append(header, playersList, addPlayerContainer)
        teamsList.appendChild(card)
    })
}

addTeamButton.addEventListener("click", createAddTeamForm)

startDateButton.addEventListener("click", toggleCalendar)

previousMonthButton.addEventListener("click", () => {
    calendarMonthDate.setMonth(calendarMonthDate.getMonth() - 1)
    renderCalendar()
})

nextMonthButton.addEventListener("click", () => {
    calendarMonthDate.setMonth(calendarMonthDate.getMonth() + 1)
    renderCalendar()
})

tournamentTypeCards.forEach(card => {
    card.addEventListener("click", () => {
        tournamentTypeCards.forEach(typeCard => {
            const isSelected = typeCard === card
            typeCard.classList.toggle("selected", isSelected)
            typeCard.setAttribute("aria-pressed", String(isSelected))
        })

        selectedTournamentType = card.dataset.type
    })
})

document.addEventListener("click", event => {
    if (
        !calendarPicker.hidden &&
        !calendarPicker.contains(event.target) &&
        !startDateButton.contains(event.target)
    ) {
        closeCalendar()
    }
})

backButton.addEventListener("click", () => {
    window.location.href = "select-tournament.html"
})

tournamentForm.addEventListener("submit", event => {
    event.preventDefault()

    const name = tournamentNameInput.value.trim()

    if (!name) {
        tournamentNameInput.classList.add("input-error")
        tournamentNameInput.focus()
        return
    }

    tournamentNameInput.classList.remove("input-error")

    const now = new Date().toISOString()

    const tournament = {
        id: crypto.randomUUID(),
        name,
        startDate: toISODate(selectedDate),
        type: selectedTournamentType,
        status: "active",
        teams: teams.map(team => ({
            id: team.id,
            name: team.name,
            players: team.players.map(player => ({
                id: player.id,
                name: player.name
            }))
        })),
        createdAt: now,
        updatedAt: now
    }

    const storedTournaments = JSON.parse(
        localStorage.getItem("tournaments") || "[]"
    )

    storedTournaments.push(tournament)

    localStorage.setItem(
        "tournaments",
        JSON.stringify(storedTournaments)
    )

    sessionStorage.setItem(
        "selectedTournament",
        JSON.stringify({
            id: tournament.id,
            name: tournament.name
        })
    )

    window.location.href = "select-tournament.html"
})

tournamentNameInput.addEventListener("input", () => {
    tournamentNameInput.classList.remove("input-error")
})

updateDateField()
renderCalendar()