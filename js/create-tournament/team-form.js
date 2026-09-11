import { renderTeams } from "./ui.js"

const addTeamContainer = document.getElementById("add-team-container")
export const teams = []
const players = []

export function createAddForm(type, onSubmit, placeholder, onCancel) {
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

export function createAddTeamForm() {
    addTeamContainer.replaceChildren(
        createAddForm(
            "team",
            name => addTeam(name),
            "Enter team name"
        )
    )

    addTeamContainer.querySelector("input").focus()
}

export function addTeam(name) {
    const team = {
        teamId: crypto.randomUUID(),
        name: name,
        players: []
    }

    teams.push(team)
    renderTeams()
    resetAddTeamButton()
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
    icon.classList.add("plus-icon")

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

export function addPlayer(player) {
    players.add(player)
}