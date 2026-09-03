import { formatTime } from "./ui.js"
import { matchState, MATCH_STATUS } from "./state.js"
import { endInterval, prepareNextSet } from "./scoring.js"

export class Timer {
    constructor({
        element,
        initialTime = 0,
        direction = "forward",
        format = "mm:ss",
        onFinish = null,
        shouldRun = null
    }) {
        this.element = element
        this.initialTime = initialTime
        this.time = initialTime
        this.direction = direction
        this.format = format
        this.onFinish = onFinish
        this.shouldRun = shouldRun

        this.paused = false
    }
    pause() {
        this.paused = true
    }
    resume() {
        this.paused = false
    }
    reset() {
        this.time = this.initialTime
        this.updateDisplay()
    }
    tick() {
        if (!this.shouldRun() || this.paused) {
            return
        }

        if (this.direction === "forward") {
            this.time++
        } else {
            this.time--

            if (this.time <= 0) {
                this.time = 0
                this.paused = true
                this.updateDisplay()

                if (this.onFinish) {
                    this.onFinish()
                    return
                }
            }
        }

        this.updateDisplay()
    }

    updateDisplay() {
        this.element.textContent = formatTime(this.time, this.format)
    }

    togglePause() {
        if (this.paused) {
            this.resume()
        } else {
            this.pause()
        }
    }
}

export const matchTimer = new Timer({
    element: document.getElementById("match-timer"),
    initialTime: 0,
    direction: "forward",
    format: "hh:mm:ss",

    shouldRun: () =>
        matchState.status === MATCH_STATUS.ONGOING ||
        matchState.status === MATCH_STATUS.PRE_GAME
})

export const intervalTimer = new Timer({
    element: document.getElementById("interval-timer"),
    initialTime: 60,
    direction: "backward",
    format: "mm:ss",

    shouldRun: () =>
        matchState.status === MATCH_STATUS.INTERVAL,

    onFinish: endInterval
})

export const setBreakTimer = new Timer({
    element: document.getElementById("set-timer"),
    initialTime: 20,
    direction: "backward",
    format: "mm:ss",

    shouldRun: () =>
        matchState.status === MATCH_STATUS.SET_FINISHED,

    onFinish: prepareNextSet
})

setInterval(() => {
    matchTimer.tick()
    intervalTimer.tick()
    setBreakTimer.tick()
}, 1000)