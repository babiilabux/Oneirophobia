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
light.intensity = 1.005;


// Création du sol
const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10, subdivisions: 100 }, scene);

// Création du matériau PBR
const groundMaterial = new BABYLON.PBRMaterial("groundMaterial", scene);

// Charger la texture diffuse (Albedo)
groundMaterial.albedoTexture = new BABYLON.Texture("../Textures/floor_diffuse.jpg", scene);

groundMaterial.albedoTexture.uScale = 3; // Plus grand = motifs plus petits
groundMaterial.albedoTexture.vScale = 3; // Plus grand = motifs plus petits
// groundMaterial.bumpTexture.uScale = 3;
// groundMaterial.bumpTexture.vScale = 3; reactiver si on active normal map


// Charger la Normal Map (bleue)
groundMaterial.bumpTexture = null;
groundMaterial.invertNormalMapX = true; 
groundMaterial.invertNormalMapY = true;



// Charger la Roughness Map (définit la rugosité)
groundMaterial.metallicTexture = new BABYLON.Texture("../Textures/floor_roughness.jpg", scene);
groundMaterial.useRoughnessFromMetallicTextureAlpha = false;
groundMaterial.useRoughnessFromMetallicTextureGreen = true; // Souvent stockée dans le canal vert

// Ajuster la rugosité globale (1 = mat, 0 = brillant)
groundMaterial.roughness = 1;

// Ajouter la Displacement Map (carte de déplacement)
groundMaterial.displacementTexture = new BABYLON.Texture("../Textures/floor_displacement.jpg", scene);

// Configurer la force du displacement (intensité du relief)
groundMaterial.displacementScale = 0.2; // Ajuster cette valeur pour un relief plus ou moins marqué
groundMaterial.displacementBias = 0;  // Ajuster le biais pour décaler le relief si nécessaire

// Appliquer le matériau au sol
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



// Matériau PBR pour les murs
const wallMaterial = new BABYLON.PBRMaterial("wallMat", scene);
wallMaterial.albedoColor = new BABYLON.Color3(0.95, 0.95, 0.9); // Couleur de base (blanc cassé)

// Appliquer les textures
wallMaterial.albedoTexture = new BABYLON.Texture("../Textures/wall_brick_diffuse.jpg", scene); // Texture diffuse
wallMaterial.bumpTexture = new BABYLON.Texture("../Textures/wall_brick_normal.jpg", scene);  // Texture normale
wallMaterial.metallicTexture = new BABYLON.Texture("../Textures/wall_brick_roughness.jpg", scene); // Texture de rugosité (roughness)
wallMaterial.displacementTexture = new BABYLON.Texture("../Textures/wall_brick_displacement.jpg", scene);

wallMaterial.bumpTexture.level = 1.0; // Niveau d'intensité de la texture normale
wallMaterial.roughness = 0.8; // Ajustez en fonction de l'effet désiré
wallMaterial.metallic = 0.1; // Ajustez en fonction du niveau métallique du matériau
wallMaterial.displacementScale = 0.2; // Ajuster cette valeur pour un relief plus ou moins marqué
wallMaterial.displacementBias = 0;  // Ajuster le biais pour décaler le relief si nécessaire

// Murs
// Mur 1 (devant)
const wall1 = BABYLON.MeshBuilder.CreatePlane("wall1", { width: 10, height: 4 }, scene);
wall1.material = wallMaterial;
wall1.position = new BABYLON.Vector3(0, 2, -5);
wall1.rotation = new BABYLON.Vector3(0, Math.PI, 0); // Rotation pour l'orientation correcte
wall1.checkCollisions = true;

// Mur 2 (gauche)
const wall2 = BABYLON.MeshBuilder.CreatePlane("wall2", { width: 10, height: 4 }, scene);
wall2.material = wallMaterial;
wall2.position = new BABYLON.Vector3(-5, 2, 0);
wall2.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0); // Orientation vers la gauche
wall2.checkCollisions = true;

// Mur 3 (droite)
const wall3 = BABYLON.MeshBuilder.CreatePlane("wall3", { width: 10, height: 4 }, scene);
wall3.material = wallMaterial;
wall3.position = new BABYLON.Vector3(5, 2, 0);
wall3.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0); // Orientation vers la droite
wall3.checkCollisions = true;

// Mur 4 (derrière)
// Mur arrière (divisé en 2 pour laisser la place à la porte)
const wallThickness = 0.2; // Ajuste l'épaisseur selon ton besoin

