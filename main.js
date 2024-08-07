import './style.css'
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { Refractor } from 'three/examples/jsm/objects/Refractor.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


camera.position.setZ(10);
camera.position.setX(35);
camera.position.setY(1);




// Create a renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);


const sungeometry = new THREE.SphereGeometry(40, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfecc51 });
const sunVisual = new THREE.Mesh(sungeometry, sunMaterial);


sunVisual.position.x = -130;
sunVisual.position.y = 10;
sunVisual.position.z = 10;
scene.add(sunVisual);



/*creating the water surface plane*/
const waterGeometry = new THREE.PlaneGeometry(1000,1000);
const water = new Water(waterGeometry, {
    textureWidth:512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/waternormals.jpg',
        (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
    ),

    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xFFFFFF,
    waterColor: 0x0E87CC,
    distortionScale: 1, /*adjust the intensity of the water ripples*/   

});

/*The code below flattens the Water plane*/
water.rotation.x = -Math.PI / 2;
scene.add(water);


/*Creating the ocean bottom*/
const oceanfloor = new THREE.TextureLoader().load('stone.jpg');
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ map: oceanfloor, side: THREE.FrontSide, });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);


//*Water Animations below*/
// Animation parameters
const rippleSpeed = 0.006;
let time = 1;

// Create a function to animate the scene
const animatewater = () => {
    requestAnimationFrame(animatewater);

    // Update water ripples
    water.material.uniforms.time.value += rippleSpeed;
    /*the time value below is used to indicate how long before the animation reloads itself*/
    water.material.uniforms.time.value %= 180;

    // Render the scene
    renderer.render(scene, camera);
};


const textbubble = new THREE.PlaneGeometry(30,10);
const textbubbletxt = new THREE.TextureLoader().load('speechbubble.png');
const textbubblematerial = new THREE.MeshBasicMaterial({map: textbubbletxt, transparent: true});
const textbubbleplane = new THREE.Mesh(textbubble, textbubblematerial);
textbubbleplane.position.y = 20;
textbubbleplane.position.x =0;
textbubbleplane.position.z = 8;
textbubbleplane.rotateY(1.2);
textbubbleplane.rotateZ(0.002);
textbubbleplane.rotateX(-0.0);
scene.add(textbubbleplane);


const loader = new GLTFLoader();
loader.load(
    'Lighthouse.glb',
    function (gltf) {
        const lighthousemodel = gltf.scene;
        lighthousemodel.position.y = 1;
        lighthousemodel.position.x = 21;

        // Add the loaded model to the scene
        scene.add(lighthousemodel);
    },
    undefined,
    function (error) {
        console.error('Error loading GLB model', error);
    }
);

loader.load(
    'Titanic.glb',
    function (gltf) {
        const titanic = gltf.scene;
        titanic.position.y = -5.0;
        titanic.position.x = -90;
        titanic.position.z = 100;
    
        const scaleFactor = 0.3; // Adjust scale as needed
        titanic.scale.set(scaleFactor, scaleFactor, scaleFactor);
        // Add the loaded model to the scene
        scene.add(titanic);

        // Define initial position and target position
        const initialPosition = titanic.position.clone();
        const targetPosition = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z-500); // Move 2 units along the x-axis

        // Animate model to move gradually along the x-axis
        const duration = 100000; // Duration of animation in milliseconds
        const startTime = Date.now(); // Get current time


        const moveAnimation = function () {
            const now = Date.now();
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1); // Clamp t between 0 and 1
            titanic.position.lerpVectors(initialPosition, targetPosition, t);
            if (t < 1) {
                requestAnimationFrame(moveAnimation); // Continue animation until t reaches 1
            }
        };
        moveAnimation();

    },

    undefined,
    function (error) {
        console.error('Error loading GLB model', error);
    }
);



// 3D object
// Load OBJ model using MTLLoader and OBJLoader
const mtlLoader = new MTLLoader();
mtlLoader.load(
    'WinterScene.mtl',
    (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
            'WinterScene.obj',
            (object) => {
                // Add the loaded model to the scene
                object.rotateY(49.2); /*adjust how the ice sculpture is facing*/
                object.position.y = -0.73;
                object.position.x = 10;

                scene.add();
            },
            undefined,
            (error) => {
                console.error('Error loading OBJ model:', error);
            }
        );
    },
    undefined,
    (error) => {
        console.error('Error loading MTL file:', error);
    }
);


