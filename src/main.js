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
import { AdvancedDynamicTexture, StackPanel, TextBlock, Button, Control } from "@babylonjs/gui/2D";


// Récupération du canvas
const canvas = document.getElementById("renderCanvas");

// Initialisation de l'engin Babylon.js
const engine = new Engine(canvas, true);

// Création de la scène
const scene = new Scene(engine);
scene.collisionsEnabled = true;
// Lumière
const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
light.intensity = 0;


// Création de la caméradd
const camera = new FreeCamera("FreeCamera", new Vector3(0, 2, 0), scene);
camera.setTarget(new BABYLON.Vector3(0, 2.3, 2)); 
camera.speed = 0.1;
camera.angularSensibility = 1000;
camera.checkCollisions = true;  // Vérifie les collisions
camera.applyGravity = true;
camera.ellipsoid = new Vector3(0.5, 1, 0.5); // Collisions avec les murs
camera.minZ = 0.1;  // Vue des objets proches


// Configurer le contrôle clavier pour ZQSD
camera.inputs.attached.keyboard.keysUp.push(90);    // Z : Déplacement vers le haut (avant)
camera.inputs.attached.keyboard.keysLeft.push(81);  // Q : Déplacement vers la gauche
camera.inputs.attached.keyboard.keysDown.push(83);  // S : Déplacement vers le bas (arrière)
camera.inputs.attached.keyboard.keysRight.push(68); // D : Déplacement vers la droite

const introText = [
    "Appuie sur espace",
    "Ugh... que se passe-t-il ?",
    "Où suis-je ?",
    "Inconnu : ...",
    "Inconnu : Aide nous",
    "Qui parle ?",
    "Répondez !",
    "Inconnu : Tu dois...",
    "Inconnu : ...Sauver le monde des rêves",
    "Inconnu : Prépare-toi à affronter tes peurs...",
    "Inconnu : A découvrir une nouvelle réalité",
    "Je comprends rien",
    "Inconnu : Tu verras. Pour l'instant, récupère la lampe",
    "Inconnu : Elle te montrera la réalité",
    "*Déplace la caméra avec la souris*",
    "*Bouge avec les flèches*",
    "*Active ton inventaire avec E*",
    "*Récupère un objet en cliquant dessus*",
    "*Equipe le avec la touche associée [1-9]*",
    "*Interragit avec espace*",
];

let currentTextIndex = 0;
let textBlock = null;
let canPlay = false;
let flashlight = null;  // Référence globale à la lampe torche
let inventory = { flashlight: false, key: false }; // Inventaire

// Matériau pour la lampe torche
const flashlightMaterial = new BABYLON.StandardMaterial("flashlightMat", scene);
flashlightMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // Jaune vif
flashlightMaterial.emissiveColor = new BABYLON.Color3(0.85, 0.73, 0.83);  // Lampe torche visible, bleue sous la spotlight

// Interface de l'inventaire
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
const inventoryPanel = new BABYLON.GUI.StackPanel();
inventoryPanel.isVisible = false;
inventoryPanel.width = "300px";
inventoryPanel.height = "200px";
inventoryPanel.background = "rgba(0, 0, 0, 0.5)"; // Fond transparent noir
advancedTexture.addControl(inventoryPanel);

const inventoryText = new BABYLON.GUI.TextBlock();
inventoryText.text = "Sac à dos :\n(vide)";
inventoryText.color = "white";
inventoryPanel.addControl(inventoryText);

// Fonction pour mettre à jour l'inventaire
function updateInventoryText() {
    let inventoryItems = "Sac à dos :\n";
    if (inventory.flashlight) inventoryItems += "[1] Lampe torche\n";
    if (inventory.key) inventoryItems += "[2] Clé\n";
    inventoryText.text = inventoryItems;
}


// Fonction pour équiper un objet
let equippedItem = null; // Objet actuellement équipé
let flashlightOn = false;

