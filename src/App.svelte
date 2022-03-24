<script>
    import {onMount} from "svelte"
    import SunCalc from "suncalc"

    let hour, month
    let showNorth = true
    reset()

    let pos
    let quizButtonText = "Quiz me!"

    let date
    $: {
        date = new Date()
        date.setHours(hour, 0, 0)
        date.setMonth(month - 1)
        pos = SunCalc.getPosition(date, 52, 10)
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

        let times = SunCalc.getTimes(date, 52, 10)
        let sunriseHour = times.sunrise.getHours()
        let sunsetHour = times.sunset.getHours()

        for (let hour2 = sunriseHour; hour2 <= sunsetHour; hour2 += 1) {
            markers.push({
                label: "" + hour2,
                azimuth: -calcAzimuth(month, hour2) + calcAzimuth(month, hour),
                size: 0.4,
                radius: 0.8,
            })
        }

        //markers.forEach((m) => (m.azimuth += offsetAzimuth))
    }

    function calcAzimuth(month, hour) {
        let date = new Date()
        date.setHours(hour, 0, 0)
        date.setMonth(month - 1)
        pos = SunCalc.getPosition(date, 52, 10)
        return pos.azimuth
    }

    function handleMousemove(event) {
        if (mousedown) {
            if (event.touches) {
                event.clientX = event.touches[0].pageX
                event.clientY = event.touches[0].pageY
            }
            let loc = cursorPoint(event)
            offsetAzimuth = Math.atan2(loc.y, loc.x) - sunAzimuth + Math.PI
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
        if (showNorth) {
            offsetAzimuth = Math.random() * 2 * Math.PI
            hour = Math.floor(Math.random() * (21 - 6) + 6)
            month = Math.floor(Math.random() * 12) + 1
            showNorth = false
            quizButtonText = "Reveal"
        } else {
            showNorth = true
            quizButtonText = "Quiz me!"
        }
    }
    function reset() {
        let date = new Date()
        hour = date.getHours()
        month = date.getMonth() + 1
        showNorth = true
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
    Month: <input type="number" bind:value={month} min="1" max="12" />
    Hour: <input type="number" bind:value={hour} min="0" max="24" />
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
            {#if showNorth}
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
            {/if}
            <circle
                cx={0.3 * Math.cos(sunAzimuth + offsetAzimuth)}
                cy={0.3 * Math.sin(sunAzimuth + offsetAzimuth)}
                r="0.05"
                fill="yellow"
                stroke="black"
                stroke-width="0.005"
            />
            {#if showNorth}
                {#each markers as marker}
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
                {/each}
            {/if}
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
        </svg>
    </div>
    <button on:click={startQuiz}>{quizButtonText}</button>
    <br />
    <p>
        The numbers indicate where north is at that hour, relative to the
        shadow.
    </p>
    <p />
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
