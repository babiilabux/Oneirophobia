import { 
    Engine, 
    Scene, 
    FreeCamera, 
    HemisphericLight, 
    Vector3, 
    MeshBuilder, 
    StandardMaterial, 
    Color3,
    Texture,
    PBRMaterial
  } from "@babylonjs/core";
  import "@babylonjs/loaders/glTF";
  
  import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
  import { AdvancedDynamicTexture, StackPanel, TextBlock } from "@babylonjs/gui/2D";

  // Récupération du canvas
const canvas = document.getElementById("renderCanvas");

// Initialisation de l'engin Babylon.js
const engine = new Engine(canvas, true);

// Création de la scène
const scene = new Scene(engine);
scene.collisionsEnabled = true;

// Création de la caméradd
const camera = new FreeCamera("FreeCamera", new Vector3(0, 1.8, 0), scene);
camera.attachControl(canvas, true);  // Permet à la caméra de suivre la souris sans clic
camera.speed = 0.1;
camera.angularSensibility = 1000;
camera.checkCollisions = true;  // Vérifie les collisions
camera.applyGravity = true;
camera.ellipsoid = new Vector3(0.5, 1, 0.5); // Collisions avec les murs
camera.minZ = 0.1;  // Vue des objets proches


// Lumière
const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
light.intensity = 0.05;