window.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E" || event.key === "i" || event.key === "I") inventoryPanel.isVisible = !inventoryPanel.isVisible;  // Afficher/Masquer l'inventaire

    if (event.key === "1" || event.key === "&") equipItem("flashlight");
    if (event.key === "2" || event.key === "é") equipItem("key"); // Ajoute la touche "2" pour équiper la clé


    if (event.key === "r" || event.key === "R") unequipItem(); // Permet de retirer l'objet de la main
    

    // Action sur la touche espace pour allumer/éteindre la lumière de la lampe torche
    if (event.key === " " && equippedItem && equippedItem.spotlight) {
        flashlightOn = !flashlightOn; // Alterne l'état de la lampe torche

        if (flashlightOn) {
            equippedItem.spotlight.intensity = 100; // Allume la lumière
        } else {
            equippedItem.spotlight.intensity = 0; // Éteint la lumière
        }
    }
});

// Créer et afficher les textes d'introduction
function showIntroText() {
    const panel = new BABYLON.GUI.StackPanel();
    advancedTexture.addControl(panel);
    panel.width = "600px";
    panel.height = "150px";
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    // Créer un TextBlock pour afficher les phrases
    textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = introText[currentTextIndex];
    textBlock.fontSize = 24;
    textBlock.color = "white";
    textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    panel.addControl(textBlock);
}

// Afficher le texte suivant
function nextIntroText() {
    currentTextIndex++;
    if (currentTextIndex < introText.length) {
        // Mettre à jour le texte avec la nouvelle phrase
        textBlock.text = introText[currentTextIndex];

        // Appliquer la mise en forme pour les phrases de contrôle
        if (introText[currentTextIndex].includes("*")) {
            textBlock.color = "white";  // Texte en violet
            textBlock.fontStyle = "bold italic"; // Texte en gras et en italique
        } 
        else if (introText[currentTextIndex].includes("Inconnu")) {
            textBlock.color = "purple";  // Texte en violet
            textBlock.fontStyle = "italic"; // Texte en gras et en italique
        }
        else {
            textBlock.color = "white";  // Texte normal
            textBlock.fontStyle = "normal";  // Texte normal (pas de gras/italique)
        }
    } else {
        // Si toutes les phrases ont été affichées, cacher l'interface et commencer le jeu après un petit délai
        setTimeout(startGame, 300);  // Ajout d'un délai de 300 ms pour garantir que le texte est bien affiché avant de commencer
    }
}

// Démarrer le jeu et masquer l'interface d'introduction
// Démarrer le jeu et masquer l'interface d'introduction
function startGame() {
    // Masquer l'interface du texte d'introduction (disposer du panel)
    if (textBlock) {
        textBlock.dispose();  // Supprimer le texte de l'écran
    }

    // Créer la lampe torche après la fin de l'introduction
    createFlashlight();  // Crée la lampe torche à la fin de l'intro

    // Rendre la lampe torche visible après la fin du texte
    flashlight.setEnabled(true);  // Rendre visible la lampe torche
    camera.attachControl(canvas, true);  // Permet à la caméra de suivre la souris sans clic


    // Permettre au joueur de commencer à jouer
    canPlay = true;
    
}


// Créer la lampe torche
function createFlashlight() {
    flashlight = BABYLON.MeshBuilder.CreateCylinder("flashlight", { height: 0.3, diameter: 0.1 }, scene);
    flashlight.material = flashlightMaterial;
    flashlight.position = new BABYLON.Vector3(0, 2, 2); // Position de la lampe torche
    flashlight.setEnabled(false);  // Assurez-vous qu'il n'est pas visible immédiatement
}

// Écouter la pression de la barre d'espace pour passer au texte suivant
function handleSpacebarEvent() {
    window.addEventListener("keydown", function(event) {
        if (event.key === " " && !canPlay) { // Assurez-vous que le jeu ne commence pas avant la fin de l'intro
            nextIntroText();
        }
    });
}

// Initialiser le jeu
function initGame() {
    showIntroText();   // Afficher le texte d'introduction
    handleSpacebarEvent(); // Gérer les événements de la barre d'espace
}

