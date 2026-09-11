import { 
    teams,
    createAddForm,
    addPlayer
} from "./team-form.js"

const teamsList = document.getElementById("teams-list")
export let selectedTournamentType = "Team based"

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
    text.textContent = "Add a player"

    button.append(icon, text)

    button.addEventListener("click", () => {
        const container = button.parentElement

        container.replaceChildren(
            createAddForm(
                "player",
                name => {
                    players.push({
                        id: crypto.randomUUID(),
                        name
                    })

                    renderTeams()
                },
                "Enter player name",
                () => container.replaceChildren(createAddPlayerButton(team))
            )
        )

        addPlayer(name, )
        container.querySelector("input").focus()
    })

    return button
}

export function renderTeams() {
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

const tournamentTypeCards = document.querySelectorAll(".tournament-type-card")

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