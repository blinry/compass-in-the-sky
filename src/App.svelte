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
    let titles = [
        "What you will learn",
        "Where are you?",
        "Where is the sun?",
        "The sun's path",
        "Where is north?",
        "The full year",
        "Cheat sheet",
        "Practice the year",
        "Final skill",
        "Congratulations!",
    ]
    let chapter = chapters[0]

    let goodCount = {quiz0: 0, quiz1: 0, quiz2: 0, quiz3: 0}

    function findPosition() {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude
            longitude = position.coords.longitude
        })
    }

    function testTask(task) {
        // Once true, always true.
        if (task.done == true) {
            return true
        }
        if (task.test) {
            task.done = true
            return true
        } else {
            return false
        }
    }

    let initialDate = new Date()
    let date = new Date(initialDate.getTime())
    let hour = 15

    let initialLatitude = 40.7128
    let initialLongitude = -74.006
    let latitude = initialLatitude
    let longitude = initialLongitude

    let northAngle = 0

    let myNorthAngle = 0
    let mySunAngle = 0
    let direction = "N"

    let quiz
    let showSolution = false
    let feedback = ""

    let tasks = {}

    let locationTask = {}
    locationTask.text =
        'Set your location, either by clicking on the map or by using "Find my position". You can always change this later.'
    $: {
        locationTask.test =
            latitude !== initialLatitude || longitude !== initialLongitude
        tasks = tasks // -.-
    }

    tasks["setup"] = [locationTask]

    let sunDragTask = {}
    sunDragTask.text =
        "Drag the sun in the diagram to match the photo. For example, if you think the sun is behind you, drag the yellow icon to the bottom. You can <b>also use you arrow keys!</b>"

    $: {
        sunDragTask.test = mySunAngle !== 0
        tasks = tasks
    }

    let submitTask = {}
    submitTask.text =
        'Click on "Submit guess" to show the correct answer. <b>You can also press the space key.</b>'
    $: {
        submitTask.test = showSolution
        tasks = tasks
    }

    let quiz0Task = {}
    quiz0Task.text =
        "Get a rating of 🤯 or 😎 2 times, or until you think you've figured it out!"
    $: {
        quiz0Task.test = goodCount.quiz0 >= 2
        tasks = tasks
    }

    tasks["quiz0"] = [sunDragTask, submitTask, quiz0Task]

    let eightTask = {}
    eightTask.text = "Where is the sun in the morning, at 8:00?"
    $: {
        eightTask.test = Math.abs(hour - 8) < 0.1
        tasks = tasks
    }

    let noonTask = {}
    noonTask.text = "Where is the sun at 12:00 (noon)?"
    $: {
        noonTask.test = Math.abs(hour - 12) < 0.1
        tasks = tasks
    }

    let eighteenTask = {}
    eighteenTask.text = "Where is the sun in the evening, at 18:00 (6pm)?"
    $: {
        eighteenTask.test = Math.abs(hour - 18) < 0.1
        tasks = tasks
    }

    let midnightTask = {}
    midnightTask.text =
        "And where would the sun be at midnight? The numbers in the diagram tell you at which hours the sun is up!"
    $: {
        midnightTask.test = Math.abs((hour - 0) % 24) < 0.1
        tasks = tasks
    }

    tasks["time"] = [eightTask, noonTask, eighteenTask, midnightTask]

    let sunDragTask1 = {}
    sunDragTask1.text =
        "Drag the sun in the diagram so that it aligns with the photo."
    $: {
        sunDragTask1.test = mySunAngle !== 0
        tasks = tasks
    }

    let northDragTask1 = {}
    northDragTask1.text =
        "Drag the compass directions so that it aligns with the sun at the time displayed above. For example, in the morning, the sun is usually in the east!"
    $: {
        northDragTask1.test = myNorthAngle !== 0
        tasks = tasks
    }

    let submitTask1 = {}
    submitTask1.text = 'Click on "Submit guess" to show the correct answer'
    $: {
        submitTask1.test = showSolution
        tasks = tasks
    }

    let quiz1Task = {}
    quiz1Task.text =
        "Get a rating of 🤯 or 😎 2 times, or until you think you've figured it out!"
    $: {
        quiz1Task.test = goodCount.quiz1 >= 2
        tasks = tasks
    }

    tasks["quiz1"] = [sunDragTask1, northDragTask1, submitTask1, quiz1Task]

    let springTask = {}
    springTask.text = "In March?"
    $: {
        springTask.test = date.getMonth() == 2
        tasks = tasks
    }

    let summerTask = {}
    summerTask.text = "In June?"
    $: {
        summerTask.test = date.getMonth() == 5
        tasks = tasks
    }

    let autumnTask = {}
    autumnTask.text = "In September?"
    $: {
        autumnTask.test = date.getMonth() == 8
        tasks = tasks
    }

    let winterTask = {}
    winterTask.text = "In December?"
    $: {
        winterTask.test = date.getMonth() == 11
        tasks = tasks
    }

    tasks["date"] = [springTask, summerTask, autumnTask, winterTask]

    let quiz2Task = {}
    quiz2Task.text =
        "Get a rating of 🤯 or 😎 2 times, or until you think you've figured it out!"
    $: {
        quiz2Task.test = goodCount.quiz2 >= 2
        tasks = tasks
    }

    tasks["quiz2"] = [quiz2Task]

    let quiz3Task = {}
    quiz3Task.text =
        "Get a rating of 🤯 or 😎 2 times! One you've figured this out, I have nothing more to teach you!"
    $: {
        quiz3Task.test = goodCount.quiz3 >= 2
        tasks = tasks
    }

    tasks["quiz3"] = [quiz3Task]

    function nextChapter() {
        chapter = chapters[(chapters.indexOf(chapter) + 1) % chapters.length]
        showSolution = false
        feedback = ""
    }

    function prevChapter() {
        chapter =
            chapters[
                (chapters.indexOf(chapter) + chapters.length - 1) %
                    chapters.length
            ]
        showSolution = false
        feedback = ""
    }

    onMount(async () => {
        //findPosition()
    })

    async function myNewQuiz(simple = false) {
        showSolution = false
        feedback = ""
        quiz = undefined
        if (simple) {
            quiz = await newQuiz(latitude, longitude, date)
        } else {
            quiz = await newQuiz(latitude, longitude)
        }
        date = quiz.date
        northAngle = quiz.northAngle

        mySunAngle = 0

        const directions = ["N", "E", "S", "W"]
        direction = directions[Math.floor(Math.random() * directions.length)]
    }

    $: {
        if (typeof quiz == "undefined") {
            if (chapter == "quiz1") {
                myNewQuiz(true)
            }
            if (
                chapter == "quiz0" ||
                chapter == "quiz2" ||
                chapter == "quiz3"
            ) {
                myNewQuiz()
            }
        }
        if (chapter == "time") {
            let currentMonth = new Date().getMonth()
            if (date.getMonth() != currentMonth) {
                initialDate = new Date()
                date = new Date(initialDate.getTime())
            }
        }
    }

    function spacePressed() {
        if (showSolution || typeof quiz == "undefined") {
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

            if (angleDiff <= 45) {
                goodCount[chapter] += 1
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
        <img src="logo.svg" />
        <div id="subtitle">A Game of Solar Orientation</div>
    </div>
    <div id="nav">
        <progress value={chapters.indexOf(chapter)} max={chapters.length - 1} />
        <div id="navstuff">
            {#if chapter != chapters[0]}
                <button on:click={prevChapter}>❮</button>
            {/if}
            <span><b>{titles[chapters.indexOf(chapter)]}</b></span>
            {#if chapter != chapters[chapters.length - 1]}
                <button
                    on:click={nextChapter}
                    class:highlighted={typeof tasks[chapter] === "undefined" ||
                        tasks[chapter].filter((task) => !testTask(task))
                            .length == 0}>❯</button
                >
            {/if}
        </div>
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
            <p>Click the arrow above to get started!</p>
            <hr />
            <p>
                If you know the technique, and would like to practice, click
                here:
            </p>
            <button
                on:click={() => {
                    findPosition()
                    chapter = "quiz3"
                }}>Jump to training</button
            >
        {:else if chapter === "setup"}
            <p>
                The technique I'll teach you depends on <b
                    >where on Earth you are</b
                >.
            </p>
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
                Well done! If you know what time it is, you can use the sun's
                position to find the compass direction!
            </p>
            <p>
                Here's a diagram of how the sun moves over the sky today. <b
                    >Drag the time slider above</b
                > to see it move!
            </p>
            <p>Familiarize yourself with this pattern:</p>
        {:else if chapter === "date"}
            <p>
                So far, we've only looked at the current month. But <b
                    >depending on the time of year, the pattern you've seen will
                    change</b
                >! There's a new slider above, which you can use to set the
                date!
            </p>
            <p>
                Does your country have daylight savings time? If so, you'll
                notice a sudden jump when daylight savings time starts and ends.
                Try to find it!
            </p>
            <p>What does the diagram look like:</p>
        {:else if chapter === "cheatsheet"}
            <p>
                To keep things simple, focus on this cheat sheet, which shows
                three diagrams:
            </p>
            <ul>
                <li>
                    <b>June</b> ("Summer" in the northern hemisphere)
                </li>
                <li>
                    <b>March and September</b>: The path is very similar, so
                    here I've combined them into one diagram
                </li>
                <li>
                    <b>December</b> ("Winter" in the northern hemisphere)
                </li>
            </ul>
            <p>Try to roughly memorize how the angles change over the year!</p>
        {:else if chapter === "quiz0"}
            <p>
                The first skill that you need is to figure out <b
                    >in which direction the sun is</b
                >.
            </p>
            <p>
                Sometimes, this can be tricky. Do your best! If the sky is
                cloudy, you often can guess the sun's position by the bright
                side of a tree or building!
            </p>
        {:else if chapter === "quiz1"}
            <p>
                The second skill is to <b
                    >align the compass directions with the sun</b
                >, depending on the time.
            </p>

            <p>All photos were taken in your current month!</p>
        {:else if chapter === "quiz2"}
            <p>
                To practice this, I will now show you photos <b
                    >from all over the year</b
                >! Again, drag the sun and the compass, and try to get a feeling
                of how the angles change depending on the date.
            </p>
        {:else if chapter === "quiz3"}
            <p>
                The fourth and final skill is to <b>do it all in your head</b>!
            </p>
            <p>
                When you want to use this technique in the real world, you won't
                have handy diagrams to guide you, so this is the ultimate test
                of your abilities!
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
                Look at the photo, and try to <b
                    >figure out where {direction} is</b
                >! Then, drag the compass or use your arrow keys. Press space to
                show the solution.
            </p>
        {:else if chapter === "yay"}
            <p>You did it! You learned a new skill!</p>
            <p>
                I'd love to get your feedback on this tool! <b
                    ><a
                        href="https://docs.google.com/forms/d/e/1FAIpQLScDaWpryKoinLP0eKOR660HDNvBgvmv6Sbo4k5hNzXDoJ2MoA/viewform"
                        >Click here to open a feedback form!</a
                    ></b
                >
            </p>
            <p>
                This project is open source! You can find the source code <a
                    href="https://github.com/blinry/compass-in-the-sky">here</a
                >.
            </p>
            <p>
                When you look around you right now, can you tell the sun's
                direction? Can you use this technique to figure out which
                direction you're facing currently?
            </p>
            <p>
                If you'd like to <b>practice this skill later</b>, theres'a
                button on the start page that leads directly to the last quiz!
            </p>
            <p>If you liked this project, you can:</p>
            <ul>
                <li>
                    Subscribe to <a href="https://tinyletter.com/blinry"
                        >my newsletter</a
                    >
                </li>
                <li>
                    Follow me in <a href="https://chaos.social/@blinry"
                        >the fediverse</a
                    >
                </li>
                <li>
                    Try other games on <a href="https://blinry.org"
                        >my website</a
                    >
                </li>
                <li>
                    Join my supporters <a href="https://patreon.com/blinry"
                        >on Patreon</a
                    >
                </li>
            </ul>
            <p>Thanks,<br />blinry</p>
        {/if}

        {#if typeof tasks[chapter] !== "undefined"}
            <ul class="checklist">
                {#each tasks[chapter] as task}
                    <li>
                        {#if testTask(task)}
                            ☑️
                        {:else}
                            ☐
                        {/if}
                        {@html task.text}
                    </li>
                {/each}
            </ul>
        {/if}

        {#if chapter === "quiz0" || chapter === "quiz1" || chapter === "quiz2" || chapter === "quiz3"}
            <p>
                <button on:click={spacePressed}>
                    {#if showSolution || typeof quiz === "undefined"}
                        New photo
                    {:else}
                        Submit guess
                    {/if}
                </button>
            </p>

            <p><b>{feedback}</b></p>
        {/if}
    </div>
    {#if chapter != "motivation" && chapter != "setup" && chapter != "yay"}
        <div id="cheatsheet">
            <Map bind:latitude bind:longitude />
        </div>
    {/if}
    <div id="big">
        {#if chapter === "time" || chapter == "date" || chapter == "cheatsheet"}
            <TimePicker
                bind:date
                {latitude}
                {longitude}
                hideYear={chapter == "time" ||
                    chapter == "quiz1" ||
                    chapter == "cheatsheet"}
                disabled={chapter == "quiz0" ||
                    chapter == "quiz1" ||
                    chapter == "quiz2" ||
                    chapter == "quiz3"}
                bind:hour
            />
        {/if}

        {#if chapter === "quiz1" || chapter === "quiz2" || chapter === "quiz3"}
            <div id="metadata">
                <TimePicker
                    bind:date
                    {latitude}
                    {longitude}
                    hideYear={chapter == "time" ||
                        chapter == "quiz1" ||
                        chapter == "cheatsheet"}
                    disabled={chapter == "quiz0" ||
                        chapter == "quiz1" ||
                        chapter == "quiz2" ||
                        chapter == "quiz3"}
                    bind:hour
                />
            </div>
        {/if}

        {#if chapter == "motivation" || chapter == "yay"}
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
                {#if quiz?.image}
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
                        onlyLabel={chapter === "quiz3" ? direction : null}
                        label="Your guess"
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
                        label="Solution"
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
        grid-template-rows: 5.5rem 4rem 3fr 10rem;
        grid-template-areas:
            "header big"
            "nav big"
            "content big"
            "cheatsheet big";
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
    #header img {
        width: 100%;
    }
    #nav {
        grid-area: nav;
        background-color: #eee;
    }
    #nav progress {
        width: calc(100% - 1rem);
        margin: 0 0.5rem 0.2rem 0.5rem;
    }
    #navstuff {
        display: flex;
    }
    #nav span {
        flex: 1;
        padding: 0.5rem;
        text-align: center;
        font-size: 110%;
    }
    #nav button {
        border: none;
        cursor: pointer;
    }
    #nav button:hover {
        background-color: #ddd;
    }
    #nav button.highlighted {
        background: green;
        color: white;
    }
    #nav button.highlighted:hover {
        background: darkgreen;
        color: white;
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
    #compass {
        position: absolute;
        bottom: -4rem;
        left: 3rem;
    }
    #cheatsheet {
        grid-area: cheatsheet;
        background-color: #eee;
    }
    .checklist {
        list-style-type: none;
    }
    #subtitle {
        font-size: 80%;
        color: #666;
    }
    #metadata {
        position: absolute;
        top: 3rem;
        left: 3rem;
        padding: 1rem;
        color: black;
        text-shadow: 0 0 0.5rem white;
    }
</style>
