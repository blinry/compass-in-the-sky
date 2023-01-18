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
        //"3d",
        "time",
        "quiz1",
        "date",
        "cheatsheet",
        "quiz2",
        "quiz3",
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
    let feedback = ""

    $: {
        if (typeof quiz == "undefined") {
            if (chapter == "quiz1") {
                myNewQuiz(true)
            }
            if (chapter == "quiz0" || chapter == "quiz3") {
                myNewQuiz()
            }
        }
        if (chapter == "time") {
            date = new Date()
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
        findPosition()
    })

    async function myNewQuiz(simple = false) {
        showSolution = false
        feedback = ""
        if (simple) {
            quiz = await newQuiz(latitude, longitude, date)
        } else {
            quiz = await newQuiz(latitude, longitude)
        }
        console.log(quiz)
        date = quiz.date
        northAngle = quiz.northAngle

        mySunAngle = 0

        const directions = ["N", "E", "S", "W"]
        direction = directions[Math.floor(Math.random() * directions.length)]
        console.log(direction)
    }

    function spacePressed() {
        if (showSolution) {
            myNewQuiz()
        } else {
            showSolution = true
            let myAngle
            let correctAngle
            let what
            if (chapter == "quiz0") {
                myAngle = mySunAngle
                correctAngle = quiz.sunAngle
                what = "sun direction"
            } else if (
                chapter == "quiz1" ||
                chapter == "quiz2" ||
                chapter == "quiz3"
            ) {
                myAngle = myNorthAngle
                correctAngle = quiz.northAngle
                what = "compass direction"
            }
            console.log("myAngle", myAngle)
            console.log("correctAngle", correctAngle)
            let angleDiff =
                (Math.abs(myAngle - correctAngle) / (2 * Math.PI)) * 360
            angleDiff = angleDiff % 360
            angleDiff = Math.min(angleDiff, 360 - angleDiff)
            angleDiff = Math.round(angleDiff)

            let ratings = [
                [10, "🤯"],
                [45, "😎"],
                [90, "🙂"],
                [130, "😐"],
                [160, "😕"],
                [180, "😡"],
            ]
            feedback = `Your ${what} was off by ${angleDiff} degrees.`
            for (let i = 0; i < ratings.length; i++) {
                if (angleDiff < ratings[i][0]) {
                    feedback += " " + ratings[i][1]
                    break
                }
            }
        }
    }

    var keyIsDown = {}
    function keyUp(e) {
        keyIsDown[e.key] = false
    }
    function keyDown(e) {
        keyIsDown[e.key] = true
        if (e.key == " ") {
            if (
                chapter == "quiz0" ||
                chapter == "quiz1" ||
                chapter == "quiz2" ||
                chapter == "quiz3"
            ) {
                e.preventDefault()
                spacePressed()
                return
            }
        }

        const circle = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"]
        const directions = {
            ArrowUp: 0,
            ArrowRight: Math.PI / 2,
            ArrowDown: Math.PI,
            ArrowLeft: (3 * Math.PI) / 2,
        }

        if (typeof directions[e.key] !== "undefined") {
            e.preventDefault()
            // Check neighboring directions and set direction diagonally, if necessary.
            var angle
            if (keyIsDown[circle[(circle.indexOf(e.key) + 1) % 4]]) {
                angle = directions[e.key] + Math.PI / 4
            } else if (keyIsDown[circle[(circle.indexOf(e.key) + 3) % 4]]) {
                angle = directions[e.key] - Math.PI / 4
            } else {
                angle = directions[e.key]
            }

            if (chapter === "quiz0") {
                mySunAngle = angle
            } else if (chapter === "quiz3") {
                const offsets = {
                    N: 0,
                    W: Math.PI / 2,
                    S: Math.PI,
                    E: (3 * Math.PI) / 2,
                }
                myNorthAngle = angle + offsets[direction]
            }
        }
    }
</script>

<svelte:body on:keydown={keyDown} on:keyup={keyUp} />

