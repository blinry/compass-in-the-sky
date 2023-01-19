<script>
    //import SunCalc from "./suncalc.js"

    export let latitude = 0
    export let longitude = 0
    export let disabled = false

    //export let date

    let imgWidth = 600
    let left = 0
    let top = 0
    $: {
        left = ((longitude + 180) / 360) * imgWidth
        top = (((90 - latitude) / 180) * imgWidth) / 2
    }

    //$: subsolarPoint = SunCalc.getSubsolarPoint(date)

    //$: sunLeft = ((subsolarPoint.longitude + 180) / 360) * imgWidth

    //$: sunTop =
    //    (subsolarPoint.latitude / (Math.PI * 2)) * (imgWidth / 2) + imgWidth / 4

    let container

    let mousedown = false
    function handleMousedown(e) {
        if (!disabled) {
            mousedown = true
            handleMousemove(e)
        }
    }

    function handleMouseup(e) {
        mousedown = false
    }

    function handleMousemove(event) {
        if (mousedown) {
            // find relative position
            var rect = container.getBoundingClientRect()
            let x = event.clientX - rect.left
            let y = event.clientY - rect.top
            latitude = -(y / (imgWidth / 2)) * 180 + 90
            latitude = Math.max(-90, Math.min(90, latitude))
            longitude = (x / imgWidth) * 360 - 180
            longitude = Math.max(-180, Math.min(180, longitude))
        }
    }

    function findPosition() {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude
            longitude = position.coords.longitude
        })
    }
</script>

<div
    id="container"
    bind:this={container}
    bind:clientWidth={imgWidth}
    on:mousedown={handleMousedown}
    on:mousemove={handleMousemove}
    on:mouseup={handleMouseup}
>
    <img src="/map.jpg" />
    <div id="marker" style="top: {top}px; left: {left}px;" />
    <!--<div id="sun" style="top: {sunTop}px; left: {sunLeft}px;" />-->
    <button on:click={findPosition}>Find my position</button>
</div>

<style>
    #container {
        width: 100%;
        position: relative;
        display: inline-block;
    }
    img {
        max-width: 100%;
        max-height: 100%;
        -webkit-user-drag: none;
        -moz-user-drag: none;
        -ms-user-drag: none;
    }
    #marker {
        width: 0.5rem;
        height: 0.5rem;
        transform: translateX(-50%) translateY(-50%);
        border-radius: 50%;
        background: black;
        position: absolute;
    }
    /*#sun {
        width: 0.5rem;
        height: 0.5rem;
        transform: translateX(-50%) translateY(-50%);
        border-radius: 50%;
        background: yellow;
        position: absolute;
    }*/
    button {
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: 1rem;
        padding: 0.2rem;
    }
</style>