// Function to create a rounded rectangular panel
function createRoundedPanel(width, height, depth, radius) {
    const shape = new THREE.Shape();

    // Rounded rectangle path
    shape.moveTo(radius, 0);
    shape.lineTo(width - radius, 0);
    shape.quadraticCurveTo(width, 0, width, radius);
    shape.lineTo(width, height - radius);
    shape.quadraticCurveTo(width, height, width - radius, height);
    shape.lineTo(radius, height);
    shape.quadraticCurveTo(0, height, 0, height - radius);
    shape.lineTo(0, radius);
    shape.quadraticCurveTo(0, 0, radius, 0);

    const extrudeSettings = {
        depth: depth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({
        color: 0xAB2330,
        side: THREE.DoubleSide,
    });

    return new THREE.Mesh(geometry, material);
}


// Create a rounded panel
const roundedPanel = createRoundedPanel(10, 6, 0.001, 0.2);


// Add panel to the scene
/*scene.add(roundedPanel);*/


// Add ambient light
const ambientLight = new THREE.AmbientLight(0xfffff6, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

const sunsetbackground = new THREE.TextureLoader().load('sunset.png');
const scenebackground = new THREE.Color((0x87CEEB));
scene.background = scenebackground;



// Handle window resize
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});



/*add pointlight*/
const pointlight = new THREE.PointLight(0xFA961B, 20000); /*This light is the artificial sun*/
pointlight.position.set(13,12,15);
pointlight.rotation.y += 0.1;

const pointlight2 = new THREE.PointLight(0xFA961B, 1000);/*This is the hidden light between the mountains*/
pointlight2.position.set(25, 5, -13);
pointlight2.rotation.y += 0.1;



const lighthelper = new THREE.PointLightHelper(pointlight);
const lighthelper2 = new THREE.PointLightHelper(pointlight2);
/*add bottom grid*/
const gridhelper = new THREE.GridHelper(200,50);

scene.add(pointlight, pointlight2 );




/*add Orbit Controls*/
const controls = new OrbitControls(camera, renderer.domElement);

/*controls maximum and minimum horizontal orbit*/
/*
controls.minAzimuthAngle = 0.7;
controls.maxAzimuthAngle = 2.8;
*/
/* controls maximum and minimum and vertical orbit*/

/*
controls.minPolarAngle = 1.15;
controls.maxPolarAngle = 1.15;

*/

/*
controls.minDistance = 33;
controls.maxDistance = 41;

*/

controls.enableZoom = true;
/*very important below prevents you from panning outside of the area*/
controls.enablePan = true;


// Define the target position for the camera zoom-in
var targetPosition = new THREE.Vector3(35, 1, 10); // Adjust as needed
var cameratarget = new THREE.Vector3(21,1,2);
// Define the duration of the animation
var duration = 2000; // in milliseconds


/*
// Start the camera zoom-in animation
zoomIn();

function zoomIn() {
    var currentCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    var currentTargetPosition = { x: cameratarget.x, y: cameratarget.y, z: cameratarget.z };

    new TWEEN.Tween(currentCameraPosition)
        .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, duration)
        .onUpdate(function () {
            camera.position.set(this.x, this.y, this.z);
        })
        .start();

    new TWEEN.Tween(currentTargetPosition)
        .to({ x: cube.position.x, y: cube.position.y, z: cube.position.z }, duration)
        .onUpdate(function () {
            camera.lookAt(this.x, this.y, this.z);
        })
        .start();
}

*/

// Create a function to animate the scene
const animate = () => {
    requestAnimationFrame(animate);

    // Rotate the panel
    roundedPanel.rotation.x += 0.00;
    roundedPanel.rotation.y += 0.00;

    
    // Render the scene
    controls.update();
    renderer.render(scene, camera);
    
};

// Start the animation loop
animatewater();
animate();