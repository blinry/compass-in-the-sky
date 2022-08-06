<script>
    import {onMount} from "svelte"
    import Compass from "./Compass.svelte"
    import Map from "./Map.svelte"
    import Space from "./Space.svelte"
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

    let latitude = 0
    let longitude = 0
    let timezoneString = "UTC"

    $: timezoneString = findTZ(latitude, longitude)

    let quiz

    let date
    $: {
        date = new Date()
        //date.toLocaleString("en-US", {timeZone: timezoneString})
        date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
        date.setMonth(month - 1)
        //pos = SunCalc.getPosition(date, latitude, longitude)
    }

    /*let northAngle = 0,
        sunAngle = 0
    $: {
        sunAngle = northAngle + quiz.sunAngle + Math.PI
    }*/

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

    function findPosition() {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude
            longitude = position.coords.longitude
            startQuiz()
        })
    }

    onMount(async () => {
        window.addEventListener("contextmenu", function (e) {
            e.preventDefault()
        })
        findPosition()
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
        <div id="intro">
            <Space />
            <p>Imagine you're lost in the woods.</p>
            <img src="forest.jpg" />
            <p>
                You know that to the North is a big city, but which direction is
                that? You'd look it up on your phone, but you threw it away
                earlier to distract a bear!
            </p>
            <p>
                This site will teach you how to find North using the sun. Even
                if you have a map, it's a useful skill to give you a better
                intuition for how to get where you want to go!
            </p>
            <h2>Preparation: Set your position</h2>
            <p>
                The sun moves differently over the sky depending on where on the
                planet you are. Set your rough position by clicking on the map,
                or use the "find my position" button to see whether your browser
                can give us a good estimation. This doesn't need to be precise.
            </p>
            <button on:click={findPosition}>Find my position</button>
            <Map bind:latitude bind:longitude />
            <h2>Lesson 1: How does the sun move in {monthNames[month - 1]}?</h2>
            <p>Try changing the time and see how the sun moves:</p>
            <p>
                <input
                    type="range"
                    bind:value={hour}
                    min="0"
                    max="24"
                    step="0.01"
                />
                <span class="big">
                    {Math.round(hour)}:00
                </span>
            </p>
            <p>
                <Compass {date} {latitude} {longitude} />
            </p>
            <p>
                So roughly, the sun is in the East at XX:00, in the South at
                XX:00, and in the West at XX:00.
            </p>
            <p>
                Depending on the month, this pattern will be a bit different.
                Try changing the month and observe how that affects the diagram
                above.
            </p>
            <p>
                <input
                    type="range"
                    bind:value={month}
                    min="1"
                    max="12"
                    step="1"
                />
                <span class="big">
                    {monthNames[month - 1]}
                </span>
            </p>
            <p>
                Here's some things that might be different! Check all boxes that
                apply:
            </p>
            <p>
                <input type="checkbox" />
                There might be fewer hours where the sun is visible in the winter
            </p>
            <p>
                <input type="checkbox" />
                The angles which the sun can reach might be more spread out in summer
            </p>
            <p>
                <input type="checkbox" />
                Depending on your location, the sun might even be in the North in
                some months, and in the South in others.
            </p>
            <p>
                <input type="checkbox" />
                If your country has daylight savings time, the hours might be shifted
                a bit when daylight savings time is active.
            </p>
        </div>
        <!--
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
                                latitude={latitude}
                                longitude={longitude}
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
                                latitude={latitude}
                                longitude={longitude}
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
        -->
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
        flex-direction: column;
        flex-grow: 1;
    }
    #intro {
        padding: 1rem;
        font-size: 1.2rem;
        line-height: 170%;
    }
    h2 {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    p,
    img {
        margin-bottom: 1rem;
    }
    ul {
        margin-left: 1rem;
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
        max-width: 50%;
        max-height: 50%;
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
