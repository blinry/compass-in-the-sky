<script>
    import {onMount} from "svelte"
    import Compass from "./Compass.svelte"
    import TimePicker from "./TimePicker.svelte"
    import Map from "./Map.svelte"
    import Space from "./Space.svelte"
    import {newQuiz} from "./sun.js"

    let chapters = ["motivation", "setup", "3d", "time", "date", "quiz1"]
    let chapter = chapters[4]

    let date = new Date()

    let latitude = 0
    let longitude = 0

    let northAngle = 0

    let myNorthAngle = 0

    let quiz
    let showSolution = false

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
        sunAngle = northAngle + quiz.sunAngle + Math.PI
        mySunAngle = 0
    }
</script>

<main>
    <div id="header">header</div>
    <div id="nav">
        <button on:click={prevChapter}>&lt;</button>
        <span>{chapter}</span>
        <button on:click={nextChapter}>&gt;</button>
    </div>
    <div id="content">
        {#if chapter === "motivation"}
            <p>Imagine you're lost in the woods.</p>
            <p>
                You know that to the North is a big city, but which direction is
                that?
            </p>
            <p>
                This site will teach you how to find North using the sun. Even
                if you have a map, it's a useful skill to give you a better
                intuition for how to get where you want to go!
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
        {:else if chapter === "quiz1"}
            <button on:click={() => myNewQuiz()}>New</button>
            <button on:click={() => (showSolution = true)}>Show solution</button
            >
        {/if}
    </div>
    <div id="sliders">
        {#if chapter == "time" || chapter == "date" || chapter === "quiz1"}
            <TimePicker bind:date hideYear={chapter == "time"} />
        {/if}
        {latitude.toFixed(2)}
        {longitude.toFixed(2)}
        <br />
        {date.toISOString()}
    </div>
    <div id="big">
        {#if chapter == "motivation"}
            <img src="forest.jpg" />
        {:else if chapter == "setup"}
            <Map bind:latitude bind:longitude />
        {:else if chapter == "3d"}
            <Space {latitude} {longitude} />
        {:else if chapter == "time" || chapter === "date"}
            <Compass {latitude} {longitude} {date} tilt="0" />
        {:else if chapter == "quiz1"}
            <img
                src={quiz?.image}
                style="width: 100%; height: 100%; object-fit: cover;"
            />
            <div id="compass">
                <Compass
                    {latitude}
                    {longitude}
                    {date}
                    {myNorthAngle}
                    sunInteractive={true}
                    northInteractive={true}
                    resetSun={true}
                    showHints={false}
                />
                {#if showSolution}
                    <Compass
                        {latitude}
                        {longitude}
                        {date}
                        {northAngle}
                        sunInteractive={false}
                        northInteractive={false}
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
