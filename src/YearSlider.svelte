<script>
    import {yearPercentageToDate} from "./sun.js"

    export let year
    export let disabled = false
</script>

<div>
    <input
        type="range"
        bind:value={year}
        min="0"
        max="0.99999"
        step="0.0001"
        {disabled}
    />
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
    }
    input {
        flex: 1;
    }
    span {
        width: 7rem;
        padding-left: 1rem;
    }
</style>
