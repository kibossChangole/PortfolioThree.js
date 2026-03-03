import * as THREE from 'three';

export class BoatControls {
    constructor(boat, scene) {
        this.boat = boat;
        this.scene = scene;
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            s: false,
            a: false,
            d: false
        };

        this.speed = 0;
        this.maxSpeed = 0.5;
        this.acceleration = 0.005;
        this.friction = 0.98;
        
        this.rotationSpeed = 0;
        this.maxRotationSpeed = 0.02;
        this.rotationAcceleration = 0.001;
        this.rotationFriction = 0.92;

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = true;
        }
    }

    onKeyUp(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = false;
        }
    }

    update() {
        if (!this.boat) return;

        // Forward and backward movement
        if (this.keys.ArrowUp || this.keys.w) {
            this.speed += this.acceleration;
        }
        if (this.keys.ArrowDown || this.keys.s) {
            this.speed -= this.acceleration;
        }

        // Rotation momentum
        if (this.keys.ArrowLeft || this.keys.a) {
            this.rotationSpeed += this.rotationAcceleration;
        } else if (this.keys.ArrowRight || this.keys.d) {
            this.rotationSpeed -= this.rotationAcceleration;
        }

        // Apply friction to speed and rotation
        this.speed *= this.friction;
        this.rotationSpeed *= this.rotationFriction;

        // Clamp speed
        if (Math.abs(this.speed) > this.maxSpeed) {
            this.speed = Math.sign(this.speed) * this.maxSpeed;
        }
        
        // Clamp rotation
        if (Math.abs(this.rotationSpeed) > this.maxRotationSpeed) {
            this.rotationSpeed = Math.sign(this.rotationSpeed) * this.maxRotationSpeed;
        }

        // Apply rotation
        this.boat.rotation.y += this.rotationSpeed;

        // Apply movement based on rotation
        // Standard forward is +Z in most models, but if it has been rotated 1.2 in main.js...
        // Wait, main.js has object.rotateY(49.2) previously, but I removed it in my consolidate.
        // Actually, the user's last edit had `object.rotateY(49.2)` in the first load and nothing in the second.
        // I'll assume the model's front is Z.
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(this.boat.quaternion);
        this.boat.position.addScaledVector(direction, this.speed);
    }
}
