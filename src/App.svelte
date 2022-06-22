<script>
    import {onMount} from "svelte"
    import Compass from "./Compass.svelte"
    import SunCalc from "suncalc"
    import findTZ from "tz-lookup"

    // 0: overview
    // 1: guess sun direction
    // 2: also guess compass
    // 3: press arrow keys to specify direction
    let level = 1
    let points = 0
    let bonus = undefined

    let levels = {
        1: {
            name: "Find the sun",
            description:
                "Learn how to find north using the sun! The first step is to estimate the direction of the sun. Estimate whether the sun is ahead, behind, or to the left or right of you in the photo, and drag the sun icon to the correct position.",
        },
        2: {
            name: "Find north",
            description: "Guess the sun direction and the compass orientation.",
        },
        3: {
            name: "Find any direction",
            description: "Do it all in your head, then guess where north is.",
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

    let image
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

    let pos

    let date
    $: {
        date = new Date()
        date.toLocaleString("en-US", {timeZone: timezoneString})
        date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
        date.setMonth(month - 1)
        pos = SunCalc.getPosition(date, lat, lng)
    }

    let northAngle = 0,
        sunAngle = 0
    $: {
        sunAngle = northAngle + pos.azimuth + Math.PI
    }

    let markers
    $: {
        markers = []

        markers.push({label: "N", size: 1, radius: 1, azimuth: 0})
        if (level >= 4 || level <= 2) {
            markers.push({label: "E", size: 1, radius: 1, azimuth: Math.PI / 2})
            markers.push({label: "S", size: 1, radius: 1, azimuth: Math.PI})
            markers.push({
                label: "W",
                size: 1,
                radius: 1,
                azimuth: (Math.PI * 3) / 2,
            })
        }

        let times = SunCalc.getTimes(date, lat, lng)
        let sunriseHour = times.sunrise.getHours()
        let sunsetHour = times.sunset.getHours()

        for (let hour2 = sunriseHour; hour2 <= sunsetHour; hour2 += 1) {
            markers.push({
                label: "" + hour2,
                azimuth: calcAzimuth(month, hour2),
                size: 0.4,
                radius: 0.8,
            })
        }

        //markers.forEach((m) => (m.azimuth += offsetAzimuth))
    }

    function calcAzimuth(month, hour) {
        let date2 = new Date(date)
        date2.setHours(Math.floor(hour), (hour % 1) * 60, 0)
        date2.setMonth(month - 1)
        pos = SunCalc.getPosition(date2, lat, lng)
        return pos.azimuth + Math.PI
    }

    function startQuiz() {
        bonus = undefined
        let size = 0.01
        let lat1 = Number(lat - size).toFixed(3)
        let lng1 = Number(lng - size).toFixed(3)
        let lat2 = Number(lat + size).toFixed(3)
        let lng2 = Number(lng + size).toFixed(3)
        image = undefined
        quizInProgress = true
        showYourCompass = true
        northAngle = 0
        sunAngle = 0
        fetch(
            `https://graph.mapillary.com/images?access_token=MLY|7569500839758282|7b3b3eced40c887cc2867488d6a50220&fields=id,captured_at,compass_angle,computed_compass_angle,geometry,computed_geometry,thumb_1024_url&bbox=${lng1},${lat1},${lng2},${lat2}&limit=1`,
        )
            .then((response) => response.json())
            .then((json) => {
                let entry = json.data[0]

                let timestamp = parseInt(entry["captured_at"])
                let date = new Date(timestamp)
                month = date.getMonth() + 1
                hour = date.getHours()
                lat = entry["computed_geometry"]["coordinates"][1]
                lng = entry["computed_geometry"]["coordinates"][0]

                image = entry["thumb_1024_url"]
                northAngle =
                    (-entry["computed_compass_angle"] / 360.0) * 2 * Math.PI

                date = new Date()
                date.toLocaleString("en-US", {timeZone: timezoneString})
                date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
                date.setMonth(month - 1)
                pos = SunCalc.getPosition(date, lat, lng)
            })
    }

    function solve() {
        quizInProgress = false
        if (level == 1) {
            let angleDiff = yourSunAngle - sunAngle
            angleDiff = Math.abs(
                ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI,
            )
            bonus = 10 * Math.max(0, -2 * (angleDiff / Math.PI) + 1)
        }
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
                >You have <span class="big">{Math.round(points)}</span> points</span
            >
        </div>
        <div>{levels[level].description}</div>
    </div>
    <div id="content">
        <div id="controls">
            {#if quizInProgress}
                {#if level >= 2}
                    <input
                        type="range"
                        bind:value={hour}
                        min="0"
                        max="24"
                        step="0.01666"
                        disabled={quizInProgress}
                    />
                    <span class="big">{Math.round(hour)}:00</span>
                    <br />
                    <input
                        type="range"
                        bind:value={month}
                        min="1"
                        max="12"
                        step="1"
                        disabled={quizInProgress}
                    />
                    <span class="big">{monthNames[month - 1]}</span>
                    <br />
                {/if}
            {/if}
            <div id="compass">
                {#if showYourCompass}
                    <div class={quizInProgress ? "" : "transparent"}>
                        <Compass
                            {markers}
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
                            {markers}
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
            {#if image}
                <img src={image} /><br />
            {/if}
        </div>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
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
        background: #f6f6f6;
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
