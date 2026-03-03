import * as THREE from 'three';

export class BoatControls {
    constructor(boat, scene) {
        this.boat = boat;
        this.scene = scene;
        this.colliders = []; // Objects to collide with
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

    addCollider(object) {
        this.colliders.push(object);
    }

    update() {
        if (!this.boat) return;

        // Save current position and rotation for potential rollback
        const oldPos = this.boat.position.clone();
        const oldRot = this.boat.rotation.clone();

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
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(this.boat.quaternion);
        this.boat.position.addScaledVector(direction, this.speed);

        // --- Collision Detection ---
        if (this.colliders.length > 0) {
            this.boat.updateMatrixWorld(); // Ensure world positions are up to date
            
            // Create a bounding box for the boat and shrink it slightly for "wiggle room"
            const boatBox = new THREE.Box3().setFromObject(this.boat);
            boatBox.expandByScalar(-0.5); // Shrink the collision box so we don't get stuck on edges

            for (let collider of this.colliders) {
                collider.updateMatrixWorld();
                const colliderBox = new THREE.Box3().setFromObject(collider);
                
                // Shrink collider box slightly too for smoother physics
                colliderBox.expandByScalar(-0.5);

                if (boatBox.intersectsBox(colliderBox)) {
                    // Collision detected! Roll back position and stop speed
                    this.boat.position.copy(oldPos);
                    this.boat.rotation.copy(oldRot);
                    this.speed = -this.speed * 0.5; // Bounce back slightly
                    this.rotationSpeed = 0;
                    break;
                }
            }
        }
    }
}
