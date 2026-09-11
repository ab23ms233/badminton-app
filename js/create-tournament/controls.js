import { createAddTeamForm } from "./team-form.js"
import { 
    toggleCalendar,
    renderCalendar,
    calendarMonthDate,
    calendarPicker
} from "./calendar.js"

import { onCreateTnt } from "./save-tournament.js"

export const tournamentNameInput = document.getElementById("tournament-name")
export const tournamentForm = document.getElementById("tournament-form")
export const tournamentCategorySelect = document.getElementById("tournament-category")

const backButton = document.getElementById("back-btn")
backButton.addEventListener("click", () => {
    window.location.href = "select-tournament.html"
})

const previousMonthButton = document.getElementById("previous-month")
const nextMonthButton = document.getElementById("next-month")

const addTeamButton = document.getElementById("add-team-btn")
export const startDateButton = document.getElementById("start-date")

addTeamButton.addEventListener("click", createAddTeamForm)
startDateButton.addEventListener("click", toggleCalendar)

previousMonthButton.addEventListener("click", () => {
    calendarMonthDate.setMonth(calendarMonthDate.getMonth() - 1)
    renderCalendar()
})

nextMonthButton.addEventListener("click", () => {
    calendarMonthDate.setMonth(calendarMonthDate.getMonth() + 1)
    renderCalendar()
})

document.addEventListener("click", event => {
    if (
        !calendarPicker.hidden &&
        !calendarPicker.contains(event.target) &&
        !startDateButton.contains(event.target)
    ) {
        closeCalendar()
    }
})

tournamentNameInput.addEventListener("input", () => {
    tournamentNameInput.classList.remove("input-error")
})

tournamentForm.addEventListener("submit", onCreateTnt)







