<script>
    import {onMount} from "svelte"
    import SunCalc from "suncalc"

    let hour, month
    let showNorth = true
    reset()

    let pos
    let quizButtonText = "Quiz me!"

    $: {
        let date = new Date()
        date.setHours(hour, 0, 0)
        date.setMonth(month - 1)
        pos = SunCalc.getPosition(date, 52, 10)
    }

    let offsetAzimuth = 0
    $: sunAzimuth = offsetAzimuth + Math.PI
    $: northAzimuth = offsetAzimuth - pos.azimuth

    let m = {x: 0, y: 0}

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
        if (showNorth) {
            offsetAzimuth = Math.random() * 2 * Math.PI
            hour = Math.floor(Math.random() * (21 - 6) + 6)
            month = Math.floor(Math.random() * 12)
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
    Month: <input type="number" bind:value={month} min="0" max="11" />
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
            <circle
                cx={0.4 * Math.cos(sunAzimuth)}
                cy={0.4 * Math.sin(sunAzimuth)}
                r="0.05"
                fill="yellow"
                stroke="black"
                stroke-width="0.005"
            />
            {#if showNorth}
                <circle
                    cx={0.4 * Math.cos(northAzimuth)}
                    cy={0.4 * Math.sin(northAzimuth)}
                    r="0.07"
                    fill="white"
                />
                <text
                    text-anchor="middle"
                    alignment-baseline="central"
                    font-size="0.1"
                >
                    <tspan
                        x={0.4 * Math.cos(northAzimuth)}
                        y={0.4 * Math.sin(northAzimuth) + 0.03}>N</tspan
                    >
                </text>
            {/if}
            <line
                x1="0"
                y1="0"
                x2={0.3 * Math.cos(sunAzimuth - Math.PI)}
                y2={0.3 * Math.sin(sunAzimuth - Math.PI)}
                stroke="black"
                stroke-width="0.05"
            />
            <circle
                cx={0.3 * Math.cos(sunAzimuth - Math.PI)}
                cy={0.3 * Math.sin(sunAzimuth - Math.PI)}
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
