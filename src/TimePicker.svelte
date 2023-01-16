<script>
    import TimeSlider from "./TimeSlider.svelte"
    import YearSlider from "./YearSlider.svelte"

    export let date

    let hour, year
    let disabled = false

    $: setHourYear(date)
    function setHourYear(date) {
        hour = date.getHours()
        year = date.getMonth() / 12 + date.getDate() / 365
    }

    $: setDate(hour, year)
    function setDate(hour, year) {
        date = new Date()
        date.setMonth(0)
        date.setDate(1)
        date.setDate(date.getDate() + Math.floor(year * 365))
        date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
    }
</script>

<TimeSlider bind:hour {disabled} />
<YearSlider bind:year {disabled} />
