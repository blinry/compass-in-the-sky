<script>
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
    <input
        type="range"
        bind:value={hour}
        min="0"
        max="24"
        step="0.01"
        {disabled}
    />
    <span class="big">
        {format(hour)}
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
