<script>
    import {onMount} from "svelte"
    import Compass from "./Compass.svelte"
    import {newQuiz, monthNames} from "./sun.js"

    export let latitude, longitude
    export let hour
    export let month
    export let date
    export let level = 1

    let bonus = undefined

    let northAngle = 0,
        sunAngle = 0,
        yourSunAngle = 0,
        yourNorthAngle = 0

    $: {
        if (quiz) {
            sunAngle = northAngle + quiz.sunAngle + Math.PI
        }
    }

    let quizInProgress = false
    let showYourCompass = false

    let quiz

    reset()

    function startQuiz() {
        bonus = undefined
        quizInProgress = true
        showYourCompass = true

        quiz = newQuiz(latitude, longitude)
    }

    function solve() {
        quizInProgress = false
        let angleDiff
        if (level == 1) {
            angleDiff = yourSunAngle - sunAngle
        } else {
            angleDiff = yourNorthAngle - northAngle
        }
        angleDiff = Math.abs(((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI)
        bonus = 10 * Math.max(0, -2 * (angleDiff / Math.PI) + 1)
        bonus = Math.round(bonus)
        points += bonus
    }

    function reset() {
        let date = new Date()
        hour = date.getHours()
        month = date.getMonth() + 1
        quizInProgress = false
    }

    onMount(async () => {
        startQuiz()
    })
</script>

<div id="controls">
    {#if showYourCompass}
        {#if level >= 2}
            <div class="big">
                {Math.round(hour)}:00, {monthNames[month - 1]}
            </div>
        {/if}
    {/if}
    <div id="compass">
        {#if showYourCompass}
            <div class={quizInProgress ? "" : "transparent"}>
                <Compass
                    {date}
                    {latitude}
                    {longitude}
                    {level}
                    bind:northAngle={yourNorthAngle}
                    bind:sunAngle={yourSunAngle}
                    showHints={false}
                    showDirections={level >= 2}
                    showSun={level <= 2}
                />
            </div>
        {/if}
        {#if !quizInProgress && showYourCompass}
            <div>
                <Compass
                    {date}
                    {latitude}
                    {longitude}
                    {level}
                    {northAngle}
                    {sunAngle}
                    showHints={level >= 2}
                    showDirections={level >= 2}
                    interactive={false}
                />
            </div>
        {/if}
    </div>
    {#if quizInProgress}
        <button on:click={solve}>Show solution</button>
        <button on:click={startQuiz}>Give me another photo</button>
    {:else}
        <button on:click={startQuiz}>New quiz!</button>
    {/if}
    {#if bonus !== undefined}
        <div>You got {bonus} points!</div>
    {/if}
</div>
<div id="photo">
    {#if quiz?.image}
        <img src={quiz.image} alt="Street-level view of a random location" /><br
        />
    {/if}
</div>

<style>
    #controls {
        padding: 1rem;
        width: 20rem;
    }
    #photo {
        background: lightblue;
        flex-grow: 1;
    }
    #compass {
        height: 20rem;
        position: relative;
    }
    #compass div {
        position: absolute;
        top: 0;
        left: 0;
    }
    .transparent {
        opacity: 10%;
    }
</style>
