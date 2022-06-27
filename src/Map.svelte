<script>
    //import SunCalc from "./suncalc.js"

    export let latitude = 0
    export let longitude = 0

    //export let date

    let imgWidth = 600

    $: left = ((longitude + 180) / 360) * imgWidth
    $: top = (((90 - latitude) / 180) * imgWidth) / 2

    //$: subsolarPoint = SunCalc.getSubsolarPoint(date)

    //$: {
    //    console.log({lat: subsolarPoint.latitude, lon: subsolarPoint.longitude})
    //}

    //$: sunLeft = ((subsolarPoint.longitude + 180) / 360) * imgWidth

    //$: sunTop =
    //    (subsolarPoint.latitude / (Math.PI * 2)) * (imgWidth / 2) + imgWidth / 4

    let container

    let mousedown = false
    function handleMousedown(e) {
        mousedown = true
        handleMousemove(e)
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
            longitude = (x / imgWidth) * 360 - 180
        }
    }
</script>

<div
    id="container"
    bind:this={container}
    on:mousedown={handleMousedown}
    on:mousemove={handleMousemove}
    on:mouseup={handleMouseup}
>
    <img src="/map.jpg" />
    <div id="marker" style="top: {top}px; left: {left}px;" />
    <!--<div id="sun" style="top: {sunTop}px; left: {sunLeft}px;" />-->
</div>

<style>
    #container {
        width: 600px;
        position: relative;
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
</style>