const wall4Left = BABYLON.MeshBuilder.CreateBox("wall4Left", { width: 4.3, height: 4, depth: wallThickness }, scene);
wall4Left.material = wallMaterial;
wall4Left.position = new BABYLON.Vector3(-2.85, 2, 5); // Même position
wall4Left.checkCollisions = true;

const wall4Right = BABYLON.MeshBuilder.CreateBox("wall4Right", { width: 4.3, height: 4, depth: wallThickness }, scene);
wall4Right.material = wallMaterial;
wall4Right.position = new BABYLON.Vector3(2.85, 2, 5); // Même position
wall4Right.checkCollisions = true;


// Ajout de la deuxième salle (même dimensions que la première)
const ground2 = BABYLON.MeshBuilder.CreateGround("ground2", { width: 10, height: 10 }, scene);
ground2.material = groundMaterial;
ground2.position.z = 10; // Derrière la première salle
ground2.checkCollisions = true;

// Plafond de la deuxième salle
const ceiling2 = BABYLON.MeshBuilder.CreateGround("ceiling2", { width: 10, height: 10 }, scene);
ceiling2.material = ceilingMaterial;
ceiling2.position = new BABYLON.Vector3(0, 4, 10);
ceiling2.rotation = new BABYLON.Vector3(Math.PI, 0, 0);
ceiling2.checkCollisions = true;

// Murs de la deuxième salle
const wall5 = BABYLON.MeshBuilder.CreatePlane("wall5", { width: 10, height: 4 }, scene);
wall5.material = wallMaterial;
wall5.position = new BABYLON.Vector3(0, 2, 15);
wall5.rotation = new BABYLON.Vector3(0, Math.PI, 0);
wall5.checkCollisions = true;

const wall6 = BABYLON.MeshBuilder.CreatePlane("wall6", { width: 10, height: 4 }, scene);
wall6.material = wallMaterial;
wall6.position = new BABYLON.Vector3(-5, 2, 10);
wall6.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);
wall6.checkCollisions = true;

const wall7 = BABYLON.MeshBuilder.CreatePlane("wall7", { width: 10, height: 4 }, scene);
wall7.material = wallMaterial;
wall7.position = new BABYLON.Vector3(5, 2, 10);
wall7.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
wall7.checkCollisions = true;



// Création du matériau PBR pour la porte
const doorPBRMaterial = new BABYLON.PBRMaterial("doorPBRMat", scene);

// Charger la texture diffuse (la texture de base) pour la porte
doorPBRMaterial.albedoTexture = new BABYLON.Texture("../Textures/wood_door.jpg", scene);

// Ajuster l'échelle de la texture pour éviter les répétitions

// Charger la texture de rugosité (ici, une texture de rugosité simple pourrait être utilisée)
doorPBRMaterial.metallicTexture = new BABYLON.Texture("../Textures/wood_roughness.jpg", scene); // Remplace cette texture par ta texture de rugosité
doorPBRMaterial.roughness = 0.8;  // Tu peux ajuster cela selon la rugosité de ton bois

// Ajouter une texture de normal map pour donner du relief à la texture
doorPBRMaterial.bumpTexture = new BABYLON.Texture("../Textures/wood_normal.jpg", scene);  // Remplace par ta texture de normal map

// Ajouter une légère réflexion (en ajustant le paramètre de métallisation et rugosité)
doorPBRMaterial.metallic = 0.0;  // Le bois n'est pas métallique
doorPBRMaterial.roughness = 0.8; // Ajuste la rugosité

// Désactiver le backFaceCulling pour voir la texture des deux côtés de la porte
doorPBRMaterial.backFaceCulling = false;

// Créer la géométrie de la porte (une simple boîte pour l'exemple)
const door = BABYLON.MeshBuilder.CreateBox("door", { height: 3, width: 1.4, depth: 0.1 }, scene); // Créer la porte avec une taille de 3x1x0.1
door.setPivotPoint(new BABYLON.Vector3(0.7, 0, 0)); // Déplace le pivot sur le bord gauche

// Appliquer le matériau PBR à la porte
door.material = doorPBRMaterial;

// Positionner la porte dans la scène
door.position = new BABYLON.Vector3(0, 1.5, 5); // Positionner la porte à (0, 1.5, 5) (ajuste en fonction de ta scène)

// Activer les collisions pour la porte
door.checkCollisions = true;  // Activer les collisions pour ce mesh
// Détecter la proximité du joueur avec la porte
let doorOpen = false;

