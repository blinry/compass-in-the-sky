<script>
    import Compass from "./Compass.svelte"
    import SunCalc from "suncalc"
    import findTZ from "tz-lookup"

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
    reset()

    let lat = 0
    let lng = 0
    let timezoneString = "UTC"

    navigator.geolocation.getCurrentPosition(function (position) {
        lat = position.coords.latitude
        lng = position.coords.longitude
    })

    $: timezoneString = findTZ(lat, lng)

    let pos
    let quizButtonText = "Quiz me!"

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
        markers.push({label: "E", size: 1, radius: 1, azimuth: Math.PI / 2})
        markers.push({label: "S", size: 1, radius: 1, azimuth: Math.PI})
        markers.push({
            label: "W",
            size: 1,
            radius: 1,
            azimuth: (Math.PI * 3) / 2,
        })

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
        if (!quizInProgress) {
            /*
            offsetAzimuth = Math.random() * 2 * Math.PI
            hour = Math.floor(Math.random() * (21 - 6) + 6)
            month = Math.floor(Math.random() * 12) + 1
            */
            let size = 0.1
            let lat1 = Number(lat - size).toFixed(3)
            let lng1 = Number(lng - size).toFixed(3)
            let lat2 = Number(lat + size).toFixed(3)
            let lng2 = Number(lng + size).toFixed(3)
            image = undefined
            quizInProgress = true
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

                    quizButtonText = "Reveal"

                    image = entry["thumb_1024_url"]
                    northAngle =
                        (-entry["computed_compass_angle"] / 360.0) * 2 * Math.PI

                    date = new Date()
                    date.toLocaleString("en-US", {timeZone: timezoneString})
                    date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
                    date.setMonth(month - 1)
                    pos = SunCalc.getPosition(date, lat, lng)
                })
        } else {
            quizButtonText = "Quiz me!"
            quizInProgress = false
        }
    }
    function reset() {
        let date = new Date()
        hour = date.getHours()
        month = date.getMonth() + 1
        quizInProgress = false
    }
</script>

<main>
    <div id="controls">
        <div class="big">{Math.round(hour)}:00</div>
        <input
            type="range"
            bind:value={hour}
            min="0"
            max="24"
            step="0.01666"
            disabled={quizInProgress}
        />
        <div class="big">{monthNames[month - 1]}</div>
        <input
            type="range"
            bind:value={month}
            min="1"
            max="12"
            step="1"
            disabled={quizInProgress}
        />
        <!--
        <input type="range" bind:value={lat} min="-90" max="90" />
        Lat: {String(lat.toFixed(3)).padStart(3, "0")}
        <br />
        <input type="range" bind:value={lng} min="-180" max="180" />
        Lon: {String(lng.toFixed(3)).padStart(3, "0")}
        <br />
        -->
        <!--<a
            href="https://www.openstreetmap.org/?mlat={lat}&mlon={lng}"
            target="_blank">OSM</a
        >
        <br />
        {timezoneString}<br />
        <button on:click={reset}>Reset</button>-->
        <Compass
            {markers}
            {yourNorthAngle}
            {yourSunAngle}
            showHints={false}
        /><br />
        {#if !quizInProgress}
            Solution:<br />
            <Compass
                {markers}
                {northAngle}
                {sunAngle}
                showHints={!quizInProgress}
            /><br />
        {/if}
        <button on:click={startQuiz}>{quizButtonText}</button>
    </div>
    <div id="photo">
        {#if image}
            <img src={image} /><br />
        {/if}
    </div>
</main>

<style>
    main {
        display: flex;
    }
    input[type="range"] {
        width: 18rem;
    }
    .big {
        font-size: 150%;
    }
    svg {
        touch-action: none;
    }
    * {
        user-select: none;
    }
</style>
