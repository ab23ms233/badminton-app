const request = indexedDB.open("badminton-scorer", 1)

request.onupgradeneeded = (event) => {
    const db = event.target.result

    if (!db.objectStoreNames.contains("players")) {
        const playerStore = db.createObjectStore("players", {
            keyPath: "playerId"
        })
        playerStore.createIndex("name", "name", {
            unique: true
        })
        playerStore.createIndex("gender", "gender", {
            unique: false
        })
    }

    if (!db.objectStoreNames.contains("tournaments")) {
        const tournamentStore = db.createObjectStore("tournaments", {
            keyPath: "tournamentId"
        })
        tournamentStore.createIndex("name", "name", {
            unique: true
        })
        tournamentStore.createIndex("type", "type", {
            unique: false
        })
        tournamentStore.createIndex("status", "status", {
            unique: false
        })
    }

    if (!db.objectStoreNames.contains("tournamentTeams")) {
        const tntTeamStore = db.createObjectStore("tournamentTeams", {
            keyPath: "teamId"
        })
        tntTeamStore.createIndex("tournamentId", "tournamentId", {
            unique: false
        })
        tntTeamStore.createIndex("name", "name", {
            unique: false
        })
    }

    if (!db.objectStoreNames.contains("tournamentTeamPlayers")) {
        const tntTeamPlayerStore = db.createObjectStore("tournamentTeamPlayers", {
            keyPath: "teamPlayerId"
        })
        tntTeamPlayerStore.createIndex("teamId", "teamId", {
            unique: false
        })
        tntTeamPlayerStore.createIndex("playerId", "playerId", {
            unique: false
        })
    }

    if (!db.objectStoreNames.contains("matches")) {
        const matchStore = db.createObjectStore("matches", {
            keyPath: "matchId"
        })
        matchStore.createIndex("category", "category", {
            unique: false
        })
        matchStore.createIndex("type", "type", {
            unique: false
        })
        matchStore.createIndex("status", "status", {
            unique: false
        })
        matchStore.createIndex("winnerTeamId", "winnerTeamId", {
            unique: false
        })
    }

    if (db.objectStoreNames.contains("sets")) {
        const setStore = db.createObjectStore("sets", {
            keyPath: "setId"
        })
        setStore.createIndex("status", "status", {
            unique: false
        })
        setStore.createIndex("matchId", "matchId", {
            unique: false
        })
    }

    if (!db.objectStoreNames.contains("matchEvents")) {
        const matchEventStore = db.createObjectStore("matchEvents", {
            keyPath: "eventId"
        })
        matchEventStore.createIndex("setId", "setId", {
            unique: false
        })
    }

    if (!db.objectStoreNames.contains("matchPlayers")) {
        const matchPlayerStore = db.createObjectStore("matchPlayers", {
            keyPath: "matchPlayerId"
        })
        matchPlayerStore.createIndex("matchId", "matchId", {
            unique: false
        })
    }

    if (!db.objectStoreNames.contains("teamFixtures")) {
        const teamFixtureStore = db.createObjectStore("teamFixtures", {
            keyPath: "fixtureId"
        })
        teamFixtureStore.createIndex("tournamentId", "tournamentId", {
            unique: false
        })
        teamFixtureStore.createIndex("status", "status", {
            unique: false
        })
    }
}

request.onsuccess = () => {
    console.log("Database created successfully.")
}

request.onerror = (event) => {
    console.error(`Database creation error: ${event.target.error}`)
}