initGame();



// function createMenu() {
//     // Création du panneau d'interface
//     const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
//     const menuPanel = new StackPanel();
//     advancedTexture.addControl(menuPanel);
//     menuPanel.width = "300px";
//     menuPanel.height = "200px";
//     menuPanel.top = "150px";
//     menuPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
//     menuPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  
//     // Titre du menu
//     const title = new TextBlock();
//     title.text = "ONEIROPHOBIA";
//     title.fontSize = 24;
//     title.color = "white";
//     menuPanel.addControl(title);
  
//     // Bouton "Démarrer"
//     const startButton = Button.CreateSimpleButton("startButton", "Démarrer");
//     startButton.width = "200px";
//     startButton.height = "40px";
//     startButton.color = "white";
//     startButton.background = "green";
//     startButton.onPointerDownObservable.add(() => {
//       startGame();
//       advancedTexture.dispose();  // Masque le menu
//     });
//     menuPanel.addControl(startButton);
  
//     // Ajouter d'autres boutons ou options au menu si nécessaire
//   }
  
//   // Fonction pour démarrer le jeu
//   function startGame() {
//     // Afficher la scène du jeu
//     scene.activeCamera = camera;  // Activer la caméra
//     engine.runRenderLoop(() => scene.render());  // Lancer la boucle de rendu
//   }
  
//   // Appel de la fonction pour créer le menu au démarrage
//   createMenu();

  
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

const ground2 = BABYLON.MeshBuilder.CreateGround("ground2", { width: 10, height: 10, subdivisions: 100 }, scene);
// Création du matériau PBR
const ground2Material = new BABYLON.PBRMaterial("ground2Material", scene);
// Charger la texture diffuse (Albedo)
ground2Material.albedoTexture = new BABYLON.Texture("../Textures/dream_floor.jpg", scene);
ground2Material.albedoTexture.uScale = 1; // Plus grand = motifs plus petits
ground2Material.albedoTexture.vScale = 1; // Plus grand = motifs plus petits
ground2Material.emissiveTexture = new BABYLON.Texture("../Textures/dream_floor.jpg", scene);
ground2Material.emissiveTexture.uScale = 1;
ground2Material.emissiveTexture.vScale = 1;
// groundMaterial.bumpTexture.uScale = 3;
// groundMaterial.bumpTexture.vScale = 3; reactiver si on active normal map
// Charger la Normal Map (bleue)
ground2Material.bumpTexture = null;
ground2Material.invertNormalMapX = true; 
ground2Material.invertNormalMapY = true;
// Charger la Roughness Map (définit la rugosité)
ground2Material.metallicTexture = new BABYLON.Texture("../Textures/dream_floor.jpg", scene);
ground2Material.useRoughnessFromMetallicTextureAlpha = false;
ground2Material.useRoughnessFromMetallicTextureGreen = true; // Souvent stockée dans le canal vert
// Ajuster la rugosité globale (1 = mat, 0 = brillant)
ground2Material.roughness = 1;
// Ajouter la Displacement Map (carte de déplacement)
ground2Material.displacementTexture = new BABYLON.Texture("../Textures/dream_floor.jpg", scene);
// Configurer la force du displacement (intensité du relief)
ground2Material.displacementScale = 0.2; // Ajuster cette valeur pour un relief plus ou moins marqué
ground2Material.displacementBias = 0;  // Ajuster le biais pour décaler le relief si nécessaire
// Appliquer le matériau au sol
ground2.material = ground2Material;
ground2.checkCollisions = true;





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
const groundsalle2 = BABYLON.MeshBuilder.CreateGround("ground2", { width: 10, height: 10 }, scene);
groundsalle2.material = groundMaterial;
groundsalle2.position.z = 10; // Derrière la première salle
groundsalle2.checkCollisions = true;

const ground2salle2 = BABYLON.MeshBuilder.CreateGround("ground2", { width: 10, height: 10 }, scene);
ground2salle2.material = ground2Material;
ground2salle2.position.z = 10; // Derrière la première salle
ground2salle2.checkCollisions = true;



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

