<script>
    import {onMount} from "svelte"
    import SunCalc from "./suncalc.js"
    import {calcAzimuth, timezoneDiff} from "./sun.js"
    import findTZ from "tz-lookup"

    export let latitude
    export let longitude
    export let date

    export let tilt = 0
    export let label = ""

    export let level = 5

    export let northAngle = 0
    export let showHints = true
    export let showDirections = true
    export let showSun = true
    export let sunInteractive = true
    export let northInteractive = true

    export let resetSun = false

    export let sunAngle = 0

    export let onlyLabel = null

    $: timezoneString = findTZ(latitude, longitude)

    $: {
        if (!resetSun) {
            let pos = SunCalc.getPosition(date, latitude, longitude)
            sunAngle = pos.azimuth + Math.PI + northAngle
        }
    }

    let markers
    $: {
        markers = []

        if (onlyLabel === null || onlyLabel === "N") {
            markers.push({label: "N", size: 1, radius: 1, azimuth: 0})
        }
        if (onlyLabel === null || onlyLabel === "E") {
            markers.push({label: "E", size: 1, radius: 1, azimuth: Math.PI / 2})
        }
        if (onlyLabel === null || onlyLabel === "S") {
            markers.push({label: "S", size: 1, radius: 1, azimuth: Math.PI})
        }
        if (onlyLabel === null || onlyLabel === "W") {
            markers.push({
                label: "W",
                size: 1,
                radius: 1,
                azimuth: (Math.PI * 3) / 2,
            })
        }

        let times = SunCalc.getTimes(date, latitude, longitude)
        let sunriseHour = times.sunrise.getHours()
        let sunsetHour = times.sunset.getHours()

        if (sunriseHour > sunsetHour) {
            sunsetHour += 24
        }

        let month = date.getMonth() + 1

        let diff = timezoneDiff(timezoneString, date)

        let offset = diff % 1

        for (
            let hour2 = sunriseHour + offset;
            hour2 <= sunsetHour + offset + 0.01;
            hour2 += 1
        ) {
            markers.push({
                label: "" + (Math.round(hour2 + offset - diff) % 24),
                azimuth: calcAzimuth(date, latitude, longitude, month, hour2),
                size: 0.4,
                radius: 0.8,
            })
        }

        //markers.forEach((m) => (m.azimuth += offsetAzimuth))
    }

    var pt, svg
    onMount(async () => {
        // Create an SVGPoint for future math
        pt = svg.createSVGPoint()
    })

    // Get point in global SVG space
    function cursorPoint(evt) {
        pt.x = evt.clientX
        pt.y = evt.clientY
        let loc = pt.matrixTransform(svg.getScreenCTM().inverse())
        return loc
    }

    function handleMousemove(event) {
        if (event.touches) {
            event.clientX = event.touches[0].pageX
            event.clientY = event.touches[0].pageY
        }
        let loc = cursorPoint(event)
        if (movingCompass) {
            northAngle = Math.atan2(loc.y, loc.x) + dragStartAngle
        }
        if (movingSun) {
            sunAngle = Math.atan2(loc.y, loc.x) + dragStartAngle
        }
    }

    let movingSun = false
    let movingCompass = false
    let dragStartAngle = 0
    function handleMousedown(event) {
        if (event.touches) {
            event.clientX = event.touches[0].pageX
            event.clientY = event.touches[0].pageY
        }
        let loc = cursorPoint(event)
        let d = Math.sqrt(loc.x ** 2 + loc.y ** 2)
        if (d < 0.35) {
            if (sunInteractive) {
                movingSun = true
                dragStartAngle = sunAngle - Math.atan2(loc.y, loc.x)
            }
        } else {
            if (northInteractive) {
                movingCompass = true
                dragStartAngle = northAngle - Math.atan2(loc.y, loc.x)
            }
        }
    }
    function handleMouseup(event) {
        movingSun = false
        movingCompass = false
    }
</script>

<div
    on:mousedown={handleMousedown}
    on:mouseup={handleMouseup}
    on:mousemove={handleMousemove}
    on:touchstart={handleMousedown}
    on:touchend={handleMouseup}
    on:touchmove={handleMousemove}
    style="--tilt: {tilt}deg"
>
    <svg viewBox="-0.5 -0.5 1 1" bind:this={svg}>
        <circle
            cx="0"
            cy="0"
            r="0.4"
            fill="none"
            stroke="black"
            stroke-width="0.005"
        />
        {#each markers as marker}
            {#if false && (marker.radius === 1 || showHints) && showDirections}
                <circle
                    cx={0.4 *
                        marker.radius *
                        Math.cos(marker.azimuth + northAngle - Math.PI / 2)}
                    cy={0.4 *
                        marker.radius *
                        Math.sin(marker.azimuth + northAngle - Math.PI / 2)}
                    r="0.07"
                    fill="white"
                />
            {/if}
        {/each}
        {#if showSun}
            <circle
                cx={0.3 * Math.cos(sunAngle - Math.PI / 2)}
                cy={0.3 * Math.sin(sunAngle - Math.PI / 2)}
                r="0.05"
                fill="yellow"
                stroke="black"
                stroke-width="0.005"
            />
        {/if}
        {#each markers as marker}
            {#if (marker.radius === 1 || showHints) && showDirections}
                <text
                    text-anchor="middle"
                    alignment-baseline="central"
                    font-size={0.1 * marker.size}
                >
                    <tspan
                        x={0.4 *
                            marker.radius *
                            Math.cos(marker.azimuth + northAngle - Math.PI / 2)}
                        y={0.4 *
                            marker.radius *
                            Math.sin(
                                marker.azimuth + northAngle - Math.PI / 2
                            ) +
                            0.03}>{marker.label}</tspan
                    >
                </text>
            {/if}
        {/each}
        {#if showSun}
            <line
                x1="0"
                y1="0"
                x2={0.3 * Math.cos(sunAngle + Math.PI / 2)}
                y2={0.3 * Math.sin(sunAngle + Math.PI / 2)}
                stroke="black"
                stroke-width="0.05"
            />
            <circle
                cx={0.3 * Math.cos(sunAngle + Math.PI / 2)}
                cy={0.3 * Math.sin(sunAngle + Math.PI / 2)}
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
    <br />
    <div id="label">{label}</div>
</div>

<style>
    svg {
        width: 25rem;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        transform: rotateX(var(--tilt));
        background-color: rgba(255, 255, 255, 0.2);
    }
    div {
        display: inline-block;
    }
    #label {
        font-size: 150%;
        position: relative;
        bottom: 6rem;
        text-align: center;
        width: 25rem;
        color: black;
        text-shadow: 0 0 0.3rem white;
    }
</style>