<main>
    <div id="header" on:click={() => (chapter = "motivation")}>
        The Solar Compass ☀️
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
                You know that to the north is a big city, but which direction is
                that?
            </p>
            <p>
                This site will teach you <b
                    >find the compass directions using the sun</b
                >. You will get an intuitive sense on where to go, without
                having to rely on maps or your phone!
            </p>
        {:else if chapter === "setup"}
            <p>
                The technique I'm about to teach you depends on where on Earth
                you are. I've already asked your browser to give me an
                estimation.
            </p>

            <p>
                Does this seem right? You can also <b
                    >set a position by clicking on the map</b
                >. This doesn't need to be precise.
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
                Here's a diagram of how the sun moves over the sky today. Drag
                the time slider below to see it move!
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
                Here's a trick to make you more precise: Depending on the time
                of year, the pattern you've seen will change! There's a new
                slider below, which you can use to set the date! Try it!
            </p>
            <p>
                No matter where on Earth you are, the sun will always rise
                approximately in the east and set in the west. Around noon, the
                sun might be in the north, in the south, or overhead.
            </p>
            <p>
                Does your country have daylight savings time? If so, you'll
                notice a sudden jump when daylight savings time starts and ends.
                Try to find it!
            </p>
            <p>
                No need to memorize all of this, we've prepared a handy cheat
                sheet for you in the next section!
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
            <p>Try to roughly memorize how the angles change over the year!</p>
        {:else if chapter === "quiz0"}
            <p>
                The first skill that you need is to figure out in which
                direction the sun is.
            </p>
            <p>
                Look at the photo, and then
                <b>drag the sun in the diagram to match the photo</b>. You can
                also use your arrow keys. For example, if you think the sun is
                behind you, drag the yellow icon to the bottom.
            </p>
            <p>
                Sometimes, this can be tricky. Give it a try nevertheless! If
                the sky is cloudy, you often can guess the sun's position by the
                brightest side of a tree or building!
            </p>
        {:else if chapter === "quiz1"}
            <p>
                The second skill is to align the compass directions with the
                sun, depending on the time.
            </p>
            <ol>
                <li>
                    Drag the sun in the diagram so that it aligns with the
                    photo.
                </li>
                <li>
                    Drag the compass directions so that it aligns with the sun
                    at the specified time. For example, in the morning, the sun
                    is often in the east!
                </li>
            </ol>
            <p>All photos were taken this month.</p>
        {:else if chapter === "quiz2"}
            <p>
                To practice this, we will now give you photos from all over the
                year! Again, drag the sun and the compass, and learn to get a
                feeling of how the angles change depending on the date.
            </p>
        {:else if chapter === "quiz3"}
            <p>The fourth and final skill is to do it all in your head!</p>
            <p>
                When you want to use the sun compass in the real world, you
                won't have handy diagrams to guide you, so this is the ultimate
                test of your abilities!
            </p>
            <!--<p>Here's how to do it:</p>
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
            -->
            <p>
                Look at the photo, and try to figure out where {direction} is! Then,
                drag the compass or use your arrow keys. Press space to show the
                solution.
            </p>
        {:else if chapter === "yay"}
            <p>You did it! You learned a new skill!</p>
            <p>
                When you look around you right now, can you tell the sun's
                direction? Can you use this technique to figure out which
                direction you're facing currently?
            </p>
            <p>
                If you'd like to drill this skill later, come back to the last
                quiz and train it a bit more!
            </p>
            <p>Congrats again!</p>
        {/if}

        {#if chapter === "quiz0" || chapter === "quiz1" || chapter === "quiz2" || chapter === "quiz3"}
            <button on:click={spacePressed}>
                {#if showSolution}
                    New photo
                {:else}
                    Show solution
                {/if}
                (Space)
            </button>
            <br />
            <b>{feedback}</b>
        {/if}
    </div>
    <div id="sliders">
        {#if chapter == "time" || chapter == "date" || chapter == "cheatsheet" || chapter === "quiz1" || chapter === "quiz2" || chapter === "quiz3"}
            <TimePicker
                bind:date
                hideYear={chapter == "time" ||
                    chapter == "quiz1" ||
                    chapter == "cheatsheet"}
                disabled={chapter == "quiz0" ||
                    chapter == "quiz1" ||
                    chapter == "quiz2" ||
                    chapter == "quiz3"}
            />
        {/if}
        {#if chapter != "motivation" && chapter != "setup"}
            <Map bind:latitude bind:longitude />
        {/if}
        <div>
            Debug info:
            {latitude}
            {longitude}
            <br />
            {date.toISOString()}
        </div>
    </div>
    <div id="big">
        {#if chapter == "motivation"}
            <div
                class="fullscreen"
                style="background-image: url(forest.jpg); background-size: cover; background-position: center center; width: 100%; height: 100%"
            />
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
        {:else if chapter == "quiz0" || chapter == "quiz1" || chapter === "quiz2" || chapter === "quiz3"}
            <img
                src={quiz?.image}
                style="width: 100%; height: 100%; object-fit: cover;"
            />
            <div id="compass">
                <Compass
                    {latitude}
                    {longitude}
                    {date}
                    bind:sunAngle={mySunAngle}
                    bind:northAngle={myNorthAngle}
                    northInteractive={true}
                    resetSun={true}
                    showHints={false}
                    tilt={60}
                    showDirections={chapter != "quiz0"}
                    showSun={chapter != "quiz3"}
                />
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
        background-color: #ccc;
        padding: 0.5rem;
        font-size: 150%;
        cursor: pointer;
    }
    #nav {
        grid-area: nav;
        background-color: #eee;
        display: flex;
    }
    #nav span {
        flex: 1;
        padding: 0.5rem;
        text-align: center;
    }
    #nav button {
        width: 3rem;
        height: 3rem;
    }
    #content {
        grid-area: content;
        padding: 1rem;
        overflow-y: auto;
    }
    #content p {
        margin-bottom: 1rem;
    }
    #big {
        grid-area: big;
        background-color: #eee;
        position: relative;
    }
    #sliders {
        grid-area: sliders;
        background-color: #eee;
        padding: 1rem;
    }
    #compass {
        /* position bottom center of parent */
        position: absolute;
        bottom: 0;
        left: 0;
    }
</style>
