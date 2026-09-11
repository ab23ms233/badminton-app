import { startDateButton } from "./controls.js"
import { 
    formatDisplayDate,
    toISODate
} from "./utils.js"

const calendarMonth = document.getElementById("calendar-month")
const calendarDays = document.getElementById("calendar-days")
export const calendarPicker = document.getElementById("calendar-picker")

const dateValue = document.getElementById("date-value")
const today = new Date()

let selectedDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
)

export let calendarMonthDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
)

export function openCalendar() {
    calendarMonthDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
    )

    renderCalendar()
    calendarPicker.hidden = false
    startDateButton.setAttribute("aria-expanded", "true")
}

export function closeCalendar() {
    calendarPicker.hidden = true
    startDateButton.setAttribute("aria-expanded", "false")
}

export function toggleCalendar() {
    if (calendarPicker.hidden) {
        openCalendar()
    } else {
        closeCalendar()
    }
}

export function renderCalendar() {
    const year = calendarMonthDate.getFullYear()
    const month = calendarMonthDate.getMonth()

    calendarMonth.textContent = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric"
    }).format(calendarMonthDate)

    calendarDays.replaceChildren()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPreviousMonth = new Date(year, month, 0).getDate()

    for (let i = firstDay - 1; i >= 0; i--) {
        const dayNumber = daysInPreviousMonth - i
        const date = new Date(year, month - 1, dayNumber)
        calendarDays.appendChild(createCalendarDay(date, true))
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        calendarDays.appendChild(createCalendarDay(date, false))
    }

    const cellsUsed = firstDay + daysInMonth
    const remainingCells = (7 - (cellsUsed % 7)) % 7

    for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day)
        calendarDays.appendChild(createCalendarDay(date, true))
    }
}

export function createCalendarDay(date, isOtherMonth) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "calendar-day"
    button.textContent = date.getDate()

    if (isOtherMonth) {
        button.classList.add("other-month")
    }

    if (toISODate(date) === toISODate(today)) {
        button.classList.add("today")
    }

    if (toISODate(date) === toISODate(selectedDate)) {
        button.classList.add("selected")
    }

    button.addEventListener("click", () => {
        selectedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        )

        updateDateField()
        closeCalendar()
    })

    return button
}

export function updateDateField() {
    dateValue.textContent = formatDisplayDate(selectedDate)
}

updateDateField()
renderCalendar()