import { FreeCamera, Vector3 } from "@babylonjs/core";
import { CONFIG } from "../config";

export function createCamera(scene, canvas) {
    const camera = new FreeCamera("FreeCamera", new Vector3(0, 1.8, 0), scene);
    camera.attachControl(canvas, true);  // Permet à la caméra de suivre la souris sans clic
    camera.speed = 0.1;
    camera.angularSensibility = 1000;
    camera.checkCollisions = true;  // Vérifie les collisions
    camera.applyGravity = true;
    camera.ellipsoid = new Vector3(0.5, 1, 0.5); // Collisions avec les murs
    camera.minZ = 0.1;  // Vue des objets proches
    
    return camera;
}
