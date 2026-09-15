export async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("badminton-scorer", 1)

        request.onupgradeneeded = (event) => {
            const db = event.target.result

            if (!db.objectStoreNames.contains("players")) {
                const playerStore = db.createObjectStore("players", {
                    keyPath: "playerId"
                })
                playerStore.createIndex(
                    "name_gender",
                    ["name", "gender"],
                    { unique: true }
                )
            }

            if (!db.objectStoreNames.contains("tournaments")) {
                const tournamentStore = db.createObjectStore("tournaments", {
                    keyPath: "tntId"
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
                tntTeamStore.createIndex(
                    "tntId_name",
                    ["tntId", "name"],
                    { unique: true }
                )
                tntTeamStore.createIndex(
                    "tntId",
                    "tntId",
                    {
                        unique: false
                    }
                )
            }

            // if (!db.objectStoreNames.contains("tournamentTeamPlayers")) {
            //     const tntTeamPlayerStore = db.createObjectStore("tournamentTeamPlayers", {
            //         keyPath: "teamPlayerId"
            //     })
            //     tntTeamPlayerStore.createIndex(
            //         "tntId_playerId",
            //         ["tntId", "playerId"],
            //         { unique: true }
            //     )
            //     tntTeamPlayerStore.createIndex(
            //         "teamId_playerId",
            //         ["teamId", "playerId"],
            //         { unique: true }
            //     )
            // }

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
                matchStore.createIndex(
                    "fixtureId_matchNum",
                    ["fixtureId", "matchNum"],
                    { unique: true }
                )
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
                setStore.createIndex(
                    "matchId_setNum",
                    ["matchId", "setNum"],
                    { unique: true }
                )
            }

            if (!db.objectStoreNames.contains("matchEvents")) {
                const matchEventStore = db.createObjectStore("matchEvents", {
                    keyPath: "eventId"
                })
                matchEventStore.createIndex("setId", "setId", {
                    unique: false
                })
                matchEventStore.createIndex(
                    "setId_seqNum",
                    ["setId", "seqNum"],
                    {
                        unique: true
                    }
                )
            }

            if (!db.objectStoreNames.contains("matchPlayers")) {
                const matchPlayerStore = db.createObjectStore("matchPlayers", {
                    keyPath: "matchPlayerId"
                })
                matchPlayerStore.createIndex("matchId_playerId",
                    ["matchId", "playerId"],
                    { unique: true }
                )
            }

            if (!db.objectStoreNames.contains("teamFixtures")) {
                const teamFixtureStore = db.createObjectStore("teamFixtures", {
                    keyPath: "fixtureId"
                })
                teamFixtureStore.createIndex(
                    "tntId_fixtureNum",
                    ["tntId", "fixtureNum"],
                    { unique: true }
                )
                teamFixtureStore.createIndex("status", "status", {
                    unique: false
                })
            }

            console.log("Database created successfully.")
        }

        request.onsuccess = (event) => {
            const db = event.target.result
            console.log("Database opened successfully.")
            resolve(db)
        }

        request.onerror = () => {
            reject(request.error)
        }

    })
}

export async function getTnts() {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tournaments", "readonly")
        const tntStore = transaction.objectStore("tournaments")

        const request = tntStore.getAll()

        request.onsuccess = () => {
            resolve(request.result)
        }
        request.onerror = () => {
            reject(request.error)
        }

        transaction.oncomplete = () => {
            resolve(request.result)
        }
        transaction.onerror = () => {
            reject(transaction.error)
        }
    })
}

export async function getTntTeams(tntId) {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tournamentTeams", "readonly")
        const tntEventStore = transaction.objectStore("tournamentTeams")

        const index = tntEventStore.index("tntId")
        const request = index.getAll(tntId)

        request.onsuccess = () => {
            resolve(request.result)
        }
        request.onerror = () => {
            reject(request.error)
        }

        transaction.oncomplete = () => {
            resolve(request.result)
        }
        transaction.onerror = () => {
            reject(transaction.error)
        }
    })
}

export async function getTntTeam(tntId, teamName) {
    const tntTeams = await getTntTeams(tntId)

    tntTeams.forEach(team => {
        if (team.name === teamName) {
            return team
        }
    })

    console.error(`${teamName} does not exist in ${tntId}.`)
}

export async function getTeamPlayers(tntId, teamName) {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tournamentTeams", "readonly")
        const tntTeamStore = transaction.objectStore("tournamentTeams")

        const index = tntTeamStore.index("tntId_name")
        const request = index.get([tntId, teamName])

        request.onsuccess = () => {
            const tntTeam = request.result
            resolve(tntTeam.players)
        }
        request.onerror = () => {
            reject(request.error)
        }

        transaction.oncomplete = () => {
            resolve(true)
        }
        transaction.onerror = () => {
            reject(transaction.error)
        }
    })
}

