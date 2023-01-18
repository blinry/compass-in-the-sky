<script>
    import {onMount} from "svelte"
    import Compass from "./Compass.svelte"
    import TimePicker from "./TimePicker.svelte"
    import Map from "./Map.svelte"
    import Space from "./Space.svelte"
    import CheatSheet from "./CheatSheet.svelte"
    import {newQuiz} from "./sun.js"

    let chapters = [
        "motivation",
        "setup",
        "quiz0",
        "3d",
        "time",
        "date",
        "cheatsheet",
        "quiz1",
        "quiz2",
        "yay",
    ]
    let chapter = chapters[0]

    let date = new Date()

    let latitude = 0
    let longitude = 0

    let northAngle = 0

    let myNorthAngle = 0
    let mySunAngle = 0
    let direction = "N"

    let quiz
    let showSolution = false

    $: {
        if (chapter == "quiz0" || chapter == "quiz1" || chapter == "quiz2") {
            if (typeof quiz == "undefined") {
                myNewQuiz()
            }
        }
    }

    function nextChapter() {
        chapter = chapters[(chapters.indexOf(chapter) + 1) % chapters.length]
    }

    function prevChapter() {
        chapter =
            chapters[
                (chapters.indexOf(chapter) + chapters.length - 1) %
                    chapters.length
            ]
    }

    function findPosition() {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude
            longitude = position.coords.longitude
        })
    }

    onMount(async () => {
        /*window.addEventListener("contextmenu", function (e) {
            e.preventDefault()
        })*/
        findPosition()
        //myNewQuiz()
    })

    async function myNewQuiz() {
        showSolution = false
        quiz = await newQuiz(latitude, longitude)
        console.log(quiz)
        date = quiz.date
        northAngle = quiz.northAngle

        mySunAngle = 0

        const directions = ["N", "E", "S", "W"]
        direction = directions[Math.floor(Math.random() * directions.length)]
        console.log(direction)
    }

    function keyDown(e) {
        console.log(e.key)
        if (e.key == " ") {
            if (
                chapter == "quiz0" ||
                chapter == "quiz1" ||
                chapter == "quiz2"
            ) {
                e.preventDefault()
                myNewQuiz()
                return
            }
        }

        if (chapter === "quiz0") {
            const directions = {
                ArrowUp: 0,
                ArrowRight: Math.PI / 2,
                ArrowDown: Math.PI,
                ArrowLeft: (3 * Math.PI) / 2,
            }
            if (typeof directions[e.key] !== "undefined") {
                mySunAngle = directions[e.key]
                showSolution = true
            }
        }

        /*if (chapter === "quiz1") {
            const directions = {
                ArrowUp: 0,
                ArrowRight: Math.PI / 2,
                ArrowDown: Math.PI,
                ArrowLeft: (3 * Math.PI) / 2,
            }
            if (typeof directions[e.key] !== "undefined") {
                myNorthAngle = directions[e.key] + Math.PI
                showSolution = true
            }
        }*/

        if (chapter === "quiz2") {
            const directions = {
                ArrowUp: 0,
                ArrowRight: Math.PI / 2,
                ArrowDown: Math.PI,
                ArrowLeft: (3 * Math.PI) / 2,
            }
            if (typeof directions[e.key] !== "undefined") {
                const offsets = {
                    N: 0,
                    W: Math.PI / 2,
                    S: Math.PI,
                    E: (3 * Math.PI) / 2,
                }
                myNorthAngle = directions[e.key] + offsets[direction]
                showSolution = true
            }
        }
    }
</script>

<svelte:window on:keydown={keyDown} />

