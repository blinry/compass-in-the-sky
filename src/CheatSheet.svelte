<script>
    import Compass from "./Compass.svelte"
    import findTZ from "tz-lookup"
    //import {changeTimezone} from "./sun.js"

    export let date = new Date()
    export let latitude = 0
    export let longitude = 0

    $: timezoneString = findTZ(latitude, longitude)

    //$: date = changeTimezone(date, timezoneString)

    let dates = []
    $: {
        dates = []
        for (let i = 5; i < 12; i += 3) {
            let newDate = new Date(date)
            let hour = date.getHours() + date.getMinutes() / 60
            newDate.setMonth(i)
            newDate.setDate(21)
            newDate.setHours(Math.floor(hour))
            newDate.setMinutes((hour % 1) * 60)

            let description = "?"
            if (i == 5) {
                description = "June"
            } else if (i == 8) {
                description = "March / September"
            } else if (i == 11) {
                description = "December"
            }

            dates.push({date: newDate, description: description})
        }
        dates = dates
    }

    //let hour = 12
    //let month = 6

    /* $: { */
    /*     for (let date2 of dates) { */
    /*         let hour = date.getHours() + date.getMinutes() / 60 */
    /*         date2.setHours(Math.floor(hour)) */
    /*         date2.setMinutes((hour % 1) * 60) */
    /*         date2 = date2 */
    /*     } */
    /* } */
</script>

<div>
    <div id="grid">
        {#each dates as { date, description }}
            <div>
                <Compass
                    {date}
                    {timezoneString}
                    {latitude}
                    {longitude}
                    interactive={false}
                    showSun={true}
                    label={description}
                />
            </div>
        {/each}
    </div>
</div>

<style>
    #grid {
        display: flex;
        flex-wrap: wrap;
    }
</style>
