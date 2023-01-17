<script>
    import {onMount} from "svelte"
    import Compass from "./Compass.svelte"
    import TimePicker from "./TimePicker.svelte"
    import {newQuiz} from "./sun.js"

    let chapter = "quiz1"

    let date = new Date()

    let latitude = 53.57
    let longitude = 10.02

    let northAngle = 0
    let sunAngle = 0

    let myNorthAngle = 0
    let mySunAngle = 0

    let quiz
    let showSolution = false

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
        //findPosition()
        myNewQuiz()
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
    <div id="nav">nav</div>
    <div id="content">
        {#if chapter === "quiz1"}
            <button on:click={() => myNewQuiz()}>New</button>
            <button on:click={() => (showSolution = true)}>Show solution</button
            >
        {/if}
    </div>
    <div id="sliders">
        <TimePicker bind:date />
    </div>
    <div
        id="big"
        style="background-image: url({quiz?.image}); background-size: cover; background-position: center;"
    >
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
    }
    #content {
        grid-area: content;
        background-color: yellow;
        padding: 1rem;
        overflow-y: auto;
    }
    #big {
        grid-area: big;
        background-color: blue;
        position: relative;
    }
    #sliders {
        grid-area: sliders;
        background-color: green;
    }
    #compass {
        /* position bottom center of parent */
        position: absolute;
        bottom: 0;
        left: 0;
    }
</style>
