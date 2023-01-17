<script>
    import * as THREE from "three"
    import {onMount} from "svelte"
    import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js"

    export let latitude = 0
    export let longitude = 0
    let earthRotation = 0

    let space,
        marker = undefined,
        light = undefined
    let earthRadius = 1
    let sunAngle = (23.5 / 360.0) * 2 * Math.PI

    onMount(() => {
        const scene = new THREE.Scene()
        let width = 500
        let height = width
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        )

        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(width, height)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.update()

        const sunPosition = new THREE.Vector3(
            -Math.cos(sunAngle) * 10,
            0,
            Math.sin(sunAngle) * 10
        )

        light = new THREE.PointLight(0x404040, 5)
        light.position.set(sunPosition.x, sunPosition.y, sunPosition.z)
        scene.add(light)
        light.castShadow = true
        light.shadow.mapSize.width = 4 * 512
        light.shadow.mapSize.height = 4 * 512
        //light.shadow.bias = -0.0001

        const light2 = new THREE.AmbientLight(0x404040, 1)
        scene.add(light2)

        //        const geometry = new THREE.SphereGeometry( 1, 32, 16)
        //const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        //const cube = new THREE.Mesh( geometry, material );
        //scene.add( cube );

        const earthGeometry = new THREE.SphereGeometry(earthRadius, 32, 32)
        const earthMaterial = new THREE.MeshStandardMaterial({color: 0xffffff})
        earthMaterial.map = new THREE.TextureLoader().load("earth.jpg")
        earthMaterial.bumpMap = new THREE.TextureLoader().load("earth_bump.jpg")
        earthMaterial.bumpScale = 0.01
        //earthMaterial.offset = new THREE.Vector2(0.2, 0)
        // add specular
        //earthMaterial.specularMap = new THREE.TextureLoader().load('earth_specular.jpg');
        //earthMaterial.specular = new THREE.Color(0xffffff);
        //earthMaterial.specularMap  = new THREE.TextureLoader().load('earth_specular.jpg');
        //earthMaterial.specular = "grey"
        const earth = new THREE.Mesh(earthGeometry, earthMaterial)
        scene.add(earth)
        earth.receiveShadow = true

        const markerGeometry = new THREE.CylinderGeometry(
            0.02,
            0.02,
            earthRadius / 3,
            32
        )
        const markerMaterial = new THREE.MeshStandardMaterial({color: 0xffffff})
        marker = new THREE.Mesh(markerGeometry, markerMaterial)

        marker.castShadow = true
        scene.add(marker)

        // cylinder axis
        //const cylinderGeometry = new THREE.CylinderGeometry( 0.02, 0.02, earthRadius*2.2, 32 )
        //const cylinderMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );
        //const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
        ////cylinder.rotateX(Math.PI/2)
        //earth.add(cylinder)

        //earth.rotation.z = 23.5/360.0*2*Math.PI

        camera.position.x = 0
        camera.position.y = -1
        camera.position.x = -0.2
        marker.add(camera)

        function animate() {
            //cube.rotation.y += 0.01;
            //earth.rotateY(0.01)
            earthRotation += 0.01
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        space.appendChild(renderer.domElement)
    })

    $: {
        console.log(latitude)
    }

    $: {
        if (marker) {
            let angle = ((latitude / 90) * Math.PI) / 2
            console.log(angle)
            marker.position.x = Math.cos(angle) * earthRadius
            marker.position.y = Math.sin(angle) * earthRadius
            marker.rotation.z = angle + Math.PI / 2
        }
    }

    $: {
        if (light) {
            const sunPosition = new THREE.Vector3(
                -Math.cos(sunAngle + earthRotation) * 10,
                0,
                Math.sin(sunAngle + earthRotation) * 10
            )

            light.position.set(sunPosition.x, sunPosition.y, sunPosition.z)
        }
    }
</script>

<div id="space" bind:this={space} />
