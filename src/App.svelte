<script>
    import {onMount} from "svelte"
    import SunCalc from "suncalc"
    import findTZ from "tz-lookup"

    let image
    let solution

    let hour, month
    let showHints = true
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

    let offsetAzimuth = 0
    $: sunAzimuth = Math.PI + pos.azimuth

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

    function handleMousemove(event) {
        if (mousedown) {
            if (event.touches) {
                event.clientX = event.touches[0].pageX
                event.clientY = event.touches[0].pageY
            }
            let loc = cursorPoint(event)
            offsetAzimuth = Math.atan2(loc.y, loc.x)
        }
    }

    let mousedown = false
    function handleMousedown(event) {
        mousedown = true
    }
    function handleMouseup(event) {
        mousedown = false
    }
    function startQuiz() {
        if (showHints) {
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
            showHints = false
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
                    solution = entry["computed_compass_angle"]
                })
        } else {
            showHints = true
            quizButtonText = "Quiz me!"
            offsetAzimuth = (-solution / 360.0) * 2 * Math.PI - Math.PI / 2
        }
    }
    function reset() {
        let date = new Date()
        hour = date.getHours()
        month = date.getMonth() + 1
        showHints = true
    }

    var pt, svg
    onMount(async () => {
        // Find your root SVG element
        svg = document.querySelector("svg")

        // Create an SVGPoint for future math
        pt = svg.createSVGPoint()
    })

    // Get point in global SVG space
    function cursorPoint(evt) {
        pt.x = evt.clientX
        pt.y = evt.clientY
        return pt.matrixTransform(svg.getScreenCTM().inverse())
    }
</script>

<main>
    {#if image}
        <img src={image} /><br />
    {/if}
    Month: <input type="number" bind:value={month} min="1" max="12" />
    <br />
    <input type="range" bind:value={hour} min="0" max="24" step="0.01666" />
    Hour: {hour}
    <br />
    <input type="range" bind:value={lat} min="-90" max="90" />
    Lat: {String(lat.toFixed(2)).padStart(2, "0")}
    <br />
    <input type="range" bind:value={lng} min="-180" max="180" />
    Lon: {String(lng.toFixed(2)).padStart(2, "0")}
    <br />
    {timezoneString}<br />
    <button on:click={reset}>Reset</button>
    <div
        on:mousedown={handleMousedown}
        on:mouseup={handleMouseup}
        on:mousemove={handleMousemove}
        on:touchstart={handleMousedown}
        on:touchend={handleMouseup}
        on:touchmove={handleMousemove}
    >
        <svg width="400" height="400" viewBox="-0.5 -0.5 1 1">
            <circle
                cx="0"
                cy="0"
                r="0.4"
                fill="none"
                stroke="black"
                stroke-width="0.005"
            />
            {#each markers as marker}
                <circle
                    cx={0.4 *
                        marker.radius *
                        Math.cos(marker.azimuth + offsetAzimuth)}
                    cy={0.4 *
                        marker.radius *
                        Math.sin(marker.azimuth + offsetAzimuth)}
                    r="0.07"
                    fill="white"
                />
            {/each}
            {#if showHints}
                <circle
                    cx={0.3 * Math.cos(sunAzimuth + offsetAzimuth)}
                    cy={0.3 * Math.sin(sunAzimuth + offsetAzimuth)}
                    r="0.05"
                    fill="yellow"
                    stroke="black"
                    stroke-width="0.005"
                />
            {/if}
            {#each markers as marker}
                {#if marker.radius === 1 || showHints}
                    <text
                        text-anchor="middle"
                        alignment-baseline="central"
                        font-size={0.1 * marker.size}
                    >
                        <tspan
                            x={0.4 *
                                marker.radius *
                                Math.cos(marker.azimuth + offsetAzimuth)}
                            y={0.4 *
                                marker.radius *
                                Math.sin(marker.azimuth + offsetAzimuth) +
                                0.03}>{marker.label}</tspan
                        >
                    </text>
                {/if}
            {/each}
            {#if showHints}
                <line
                    x1="0"
                    y1="0"
                    x2={0.3 * Math.cos(sunAzimuth - Math.PI + offsetAzimuth)}
                    y2={0.3 * Math.sin(sunAzimuth - Math.PI + offsetAzimuth)}
                    stroke="black"
                    stroke-width="0.05"
                />
                <circle
                    cx={0.3 * Math.cos(sunAzimuth - Math.PI + offsetAzimuth)}
                    cy={0.3 * Math.sin(sunAzimuth - Math.PI + offsetAzimuth)}
                    r="0.025"
                    fill="black"
                />
                <circle
                    cx="0"
                    cy="0"
                    r="0.025"
                    fill="grey"
                    stroke="black"
                    stroke-width="0.005"
                />
            {/if}
        </svg>
    </div>
    <button on:click={startQuiz}>{quizButtonText}</button>
</main>

<style>
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        opacity: 1;
    }
    svg {
        touch-action: none;
    }
    * {
        user-select: none;
    }
</style>
