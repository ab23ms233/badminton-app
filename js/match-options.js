// Event listener for start match form
const matchOptionsForm = document.getElementById("match-options-section")
matchOptionsForm.addEventListener("submit", recordMatchConfig)

// Collects all match configuration from the form and validates inputs
function recordMatchConfig(event) {
    event.preventDefault()

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

// Create and insert number of sets dropdown
const numSets = [1, 3, 5]
const defaultSet = 3
const numSetsDropDown = createSetsDropDown(numSets, defaultSet)

document.getElementById("number-of-sets-option").appendChild(numSetsDropDown)

// Setup card selection behavior for match configuration options
setCardSelection(".category-card")
setCardSelection(".type-card")
setCardSelection(".allow-deuce")