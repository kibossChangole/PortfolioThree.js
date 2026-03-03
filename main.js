import "./style.css";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { Refractor } from "three/examples/jsm/objects/Refractor.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BoatControls } from "./boat.js";

let boatControls;

// Create a scene
const scene = new THREE.Scene();
const colliders = []; // Array to store objects the boat should not pass through

// Create a camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

camera.position.setZ(10);
camera.position.setX(40);
camera.position.setY(14);

// Create a renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

const sungeometry = new THREE.SphereGeometry(100, 100, 100);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfecc51 });
const sunVisual = new THREE.Mesh(sungeometry, sunMaterial);

sunVisual.position.x = -290;
sunVisual.position.y = 0;
sunVisual.position.z = 10;
scene.add(sunVisual);

/*creating the water surface plane*/
const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/waternormals.jpg",
    (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    },
  ),

  alpha: 1.0,
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0x0e87cc,
  distortionScale: 1 /*adjust the intensity of the water ripples*/,
});

/*The code below flattens the Water plane*/
water.rotation.x = -Math.PI / 2;
scene.add(water);

/*Creating the ocean bottom*/
const oceanfloor = new THREE.TextureLoader().load("stone.jpg");
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
  map: oceanfloor,
  side: THREE.FrontSide,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);

//*Water Animations below*/
// Animation parameters
const rippleSpeed = 0.02;
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

const textbubble = new THREE.PlaneGeometry(15, 5);
const textbubbletxt = new THREE.TextureLoader().load("speechbubble.png");
const textbubblematerial = new THREE.MeshBasicMaterial({
  map: textbubbletxt,
  transparent: true,
});
const textbubbleplane = new THREE.Mesh(textbubble, textbubblematerial);
textbubbleplane.position.y = 17.5;
textbubbleplane.position.x =15;
textbubbleplane.position.z = 3;
textbubbleplane.rotateY(1.2);
textbubbleplane.rotateZ(0.002);
textbubbleplane.rotateX(-0.0);
scene.add(textbubbleplane);

const loader = new GLTFLoader();
loader.load(
  "Lighthouse.glb",
  function (gltf) {
    const lighthousemodel = gltf.scene;
    lighthousemodel.position.y = 1;
    lighthousemodel.position.x = 21;

    // Add the loaded model to the scene
    scene.add(lighthousemodel);
    colliders.push(lighthousemodel);
    
    // If boat is already loaded, add lighthouse as collider
    if (boatControls) boatControls.addCollider(lighthousemodel);
  },
  undefined,
  function (error) {
    console.error("Error loading GLB model", error);
  },
);
{/*
loader.load(
  "Titanic.glb",
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
    const targetPosition = new THREE.Vector3(
      initialPosition.x,
      initialPosition.y,
      initialPosition.z - 500,
    ); // Move 2 units along the x-axis

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
    console.error("Error loading GLB model", error);
  },
);
*/}

// 3D object
// Load Boat model
const mtlLoader = new MTLLoader();
mtlLoader.load(
  "boat.mtl",
  (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(
      "boat.obj",
      (object) => {
        object.rotateY(49.2);
        object.position.y = 0.1;
        object.position.x =28;
        object.position.z = 10;
        object.scale.set(0.6, 0.6, 0.6);
        scene.add(object);
        
        // Initialize controls for this boat
        boatControls = new BoatControls(object, scene);
        
        // Add existing colliders to the boat
        colliders.forEach(c => boatControls.addCollider(c));
      },
      undefined,
      (error) => {
        console.error("Error loading Boat OBJ model:", error);
      },
    );
  },
  undefined,
  (error) => {
    console.error("Error loading Boat MTL file:", error);
  },
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
    color: 0xab2330,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}

// Create a rounded panel
const roundedPanel = createRoundedPanel(10, 6, 0.001, 0.2);

// Add panel to the scene
/*scene.add(roundedPanel);*/

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xfffff6, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfa961b, 1.1);
scene.add(directionalLight);

const sunsetbackground = new THREE.TextureLoader().load("sunset.png");
const scenebackground = new THREE.Color(0x87ceeb);
scene.background = scenebackground;

// Handle window resize
window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});

/*add pointlight*/
const pointlight = new THREE.PointLight(
  0xfa961b,
  100,
); /*This light is the artificial sun*/
pointlight.position.set(10,6, 15);
pointlight.rotation.y += 0.1;

const pointlight2 = new THREE.PointLight(
  0xfa961b,
  100,
); /*This is the hidden light between the mountains*/
pointlight2.position.set(18, 10, -5);
pointlight2.rotation.y += 0.1;

const pointlight3 = new THREE.PointLight(
  0xfa961b,
  1000,
); /*This is the hidden light between the mountains*/
pointlight3.position.set(23, 15, -5);
pointlight3.rotation.y += 0.1;

const lighthelper = new THREE.PointLightHelper(pointlight);
const lighthelper2 = new THREE.PointLightHelper(pointlight2);
const lighthelper3 = new THREE.PointLightHelper(pointlight3);
/*add bottom grid*/
const gridhelper = new THREE.GridHelper(200, 50);



scene.add(pointlight, pointlight2, pointlight3, {/*lighthelper, lighthelper2, lighthelper3*/});

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

controls.enabled = false;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false;

// Define the target position for the camera zoom-in
var targetPosition = new THREE.Vector3(35, 1, 10); // Adjust as needed
var cameratarget = new THREE.Vector3(21, 1, 2);
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
  roundedPanel.rotation.x += 0.0;
  roundedPanel.rotation.y += 0.0;

  // Render the scene
  if (boatControls) boatControls.update();
  controls.update();
  renderer.render(scene, camera);
};

// Start the animation loop
animatewater();
animate();

// Sidebar toggle logic
const menuBtn = document.getElementById('menu');
const closeBtn = document.getElementById('close-sidebar');

menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
});

closeBtn.addEventListener('click', () => {
    document.body.classList.remove('sidebar-open');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (document.body.classList.contains('sidebar-open')) {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            document.body.classList.remove('sidebar-open');
        }
    }
});

const sidebarLinks = document.querySelectorAll('.sidebar-links a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#') {
            e.preventDefault();
            document.body.classList.remove('sidebar-open');
            document.body.classList.add('show-content');
        }
    });
});

// Logo returns to the canvas
const logo = document.getElementById('logo');
if (logo) {
    logo.addEventListener('click', () => {
        document.body.classList.remove('show-content');
    });
    logo.style.cursor = 'pointer';
}
