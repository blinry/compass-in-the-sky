<script>
    import TimeSlider from "./TimeSlider.svelte"
    import YearSlider from "./YearSlider.svelte"
    import {yearPercentageToDate, dateToYearPercentage} from "./sun.js"

    export let date
    export let hideYear = false
    export let disabled = false

    let hour, year

    $: setDate(date)
    function setDate(date) {
        hour = date.getHours() + date.getMinutes() / 60
        year = dateToYearPercentage(date)
    }

    $: setHour(hour)
    function setHour(hour) {
        console.log("here")
        date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
        date = date // trigger update
    }
    $: setYear(year)
    function setYear(year) {
        date = yearPercentageToDate(year)
        setHour(hour)
    }
</script>

<TimeSlider bind:hour {disabled} />
{#if !hideYear}
    <YearSlider bind:year {disabled} />
{/if}