// Mur 8 (tout au fond, retourné de 180°)
const wall8 = BABYLON.MeshBuilder.CreatePlane("wall8", { width: 10, height: 4 }, scene);
wall8.material = wallMaterial;
wall8.position = new BABYLON.Vector3(0, 2, 10); // Position arrière sur l'axe Z
wall8.checkCollisions = true;





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
    // Vérifie si la touche pressée est l'espace
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key === " ") {

        // Vérifie si le joueur est près de la porte (distance < 2.5 par exemple)
        const distance = BABYLON.Vector3.Distance(door.position, camera.position);
        // Vérifie si le joueur a la clé en main (equippedItem doit être la clé)
        if (distance < 2.5 && equippedItem && equippedItem.name === '__root__') {
            // Si les conditions sont remplies, ouvre la porte
            if (!doorOpen) {
                openDoor();  // Fonction pour ouvrir la porte
            }
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


BABYLON.SceneLoader.ImportMesh("", "/models/", "bed_agape.glb", scene, function (meshes) {
    let bed = meshes[0]; // Récupérer l'objet principal du modèle

    // Ajuster la position pour placer le lit dans un coin
    bed.position = new BABYLON.Vector3(-3.2, 0, -3.7); // Ajuste en fonction de ta pièce

    // Mise à l'échelle pour s'assurer que le lit a la bonne taille
    bed.scaling = new BABYLON.Vector3(0.015, 0.015, 0.015); // Ajuste selon la taille du modèle

    // Rotation si nécessaire
    bed.rotation.y = Math.PI / 2; // Tourne le lit de 90° si besoin
    bed.checkCollisions = true;


    console.log("Lit importé et positionné !");
    
});
BABYLON.SceneLoader.ImportMesh("", "/models/", "desk.glb", scene, function (meshes) {
    let desk = meshes[0]; // Récupérer l'objet principal du modèle

    // Ajuster la position pour placer le bureau dans un coin
    desk.position = new BABYLON.Vector3(4, 0, 4.25); // Ajuste en fonction de ta pièce

    // Mise à l'échelle pour s'assurer que le bureau a la bonne taille
    desk.scaling = new BABYLON.Vector3(1.25, 1.25, 1.25); // Ajuste selon la taille du modèle

    // Activer les collisions pour le modèle
    desk.checkCollisions = true;

    // Si nécessaire, activer un environnement sombre
    console.log("Bureau importé, positionné et visible seulement dans l'obscurité !");
});

BABYLON.SceneLoader.ImportMesh("", "/models/", "common_table_and_chair.glb", scene, function (meshes) {
    let common_table_and_chair = meshes[0]; // Récupérer l'objet principal du modèle

    // Ajuster la position pour placer le bureau dans un coin
    common_table_and_chair.position = new BABYLON.Vector3(2, 0, -2); // Ajuste en fonction de ta pièce

    // Mise à l'échelle pour s'assurer que le bureau a la bonne taille
    common_table_and_chair.scaling = new BABYLON.Vector3(0.006, 0.006, 0.006); // Ajuste selon la taille du modèle

    // Activer les collisions pour le modèle
    common_table_and_chair.checkCollisions = true;

    // Si nécessaire, activer un environnement sombre
    console.log("Bureau importé, positionné et visible seulement dans l'obscurité !");
});

// BABYLON.SceneLoader.ImportMesh("", "/models/", "meuble_tv.glb", scene, function (meshes) {
//     let meuble = meshes[0]; // Récupérer l'objet principal du modèle

//     // Ajuster la position pour placer le bureau dans un coin
//     meuble.position = new BABYLON.Vector3(4.5, 0.5, -2.75); // Ajuste en fonction de ta pièce

//     // Mise à l'échelle pour s'assurer que le bureau a la bonne taille
//     meuble.scaling = new BABYLON.Vector3(1.75, 1.75, 1.75); // Ajuste selon la taille du modèle

//     // Activer les collisions pour le modèle
//     meuble.checkCollisions = true;

//     // Si nécessaire, activer un environnement sombre
//     meuble.log("Bureau importé, positionné et visible seulement dans l'obscurité !");
// });

let key=null;

BABYLON.SceneLoader.ImportMesh("", "/models/", "key.glb", scene, function (meshes) {
    key = meshes[0]; // Récupérer l'objet principal du modèle

    // Ajuster la position pour placer le modèle dans la scène
    key.position = new BABYLON.Vector3(2, 1.05, -2); // Ajuste en fonction de ta scène

    // Mise à l'échelle du modèle pour s'assurer qu'il a la bonne taille
    key.scaling = new BABYLON.Vector3(0.001, 0.001, 0.001); // Ajuste selon la taille du modèle

    // Réinitialiser la rotation
    key.rotation = new BABYLON.Vector3(0, 0, 0); // Réinitialiser la rotation initiale

    // Appliquer la rotation autour de l'axe X pour passer du vertical à l'horizontal
    key.rotation.x = Math.PI / 2;  // 90 degrés en radians (rotation autour de l'axe X)


    // Activer les collisions
    key.checkCollisions = true;
    meshes.forEach((mesh, index) => {
        console.log(`Mesh ${index}: ${mesh.name}`);
    });

    // Créer un matériau émissif pour le bureau
    let emissiveMaterial = new BABYLON.StandardMaterial("emissiveMat", scene);
    emissiveMaterial.emissiveColor = new BABYLON.Color3(0.85, 0.73, 0.83);  // Couleur bleue douce qui émane du bureau
    emissiveMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);  // Pas de couleur diffuse, reste noir dans la lumière
    emissiveMaterial.specularColor = new BABYLON.Color3(0, 0, 0);  // Pas de spéculaire, aucune brillance

    // Appliquer le matériau émissif à chaque mesh du modèle
    meshes.forEach((mesh) => {
        mesh.material = emissiveMaterial; // Appliquer le matériau à chaque partie du modèle
        mesh.isPickable = true; 
    });

    scene.ambientColor = new BABYLON.Color3(0, 0, 0); // Éclairage ambiant sombre pour forcer l'obscurité

    // Fonction pour vérifier l'intensité de la lumière de la scène
    function checkLighting() {
        // On récupère l'intensité totale des lumières dans la scène (exemple avec une lumière directionnelle)
        let lightIntensity = 0;
        scene.lights.forEach(light => {
            if (light.intensity) {
                lightIntensity += light.intensity;
            }
        });

        // Si l'intensité lumineuse est supérieure à un seuil (par exemple 0.5), on cache le bureau
        if (lightIntensity > 0.5) {
            key.setEnabled(false);  // Masquer le bureau si la lumière est assez forte
            ground2Material.alpha = 0; 
            ground2Material.emissiveColor = new BABYLON.Color3(0, 0, 0); // Pas d'émission
        } else {
            key.setEnabled(true);
            ground2Material.alpha = 1;  // Afficher le bureau si la lumière est faible
            ground2Material.emissiveColor = new BABYLON.Color3(1, 0.4, 0.6); // Blanc teinté de rose

        }
    }
    

    // Vérification de l'éclairage à chaque frame
    scene.onBeforeRenderObservable.add(() => {
        checkLighting();
    });
    
});

BABYLON.SceneLoader.ImportMesh("", "/models/", "antique_iron_safe.glb", scene, function (meshes) {
    let safe = meshes[0]; // Récupérer l'objet principal du modèle

    // Ajuster la position pour placer le modèle dans la scène
    safe.position = new BABYLON.Vector3(4, 0.6, 9); // Ajuste en fonction de ta scène

    // Mise à l'échelle du modèle pour s'assurer qu'il a la bonne taille
    safe.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1); // Ajuste selon la taille du modèle

    // Activer les collisions
    safe.checkCollisions = true;

    // Créer un matériau émissif pour le bureau
    let emissiveMaterial = new BABYLON.StandardMaterial("emissiveMat", scene);
    emissiveMaterial.emissiveColor = new BABYLON.Color3(0.85, 0.73, 0.83);  // Couleur bleue douce qui émane du bureau
    emissiveMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);  // Pas de couleur diffuse, reste noir dans la lumière
    emissiveMaterial.specularColor = new BABYLON.Color3(0, 0, 0);  // Pas de spéculaire, aucune brillance

    // Appliquer le matériau émissif à chaque mesh du modèle
    meshes.forEach((mesh) => {
        mesh.material = emissiveMaterial; // Appliquer le matériau à chaque partie du modèle
        mesh.isPickable = true; // Empêcher de cliquer sur le modèle
    });

    scene.ambientColor = new BABYLON.Color3(0, 0, 0); // Éclairage ambiant sombre pour forcer l'obscurité

    // Fonction pour vérifier l'intensité de la lumière de la scène
    function checkLighting() {
        // On récupère l'intensité totale des lumières dans la scène (exemple avec une lumière directionnelle)
        let lightIntensity = 0;
        scene.lights.forEach(light => {
            if (light.intensity) {
                lightIntensity += light.intensity;
            }
        });

        // Si l'intensité lumineuse est supérieure à un seuil (par exemple 0.5), on cache le bureau
        if (lightIntensity > 0.5) {
            safe.setEnabled(false);  // Masquer le bureau si la lumière est assez forte
            ground2Material.alpha = 0; 
            ground2Material.emissiveColor = new BABYLON.Color3(0, 0, 0); // Pas d'émission
        } else {
            safe.setEnabled(true);
            ground2Material.alpha = 1;  // Afficher le bureau si la lumière est faible
            ground2Material.emissiveColor = new BABYLON.Color3(1, 0.4, 0.6); // Blanc teinté de rose

        }
    }
    

    // Vérification de l'éclairage à chaque frame
    scene.onBeforeRenderObservable.add(() => {
        checkLighting();
    });
    
});





