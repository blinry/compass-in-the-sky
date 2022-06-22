<script>
    import {onMount} from "svelte"

    export let markers = []
    export let northAngle = 0
    export let sunAngle = 0
    export let showHints = true
    export let showDirections = true
    export let showSun = true
    export let interactive = true

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
            {#if (marker.radius === 1 || showHints) && showDirections}
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
