import { openDB } from "../db/database.js"

export async function saveTnt(tournament) {
    if (!Object.hasOwn(tournament, "createdAt")) {
        tournament.createdAt = new Date().toISOString()
    }
    if (!Object.hasOwn(tournament, "tntId")) {
        tournament.tntId = crypto.randomUUID()
    }

    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tournaments", "readwrite")
        const tntStore = transaction.objectStore("tournaments")

        const getRequest = tntStore.getAll()

        getRequest.onsuccess = () => {
            const addedTnts = getRequest.result
            const addedTntNames = addedTnts.map(tnt => tnt.name)

            if (!addedTntNames.includes(tournament.name)) {
                const addRequest = tntStore.add(tournament)

                addRequest.onsuccess = () => {
                    console.log(`Added ${tournament.name} to DB.`)
                }

                addRequest.onerror = () => {
                    reject(addRequest.error)
                }
            } else {
                console.log(`Tournament ${tournament.name} already exists.`)
            }
        }

        getRequest.onerror = () => {
            reject(getRequest.error)
        }

        transaction.oncomplete = () => {
            console.log("Transaction completed successfully.")
            resolve()
        }

        transaction.onerror = () => {
            reject(transaction.error)
        }
    })
}

export async function saveTeamPlayers(teams) {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("players", "readwrite")
        const playerStore = transaction.objectStore("players")

        const index = playerStore.index("name_gender")

        teams.forEach(team => {
            team.players.forEach(player => {
                const getRequest = index.get([
                    player.name,
                    player.gender
                ])

                getRequest.onsuccess = () => {
                    if (getRequest.result) {
                        console.log(`${player.name} already exists in players.`)
                        
                        const playerId = getRequest.result.playerId
                        player.playerId = playerId
                    } else {
                        const playerToAdd = {
                            playerId: crypto.randomUUID(),
                            name: player.name,
                            gender: player.gender,
                            createdAt: new Date().toISOString()
                        }
  
                        const addRequest = playerStore.add(playerToAdd)

                        addRequest.onsuccess = () => {
                            console.log(`Added ${player.name} to players successfully.`)
                            player.playerId = playerToAdd.playerId
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