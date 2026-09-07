// Select tournament page

const tournamentList = document.getElementById("tournament-list")
const createTournamentBtn = document.getElementById("create-tournament-btn")

const fallbackTournaments = [
    {
        id: "iism-2026",
        name: "IISM 2026",
        startDate: "2026-10-12",
        matches: 18
    },
    {
        id: "inter-batch-2026",
        name: "Inter-Batch 2026",
        startDate: "2026-10-15",
        matches: 24
    },
    {
        id: "club-championship",
        name: "Club Championship",
        startDate: "2026-09-05",
        matches: 12
    },
    {
        id: "weekend-league",
        name: "Weekend League",
        startDate: "2026-09-28",
        matches: 8
    }
]

function formatStartDate(dateValue) {
    const [year, month, day] = dateValue.split("-").map(Number)
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(year, month - 1, day))
}

function createTournamentCard(tournament) {
    const card = document.createElement("button")
    card.className = "tournament-card"
    card.type = "button"
    card.dataset.tournamentId = tournament.id

    const header = document.createElement("div")
    header.className = "tournament-card-header"

    const name = document.createElement("span")
    name.className = "tournament-name"
    name.textContent = tournament.name

    const icon = document.createElement("span")
    icon.className = "tournament-icon"
    icon.textContent = "♙"

    header.append(name, icon)

    const footer = document.createElement("div")
    footer.className = "tournament-card-footer"

    const startDate = document.createElement("span")
    startDate.textContent = `Starts ${formatStartDate(tournament.startDate)}`

    const metadata = document.createElement("strong")
    const teamCount = tournament.teams?.length ?? 0
    const matchCount = tournament.matches ?? 0
    metadata.textContent = `${teamCount} teams | ${matchCount} matches`

    footer.append(startDate, metadata)
    card.append(header, footer)

    card.addEventListener("click", () => {
        sessionStorage.setItem(
            "selectedTournament",
            JSON.stringify({
                id: tournament.id,
                name: tournament.name
            })
        )

        window.location.href = "team-overview.html"
    })

    return card
}

function renderTournamentCards() {
    const storedTournaments = JSON.parse(
        localStorage.getItem("tournaments") || "[]"
    )

    const tournaments = storedTournaments.length
        ? [...storedTournaments].reverse()
        : fallbackTournaments

    tournamentList.replaceChildren(
        ...tournaments.map(createTournamentCard)
    )
}

const backBtn = document.querySelector(".back-btn")
backBtn.addEventListener("click", () => {
    window.location.href = "home.html"
})

createTournamentBtn.addEventListener("click", () => {
    window.location.href = "create-tournament.html"
})

renderTournamentCards()