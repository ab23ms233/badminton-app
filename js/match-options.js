// Event listener for start match button
const nextBtn = document.getElementById("next-btn");
nextBtn.addEventListener("click", recordMatchConfig);

// Collects all match configuration from the form and validates inputs
function recordMatchConfig() {
    // Fetch team selection dropdowns
    let teamGreen = document.querySelector(".team-green-select")
    let teamOrange = document.querySelector(".team-orange-select")

    // Validate that both teams have been selected
    if (!teamGreen.value || !teamOrange.value) {
        alert("Please select team names of both teams before proceeding.")
        return
    }

    // Extract team names
    teamGreen = teamGreen.value.trim()
    teamOrange = teamOrange.value.trim()

    // Extract match type and category
    const category = document.querySelector(".category-card.selected").textContent.trim()
    const type = document.querySelector(".type-card.selected").textContent.trim()

    // Extract match rules
    const numOfSets = Number(document.getElementById("number-of-sets").value)
    const pointsPerSet = Number(document.getElementById("points-per-set-input").value)

    // Extract deuce setting
    const allowDeuce = document.querySelector(".allow-deuce.selected").textContent.trim() === "Yes"

    // Create match configuration object
    const matchConfig = {
        green: teamGreen,
        orange: teamOrange,
        category: category,
        type: type,
        numOfSets: numOfSets,
        pointsPerSet: pointsPerSet,
        allowDeuce: allowDeuce
    }

    // Save match configuration to browser session storage
    sessionStorage.setItem(
        "matchConfig",
        JSON.stringify(matchConfig)
    )
    // Navigate to player information page
    window.location.href = "player-info.html"
}

// Handles card selection UI - ensures only one card is selected at a time
function setCardSelection(selector) {
    const cards = document.querySelectorAll(selector)

    // Add click listener to each card
    cards.forEach(card => {
        card.addEventListener("click", () => {
            // Remove selected state from all cards
            cards.forEach(card => {
                card.classList.remove("selected")
            })
            // Add selected state to clicked card
            card.classList.add("selected")
        })
    })
}

// Creates a dropdown menu for team selection with all available teams
function createTeamDropDown(teamId) {
    // Create wrapper container for the dropdown
    const wrapper = document.createElement("div")
    wrapper.classList.add("select-wrapper")

    // Create select element with appropriate classes
    const select = document.createElement("select")
    select.classList.add(`team-${teamId}-select`, `thin-${teamId}-border`, "dropdown", "team-select-dropdown")

    // Create placeholder option
    const placeholder = document.createElement("option")
    placeholder.value = ""
    placeholder.textContent = "Choose a team..."
    placeholder.disabled = true
    placeholder.selected = true
    placeholder.hidden = true

    select.appendChild(placeholder)
    select.required = true

    // Populate dropdown with all team names
    teams.forEach(team => {
        const option = document.createElement("option")
        option.value = team
        option.textContent = team

        select.appendChild(option)
    })

    wrapper.appendChild(select)
    return wrapper
}

// Creates a dropdown menu for selecting the number of sets in a match
function createSetsDropDown(numSets, defaultSet) {
    // Create wrapper container for the dropdown
    const wrapper = document.createElement("div")
    wrapper.classList.add("select-wrapper")

    // Create select element with unique id
    const select = document.createElement("select")
    select.classList.add("dropdown")
    select.id = "number-of-sets"

    // Populate dropdown with available set options
    numSets.forEach(set => {
        const option = document.createElement("option")
        option.value = set
        option.textContent = set

        console.log(set)
        console.log(defaultSet)
        // Set the default selected value
        if (set === defaultSet) {
            console.log(set)
            option.selected = true
        }

        select.appendChild(option)
    })

    wrapper.appendChild(select)
    return wrapper
}

// Array of available team options
const teams = [
    "22MS",
    "23MS",
    "24MS"
]

// Create team selection dropdowns for both teams
const greenDropDown = createTeamDropDown("green")
const orangeDropDown = createTeamDropDown("orange")

// Insert team dropdowns into the page
document.getElementById("team-green-option").appendChild(greenDropDown)
document.getElementById("team-orange-option").appendChild(orangeDropDown)

// Create and insert number of sets dropdown
const numSets = [1, 3, 5]
const defaultSet = 3
const numSetsDropDown = createSetsDropDown(numSets, defaultSet)

document.getElementById("number-of-sets-option").appendChild(numSetsDropDown)

// Setup card selection behavior for match configuration options
setCardSelection(".category-card")
setCardSelection(".type-card")
setCardSelection(".allow-deuce")