export async function saveTeams(tntId, teams) {
    const db = await openDB()

    teams.forEach(team => {
        if (!Object.hasOwn(team, "teamId")) {
            team.teamId = crypto.randomUUID()
        }
        if (!Object.hasOwn(team, "tntId")) {
            team.tntId = tntId
        }
        if (!Object.hasOwn(team, "createdAt")) {
            team.createdAt = new Date().toISOString()
        }
    })

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tournamentTeams", "readwrite")
        const tntTeamStore = transaction.objectStore("tournamentTeams")

        const index = tntTeamStore.index("tntId_name")

        teams.forEach(team => {
            const request = index.get([
                team.tntId,
                team.name
            ])

            request.onsuccess = () => {
                if (request.result) {
                    console.log(`${team.name} already exists in ${tntId}.`)
                    resolve(false)
                } else {
                    const addRequest = tntTeamStore.add(team)

                    addRequest.onsuccess = () => {
                        console.log(`${team.name} added successfully to ${tntId}.`)
                    }
                    addRequest.onerror = () => {
                        reject(addRequest.error)
                    }
                }
            }

            request.onerror = () => {
                reject(request.error)
            }

            transaction.oncomplete = () => {
                // console.log(`Team transaction completed successfully.`)
                resolve(true)
            }
            transaction.onerror = () => {
                reject(transaction.error)
            }
        })
    })
}

export async function savePlayer(player) {
    if (!Object.hasOwn(player, "playerId")) {
        player.playerId = crypto.randomUUID()
    }
    if (!Object.hasOwn(player, "createdAt")) {
        player.createdAt = new Date().toISOString()
    }

    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("players", "readwrite")
        const playerStore = transaction.objectStore("players")

        const index = playerStore.index("name_gender")
        const getRequest = index.get([player.name, player.gender])

        getRequest.onsuccess = () => {
            if (getRequest.result) {
                console.log(`${player.name} already exists in DB.`)
            } else {
                const addRequest = playerStore.add(player)

                addRequest.onsuccess = () => {
                    console.log(`Added ${player.name} to DB.`)
                    resolve(true)
                }
                addRequest.onerror = () => {
                    reject(addRequest.error)
                }
            }
        }

        getRequest.onerror = () => {
            reject(getRequest.error)
        }
        transaction.oncomplete = () => {
            resolve(true)
        }
        transaction.onerror = () => {
            reject(transaction.error)
        }
    })
}

export async function savePlayers(players) {
    players.forEach(player => {
        if (!Object.hasOwn(player, "playerId")) {
            player.playerId = crypto.randomUUID()
        }
        if (!Object.hasOwn(player, "createdAt")) {
            player.createdAt = new Date().toISOString()
        }
    })

    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("players", "readwrite")
        const playerStore = transaction.objectStore("players")

        const index = playerStore.index("name_gender")

        players.forEach(player => {
            const getRequest = index.get([player.name, player.gender])

            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    console.log(`${player.name} already exists in players.`)
                } else {
                    const addRequest = playerStore.add(player)

                    addRequest.onsuccess = () => {
                        console.log(`Added ${player.name} to players successfully.`)
                    }
                    addRequest.onerror = () => {
                        reject(addRequest.error)
                    }
                }
            }
            getRequest.onerror = () => {
                    reject(getRequest.error)
            }
        })

        transaction.oncomplete = () => {
            // console.log("Player transaction completed successfully.")
            resolve(true)
        }
        transaction.onerror = () => {
            reject(transaction.error)
        }

    })
}

export async function getPlayerIds(players) {
    const ids = []
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tournamentTeams", "readwrite")
        const tntTeamStore = transaction.objectStore("tournamentTeams")

        const index = tntTeamStore.get("tntId_name")

        players.forEach(player => {
            const request = index.get([player.name, player.gender])

            request.onsuccess = () => {
                if (request.result) {
                    const id = request.result.playerId
                    ids.push(id)
                } else {
                    console.log(`${player.name} does not exist in players.`)
                }
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    })
}
export async function addPlayersToTeam(tntId, players) {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tournamentTeams", "readwrite")
        const tntTeamStore = transaction.objectStore("tournamentTeams")

        const index = tntTeamStore.get("tntId_name")
        const request = index.get([tntId, teamName])

        request.onsuccess = () => {
            const team = request.result



        }
    })
}
openDB()

