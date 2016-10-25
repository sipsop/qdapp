class TimeStore {
    @observable today = this.getDay()

    initialize = () => {
        this.setDay()
    }

    /* Get the day for which we should be displaying the time */
    getDay = () => {
        const date = new Date()
        var day = date.getDay()

        /* If it's before 06.00AM, display the date from the day before */
        if (date.getHours() < 6)
            day -= 1
        if (day < 0)
            day += 7
        return day
    }

    /* Update the 'day' every 5 minutes */
    @action setDay = () => {
        this.today = this.getDay()
        setTimeout(setDay, 1000 * 60 * 5)
    }
}

export const timeStore = new TimeStore()
