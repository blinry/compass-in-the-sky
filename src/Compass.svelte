<script>
    import {onMount} from "svelte"
    import SunCalc from "./suncalc.js"
    import {calcAzimuth, timezoneDiff} from "./sun.js"

    export let latitude
    export let longitude
    export let date
    export let timezoneString
    export let level

    export let northAngle = 0
    export let showHints = true
    export let showDirections = true
    export let showSun = true
    export let interactive = true

    let sunAngle
    $: {
        let pos = SunCalc.getPosition(date, latitude, longitude)
        sunAngle = pos.azimuth + Math.PI
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

        let times = SunCalc.getTimes(date, latitude, longitude)
        console.log(times)
        let sunriseHour = times.sunrise.getHours()
        let sunsetHour = times.sunset.getHours()

        if (sunriseHour > sunsetHour) {
            sunsetHour += 24
        }

        let month = date.getMonth() + 1

        let diff = timezoneDiff(timezoneString)

        for (let hour2 = sunriseHour; hour2 <= sunsetHour; hour2 += 1) {
            markers.push({
                label: "" + (Math.round(hour2 - diff) % 24),
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
        return pt.matrixTransform(svg.getScreenCTM().inverse())
    }

    function handleMousemove(event) {
        if (event.touches) {
            event.clientX = event.touches[0].pageX
            event.clientY = event.touches[0].pageY
        }
        let loc = cursorPoint(event)
        if (movingCompass) {
            northAngle = Math.atan2(loc.y, loc.x) + Math.PI / 2
        }
        if (movingSun) {
            sunAngle = Math.atan2(loc.y, loc.x) + Math.PI / 2
        }
    }

    let movingSun = false
    let movingCompass = false
    function handleMousedown(event) {
        if (interactive) {
            if (event.touches) {
                event.clientX = event.touches[0].pageX
                event.clientY = event.touches[0].pageY
            }
            let loc = cursorPoint(event)
            let d = Math.sqrt(loc.x ** 2 + loc.y ** 2)
            if (d < 0.35) {
                movingSun = true
            } else {
                movingCompass = true
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
                                marker.azimuth + northAngle - Math.PI / 2,
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
</div>

<style>
    svg {
        width: 20rem;
    }
</style>