<main>
    <div id="header" on:click={() => (chapter = "motivation")}>
        The Solar Compass
    </div>
    <div id="nav">
        {#if chapter != chapters[0]}
            <button on:click={prevChapter}>&lt;</button>
        {/if}
        <span>{chapter}</span>
        {#if chapter != chapters[chapters.length - 1]}
            <button on:click={nextChapter}>&gt;</button>
        {/if}
    </div>
    <div id="content">
        {#if chapter === "motivation"}
            <p>Imagine you're lost in the woods. 🌲</p>
            <p>
                You know that to the North is a big city, but which direction is
                that?
            </p>
            <p>
                This site will teach you <b>how to find North using the sun</b>.
                Even though you can look that up on your smartphone, it's a
                useful skill to give you a better intuition for where to go!
            </p>
        {:else if chapter === "setup"}
            <p>
                The sun moves differently over the sky depending on where on the
                planet you are. Set your position by clicking on the map, or use
                the "find my position" button to see whether your browser can
                give us a good estimation. This doesn't need to be precise.
            </p>
            <button on:click={findPosition}>Find my position</button>
        {:else if chapter === "3d"}
            <p>
                The earth rotates around itself every 24 hours. In addition, the
                earth is orbiting the sun every year. Because the earth's axis
                is slightly tilted, the sun falls on your location from
                different directions depending on the time of day and the month
                of the year.
            </p>
        {:else if chapter === "time"}
            <p>
                Here's a diagram of how the sun moves over the sky during the
                day. Drag the time slider below to see it move!
            </p>
            <p>
                The numbers in the diagram tell you where the sun is at that
                hour. You only see the hours where the sun is in the sky – we
                can't use this technique at night.
            </p>
            <p>
                This is a pattern you need to familiarize yourself with. Take
                some time to memorize it: where is the sun in the morning? In
                the evening? At noon?
            </p>
        {:else if chapter === "date"}
            <p>
                Depending on the time of year, this pattern will change. There's
                a new slider below, which you can use to set the date! Try it!
            </p>
            <p>
                No matter where on Earth you are, the sun will always rise
                approximately in the East and set in the West. Around noon, the
                sun might be in the North, in the South, or overhead.
            </p>
            <p>
                Does your country have daylight savings time? If so, you'll
                notice a sudden jump when daylight savings time starts and ends.
                Try to find it!
            </p>
        {:else if chapter === "cheatsheet"}
            <p>
                To keep things simple, focus on this cheat sheet, which shows
                three diagrams:
            </p>
            <ul>
                <li>
                    The sun's path in <b>June</b> ("Summer" in the northern hemisphere)
                </li>
                <li>
                    The sun's path in <b>April and September</b> is very similar,
                    so here we've combined them into one diagram
                </li>
                <li>
                    The sun's path in <b>December</b> ("Winter" in the northern hemisphere)
                </li>
            </ul>
        {:else if chapter === "quiz0"}
            <p>
                Let's immediately start with some practice! The first skill that
                you need is to figure out in which direction the sun is.
            </p>
            <p>
                Look at the photo, and then use your arrow keys to guess the
                direction of the sun. For example, if you think the sun is
                behind you in the photo, press the down arrow.
            </p>
            <p>
                Sometimes, this can be tricky. Do your best! If the sky is
                cloudy, sometimes you can guess the sun's position by what side
                of a tree, lamppost or building is brightest!
            </p>
        {:else if chapter === "quiz1"}
            <p>
                The second skill is to align the compass directions with the
                sun, depending on the time.
            </p>
            <ol>
                <li>
                    First, drag the sun in the diagram so that it aligns with
                    the photo.
                </li>
                <li>
                    And second, drag the compass directions so that it aligns
                    with the sun at the specified time.
                </li>
            </ol>
        {:else if chapter === "quiz2"}
            <p>The third and final skill is to do it all in your head!</p>
            <p>
                When you want to use the sun compass in the real world, you
                won't have handy diagrams to guide you, so this is the ultimate
                test of your abilities!
            </p>
            <p>Here's how to do it:</p>
            <ol>
                <li>
                    Check where the sun is in the sky, and remember that
                    direction.
                </li>
                <li>
                    Check the current time and imagine the north-south axis
                    relative to the sun.
                </li>
                <li>
                    Imagine you want to do <b>{direction}</b>! Where is that
                    direction, relative to the way you're facing? Press the
                    corresponding arrow key!
                </li>
            </ol>
        {:else if chapter === "yay"}
            <p>You did it! You learned a new skill!</p>
            <p>
                When you look around you, can you tell the sun's direction? Can
                you use this technique to figure out which direction you're
                facing currently?
            </p>
            <p>
                If you'd like to drill this skill later, come back to the last
                quiz and train it a bit more!
            </p>
        {/if}

        {#if chapter === "quiz0" || chapter === "quiz1" || chapter === "quiz2"}
            <button on:click={() => myNewQuiz()}>New (Space)</button>
            {#if chapter !== "quiz2"}
                <button on:click={() => (showSolution = true)}
                    >Show solution</button
                >
            {/if}
        {/if}
    </div>
    <div id="sliders">
        {#if chapter == "time" || chapter == "date" || chapter == "cheatsheet" || chapter === "quiz1" || chapter === "quiz2"}
            <TimePicker
                bind:date
                hideYear={chapter == "time" || chapter == "cheatsheet"}
                disabled={chapter == "quiz0" ||
                    chapter == "quiz1" ||
                    chapter == "quiz2"}
            />
        {/if}
        {#if chapter != "motivation" && chapter != "setup"}
            <Map bind:latitude bind:longitude />
        {/if}
        <div>
            {latitude}
            {longitude}
            <br />
            {date.toISOString()}
        </div>
    </div>
    <div id="big">
        {#if chapter == "motivation"}
            <img src="forest.jpg" />
        {:else if chapter == "setup"}
            <Map bind:latitude bind:longitude />
        {:else if chapter == "3d"}
            <Space {latitude} {longitude} />
        {:else if chapter == "time" || chapter === "date"}
            <Compass
                {latitude}
                {longitude}
                {date}
                tilt="0"
                sunInteractive={false}
                northInteractive={false}
            />
        {:else if chapter == "cheatsheet"}
            <CheatSheet {latitude} {longitude} {date} />
        {:else if chapter == "quiz0" || chapter == "quiz1" || chapter === "quiz2"}
            <img
                src={quiz?.image}
                style="width: 100%; height: 100%; object-fit: cover;"
            />
            <div id="compass">
                {#if chapter !== "quiz2" || showSolution}
                    <Compass
                        {latitude}
                        {longitude}
                        {date}
                        bind:sunAngle={mySunAngle}
                        northAngle={myNorthAngle}
                        northInteractive={true}
                        resetSun={true}
                        showHints={false}
                        tilt={60}
                        showDirections={chapter != "quiz0"}
                        showSun={chapter != "quiz2"}
                    />
                {/if}
                {#if showSolution}
                    <Compass
                        {latitude}
                        {longitude}
                        {date}
                        {northAngle}
                        sunInteractive={false}
                        northInteractive={false}
                        tilt={60}
                        showDirections={chapter != "quiz0"}
                    />
                {/if}
            </div>
        {/if}
    </div>
</main>

<style>
    main {
        display: grid;
        grid-template-columns: 20rem 1fr;
        grid-template-rows: 3rem 3rem 3fr 1fr;
        grid-template-areas:
            "header big"
            "nav big"
            "content big"
            "sliders big";
        height: 100vh;
        gap: 5px;
    }
    #header {
        grid-area: header;
        background-color: red;
        padding: 0.5rem;
        font-size: 150%;
        cursor: pointer;
    }
    #nav {
        grid-area: nav;
        background-color: gray;
        display: flex;
    }
    #nav span {
        flex: 1;
        padding: 0.5rem;
        text-align: center;
    }
    #content {
        grid-area: content;
        background-color: yellow;
        padding: 1rem;
        overflow-y: auto;
    }
    #content p {
        margin-bottom: 1rem;
    }
    #big {
        grid-area: big;
        background-color: blue;
        position: relative;
    }
    #sliders {
        grid-area: sliders;
        background-color: green;
        padding: 1rem;
    }
    #compass {
        /* position bottom center of parent */
        position: absolute;
        bottom: 0;
        left: 0;
    }
</style>