scene.onKeyboardObservable.add((kbInfo) => {
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key === "a") {
        const distance = BABYLON.Vector3.Distance(door.position, camera.position);
        if (distance < 2.5 && !doorOpen) {
            openDoor();
        }
    }
});

function openDoor() {
    doorOpen = true;
    const animation = new BABYLON.Animation(
        "doorOpenAnimation",
        "rotation.y",
        30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keys = [
        { frame: 0, value: 0 },
        { frame: 30, value: Math.PI / 2 }
    ];

    animation.setKeys(keys);
    door.animations = [animation];
    scene.beginAnimation(door, 0, 30, false);
}

function closeDoor() {
  doorOpen = false;
  const animation = new BABYLON.Animation(
      "doorCloseAnimation",
      "rotation.y",
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [
      { frame: 0, value: Math.PI / 2 },
      { frame: 30, value: 0 }
  ];

  animation.setKeys(keys);
  door.animations = [animation];
  scene.beginAnimation(door, 0, 30, false);
}

// Détection du joueur dans la deuxième salle
scene.registerBeforeRender(() => {
  if (doorOpen) {
      const playerInsideSecondRoom = camera.position.z > 6; // Si le joueur est dans la deuxième salle

      if (playerInsideSecondRoom) {
          setTimeout(() => {
              if (doorOpen) {
                  closeDoor();
              }
          }, 1000); // Attendre 1 seconde avant de fermer la porte
      }
  }
});




// Mains
const handMaterial = new StandardMaterial("handMat", scene);
handMaterial.diffuseColor = new Color3(0.8, 0.4, 0.2);

const leftHand = MeshBuilder.CreateBox("leftHand", { width: 0.2, height: 0.1, depth: 0.3 }, scene);
leftHand.material = handMaterial;

const rightHand = leftHand.clone("rightHand");

// Création d'un élément
// const keyMaterial = new StandardMaterial("keyMat", scene);
// keyMaterial.diffuseColor = new Color3(1, 1, 0);  


// modélisation et position de l'élément
// const key = MeshBuilder.CreateCylinder("key", { height: 0.5, diameter: 0.2 }, scene);
// key.material = keyMaterial;
// key.position = new Vector3(0, 1, 0);  // Position de la clé dans la salle
// key.checkCollisions = true;


BABYLON.SceneLoader.Append("/models/", "flashlight.glb", scene, function (scene) {
  console.log("Modèle chargé avec succès !");
}, null, function (scene, message) {
  console.error("Erreur de chargement :", message);
});


const flashlightMaterial = new StandardMaterial("flashlightMat", scene);
flashlightMaterial.diffuseColor = new Color3(1, 1, 0); // Jaune vif

const flashlight = MeshBuilder.CreateCylinder("flashlight", { height: 0.3, diameter: 0.1 }, scene);
flashlight.material = flashlightMaterial;
flashlight.position = new Vector3(1, 1, 1); // Position de la lampe torche

// Variables pour stocker les objets ramassés
let inventory = {
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

function updateInventoryText() {
  let inventoryItems = "Sac à dos :\n";
  if (inventory.flashlight) inventoryItems += "Lampe torche\n";
  inventoryText.text = inventoryItems;
}
function collectItem(item) {
  switch (item) {
      // case "element modélisé a récupérer":
      //     if (!inventory.key) {
      //         inventory.key = true;
      //         key.dispose(); // Supprime la clé de la scène
      //         updateInventoryText();
      //     }
      //     break;
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
              Math.PI / 2, // Augmenter l'angle pour une diffusion plus large
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
      // if (pickResult.pickedMesh === key) collectItem("element a ajouter");
      if (pickResult.pickedMesh === flashlight) collectItem("flashlight");
  }
};



// Affichage/masquage de l'inventaire
window.addEventListener("keydown", (event) => {
  if (event.key === "e" || event.key === "E") inventoryPanel.isVisible = !inventoryPanel.isVisible;

  // if (event.key === "1" || event.key === "&") equipItem("element a ajouter");
  if (event.key === "4" || event.key === "'") equipItem("flashlight");

  if (event.key === "r" || event.key === "R") unequipItem(); // Permet de retirer l'objet de la main

  // Action sur la touche espace pour allumer/éteindre la lumière de la lampe torche
  if (event.key === " " && equippedItem && equippedItem.spotlight) {
      flashlightOn = !flashlightOn; // Alterne l'état de la lampe torche

      if (flashlightOn) {
          equippedItem.spotlight.intensity = 10; // Allume la lumière
      } else {
          equippedItem.spotlight.intensity = 0; // Éteint la lumière
      }
  }
});


// Boucle de rendu
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());