<script>
    import Compass from "./Compass.svelte"
    import Map from "./Map.svelte"
    import findTZ from "tz-lookup"
    import {changeTimezone} from "./sun.js"

    let date = new Date()
    export let latitude = 52
    export let longitude = 10

    $: timezoneString = findTZ(latitude, longitude)

    //$: date = changeTimezone(date, timezoneString)

    let dates = []
    $: {
        dates = []
        for (let i = 0; i < 12; i++) {
            let newDate = new Date(date)
            newDate.setMonth(i)
            newDate.setDate(1)
            dates.push(newDate)
        }
    }

    let hour = 12
    let month = 6

    $: {
        date.setMonth(month)
        date.setDate((month % 1) * 30)
        date.setHours(Math.floor(hour))
        date.setMinutes((hour % 1) * 60)
        //date = changeTimezone(date, timezoneString)
        date = date
    }
</script>

<div>
    <input type="range" bind:value={hour} min="0" max="24" step="0.01" />
    {hour}<br />

    <input type="range" bind:value={month} min="0" max="12" step="0.01" />
    {month}

    <div id="grid">
        {#each dates as date}
            <div>
                <Compass
                    {date}
                    {timezoneString}
                    {latitude}
                    {longitude}
                    interactive={false}
                    showSun={false}
                />
                <div>{date.toISOString().split("T")[0]}</div>
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
