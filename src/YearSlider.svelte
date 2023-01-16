<script>
    export let year

    function yearPercentageToDate(yearPercentage) {
        /* be precise */
        const year = Math.floor(yearPercentage * 365)
        const day = yearPercentage * 365 - year
        const date = new Date()
        date.setFullYear(2020, 0, 1)
        date.setDate(date.getDate() + year)
        date.setHours(Math.floor(day * 24), ((day * 24) % 1) * 60, 0)
        return date
    }
</script>

<div>
    <input type="range" bind:value={year} min="0" max="1" step="0.01" />
    <span class="big">
        {yearPercentageToDate(year).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
        })}
    </span>
</div>

<style>
    div {
        display: flex;
        background: brown;
    }
    input {
        flex: 1;
    }
    span {
        width: 7rem;
        padding-left: 1rem;
    }
</style>
