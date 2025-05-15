import { Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder, PBRMaterial, StandardMaterial, Texture, Color3 } from "@babylonjs/core";
import { createFlashlight } from "../objects/flashlight.js";
import { createKey } from "../objects/key.js";
import { createDoor } from "../objects/door.js";
import { createSafe } from "../objects/safe.js";
import { createInventory } from "../ui/inventory.js";
import { initGame } from "../ui/intro.js";
import { createTableau } from "../objects/tableau.js";
import { loadBed, loadDesk, loadKey, loadSafe } from "../utils/loaders.js";
import { checkLighting } from "../utils/lighting.js";
import { showNotification } from "../utils/helpers.js";
import { createCamera } from "../core/camera.js";
import { createLighting } from "../core/lighting.js";

export async function createScene1(engine, canvas) {
  const scene = new Scene(engine);

  // === Lumière ===
  const light = createLighting(scene, 0);

  // === Caméra ===
  const camera = createCamera(scene, canvas);

  // === Sol principal ===
  const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
  const groundMaterial = new PBRMaterial("groundMaterial", scene);
  groundMaterial.albedoTexture = new Texture("../Textures/floor_diffuse.jpg", scene);
  groundMaterial.bumpTexture = new Texture("../Textures/floor_normal.jpg", scene);
  groundMaterial.roughness = 1;
  groundMaterial.metallic = 0.1;
  ground.material = groundMaterial;
  ground.checkCollisions = true;

  // === Plafond ===
  const ceiling = MeshBuilder.CreateGround("ceiling", { width: 10, height: 10 }, scene);
  const ceilingMaterial = new PBRMaterial("ceilingMaterial", scene);
  ceilingMaterial.albedoColor = new Color3(0, 0, 0); // Noir
  ceiling.material = ceilingMaterial;
  ceiling.position = new Vector3(0, 4, 0);
  ceiling.rotation = new Vector3(Math.PI, 0, 0);
  ceiling.checkCollisions = true;

  // === Murs ===
  const wallMaterial = new PBRMaterial("wallMaterial", scene);
  wallMaterial.albedoTexture = new Texture("../Textures/wall_brick_diffuse.jpg", scene);
  wallMaterial.bumpTexture = new Texture("../Textures/wall_brick_normal.jpg", scene);
  wallMaterial.roughness = 0.8;
  wallMaterial.metallic = 0.1;

  const walls = [
    { name: "wall1", width: 10, height: 4, position: new Vector3(0, 2, -5), rotation: new Vector3(0, Math.PI, 0) },
    { name: "wall2", width: 10, height: 4, position: new Vector3(-5, 2, 0), rotation: new Vector3(0, -Math.PI / 2, 0) },
    { name: "wall3", width: 10, height: 4, position: new Vector3(5, 2, 0), rotation: new Vector3(0, Math.PI / 2, 0) },
    { name: "wall4", width: 10, height: 4, position: new Vector3(0, 2, 5), rotation: new Vector3(0, 0, 0) },
  ];

  walls.forEach((wall) => {
    const mesh = MeshBuilder.CreatePlane(wall.name, { width: wall.width, height: wall.height }, scene);
    mesh.material = wallMaterial;
    mesh.position = wall.position;
    mesh.rotation = wall.rotation;
    mesh.checkCollisions = true;
  });

  // === Objets interactifs ===
  await loadBed(scene); // Lit
  await loadDesk(scene); // Bureau
  await loadKey(scene); // Clé
  await loadSafe(scene); // Coffre

  // === Lampe torche ===
  createFlashlight(scene, camera);

  // === Porte ===
  createDoor(scene, camera);

  // === Tableaux ===
  createTableau(scene, new Vector3(-4.9, 2.15, 7.5), new Vector3(0, -Math.PI / 2, 0), "../Textures/tableau1.png");
  createTableau(scene, new Vector3(-2.9, 2.15, 9.9), new Vector3(0, 0, 0), "../Textures/tableau2.png");
  createTableau(scene, new Vector3(0, 2.15, 9.9), new Vector3(0, 0, 0), "../Textures/tableau3.png");

  // === Vérification de l'éclairage ===
  checkLighting(scene, 0.5, () => {
    showNotification(scene, "Lumière faible : objets cachés révélés.", "yellow");
  }, () => {
    showNotification(scene, "Lumière forte : objets cachés masqués.", "blue");
  });

  // Création de l'inventaire
  createInventory(scene);

  // Initialisation du jeu
  initGame(scene, camera);

  return scene;
}
