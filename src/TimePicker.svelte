<script>
    import TimeSlider from "./TimeSlider.svelte"
    import YearSlider from "./YearSlider.svelte"
    import {yearPercentageToDate, dateToYearPercentage} from "./sun.js"
    import {calcAzimuth, timezoneDiff} from "./sun.js"
    import findTZ from "tz-lookup"

    export let date
    export let hideYear = false
    export let disabled = false

    export let latitude = 0
    export let longitude = 0

    $: timezoneString = findTZ(latitude, longitude)

    let hour, year

    $: setDate(date, timezoneString)
    function setDate(date, timezoneString) {
        let date2 = new Date(
            date.getTime() - timezoneDiff(timezoneString, date) * 60 * 60 * 1000
        )
        hour = date2.getHours() + date2.getMinutes() / 60
        year = dateToYearPercentage(date2)
    }

    //$: setHour(hour, timezoneString)
    //$: setYear(year, timezoneString)
    function setHour(hour, timezoneString) {
        let hour2 = hour + timezoneDiff(timezoneString, date)
        date.setHours(Math.floor(hour2 % 24), (hour2 % 1) * 60, 0)
        date = date // trigger update
    }
    function setYear(year, timezoneString) {
        date = yearPercentageToDate(year)
        date.setHours(Math.floor(hour % 24), (hour % 1) * 60, 0)
        // shift back by timezoneDiff(timezoneString)
        date = new Date(
            date.getTime() + timezoneDiff(timezoneString, date) * 60 * 60 * 1000
        )
    }

    function hourChanged(e) {
        setHour(parseFloat(e.detail), timezoneString)
    }

    function yearChanged(e) {
        setYear(parseFloat(e.detail), timezoneString)
    }
</script>

<div>
    <TimeSlider {hour} on:change={hourChanged} {disabled} />
    {#if !hideYear}
        <YearSlider {year} on:change={yearChanged} {disabled} />
    {/if}
</div>

<style>
    div {
        font-size: 120%;
    }
</style>
