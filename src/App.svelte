<script>
    import {onMount} from "svelte"
    import Compass from "./Compass.svelte"
    import CheatSheet from "./CheatSheet.svelte"
    import SunCalc from "./suncalc.js"
    import findTZ from "tz-lookup"
    import {newQuiz} from "./sun.js"

    // 0: overview
    // 1: guess sun direction
    // 2: also guess compass
    // 3: press arrow keys to specify direction
    let level = 0
    let points = 0
    let bonus = undefined

    let levels = {
        0: {
            name: "Introduction",
            description: "TBD",
            requiredPoints: 0,
        },
        1: {
            name: "Find the sun",
            description:
                "Learn how to find north using the sun! The first step is to estimate the direction of the sun. Estimate whether the sun is ahead, behind, or to the left or right of you in the photo, and drag the sun icon to the correct position.",
            requiredPoints: 0,
        },
        2: {
            name: "Find north",
            description:
                "Now we add the second step: after guessing the sun direction, also drag the compass to point in the right direction!",
            requiredPoints: 30,
        },
        3: {
            name: "Directly find north",
            description: "Do it all in your head, then guess where north is.",
            requiredPoints: 60,
        },
        4: {
            name: "Impossible level",
            description: "",
            requiredPoints: 999999,
        },
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    let yourSunAngle = 0,
        yourNorthAngle = 0

    let hour, month
    let quizInProgress = false
    let showYourCompass = false
    reset()

    let lat = 0
    let lng = 0
    let timezoneString = "UTC"

    $: timezoneString = findTZ(lat, lng)

    let quiz

    let date
    //$: {
    //    date = new Date()
    //    date.toLocaleString("en-US", {timeZone: timezoneString})
    //    date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
    //    date.setMonth(month - 1)
    //    pos = SunCalc.getPosition(date, lat, lng)
    //}

    /*let northAngle = 0,
        sunAngle = 0
    $: {
        sunAngle = northAngle + quiz.sunAngle + Math.PI
    }*/

    function startQuiz() {
        bonus = undefined
        quizInProgress = true
        showYourCompass = true

        quiz = newQuiz(lat, lng)
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

    function nextLevel() {
        level += 1
        startQuiz()
    }

    function reset() {
        let date = new Date()
        hour = date.getHours()
        month = date.getMonth() + 1
        quizInProgress = false
    }

    onMount(async () => {
        window.addEventListener("contextmenu", function (e) {
            e.preventDefault()
        })

        navigator.geolocation.getCurrentPosition(function (position) {
            lat = position.coords.latitude
            lng = position.coords.longitude
            startQuiz()
        })
    })
</script>

<main>
    <div id="level-select">
        <div id="top-row">
            <input type="range" bind:value={level} min="0" max="5" step="1" />
            <span class="big">Level {level}: {levels[level].name}</span>
            <div class="filler" />
            <span
                >You have <span class="big">{Math.round(points)}</span>
                points. You need {levels[level + 1].requiredPoints} to unlock the
                next level.</span
            >
        </div>
        <div>{levels[level].description}</div>
    </div>
    <div id="content">
        {#if level == 0}
            <CheatSheet />
        {:else}
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
                                latitude={lat}
                                longitude={lng}
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
                                latitude={lat}
                                longitude={lng}
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
                {#if points >= levels[level + 1].requiredPoints}
                    <div>You have unlocked the next level!</div>
                    <button on:click={nextLevel}>Next level</button>
                {/if}
            </div>
            <div id="photo">
                {#if quiz?.image}
                    <img src={quiz.image} /><br />
                {/if}
            </div>
        {/if}
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }
    #level-select {
        background: #eee;
        padding: 1rem;
    }
    #top-row {
        display: flex;
    }
    .filler {
        flex-grow: 1;
    }
    #content {
        display: flex;
        flex-grow: 1;
    }
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
    input[type="range"] {
        width: 18rem;
    }
    img {
        max-width: 100%;
        max-height: 100%;
    }
    .big {
        font-size: 150%;
    }
    svg {
        touch-action: none;
    }
    .transparent {
        opacity: 10%;
    }
    * {
        user-select: none;
    }
</style>
