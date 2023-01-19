<script>
    import {createEventDispatcher} from "svelte"
    const dispatch = createEventDispatcher()

    export let hour
    export let disabled

    function format(hour) {
        let h = Math.floor(hour).toString().padStart(2, "0")
        let m = Math.floor((hour % 1) * 60)
            .toString()
            .padStart(2, "0")
        return `${h}:${m}`
    }
</script>

<div>
    {#if !disabled}
        <input
            type="range"
            value={hour}
            on:input={(e) => dispatch("change", e.target.value)}
            min="0"
            max="24"
            step="0.01"
        />
    {/if}
    <span class="big">
        {format(hour)}
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
        width: 9rem;
        padding-left: 1rem;
    }
</style>
