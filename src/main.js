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
light.intensity = 0.1;

// Sol
const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
const groundMaterial = new StandardMaterial("groundMat", scene);
groundMaterial.diffuseColor = new Color3(0.5, 0.35, 0.2); // Couleur parquet
ground.material = groundMaterial;
ground.checkCollisions = true;

// Plafond
const ceiling = MeshBuilder.CreateGround("ceiling", { width: 10, height: 10 }, scene);
const ceilingMaterial = new StandardMaterial("ceilingMat", scene);
ceilingMaterial.diffuseColor = new Color3(0, 0, 0); // Couleur noir
ceiling.material = ceilingMaterial;
ceiling.position = new Vector3(0, 4, 0);
ceiling.rotation = new Vector3(Math.PI, 0, 0);
ceiling.checkCollisions = true;

// Murs
const wallMaterial = new StandardMaterial("wallMat", scene);
wallMaterial.diffuseColor = new Color3(0.95, 0.95, 0.9); // Blanc cassé
wallMaterial.backFaceCulling = false;

// Mur 1 (devant)
const wall1 = MeshBuilder.CreatePlane("wall1", { width: 10, height: 4 }, scene);
wall1.material = wallMaterial;
wall1.position = new Vector3(0, 2, -5);
wall1.rotation = new Vector3(0, Math.PI, 0); // Rotation pour l'orientation correcte
wall1.checkCollisions = true;

// Mur 2 (gauche)
const wall2 = MeshBuilder.CreatePlane("wall2", { width: 10, height: 4 }, scene);
wall2.material = wallMaterial;
wall2.position = new Vector3(-5, 2, 0);
wall2.rotation = new Vector3(0, -Math.PI / 2, 0); // Orientation vers la gauche
wall2.checkCollisions = true;

// Mur 3 (droite)
const wall3 = MeshBuilder.CreatePlane("wall3", { width: 10, height: 4 }, scene);
wall3.material = wallMaterial;
wall3.position = new Vector3(5, 2, 0);
wall3.rotation = new Vector3(0, Math.PI / 2, 0); // Orientation vers la droite
wall3.checkCollisions = true;

// Mur 4 (derrière)
const wall4 = MeshBuilder.CreatePlane("wall4", { width: 10, height: 4 }, scene);
wall4.material = wallMaterial;
wall4.position = new Vector3(0, 2, 5);
wall4.checkCollisions = true;

// Déclaration du matériau de la porte
const doorMaterial = new StandardMaterial("doorMat", scene);
doorMaterial.diffuseColor = new Color3(0.7, 0.5, 0.2);  // Couleur rouge

// Création de la porte avec le matériau
const door = MeshBuilder.CreateBox("door", { width: 2, height: 3, depth: 0.1 }, scene);
door.material = doorMaterial;
door.position = new Vector3(0, 1.5, -4.9);  // Légèrement en avant
door.checkCollisions = false;

// Mains
const handMaterial = new StandardMaterial("handMat", scene);
handMaterial.diffuseColor = new Color3(0.8, 0.4, 0.2);

const leftHand = MeshBuilder.CreateBox("leftHand", { width: 0.2, height: 0.1, depth: 0.3 }, scene);
leftHand.material = handMaterial;

const rightHand = leftHand.clone("rightHand");

// Création de la clé dans la salle
const keyMaterial = new StandardMaterial("keyMat", scene);
keyMaterial.diffuseColor = new Color3(1, 1, 0);  // Couleur rouge

const swordMaterial = new StandardMaterial("swordMat", scene);
swordMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur métallique pour l'épée

const potionMaterial = new StandardMaterial("potionMat", scene);
potionMaterial.diffuseColor = new Color3(0, 0, 1); // Couleur bleue pour la potion

//clé
const key = MeshBuilder.CreateCylinder("key", { height: 0.5, diameter: 0.2 }, scene);
key.material = keyMaterial;
key.position = new Vector3(0, 1, 0);  // Position de la clé dans la salle
key.checkCollisions = true;

