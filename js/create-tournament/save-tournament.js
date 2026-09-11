import {
    tournamentNameInput,
    tournamentCategorySelect,
} from "./controls.js"

import { selectedTournamentType } from "./ui.js"
import { teams } from "./team-form.js"


export function onCreateTnt(event) {
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
        tournamentId: crypto.randomUUID(),
        name: name,
        startDate: toISODate(selectedDate),
        type: selectedTournamentType,
        category: tournamentCategorySelect.value,
        status: "ACTIVE",
        createdAt: now,
    }

    const request = indexedDB.open("badminton-scorer", 1)

    request.onsuccess = (event) => {
        console.log("Database opened successfully")

        const db = event.target.result
        saveTnt(db, tournament)
    }

    request.onerror = (event) => {
        console.error(`Failed to open DB: ${event.target.error}`)
    }
}

async function saveTnt(db, tournament) {
    // console.log("Database open request created")

    const transaction = db.transaction("tournaments", "readwrite")
    const tntStore = transaction.objectStore("tournaments")

    // console.log("Tournament store obtained")

    const getRequest = tntStore.getAll()

    getRequest.onsuccess = () => {
        console.log("Tournaments read successfully.")

        const addedTnts = getRequest.result
        const addedTntNames = addedTnts.map(tnt => tnt.name)

        if (!addedTntNames.includes(tournament.name)) {
            tntStore.add(tournament)
            console.log(`Added ${tournament.name} to DB.`)
        } else {
            console.log(`Tournament ${tournament.name} already exists.`)
        }
    }

    getRequest.onerror = (event) => {
        console.error(`Error reading tournaments: ${event.target.error}`)
    }

    transaction.oncomplete = () => {
        console.log("Transaction completed successfully.")
    }

    transaction.onerror = (event) => {
        console.error(`Error adding ${tournament.name}: ${event.target.error}`)
    }
}


function saveTeams(db, tournament, teams) {
    teams.forEach(team => {
        team.tournamentId = tournament.tournamentId
    })

    const transaction = db.transaction("tournamentTeams", "readwrite")
    const tntTeamStore = transaction.objectStore("tournamentTeams")

    const getRequest = tntTeamStore.getAll()

    getRequest.onsuccess = () => {
        console.log("Teams read successfully.")

        const addedTeams = getRequest.result
        const tntIds = addedTeams.map(team => team.tournamentId)
        const teamNames = addedTeams
    }

}