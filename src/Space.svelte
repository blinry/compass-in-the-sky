<script>
    import * as THREE from "three"
    import {onMount} from "svelte"
    import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js"

    let space

    onMount(() => {
        const scene = new THREE.Scene();
        let width = 1000
        let height = width
        const camera = new THREE.PerspectiveCamera( 75, width/height, 0.1, 1000 );



        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( width,height)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

        const controls = new OrbitControls( camera, renderer.domElement );
        controls.update();

        const sunPosition = new THREE.Vector3(-10, 0, 5)

        const light = new THREE.PointLight( 0x404040, 10)
        light.position.set(sunPosition.x, sunPosition.y, sunPosition.z)
scene.add( light );
light.castShadow = true;
    light.shadow.mapSize.width = 4 * 512
    light.shadow.mapSize.height = 4 * 512
    //light.shadow.bias = -0.0001


        const light2 = new THREE.AmbientLight( 0x404040, 1)
scene.add( light2 );


//        const geometry = new THREE.SphereGeometry( 1, 32, 16)
//const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
//const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

let earthRadius = 1
        const earthGeometry = new THREE.SphereGeometry( earthRadius, 32, 16)
const earthMaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff } );
const earth = new THREE.Mesh( earthGeometry, earthMaterial );
scene.add( earth );
earth.receiveShadow = true;

        const markerGeometry = new THREE.CylinderGeometry( 0.05, 0.05, earthRadius/5, 32 )
const markerMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const marker = new THREE.Mesh( markerGeometry, markerMaterial );
let angle = Math.PI/4
marker.translateX(Math.cos(angle)*earthRadius)
marker.translateY(Math.sin(angle)*earthRadius)
marker.rotateZ(angle + Math.PI/2)
marker.castShadow = true
earth.add( marker );

// cylinder axis
const cylinderGeometry = new THREE.CylinderGeometry( 0.1, 0.1, earthRadius*2.5, 32 )
const cylinderMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
//cylinder.rotateX(Math.PI/2)
earth.add(cylinder)

earth.rotation.z = 23.5/360.0*2*Math.PI

camera.position.y = 2;
marker.add(camera)

function animate() {
    //cube.rotation.y += 0.01;
    earth.rotateY(0.01)
	requestAnimationFrame( animate );
controls.update();
	renderer.render( scene, camera );
}
animate();

        space.appendChild( renderer.domElement );
    })

</script>

<div id="space" bind:this={space}></div>