// Création de l'épée
const sword = MeshBuilder.CreateBox("sword", { width: 0.1, height: 0.5, depth: 0.1 }, scene);
sword.material = swordMaterial;
sword.position = new Vector3(-1, 1, 0); // Position de l'épée
sword.checkCollisions = true;

// Création de la potion
const potion = MeshBuilder.CreateSphere("potion", { diameter: 0.3 }, scene);
potion.material = potionMaterial;
potion.position = new Vector3(1, 1, 0); // Position de la potion
potion.checkCollisions = true;

const flashlightMaterial = new StandardMaterial("flashlightMat", scene);
flashlightMaterial.diffuseColor = new Color3(1, 1, 0); // Jaune vif

const flashlight = MeshBuilder.CreateCylinder("flashlight", { height: 0.3, diameter: 0.1 }, scene);
flashlight.material = flashlightMaterial;
flashlight.position = new Vector3(1, 1, 1); // Position de la lampe torche

// Création du lit
const bedMaterial = new StandardMaterial("bedMat", scene);
bedMaterial.diffuseColor = new Color3(0.8, 0.5, 0.3);  // Couleur bois clair

// Base du lit (un grand rectangle)
const bedBase = MeshBuilder.CreateBox("bedBase", { width: 2, height: 0.1, depth: 1 }, scene);
bedBase.material = bedMaterial;
bedBase.position = new Vector3(-4, 0.05, -4);  // Position du lit dans le coin de la pièce
bedBase.checkCollisions = true;

// Matelas du lit
const mattressMaterial = new StandardMaterial("mattressMat", scene);
mattressMaterial.diffuseColor = new Color3(0.9, 0.9, 0.9);  // Couleur blanc pour le matelas

const mattress = MeshBuilder.CreateBox("mattress", { width: 2, height: 0.1, depth: 1 }, scene);
mattress.material = mattressMaterial;
mattress.position = new Vector3(-4, 0.2, -4);  // Position du matelas sur la base du lit
mattress.checkCollisions = true;

// Oreillers
const pillowMaterial = new StandardMaterial("pillowMat", scene);
pillowMaterial.diffuseColor = new Color3(1, 1, 1);  // Couleur blanc pour les oreillers

const pillow1 = MeshBuilder.CreateBox("pillow1", { width: 0.5, height: 0.2, depth: 0.3 }, scene);
pillow1.material = pillowMaterial;
pillow1.position = new Vector3(-4.5, 0.35, -4.5);  // Position du premier oreiller

const pillow2 = pillow1.clone("pillow2");
pillow2.position = new Vector3(-3.5, 0.35, -4.5);  // Position du second oreiller

// Variables pour stocker les objets ramassés
let inventory = {
  key: false,
  sword: false,
  potion: false,
  flashlight: false,
};

scene.onBeforeRenderObservable.add(() => {
  const cameraForward = camera.getDirection(Vector3.Forward()).normalize();
  const cameraRight = camera.getDirection(Vector3.Right()).normalize();

  // Position des mains par rapport à la caméra
  leftHand.position = camera.position
      .add(cameraForward.scale(0.6))
      .subtract(cameraRight.scale(0.3))
      .add(new Vector3(0, -0.2, 0));

  rightHand.position = camera.position
      .add(cameraForward.scale(0.6))
      .add(cameraRight.scale(0.3))
      .add(new Vector3(0, -0.2, 0));

  leftHand.rotation = camera.rotation;
  rightHand.rotation = camera.rotation;
});

// Déplacements (avec gestion des touches multiples)
const keyboardMap = {}; // Carte pour les touches enfoncées
let speed = 0.1; // Vitesse de déplacement

scene.actionManager = new ActionManager(scene);
scene.actionManager.registerAction(new ExecuteCodeAction(
  ActionManager.OnKeyDownTrigger,
  (evt) => {
      keyboardMap[evt.sourceEvent.key.toLowerCase()] = true;
  }
));
scene.actionManager.registerAction(new ExecuteCodeAction(
  ActionManager.OnKeyUpTrigger,
  (evt) => {
      keyboardMap[evt.sourceEvent.key.toLowerCase()] = false;
  }
));

