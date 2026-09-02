// Start match button
const nextBtn = document.getElementById("next-btn");
nextBtn.addEventListener("click", recordMatchConfig);

// If start match is clicked
function recordMatchConfig() {
    // Fetch all match config
    let teamGreen = document.querySelector(".team-green-select")
    let teamOrange = document.querySelector(".team-orange-select")

    if (!teamGreen.value || !teamOrange.value) {
        alert("Please select team names of both teams before proceeding.")
        return
    }

    teamGreen = teamGreen.value.trim()
    teamOrange = teamOrange.value.trim()

    const category = document.querySelector(".category-card.selected").textContent.trim()
    const type = document.querySelector(".type-card.selected").textContent.trim()

    const numOfSets = Number(document.getElementById("number-of-sets").value)
    const pointsPerSet = Number(document.getElementById("points-per-set-input").value)

    const allowDeuce = document.querySelector(".allow-deuce.selected").textContent.trim() === "Yes"

    // Store in json
    const matchConfig = {
        greenTeam: teamGreen,
        orangeTeam: teamOrange,
        category: category,
        type: type,
        numOfSets: numOfSets,
        pointsPerSet: pointsPerSet,
        allowDeuce: allowDeuce
    }
    // console.log(type)

    // Save in browser storage
    sessionStorage.setItem(
        "matchConfig",
        JSON.stringify(matchConfig)
    )
    // Change page to player-info
    window.location.href = "player-info.html"
}

// Change card selection on clicking
function setCardSelection(selector) {
    const cards = document.querySelectorAll(selector)

    cards.forEach(card => {
        // If card is clicked
        card.addEventListener("click", () => {
            // Remove selected from all cards
            cards.forEach(card => {
                card.classList.remove("selected")
            })
            // Select clicked card
            card.classList.add("selected")
        })
    })
}

// Create dropdown menu for team-selection
function createTeamDropDown(teamId, teams) {
    const wrapper = document.createElement("div")
    wrapper.classList.add("select-wrapper")

    const select = document.createElement("select")
    select.classList.add(`${teamId}-select`, "dropdown", "team-select-dropdown")

    const placeholder = document.createElement("option")
    placeholder.value = ""
    placeholder.textContent = "Choose a team..."
    placeholder.disabled = true
    placeholder.selected = true
    placeholder.hidden = true

    select.appendChild(placeholder)
    select.required = true

    teams.forEach(team => {
        const option = document.createElement("option")
        option.value = team
        option.textContent = team

        select.appendChild(option)
    })

    wrapper.appendChild(select)
    return wrapper
}

function createSetsDropDown(numSetsArr, defaultSet) {
    const wrapper = document.createElement("div")
    wrapper.classList.add("select-wrapper")

    const select = document.createElement("select")
    select.classList.add("dropdown")
    select.id = "number-of-sets"

    numSetsArr.forEach(set => {
        const option = document.createElement("option")
        option.value = set
        option.textContent = set

        if (set === defaultSet) {
            option.selected = true
        }

        select.appendChild(option)
    })

    wrapper.appendChild(select)
    return wrapper
}

const teams = [
    "22MS",
    "23MS",
    "24MS"
]

const greenDropDown = createTeamDropDown("team-green", teams)
const orangeDropDown = createTeamDropDown("team-orange", teams)

document.getElementById("team-green-option").appendChild(greenDropDown)
document.getElementById("team-orange-option").appendChild(orangeDropDown)

const numSets = [1, 3, 5]
const defaultSet = 3
const numSetsDropDown = createSetsDropDown(numSets, defaultSet)

document.getElementById("number-of-sets-option").appendChild(numSetsDropDown)

setCardSelection(".category-card")
setCardSelection(".type-card")
setCardSelection(".allow-deuce")