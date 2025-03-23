import { CONFIG } from '../config';
import { createCamera } from "../core/camera";
import { createLight } from "../core/light";
import { 
    Engine, 
    Scene, 
    FreeCamera, 
    HemisphericLight, 
    Vector3, 
    MeshBuilder, 
    StandardMaterial, 
    Color3
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";

export function createGameScene(engine, canvas) {
    const scene = new Scene(engine);

    // Créer la caméra
    const camera = createCamera(scene, canvas);
    scene.activeCamera = camera;  // Assurez-vous que la caméra est bien définie
    camera.position = new Vector3(0, 5, -10); // Place la caméra en hauteur et en retrait
    camera.setTarget(Vector3.Zero()); // Oriente la caméra vers le centre de la scène

    console.log("Scene 1 créée");
console.log("Caméra active :", scene.activeCamera);

    // Créer la lumière
    createLight(scene);

    // Ajouter un sol
    const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);  // Gris
    ground.material = groundMaterial;

    // Créer un cube
    const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
    box.position = new Vector3(0, 1, 0); // Place le cube au-dessus du sol

    // Appliquer un matériau simple pour le cube
    const boxMaterial = new StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseColor = new Color3(1, 0, 0); // Rouge
    box.material = boxMaterial;

    return scene;
}
