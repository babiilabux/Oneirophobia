import { Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder, PBRMaterial, StandardMaterial, Texture, Color3 } from "@babylonjs/core";
import { createFlashlight } from "../objects/flashlight.js";
import { createKey } from "../objects/key.js";
import { createDoor } from "../objects/door.js";
import { createSafe } from "../objects/safe.js";
import { createInventory } from "../ui/inventory.js";
import { initGame } from "../ui/intro.js";
import { createTableau } from "../objects/tableau.js";

export function createScene1(engine) {
  const scene = new Scene(engine);

  // Lumière
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0;

  // Caméra
  const camera = new FreeCamera("FreeCamera", new Vector3(0, 2, 0), scene);
  camera.setTarget(new Vector3(0, 2.3, 2));
  camera.speed = 0.1;
  camera.angularSensibility = 1000;
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.ellipsoid = new Vector3(0.5, 1, 0.5);
  camera.minZ = 0.1;

  // Configuration des contrôles clavier pour ZQSD
  camera.inputs.attached.keyboard.keysUp.push(90);
  camera.inputs.attached.keyboard.keysLeft.push(81);
  camera.inputs.attached.keyboard.keysDown.push(83);
  camera.inputs.attached.keyboard.keysRight.push(68);

  // Création des objets
  const flashlight = createFlashlight(scene);
  const key = createKey(scene);
  const door = createDoor(scene, camera);
  const safe = createSafe(scene);

  // Création des tableaux
  createTableau(scene, new Vector3(-4.9, 2.15, 7.5), new Vector3(0, -Math.PI / 2, 0), "../Textures/tableau1.png");
  createTableau(scene, new Vector3(-2.9, 2.15, 9.9), new Vector3(0, 0, 0), "../Textures/tableau2.png");
  createTableau(scene, new Vector3(0, 2.15, 9.9), new Vector3(0, 0, 0), "../Textures/tableau3.png");

  // Création de l'inventaire
  createInventory(scene);

  // Initialisation du jeu
  initGame(scene);

  // Sol
  const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10, subdivisions: 100 }, scene);
  const groundMaterial = new PBRMaterial("groundMaterial", scene);
  groundMaterial.albedoTexture = new Texture("../Textures/floor_diffuse.jpg", scene);
  groundMaterial.albedoTexture.uScale = 3;
  groundMaterial.albedoTexture.vScale = 3;
  groundMaterial.roughness = 1;
  ground.material = groundMaterial;
  ground.checkCollisions = true;

  // Plafond
  const ceiling = MeshBuilder.CreateGround("ceiling", { width: 10, height: 10 }, scene);
  const ceilingMaterial = new StandardMaterial("ceilingMat", scene);
  ceilingMaterial.diffuseColor = new Color3(0, 0, 0);
  ceiling.material = ceilingMaterial;
  ceiling.position = new Vector3(0, 4, 0);
  ceiling.rotation = new Vector3(Math.PI, 0, 0);
  ceiling.checkCollisions = true;

  // Murs
  const wallMaterial = new PBRMaterial("wallMat", scene);
  wallMaterial.albedoTexture = new Texture("../Textures/wall_brick_diffuse.jpg", scene);
  wallMaterial.bumpTexture = new Texture("../Textures/wall_brick_normal.jpg", scene);
  wallMaterial.metallicTexture = new Texture("../Textures/wall_brick_roughness.jpg", scene);
  wallMaterial.displacementTexture = new Texture("../Textures/wall_brick_displacement.jpg", scene);
  wallMaterial.backFaceCulling = false;

  const wall1 = MeshBuilder.CreatePlane("wall1", { width: 10, height: 4 }, scene);
  wall1.material = wallMaterial;
  wall1.position = new Vector3(0, 2, -5);
  wall1.rotation = new Vector3(0, Math.PI, 0);
  wall1.checkCollisions = true;

  const wall2 = MeshBuilder.CreatePlane("wall2", { width: 10, height: 4 }, scene);
  wall2.material = wallMaterial;
  wall2.position = new Vector3(-5, 2, 0);
  wall2.rotation = new Vector3(0, -Math.PI / 2, 0);
  wall2.checkCollisions = true;

  const wall3 = MeshBuilder.CreatePlane("wall3", { width: 10, height: 4 }, scene);
  wall3.material = wallMaterial;
  wall3.position = new Vector3(5, 2, 0);
  wall3.rotation = new Vector3(0, Math.PI / 2, 0);
  wall3.checkCollisions = true;

  const wall4Left = MeshBuilder.CreateBox("wall4Left", { width: 4.3, height: 4, depth: 0.2 }, scene);
  wall4Left.material = wallMaterial;
  wall4Left.position = new Vector3(-2.85, 2, 5);
  wall4Left.checkCollisions = true;

  const wall4Right = MeshBuilder.CreateBox("wall4Right", { width: 4.3, height: 4, depth: 0.2 }, scene);
  wall4Right.material = wallMaterial;
  wall4Right.position = new Vector3(2.85, 2, 5);
  wall4Right.checkCollisions = true;

  return scene;
}
