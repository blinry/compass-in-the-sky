<script>
    import Compass from "./Compass.svelte"
    import Map from "./Map.svelte"
    import findTZ from "tz-lookup"
    import {changeTimezone} from "./sun.js"

    let date = new Date()
    let latitude = 52
    let longitude = 10

    $: timezoneString = findTZ(latitude, longitude)

    //$: date = changeTimezone(date, timezoneString)

    $: console.log(date)

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
    <input
        type="range"
        bind:value={latitude}
        min="-90"
        max="90"
        step="0.01666"
    />
    {latitude}
    <br />
    <input
        type="range"
        bind:value={longitude}
        min="-180"
        max="180"
        step="0.01666"
    />
    {longitude}
    <br />
    {timezoneString}<br />
    <Map bind:latitude bind:longitude {date} />

    <input type="range" bind:value={hour} min="0" max="24" step="0.01" />
    {hour}<br />

    <input type="range" bind:value={month} min="0" max="12" step="0.01" />
    {month}

    <Compass
        {date}
        {timezoneString}
        {latitude}
        {longitude}
        interactive={false}
    />
</div>

<style>
    #grid {
        display: flex;
        flex-wrap: wrap;
    }
</style>
