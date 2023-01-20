<script>
    import {yearPercentageToDate} from "./sun.js"
    import {createEventDispatcher} from "svelte"
    const dispatch = createEventDispatcher()

    export let year
    export let disabled = false
</script>

<div>
    {#if !disabled}
        <input
            type="range"
            value={year}
            on:input={(e) => dispatch("change", e.target.value)}
            min="0"
            max="0.99999"
            step="0.00001"
            {disabled}
        />
    {/if}
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
        width: 15rem;
        padding-left: 1rem;
    }
</style>
