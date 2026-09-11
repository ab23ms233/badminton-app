import { interBatch2025Fixtures } from "../../db/match_results_interbatch_2025.js"



const tournaments = [
    {
        tournamentId: crypto.randomUUID(),
        name: "Inter-Batch 2025",
        type: "Team Based",
        start_date: new Date(2025, 0, 15).toLocaleDateString("en-CA"),
        end_date: new Date(2025, 2, 23).toLocaleDateString("en-CA"),
        status: "COMPLETED",
        created_at: new Date().toISOString()
    }
]

let playerNames = []
let players = []

let tntEvents = []
let tntEventTeams = []

// for (let i = 0; i < interBatch2025Fixtures.length; i++) {
//     const fixture = interBatch2025Fixtures[i]
//     const matches = fixture.matches
//     const category = fixture.category
//     const gender = 
//     category === "MX"
//     ? null
//     : category

//     // Updating tournament events
//     const tournamentId = tournaments[0].tournamentId
    
//     let eventName
//     const format = "Pooling"
//     if (category === "M") {
//         eventName = "Men's"
//     } else if (category === "W") {
//         eventName = "Women's"
//     } else {
//         eventName = "Mixed"
//     }

//     const tntEvent = {
//         eventId: crypto.randomUUID(),
//         tournamentId: tournamentId,
//         name: eventName,
//         format: format
//     }

//     if (!tntEvents.includes(tntEvent)) {
//         tntEvents.push(tntEvent)
//     }

//     const eventId = tntEvent.eventId
//     const teams = [fixture.teamA, fixture.teamB]
//     teams.forEach(team => {
//         if (!tntEventTeams.includes(team)) {

//         }
//     })
//     matches.forEach(match => {
//         const matchPlayerNames = [...match.teamAPlayers, ...match.teamBPlayers]

//         for (let playerName of matchPlayerNames) {
//             if (!playerNames.includes(playerName)) {
//                 playerNames.push(playerName)

//                 if (!category) {
//                     console.log(`${playerName} is in mixed.`)
//                 }
//                 const player = {
//                     playerId: crypto.randomUUID(),
//                     name: playerName,
//                     gender: gender,
//                     created_at: new Date().toISOString()
//                 }
    
//                 players.push(player)
//             }
//         }
//     })
// }

// console.log(`Number of players in dataset: ${players.length}`)





async function addPlayers(db, players) {
    const addedPlayers = await readPlayers(db)
    const addedPlayerNames = addedPlayers.map(player => player.name)

    const transaction = db.transaction("players", "readwrite")
    const playerStore = transaction.objectStore("players")

    players.forEach(player => {
        if (!addedPlayerNames.includes(player.name)) {
            playerStore.add(player)
        } else {
            console.log(`${player.name} exists in the table`)
        }
    })

    transaction.oncomplete = () => {
        console.log(`Added ${players.length} players succesfully`)
    }

    transaction.onerror = (event) => {
        console.error(`Error adding players: ${event.target.error}`)
    }
}

async function readPlayers(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("players", "readonly")
        const playerStore = transaction.objectStore("players")

        const getRequest = playerStore.getAll()

        getRequest.onsuccess = () => {
            const players = getRequest.result
            console.log(`Read ${players.length} players`)
            resolve(players)
        }

        getRequest.onerror = (event) => {
            console.error(`Error reading players: ${event.target.error}`)
            reject(event.target.error)
        }
    })
    
}
// console.log(state)

// import interBatch2025Fixtures from "../db/match_results_interbatch_2025.js";

// const DB_NAME = "badminton-scorer";
// const DB_VERSION = 2;

// const STORES = {
//     players: "players",
//     eventTeams: "tournament_event_teams",
//     fixtures: "team_fixtures",
//     matches: "matches",
//     matchPlayers: "match_players",
//     sets: "sets"
// };


// /* ---------------------------------------------------------
//    IndexedDB helper
// --------------------------------------------------------- */

// function openDatabase() {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open(DB_NAME, DB_VERSION);

//         request.onupgradeneeded = event => {
//             const db = event.target.result;

//             for (const storeName of Object.values(STORES)) {
//                 if (!db.objectStoreNames.contains(storeName)) {
//                     db.createObjectStore(storeName, { keyPath: "id" });
//                 }
//             }
//         };

//         request.onsuccess = () => {
//             resolve(request.result);
//         };

//         request.onerror = () => {
//             reject(request.error);
//         };
//     });
// }


// /* ---------------------------------------------------------
//    Generic ID generator
// --------------------------------------------------------- */

// function generateId(prefix) {
//     return `${prefix}-${crypto.randomUUID()}`;
// }


// /* ---------------------------------------------------------
//    Get all records from an object store
// --------------------------------------------------------- */

// function getAll(store) {
//     return new Promise((resolve, reject) => {
//         const request = store.getAll();

//         request.onsuccess = () => {
//             resolve(request.result);
//         };

//         request.onerror = () => {
//             reject(request.error);
//         };
//     });
// }


// /* ---------------------------------------------------------
//    Build lookup maps
// --------------------------------------------------------- */

