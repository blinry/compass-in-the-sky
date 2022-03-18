<script>
    import {onMount} from "svelte"
    import SunCalc from "suncalc"

    let hour = 12,
        month = 3

    let pos
    let date = new Date()
    $: {
        date.setHours(hour, 0, 0)
        date.setMonth(month)
        console.log(date)
        pos = SunCalc.getPosition(date, 52, 10)
    }

    let offsetAzimuth = 0
    $: sunAzimuth = offsetAzimuth
    $: northAzimuth = offsetAzimuth - pos.azimuth

    let m = {x: 0, y: 0}

    function handleMousemove(event) {
        m.x = event.clientX
        m.y = event.clientY
        //let loc = cursorPoint(event)
        //mouseAzimuth = Math.atan2(loc.y, loc.x)
    }

    let mousedown = true
    function handleMousedown(event) {
        mousedown = true
    }
    function handleMouseup(event) {
        mousedown = false
        offsetAzimuth = Math.random() * 2 * Math.PI
        hour = Math.floor(Math.random() * (21 - 6) + 6)
        month = Math.floor(Math.random() * 12)
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
    <div
        on:mousemove={handleMousemove}
        on:mousedown={handleMousedown}
        on:mouseup={handleMouseup}
    >
        <svg width="500" height="500" viewBox="-0.5 -0.5 1 1">
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
            />
            {#if mousedown}
                <circle
                    cx={0.4 * Math.cos(northAzimuth)}
                    cy={0.4 * Math.sin(northAzimuth)}
                    r="0.05"
                    fill="black"
                />
            {/if}
        </svg>
    </div>
</main>

<style>
</style>