BABYLON.SceneLoader.ImportMesh("", "/models/", "cupboard.glb", scene, function (meshes) {
    let cupboard = meshes[0]; // Récupérer l'objet principal du modèle

    // Ajuster la position pour placer le lit dans un coin
    cupboard.position = new BABYLON.Vector3(-2.5, 0, 4.75); // Ajuste en fonction de ta pièce

    // Mise à l'échelle pour s'assurer que le lit a la bonne taille
    cupboard.scaling = new BABYLON.Vector3(0.008, 0.008, 0.008); // Ajuste selon la taille du modèle
    cupboard.checkCollisions = true;

    
});


BABYLON.SceneLoader.ImportMesh("", "/models/", "fps_arms.glb", scene, function (meshes) {
    const arms = meshes[0]; // Supposons que les bras sont dans meshes[0]
    arms.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01); // Ajuste la taille si nécessaire

    scene.onBeforeRenderObservable.add(() => {
        const cameraForward = camera.getDirection(BABYLON.Vector3.Forward()).normalize();
        
        // Position des bras par rapport à la caméra
        arms.position = camera.position
            .add(cameraForward.scale(0.05)) // Distance devant la caméra
            .add(new BABYLON.Vector3(0, -0.1, 0)); // Ajustement vertical
        
        arms.rotation = camera.rotation; // Synchronisation avec la caméra
    });
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

// // Détection du clic sur la clé
// key.actionManager = new ActionManager(scene);

// // Quand l'utilisateur clique sur la clé, ajoute-la à l'inventaire
// key.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
//     if (!hasKey) {
//         hasKey = true;
//         inventoryText.text += "\n- Clé";  // Ajoute la clé à l'inventaire
//         key.setEnabled(false);  // Désactive l'objet clé après l'avoir ramassé
//     }
// }));





let keyHand = null;
// Fonction pour équiper un objet
function equipItem(item) {
    if (!inventory[item]) return; // Si l'objet n'est pas dans l'inventaire, ne rien faire

    unequipItem(); // Retire l'objet précédemment équipé

    switch (item) {
        case "key": // 🔑 Ajout de la clé avec le modèle 3D
            // Charger le modèle de la clé (clé.glb)
            BABYLON.SceneLoader.ImportMesh("", "/models/", "key.glb", scene, function (meshes) {
                let keyHand = meshes[0]; // Récupère le modèle de la clé (premier mesh)                
                // Positionne la clé dans la main droite du personnage
                keyHand.parent = camera;
                keyHand.position = new BABYLON.Vector3(0.11, 0, 0.4); // On va ajuster cette position plus bas
                keyHand.scaling = new BABYLON.Vector3(0.0003, 0.0003, 0.0003); // Ajuste l'échelle pour que la clé soit à la bonne taille
                let emissiveMaterial = new BABYLON.StandardMaterial("emissiveMat", scene);
                emissiveMaterial.emissiveColor = new BABYLON.Color3(0.85, 0.73, 0.83);  // Couleur bleue douce qui émane du bureau
                emissiveMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);  // Pas de couleur diffuse, reste noir dans la lumière
                emissiveMaterial.specularColor = new BABYLON.Color3(0, 0, 0);  // Pas de spéculaire, aucune brillance
            
                // Appliquer le matériau émissif à chaque mesh du modèle
                meshes.forEach((mesh) => {
                    mesh.material = emissiveMaterial; // Appliquer le matériau à chaque partie du modèle
                });
                equippedItem = keyHand;

            });
            break;
        
        case "flashlight": // Équipement de la lampe torche

            equippedItem = MeshBuilder.CreateCylinder("flashlightInHand", { height: 0.3, diameter: 0.1 }, scene);
            equippedItem.material = flashlightMaterial;
            equippedItem.parent = camera;
            equippedItem.position = new BABYLON.Vector3(0.15, -0.1, 0.5); // Ajuste pour qu'elle soit dans la main
            equippedItem.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0); // Alignement correct

            // Création du faisceau lumineux
            const spotlight = new BABYLON.SpotLight(
                "spotlight",
                camera.position, // Position initiale : à la position de la caméra
                camera.getDirection(Vector3.Forward()), // Direction alignée sur la caméra
                Math.PI / 3, // Augmenter l'angle pour une diffusion plus large
                2, // Exposant pour une atténuation plus douce
                scene
            );

            spotlight.diffuse = new Color3(0.1, 0.1, 1); // Lumière bleue
            spotlight.specular = new Color3(1, 1, 1); // Garde la lumière blanche pour les reflets
            spotlight.intensity = 100; // Augmente l'intensité de la lumière
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
    console.log(equippedItem);
    if (equippedItem) {
        // Si l'objet équipé est une lampe torche, supprimer la lumière
        if (equippedItem.spotlight) {
            equippedItem.spotlight.dispose(); // Supprime la lumière associée
            equippedItem.spotlight = null; // Réinitialise la référence à la lumière
        }
        if (equippedItem.name === "keyHand") {
            console.log("Retire key")
            keyHand.parent = null;  // Détache la clé de la main
            keyHand.dispose(); // Supprime la clé de la scène
        }
        
        equippedItem.dispose(); // Supprime l'objet de la main
        equippedItem = null; // Réinitialise la variable
    }
}

// Fonction pour collecter un objet
function collectItem(item) {
    console.log("Objet collecté : " + item);
    switch (item) {
        case "key":
            if (!inventory.key) {
                inventory.key = true;
                key.dispose(); // Supprime la clé de la scène
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

scene.onPointerDown = function (evt, pickResult) {
    if (pickResult.hit) {
        console.log(pickResult.pickedMesh.name);
        if (pickResult.pickedMesh.name === "flashlight") collectItem("flashlight");
        if (pickResult.pickedMesh.name === "Object_2") collectItem("key"); // Détection de la clé
    }
};

    



// Boucle de rendu
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());