// function buildPlayerMap(players) {
//     const map = new Map();

//     for (const player of players) {
//         map.set(normalizeName(player.name), player.id);
//     }

//     return map;
// }


// function buildTeamMap(teams) {
//     const map = new Map();

//     for (const team of teams) {
//         map.set(
//             `${team.event_id}::${normalizeName(team.name)}`,
//             team.id
//         );
//     }

//     return map;
// }


// function normalizeName(name) {
//     return String(name)
//         .trim()
//         .replace(/\s+/g, " ")
//         .toLowerCase();
// }


// /* ---------------------------------------------------------
//    Main importer
// --------------------------------------------------------- */

// export async function importInterBatch2025() {
//     const db = await openDatabase();

//     /*
//      * Read existing players and event teams first.
//      *
//      * These should already have been inserted by the
//      * tournament/team import.
//      */
//     const readTransaction = db.transaction(
//         [
//             STORES.players,
//             STORES.eventTeams
//         ],
//         "readonly"
//     );

//     const players = await getAll(
//         readTransaction.objectStore(STORES.players)
//     );

//     const eventTeams = await getAll(
//         readTransaction.objectStore(STORES.eventTeams)
//     );


//     const playerMap = buildPlayerMap(players);
//     const teamMap = buildTeamMap(eventTeams);


//     /*
//      * We need event IDs.
//      *
//      * Change these to the actual IDs you used when creating
//      * the Inter-Batch 2025 events.
//      */
//     const EVENT_IDS = {
//         M: "event-interbatch-2025-m",
//         W: "event-interbatch-2025-w",
//         MX: "event-interbatch-2025-mx"
//     };


//     /*
//      * All records generated during this import go into one
//      * transaction.
//      *
//      * If something fails, none of the records are committed.
//      */
//     const transaction = db.transaction(
//         [
//             STORES.fixtures,
//             STORES.matches,
//             STORES.matchPlayers,
//             STORES.sets
//         ],
//         "readwrite"
//     );


//     const fixtureStore =
//         transaction.objectStore(STORES.fixtures);

//     const matchStore =
//         transaction.objectStore(STORES.matches);

//     const matchPlayerStore =
//         transaction.objectStore(STORES.matchPlayers);

//     const setStore =
//         transaction.objectStore(STORES.sets);


//     let fixtureCount = 0;
//     let matchCount = 0;
//     let matchPlayerCount = 0;
//     let setCount = 0;


//     try {

//         for (const fixtureData of interBatch2025Fixtures) {

//             const eventId = EVENT_IDS[fixtureData.category];

//             if (!eventId) {
//                 throw new Error(
//                     `Unknown category: ${fixtureData.category}`
//                 );
//             }


//             /* ---------------------------------------------
//                Resolve teams
//             --------------------------------------------- */

//             const teamAId = teamMap.get(
//                 `${eventId}::${normalizeName(fixtureData.teamA)}`
//             );

//             const teamBId = teamMap.get(
//                 `${eventId}::${normalizeName(fixtureData.teamB)}`
//             );


//             if (!teamAId) {
//                 throw new Error(
//                     `Team not found: ${fixtureData.teamA}`
//                 );
//             }

//             if (!teamBId) {
//                 throw new Error(
//                     `Team not found: ${fixtureData.teamB}`
//                 );
//             }


//             /* ---------------------------------------------
//                Resolve fixture winner
//             --------------------------------------------- */

//             let winnerTeamId = null;

//             if (fixtureData.winnerSide === "team_a") {
//                 winnerTeamId = teamAId;
//             }
//             else if (fixtureData.winnerSide === "team_b") {
//                 winnerTeamId = teamBId;
//             }


//             /* ---------------------------------------------
//                Create team fixture
//             --------------------------------------------- */

//             const fixtureId = generateId("fixture");

//             const fixtureRecord = {
//                 id: fixtureId,

//                 event_id: eventId,

//                 team_a_id: teamAId,
//                 team_b_id: teamBId,

//                 fixture_number: fixtureData.fixtureNumber,

//                 status: "COMPLETED",

//                 winner_team_id: winnerTeamId,

//                 scheduled_at: null,
//                 started_at: null,
//                 completed_at: null
//             };


//             fixtureStore.add(fixtureRecord);

//             fixtureCount++;


//             /* ---------------------------------------------
//                Individual matches
//             --------------------------------------------- */

//             for (const matchData of fixtureData.matches) {

//                 let matchWinnerTeamId = null;

//                 if (
//                     matchData.winnerSide === "team_a"
//                 ) {
//                     matchWinnerTeamId = teamAId;
//                 }
//                 else if (
//                     matchData.winnerSide === "team_b"
//                 ) {
//                     matchWinnerTeamId = teamBId;
//                 }


//                 const matchId = generateId("match");


//                 /* -----------------------------------------
//                    Create match
//                 ----------------------------------------- */

//                 const matchRecord = {
//                     id: matchId,

//                     fixture_id: fixtureId,

//                     match_number: matchData.matchNumber,

//                     match_type:
//                         normalizeMatchType(matchData.matchType),