// Détection du clic sur la clé
key.actionManager = new ActionManager(scene);

// Quand l'utilisateur clique sur la clé, ajoute-la à l'inventaire
key.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
  if (!hasKey) {
      hasKey = true;
      inventoryText.text += "\n- Clé";  // Ajoute la clé à l'inventaire
      key.setEnabled(false);  // Désactive l'objet clé après l'avoir ramassé
  }
}));

scene.onBeforeRenderObservable.add(() => {
  const moveVector = new Vector3(0, 0, 0);

  // Gérer les mouvements avec ZQSD et flèches
  if (keyboardMap["z"] || keyboardMap["arrowup"]) moveVector.z = 1;
  if (keyboardMap["s"] || keyboardMap["arrowdown"]) moveVector.z = -1;
  if (keyboardMap["q"] || keyboardMap["arrowleft"]) moveVector.x = -1;
  if (keyboardMap["d"] || keyboardMap["arrowright"]) moveVector.x = 1;

  // Appliquer le déplacement avec gestion des collisions
  const nextPosition = camera.position.add(moveVector.scale(speed));

  // Vérifier les collisions et ne déplacer que si la position est valide
  const newPos = nextPosition.add(camera.ellipsoid);
  if (!scene.collisionsEnabled || !camera.checkCollisions) {
      camera.position = nextPosition;
  }
});



// Inventaire (interface utilisateur)
const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
const inventoryPanel = new StackPanel();
inventoryPanel.isVisible = false;
inventoryPanel.width = "300px";
inventoryPanel.height = "200px";
inventoryPanel.background = "rgba(0, 0, 0, 0.5)"; // Fond transparent noir
advancedTexture.addControl(inventoryPanel);

const inventoryText = new TextBlock();
inventoryText.text = "Sac à dos :\n(vide)";
inventoryText.color = "white";
inventoryPanel.addControl(inventoryText);

let keyInHand = null; // Variable pour stocker la clé dans la main

function updateInventoryText() {
  let inventoryItems = "Sac à dos :\n";
  if (inventory.key) inventoryItems += "[1] Clé\n";
  if (inventory.sword) inventoryItems += "[2] Épée\n";
  if (inventory.potion) inventoryItems += "[3] Potion de soin\n";
  if (inventory.flashlight) inventoryItems += "[4] Lampe torche\n";
  inventoryText.text = inventoryItems;
}
function collectItem(item) {
  switch (item) {
      case "key":
          if (!inventory.key) {
              inventory.key = true;
              key.dispose(); // Supprime la clé de la scène
              updateInventoryText();
          }
          break;
      case "sword":
          if (!inventory.sword) {
              inventory.sword = true;
              sword.dispose(); // Supprime l'épée de la scène
              updateInventoryText();
          }
          break;
      case "potion":
          if (!inventory.potion) {
              inventory.potion = true;
              potion.dispose(); // Supprime la potion de la scène
              updateInventoryText();
          }
          break;
      case "flashlight": // Gestion de la lampe torche
          if (!inventory.flashlight) {
              inventory.flashlight = true;
              flashlight.dispose(); // Supprime la lampe torche de la scène
              updateInventoryText();
          }
          break;
  }
}

// Fonction pour équiper un objet
let equippedItem = null; // Objet actuellement équipé
let flashlightOn = false;