//                     category: fixtureData.category,

//                     status:
//                         matchData.status === "WALKOVER"
//                             ? "WALKOVER"
//                             : "COMPLETED",

//                     winner_team_id: matchWinnerTeamId,

//                     best_of_sets: null,
//                     points_per_set: null,
//                     allow_deuce: null,
//                     allow_interval: null,

//                     started_at: null,
//                     ended_at: null
//                 };


//                 matchStore.add(matchRecord);

//                 matchCount++;


//                 /* -----------------------------------------
//                    Match players
                   
//                    Do NOT create player records for a team
//                    walkover when the normalized data has
//                    no players.
//                 ----------------------------------------- */

//                 await addMatchPlayers({
//                     matchPlayerStore,
//                     matchId,
//                     players: matchData.teamAPlayers,
//                     teamId: teamAId,
//                     playerMap,
//                     startingPosition: 1
//                 });

//                 matchPlayerCount +=
//                     matchData.teamAPlayers.length;


//                 await addMatchPlayers({
//                     matchPlayerStore,
//                     matchId,
//                     players: matchData.teamBPlayers,
//                     teamId: teamBId,
//                     playerMap,
//                     startingPosition: 1
//                 });

//                 matchPlayerCount +=
//                     matchData.teamBPlayers.length;


//                 /* -----------------------------------------
//                    Sets
                   
//                    Walkovers have no sets.
//                 ----------------------------------------- */

//                 for (
//                     let i = 0;
//                     i < matchData.sets.length;
//                     i++
//                 ) {

//                     const score = matchData.sets[i];

//                     const setNumber = i + 1;

//                     const setWinner =
//                         determineSetWinner(
//                             score,
//                             teamAId,
//                             teamBId
//                         );


//                     const setRecord = {
//                         id: generateId("set"),

//                         match_id: matchId,

//                         set_number: setNumber,

//                         team_a_score:
//                             score.teamAScore,

//                         team_b_score:
//                             score.teamBScore,

//                         winner_team_id: setWinner,

//                         status: "COMPLETED",

//                         started_at: null,
//                         completed_at: null
//                     };


//                     setStore.add(setRecord);

//                     setCount++;
//                 }
//             }
//         }

//     }
//     catch (error) {

//         transaction.abort();

//         throw error;
//     }


//     return new Promise((resolve, reject) => {

//         transaction.oncomplete = () => {

//             console.log(
//                 "Inter-Batch 2025 import completed."
//             );

//             console.log(
//                 `Fixtures: ${fixtureCount}`
//             );

//             console.log(
//                 `Matches: ${matchCount}`
//             );

//             console.log(
//                 `Match players: ${matchPlayerCount}`
//             );

//             console.log(
//                 `Sets: ${setCount}`
//             );

//             resolve({
//                 fixtures: fixtureCount,
//                 matches: matchCount,
//                 matchPlayers: matchPlayerCount,
//                 sets: setCount
//             });
//         };


//         transaction.onerror = () => {
//             reject(transaction.error);
//         };

//         transaction.onabort = () => {
//             reject(
//                 transaction.error ||
//                 new Error("Import transaction aborted.")
//             );
//         };
//     });
// }


// /* ---------------------------------------------------------
//    Add match players
// --------------------------------------------------------- */

// function addMatchPlayers({
//     matchPlayerStore,
//     matchId,
//     players,
//     teamId,
//     playerMap,
//     startingPosition
// }) {

//     for (let i = 0; i < players.length; i++) {

//         const playerName = players[i];

//         const playerId =
//             playerMap.get(
//                 normalizeName(playerName)
//             );


//         if (!playerId) {
//             throw new Error(
//                 `Player not found: "${playerName}"`
//             );
//         }


//         const record = {
//             id: generateId("match-player"),

//             match_id: matchId,

//             player_id: playerId,

//             team_id: teamId,

//             position: startingPosition + i
//         };


//         matchPlayerStore.add(record);
//     }
// }


// /* ---------------------------------------------------------
//    Determine set winner
// --------------------------------------------------------- */

// function determineSetWinner(
//     score,
//     teamAId,
//     teamBId
// ) {

//     if (
//         score.teamAScore === null ||
//         score.teamBScore === null
//     ) {
//         return null;
//     }


//     if (
//         score.teamAScore >
//         score.teamBScore
//     ) {
//         return teamAId;
//     }


//     if (
//         score.teamBScore >
//         score.teamAScore
//     ) {
//         return teamBId;
//     }


//     return null;
// }


// /* ---------------------------------------------------------
//    Normalize match type
// --------------------------------------------------------- */

// function normalizeMatchType(type) {

//     const value =
//         String(type)
//             .trim()
//             .toUpperCase();


//     switch (value) {

//         case "SINGLES":
//             return "SINGLES";

//         case "DOUBLES":
//             return "DOUBLES";

//         case "REVERSE SINGLES":
//         case "REVERSE_SINGLES":
//             return "REVERSE_SINGLES";

//         default:
//             throw new Error(
//                 `Unknown match type: ${type}`
//             );
//     }
// }