function equipItem(item) {
  if (!inventory[item]) return; // Si l'objet n'est pas dans l'inventaire, ne rien faire

  unequipItem(); // Retire l'objet précédemment équipé

  switch (item) {
      case "flashlight": // Équipement de la lampe torche
          equippedItem = MeshBuilder.CreateCylinder("flashlightInHand", { height: 0.3, diameter: 0.1 }, scene);
          equippedItem.material = flashlightMaterial;

          // Création du faisceau lumineux
          const spotlight = new BABYLON.SpotLight(
              "spotlight",
              camera.position, // Position initiale : à la position de la caméra
              camera.getDirection(Vector3.Forward()), // Direction alignée sur la caméra
              Math.PI / 3, // Augmenter l'angle pour une diffusion plus large
              2, // Exposant pour une atténuation plus douce
              scene
          );

          spotlight.diffuse = new Color3(1, 1, 1); // Couleur blanche
          spotlight.specular = new Color3(1, 1, 1);
          spotlight.intensity = 0; // Par défaut, la lumière est éteinte
          spotlight.range = 20; // Augmente la portée du faisceau
          spotlight.falloffType = BABYLON.Light.FALLOFF_EXPONENTIAL; // Atténuation exponentielle pour une transition plus fluide
          spotlight.angle = Math.PI / 3; // Augmenter l'angle du faisceau pour un éclairage plus diffus
          spotlight.position = camera.position.add(camera.getDirection(Vector3.Forward()).scale(0.5)); // Position légèrement devant la caméra

          equippedItem.spotlight = spotlight; // Attache le faisceau lumineux à l'objet équipé

          // Mise à jour de la position et direction du faisceau lumineux à chaque frame
          scene.onBeforeRenderObservable.add(() => {
              spotlight.position = camera.position.add(camera.getDirection(Vector3.Forward()).scale(0.5)); // Position de la lumière à la caméra + une petite offset
              spotlight.direction = camera.getDirection(Vector3.Forward()); // Direction alignée avec la caméra
          });

          // Optionnel : Ajouter un `shadowGenerator` pour des ombres douces (soft shadows)
          const shadowGenerator = new BABYLON.ShadowGenerator(1024, spotlight);
          shadowGenerator.usePoissonSampling = true; // Améliore la qualité des ombres en rendant les bords plus doux
          shadowGenerator.setDarkness(0.4); // Ajuste la densité de l'ombre pour des ombres plus subtiles
          shadowGenerator.bias = 0.02; // Ajuste le biais pour éviter les artefacts d'ombre

          break;
  }

  // Fixe l'objet équipé à la main droite
  if (equippedItem) {
      equippedItem.parent = rightHand;
      equippedItem.position = new Vector3(0, 0, 0.15); // Position relative à la main
      equippedItem.rotation = new Vector3(Math.PI / 2, 0, 0); // Rotation ajustée
  }
}
// Fonction pour déséquiper l'objet de la main
function unequipItem() {
  if (equippedItem) {
      // Si l'objet équipé est une lampe torche, supprimer la lumière
      if (equippedItem.spotlight) {
          equippedItem.spotlight.dispose(); // Supprime la lumière associée
          equippedItem.spotlight = null; // Réinitialise la référence à la lumière
      }
      
      equippedItem.dispose(); // Supprime l'objet de la main
      equippedItem = null; // Réinitialise la variable
  }
}

// Interaction avec les objets dans la salle
scene.onPointerDown = function (evt, pickResult) {
  if (pickResult.hit) {
      if (pickResult.pickedMesh === key) collectItem("key");
      if (pickResult.pickedMesh === sword) collectItem("sword");
      if (pickResult.pickedMesh === potion) collectItem("potion");
      if (pickResult.pickedMesh === flashlight) collectItem("flashlight");
  }
};



// Affichage/masquage de l'inventaire
window.addEventListener("keydown", (event) => {
  if (event.key === "e" || event.key === "E") inventoryPanel.isVisible = !inventoryPanel.isVisible;

  if (event.key === "1" || event.key === "&") equipItem("key");
  if (event.key === "2" || event.key === "é") equipItem("sword");
  if (event.key === "3" || event.key === "\"") equipItem("potion");
  if (event.key === "4" || event.key === "'") equipItem("flashlight");

  if (event.key === "r" || event.key === "R") unequipItem(); // Permet de retirer l'objet de la main

  // Action sur la touche espace pour allumer/éteindre la lumière de la lampe torche
  if (event.key === " " && equippedItem && equippedItem.spotlight) {
      flashlightOn = !flashlightOn; // Alterne l'état de la lampe torche

      if (flashlightOn) {
          equippedItem.spotlight.intensity = 0.8; // Allume la lumière
      } else {
          equippedItem.spotlight.intensity = 0; // Éteint la lumière
      }
  }
});


// Boucle de rendu
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());