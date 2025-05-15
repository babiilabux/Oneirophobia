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
  PBRMaterial,
  SceneLoader,
  CreateSoundAsync
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { AdvancedDynamicTexture, StackPanel, TextBlock, Button, Control, Slider } from "@babylonjs/gui/2D";
import { createEngine } from "./core/engine.js";
import { createCamera } from "./core/camera";
import { createLighting } from "./core/lighting.js";
import { playAmbientSound } from "./core/sounds.js";
import { showIntroText, nextIntroText, skipIntro } from "./ui/intro.js";


// Engine + Canvas
const { engine, canvas } = createEngine(); // Crée l'engine et le canvas

// Création de la scène
const scene = new Scene(engine);
scene.collisionsEnabled = true;

// Lumière
const light = createLighting(scene, 0); 

// Caméra
const camera = createCamera(scene, canvas);

// === Intro ===
/*
const introText = [
    "Appuie sur espace",
    "Ugh... que se passe-t-il ?",
    "Où suis-je ?",
    "Inconnu : Dans le monde des rêves",
    "Qui parle ?",
    "Répondez !",
    "Inconnu : Je ne peux rien te dire",
    "Inconnu : Mais pour l'instant tu es coincé ici",
    "Je comprends rien",
    "Inconnu : Pour l'instant, je peux juste te donner ce 'baton'",
    "Inconnu : L'activer te permettra de voir temporairement la réalité",
    "Inconnu : Mais n'oublie pas, ce n'est que temporaire.",
    "*Déplace la caméra avec la souris*",
    "*Bouge avec les flèches*",
    "*Active ton inventaire avec E*",
    "*Récupère un objet en cliquant dessus*",
    "*Equipe le avec la touche associée [1-9]*",
    "*Interragit avec espace*",
];




let canAdvanceText = true;
let currentTextIndex = 0;
let textBlock = null;
let canPlay = false;
*/
let flashlight = null;  // Référence globale à la lampe torche
let inventory = { flashlight: false, key: false }; // Inventaire

// Matériau pour la lampe torche
const flashlightMaterial = new BABYLON.StandardMaterial("flashlightMat", scene);
flashlightMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // Jaune vif
flashlightMaterial.emissiveColor = new BABYLON.Color3(0.85, 0.73, 0.83);  // Lampe torche visible, bleue sous la spotlight




// === Inventaire ===
const introTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("IntroUI", true, scene);
const uiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene); // Pour l'inventaire
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

const inventoryPanel = new BABYLON.GUI.Rectangle();
inventoryPanel.width = "300px";
inventoryPanel.height = "100%";
inventoryPanel.thickness = 0;
inventoryPanel.background = "rgba(0, 0, 0, 0.8)";
inventoryPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
inventoryPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
inventoryPanel.isVisible = false;
uiTexture.addControl(inventoryPanel);


// Contenu de l'inventaire
const inventoryLayout = new BABYLON.GUI.StackPanel();
inventoryLayout.width = "100%";
inventoryLayout.height = "100%";
inventoryLayout.paddingTop = "10px";
inventoryLayout.paddingLeft = "10px";
inventoryLayout.paddingRight = "10px";
inventoryPanel.addControl(inventoryLayout);

// 🟥 Bouton de fermeture (croix en haut)
const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeBtn", "❌");
closeButton.width = "30px";
closeButton.height = "30px";
closeButton.color = "white";
closeButton.background = "transparent";
closeButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
closeButton.onPointerUpObservable.add(() => {
    inventoryPanel.isVisible = false;
});
inventoryLayout.addControl(closeButton);

// Titre
const titleText = new BABYLON.GUI.TextBlock();
titleText.text = "Inventaire";
titleText.height = "40px";
titleText.color = "white";
titleText.fontSize = 24;
titleText.paddingBottom = "10px";
titleText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
inventoryLayout.addControl(titleText);

// Liste des objets
const itemList = new BABYLON.GUI.StackPanel();
itemList.height = "200px";
itemList.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
inventoryLayout.addControl(itemList);

// Zone de description
const itemDescription = new BABYLON.GUI.TextBlock();
itemDescription.text = "Sélectionnez un objet pour voir sa description";
itemDescription.color = "white";
itemDescription.fontSize = 16;
itemDescription.textWrapping = true;
itemDescription.height = "80px";
itemDescription.paddingTop = "10px";
inventoryLayout.addControl(itemDescription);

// 🔘 Bouton pour afficher les commandes
const helpButton = BABYLON.GUI.Button.CreateSimpleButton("helpBtn", "Afficher les commandes");
helpButton.width = "100%";
helpButton.height = "40px";
helpButton.color = "white";
helpButton.background = "#666";
helpButton.paddingTop = "20px";
helpButton.onPointerUpObservable.add(() => {
    // Tu peux ici afficher un autre panneau d’aide, par exemple :
    alert("Commandes :\n- [1] Équiper lampe\n- [2] Équiper clé\n- [R] Déséquiper\n- [E/I] Inventaire\n- [Esc] Fermer");
});
inventoryLayout.addControl(helpButton);

// Fonction pour mettre à jour l'inventaire
function updateInventoryText() {
    itemList.clearControls(); // Vide la liste d’objets

    const createItemButton = (id, label, description) => {
        const isEquipped = equippedItemName === id;

        const btn = BABYLON.GUI.Button.CreateSimpleButton(id + "Btn", label);
        btn.width = "100%";
        btn.height = "30px";
        btn.color = "white";
        btn.background = isEquipped ? "#8854d0" : "#444"; // Violet si équipé

        btn.onPointerUpObservable.add(() => {
            itemDescription.text = description;
            equipItem(id);
            updateInventoryText(); // Mettre à jour l’état visuel après clic
        });

        itemList.addControl(btn);
    };

    if (inventory.flashlight) {
        createItemButton("flashlight", "Lampe torche", "Lampe torche : Permet d'éclairer les zones sombres.");
    }

    if (inventory.key) {
        createItemButton("key", "Clé", "Clé : Permet d’ouvrir une porte verrouillée.");
    }

    if (!inventory.flashlight && !inventory.key) {
        itemDescription.text = "(Inventaire vide)";
    }
}


// Création du UI overlay noir
const blackOverlay = new BABYLON.GUI.Rectangle();
blackOverlay.width = 1;
blackOverlay.height = 1;
blackOverlay.color = "black";
blackOverlay.background = "black";
blackOverlay.alpha = 0;
advancedTexture.addControl(blackOverlay);
function animateOverlay(toAlpha, duration = 1000, callback = null) {
    const animation = new BABYLON.Animation("fade", "alpha", 60, 
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    const keys = [
        { frame: 0, value: blackOverlay.alpha },
        { frame: 60, value: toAlpha }
    ];

    animation.setKeys(keys);

    blackOverlay.animations = [];
    blackOverlay.animations.push(animation);

    scene.beginAnimation(blackOverlay, 0, 60, false, 60 / duration * 1000, () => {
        if (callback) callback();
    });
}


let equippedItem = null; // Objet actuellement équipé
let flashlightOn = true; // La lampe est allumée par défaut

window.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E" || event.key === "i" || event.key === "I") inventoryPanel.isVisible = !inventoryPanel.isVisible;
    if (event.key === "Escape") {
        puzzlePanel.isVisible = false;
        inventoryPanel.isVisible = false;
    }
    if (event.key === "1" || event.key === "&") equipItem("flashlight");
    if (event.key === "2" || event.key === "é") equipItem("key");
    if (event.key === "r" || event.key === "R") unequipItem();

    // Éteindre la lampe torche si la barre espace est enfoncée
    if (event.code === "Space" && flashlightOn) {
        flashlightOn = false;

        animateOverlay(1, 10000, () => {
            if (spotlight) spotlight.intensity = 0;
            if (lampe) lampe.setEnabled(false);

            animateOverlay(0, 10000);
        });
    }
});

window.addEventListener("keyup", (event) => {
    if (event.code === "Space" && !flashlightOn) {
        animateOverlay(1, 10000, () => {
            flashlightOn = true;

            if (spotlight) spotlight.intensity = 50; // Remettre l’intensité souhaitée
            if (lampe) lampe.setEnabled(true);

            animateOverlay(0, 10000);
        });
    }
});



// Créer et afficher les textes d'introduction




// function showIntroText() {
//     introPanel = new BABYLON.GUI.StackPanel();
//     introTexture.addControl(introPanel);

//     introPanel.width = "600px";
//     introPanel.height = "150px";
//     introPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
//     introPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

//     // Fond sombre avec une légère transparence
//     const background = new BABYLON.GUI.Rectangle();
//     background.width = "100%";
//     background.height = "100%";
//     background.background = "rgba(0, 0, 0, 1)";
//     introPanel.addControl(background);

//     // Créer un TextBlock pour afficher les phrases
//     textBlock = new BABYLON.GUI.TextBlock();
//     textBlock.text = introText[currentTextIndex];
//     textBlock.fontSize = 24;
//     textBlock.color = "white";
//     textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
//     textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
//     introPanel.addControl(textBlock);

//     // Ajouter le bouton "Skip" pour sauter l'introduction
//     const skipButton = BABYLON.GUI.Button.CreateSimpleButton("skipBtn", "SKIP");
//     skipButton.width = "100px";
//     skipButton.height = "40px";
//     skipButton.color = "white";
//     skipButton.background = "red";
//     skipButton.top = "10px";
//     skipButton.onPointerUpObservable.add(() => {
//         skipIntro(); // Quand on clique sur "SKIP", on saute l'intro
//     });
//     introPanel.addControl(skipButton);
// }




// Afficher le texte suivant
// function nextIntroText() {
//     if (!canAdvanceText) return;

//     canAdvanceText = false; // Empêche les appels multiples rapides
//     setTimeout(() => {
//         canAdvanceText = true; // Autorise à nouveau le changement de texte après 1 seconde
//     }, 1000);

//     currentTextIndex++;
//     if (currentTextIndex < introText.length) {
//         textBlock.text = introText[currentTextIndex];

//         // Changer la couleur et le style du texte selon le contenu
//         if (introText[currentTextIndex].includes("*")) {
//             textBlock.color = "white";
//             textBlock.fontStyle = "bold italic";
//         } else if (introText[currentTextIndex].includes("Inconnu")) {
//             textBlock.color = "purple";
//             textBlock.fontStyle = "italic";
//         } else {
//             textBlock.color = "white";
//             textBlock.fontStyle = "normal";
//         }
//     } else {
//         setTimeout(() => {
//             startGame(); // Lancer le jeu après la fin de l'intro
//         }, 300);
//     }
// }


// function skipIntro() {
//     currentTextIndex = introText.length; // Avancer directement à la fin
//     nextIntroText(); // Change le texte à la fin et commence le jeu

//     // Supprimer tous les contrôles d'interface 2D, y compris l'intro
//     if (introPanel) {
        

//         introPanel.dispose();
//         introPanel = null; // Réinitialiser la variable de référence
//     }

//     // Désactiver l'affichage de l'interface 2D
//     introTexture.dispose();

//     // Permettre au joueur de commencer à jouer
//     canPlay = true;
    
//     // Réactiver le contrôle de la caméra pour le jeu
//     camera.attachControl(canvas, true); // Reprendre le contrôle de la caméra proprement
// }


// Démarrer le jeu et masquer l'interface d'introduction
export function startGame(introPanel, textBlock) {
    // Masquer l'interface du texte d'introduction (en supprimant le panneau entier)
    if (introPanel) {
        introPanel.dispose();  // Supprimer l'ensemble du panneau d'introduction
        introPanel = null; // Réinitialiser la référence à l'interface d'introduction
        background.dispose(); // Supprimer le fond sombre
        textBlock.dispose(); // Supprimer le texte
    }

    camera.attachControl(canvas, true);  // Permet à la caméra de suivre la souris sans clic

    // Permettre au joueur de commencer à jouer
    canPlay = true;
    
}

showIntroText(introTexture,  camera);

// Écouter l'appui sur la touche espace pour passer à l'introduction suivante
scene.onKeyboardObservable.add((keyboardInfo) => {
    if (keyboardInfo.event.code === "Space" && canAdvanceText) {
        nextIntroText(introTexture);
    }
});

// Écouter la pression de la barre d'espace pour passer au texte suivant
function handleSpacebarEvent() {
    window.addEventListener("keydown", function(event) {
        if (event.key === " " && !canPlay) { // Assurez-vous que le jeu ne commence pas avant la fin de l'intro
            nextIntroText();
        }
    });
}

// Initialiser le jeu
export function initGame() {
    showIntroText(introTexture);   // Afficher le texte d'introduction
    handleSpacebarEvent(); // Gérer les événements de la barre d'espace
}

initGame();




// (async () => {
//     const audioEngine = await BABYLON.CreateAudioEngineAsync();
  
//     // Create sounds here, but don't call `play()` on them, yet ...
  
//     // Wait until audio engine is ready to play sounds.
//     await audioEngine.unlock();
  
//     // Start sound playback ...
//   })();
  
//   const audioEngine = await BABYLON.CreateAudioEngineAsync();
  
//   const ambient = await BABYLON.CreateSoundAsync("ambient",
//     "/sounds/sinnesloschen-beam-117362.mp3"
//   );
  
//   // Set the sound to loop
//   ambient.loop = true;
  
//   // Wait until audio engine is ready to play sounds.
//   await audioEngine.unlock();
  
//   // Start playing the sound
//   ambient.play();
  

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

  
// Sol 1
const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10, subdivisions: 100 }, scene);
const groundMaterial = new PBRMaterial("groundMaterial", scene);

groundMaterial.albedoTexture = new Texture("../Textures/floor_diffuse.jpg", scene);
groundMaterial.albedoTexture.uScale = 3;
groundMaterial.albedoTexture.vScale = 3;

groundMaterial.bumpTexture = null;
groundMaterial.invertNormalMapX = true; 
groundMaterial.invertNormalMapY = true;

groundMaterial.metallicTexture = new Texture("../Textures/floor_roughness.jpg", scene);
groundMaterial.useRoughnessFromMetallicTextureAlpha = false;
groundMaterial.useRoughnessFromMetallicTextureGreen = true;
groundMaterial.roughness = 1;

groundMaterial.displacementTexture = new Texture("../Textures/floor_displacement.jpg", scene);
groundMaterial.displacementScale = 0.2;
groundMaterial.displacementBias = 0;

ground.material = groundMaterial;
ground.checkCollisions = true;

// Sol 2
const ground2 = MeshBuilder.CreateGround("ground2", { width: 10, height: 10, subdivisions: 100 }, scene);
const ground2Material = new PBRMaterial("ground2Material", scene);

ground2Material.albedoTexture = new Texture("../Textures/dream_floor.jpg", scene);
ground2Material.albedoTexture.uScale = 1;
ground2Material.albedoTexture.vScale = 1;

ground2Material.emissiveTexture = new Texture("../Textures/dream_floor.jpg", scene);
ground2Material.emissiveTexture.uScale = 1;
ground2Material.emissiveTexture.vScale = 1;

ground2Material.bumpTexture = null;
ground2Material.invertNormalMapX = true; 
ground2Material.invertNormalMapY = true;

ground2Material.metallicTexture = new Texture("../Textures/dream_floor.jpg", scene);
ground2Material.useRoughnessFromMetallicTextureAlpha = false;
ground2Material.useRoughnessFromMetallicTextureGreen = true;
ground2Material.roughness = 1;

ground2Material.displacementTexture = new Texture("../Textures/dream_floor.jpg", scene);
ground2Material.displacementScale = 0.2;
ground2Material.displacementBias = 0;

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
const wallMaterial = new PBRMaterial("wallMat", scene);
wallMaterial.albedoTexture = new Texture("../Textures/wall_brick_diffuse.jpg", scene);
wallMaterial.bumpTexture = new Texture("../Textures/wall_brick_normal.jpg", scene);
wallMaterial.metallicTexture = new Texture("../Textures/wall_brick_roughness.jpg", scene);
wallMaterial.displacementTexture = new Texture("../Textures/wall_brick_displacement.jpg", scene);
wallMaterial.backFaceCulling = false;


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



// === Tableau 1 ===
const tableau1Material = new PBRMaterial("tableau1Mat", scene);
tableau1Material.albedoTexture = new Texture("../Textures/tableau1.png", scene);
tableau1Material.albedoTexture.level = 0.8;
tableau1Material.metallic = 0.0;
tableau1Material.roughness = 0.8;
tableau1Material.metallicTexture = new Texture("../Textures/wood_roughness.jpg", scene);
tableau1Material.useRoughnessFromMetallicTextureAlpha = false;
tableau1Material.bumpTexture = new Texture("../Textures/wood_normal.jpg", scene);
tableau1Material.invertNormalMapX = true;
tableau1Material.invertNormalMapY = true;

const tableau1 = MeshBuilder.CreatePlane("tableau1", { width: 2, height: 1.3 }, scene);
tableau1.position = new Vector3(-4.9, 2.15, 7.5);
tableau1.rotation = new Vector3(0, -Math.PI / 2, 0);
tableau1.material = tableau1Material;

// === Tableau 2 ===
const tableau2Material = new PBRMaterial("tableau2Mat", scene);
tableau2Material.albedoTexture = new Texture("../Textures/tableau2.png", scene);
tableau2Material.albedoTexture.level = 0.8;
tableau2Material.metallic = 0.0;
tableau2Material.roughness = 0.8;
tableau2Material.metallicTexture = new Texture("../Textures/wood_roughness.jpg", scene);
tableau2Material.useRoughnessFromMetallicTextureAlpha = false;
tableau2Material.bumpTexture = new Texture("../Textures/wood_normal.jpg", scene);
tableau2Material.invertNormalMapX = true;
tableau2Material.invertNormalMapY = true;
tableau2Material.backFaceCulling = false;

const tableau2 = MeshBuilder.CreatePlane("tableau2", { width: 2, height: 1.3 }, scene);
tableau2.position = new Vector3(-2.9, 2.15, 9.9);
tableau2.rotation = new Vector3(0, 0, 0);
tableau2.material = tableau2Material;

// === Tableau 3 ===
const tableau3Material = new PBRMaterial("tableau3Mat", scene);
tableau3Material.albedoTexture = new Texture("../Textures/tableau3.png", scene);
tableau3Material.albedoTexture.level = 0.8;
tableau3Material.metallic = 0.0;
tableau3Material.roughness = 0.8;
tableau3Material.metallicTexture = new Texture("../Textures/wood_roughness.jpg", scene);
tableau3Material.useRoughnessFromMetallicTextureAlpha = false;
tableau3Material.bumpTexture = new Texture("../Textures/wood_normal.jpg", scene);
tableau3Material.invertNormalMapX = true;
tableau3Material.invertNormalMapY = true;
tableau3Material.backFaceCulling = false;

const tableau3 = MeshBuilder.CreatePlane("tableau3", { width: 2, height: 1.3 }, scene);
tableau3.position = new Vector3(0, 2.15, 9.9);
tableau3.rotation = new Vector3(0, 0, 0);
tableau3.material = tableau3Material;


// Variable pour stocker l'angle actuel de rotation
let currentRotationtab1 = 0;

// Ajouter un gestionnaire d'événements pour détecter le clic
tableau1.actionManager = new BABYLON.ActionManager(scene);
tableau1.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        currentRotationtab1 += BABYLON.Tools.ToRadians(-22.5);
        
        // Appliquer la rotation autour de l'axe Y
        tableau1.rotation.z = currentRotationtab1;
    })
);

let currentRotationtab2 = 0;

// Ajouter un gestionnaire d'événements pour détecter le clic
tableau2.actionManager = new BABYLON.ActionManager(scene);
tableau2.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        currentRotationtab2 += BABYLON.Tools.ToRadians(-22.5);
        
        // Appliquer la rotation autour de l'axe Y
        tableau2.rotation.z = currentRotationtab2;
    })
);

let currentRotationtab3 = 0;

// Ajouter un gestionnaire d'événements pour détecter le clic
tableau3.actionManager = new BABYLON.ActionManager(scene);
tableau3.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        currentRotationtab3 += BABYLON.Tools.ToRadians(-22.5);
        
        // Appliquer la rotation autour de l'axe Y
        tableau3.rotation.z = currentRotationtab3;
    })
);

const tableauReveMaterial = new BABYLON.StandardMaterial("tableauReveMat", scene);
tableauReveMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // Jaune vif
tableauReveMaterial.emissiveColor = new BABYLON.Color3(0.85, 0.73, 0.83);  // Lampe torche visible, bleue sous la spotlight

const tableau1Reve = BABYLON.MeshBuilder.CreatePlane("tableau1Reve", { width: 1.8, height: 1.17 }, scene);
tableau1Reve.position = new BABYLON.Vector3(-4.85, 2.15, 7.5);
tableau1Reve.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0); 
tableau1Reve.material = tableauReveMaterial;
tableau1Reve.rotation.z = 135;

const tableau2Reve = BABYLON.MeshBuilder.CreatePlane("tableau2Reve", { width: 1.8, height: 1.17 }, scene);
tableau2Reve.position = new BABYLON.Vector3(-2.9, 2.15, 9.85);
tableau2Reve.rotation = new BABYLON.Vector3(0, 0, 0); 
tableau2Reve.material = tableauReveMaterial;
tableau2Reve.rotation.z = 90;

const tableau3Reve = BABYLON.MeshBuilder.CreatePlane("tableau3Reve", { width: 1.8, height: 1.17 }, scene);
tableau3Reve.position = new BABYLON.Vector3(0, 2.15, 9.85);
tableau3Reve.rotation = new BABYLON.Vector3(0, 0, 0); 
tableau3Reve.material = tableauReveMaterial;
tableau3Reve.rotation.z = -22.5;

tableau1Reve.isPickable = false;
tableau2Reve.isPickable = false;
tableau3Reve.isPickable = false;


function checkLighting() {
    let lightIntensity = 0;

    // Calculer l'intensité totale des lumières dans la scène
    scene.lights.forEach(light => {
        if (light.isEnabled() && light.intensity) {
            lightIntensity += light.intensity;
        }
    });

    // Définir un seuil d'intensité lumineuse (ex : 0.5)
    let seuilLuminosite = 0.5;

    // Ajuster la transparence du tableau en fonction de la lumière
    if (lightIntensity > seuilLuminosite) {
        tableau1Reve.visibility = 0;
        tableau2Reve.visibility = 0;
        tableau3Reve.visibility = 0;  // Rendre le tableau invisible
    } else {
        tableau1Reve.visibility = 1;
        tableau2Reve.visibility = 1;
        tableau3Reve.visibility = 1;  // Rendre le tableau visible
    }
}


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
const doorPBRMaterial = new PBRMaterial("doorPBRMat", scene);

// Texture diffuse (albedo)
doorPBRMaterial.albedoTexture = new Texture("../Textures/wood_door.jpg", scene);

// Texture de rugosité
doorPBRMaterial.metallicTexture = new Texture("../Textures/wood_roughness.jpg", scene);
doorPBRMaterial.roughness = 0.8;

// Normal map
doorPBRMaterial.bumpTexture = new Texture("../Textures/wood_normal.jpg", scene);
doorPBRMaterial.invertNormalMapX = true;
doorPBRMaterial.invertNormalMapY = true;

// Métallisation
doorPBRMaterial.metallic = 0.0;

// Affichage des deux faces
doorPBRMaterial.backFaceCulling = false;

// Création de la géométrie de la porte
const door = MeshBuilder.CreateBox("door", { height: 3, width: 1.4, depth: 0.1 }, scene);
door.setPivotPoint(new Vector3(0.7, 0, 0)); // Pivot à gauche

// Application du matériau
door.material = doorPBRMaterial;

// Positionnement
door.position = new Vector3(0, 1.5, 5);

// Collisions
door.checkCollisions = true;

// Variable d'ouverture
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


async function loadBed() {
    try {
        const result = await SceneLoader.ImportMeshAsync("", "/models/", "bed_agape.glb", scene);
        if (result.meshes && result.meshes.length > 0) {
            let bed = result.meshes[0]; // Récupérer l'objet principal du modèle du lit

            // Ajuster la position pour placer le lit dans un coin
            bed.position = new Vector3(-3.2, 0, -3.7); // Ajuste en fonction de ta scène

            // Mise à l'échelle pour s'assurer que le lit a la bonne taille
            bed.scaling = new Vector3(0.015, 0.015, 0.015); // Ajuste selon la taille du modèle

            // Rotation si nécessaire
            bed.rotation.y = Math.PI / 2; // Tourne le lit de 90° si besoin
            bed.checkCollisions = true;

            console.log("Lit importé et positionné !");
        } else {
            console.error("Erreur : Aucun modèle GLB chargé.");
        }
    } catch (error) {
        console.error("Erreur lors du chargement du modèle GLB du lit : ", error);
    }
}

// Appel de la fonction pour charger le lit
loadBed();

let lampe = null; // Globalement accessible



let spotlight = null;


// === Charger la lampe et la lumière ===
async function loadLampe() {
    try {
        const result = await SceneLoader.ImportMeshAsync("", "/models/", "lantern.glb", scene);
        if (result.meshes && result.meshes.length > 0) {
            lampe = result.meshes[0];

            lampe.scaling = new BABYLON.Vector3(0.001, 0.001, 0.001);
            lampe.parent = camera;
            lampe.position = new BABYLON.Vector3(-0.15, -0.15, 0.4);
            lampe.rotation = new BABYLON.Vector3(0, 0, 0);
            lampe.checkCollisions = true;
            lampe.setEnabled(true);

            // Création de la lumière
            spotlight = new BABYLON.SpotLight(
                "lanternLight",
                lampe.getAbsolutePosition(),
                camera.getDirection(BABYLON.Vector3.Forward()),
                Math.PI / 3,
                2,
                scene
            );

            spotlight.intensity = 50;
            spotlight.range = 15;
            spotlight.falloffType = BABYLON.Light.FALLOFF_LINEAR;
            spotlight.diffuse = new BABYLON.Color3(1.0, 0.78, 0.4);
            spotlight.specular = new BABYLON.Color3(0.8, 0.6, 0.3);

            // Mettre à jour position/direction à chaque frame
            scene.onBeforeRenderObservable.add(() => {
                if (lampe && spotlight) {
                    spotlight.position = lampe.getAbsolutePosition();
                    spotlight.direction = camera.getDirection(BABYLON.Vector3.Forward());
                }
            });

            console.log("Lampe torche et lumière chargées !");
        } else {
            console.error("Erreur : Aucun mesh trouvé dans le modèle.");
        }
    } catch (error) {
        console.error("Erreur lors du chargement de la lampe torche :", error);
    }
}

loadLampe();


 // Masquer la lampe au début

async function loadBook() {
    try {
        const result = await SceneLoader.ImportMeshAsync("", "/models/", "book.glb", scene);
        const book = result.meshes[0]; // Récupérer l'objet principal du modèle du livre

        // Ajuster la position pour placer le livre dans la scène
        book.position = new Vector3(-2.7, 1.8, 4.25); // Ajuste en fonction de ta scène

        // Mise à l'échelle pour s'assurer que le livre a la bonne taille
        book.scaling = new Vector3(1, 1, 1); // Ajuste selon la taille du modèle

        // Rotation si nécessaire
        book.rotation.y = Math.PI / 2; // Tourne le livre de 90° si besoin
        book.checkCollisions = true;

        console.log("Livre importé et positionné !");
    } catch (error) {
        console.error("Erreur lors du chargement du modèle GLB : ", error);
    }
}

// Appel de la fonction pour charger le livre
loadBook();

async function loadDesk() {
    try {
        const result = await SceneLoader.ImportMeshAsync("", "/models/", "desk.glb", scene);
        if (result.meshes && result.meshes.length > 0) {
            let desk = result.meshes[0]; // Récupérer l'objet principal du modèle du bureau

            // Ajuster la position pour placer le bureau dans un coin
            desk.position = new Vector3(4, 0, 4.25); // Ajuste en fonction de ta scène

            // Mise à l'échelle pour s'assurer que le bureau a la bonne taille
            desk.scaling = new Vector3(1.25, 1.25, 1.25); // Ajuste selon la taille du modèle

            // Activer les collisions pour le modèle
            desk.checkCollisions = true;

            // Si nécessaire, activer un environnement sombre
            console.log("Bureau importé, positionné et visible seulement dans l'obscurité !");
        } else {
            console.error("Erreur : Aucun modèle GLB chargé.");
        }
    } catch (error) {
        console.error("Erreur lors du chargement du modèle GLB du bureau : ", error);
    }
}

// Appel de la fonction pour charger le bureau
loadDesk();


// Chargement du modèle GLB du bureau et chaise
async function loadCommonTableAndChair() {
    try {
        const result = await SceneLoader.ImportMeshAsync("", "/models/", "common_table_and_chair.glb", scene);
        if (result.meshes && result.meshes.length > 0) {
            let common_table_and_chair = result.meshes[0]; // Récupérer l'objet principal du modèle (table et chaise)

            // Ajuster la position pour placer la table et la chaise dans un coin
            common_table_and_chair.position = new Vector3(2, 0, -2); // Ajuste en fonction de ta scène

            // Mise à l'échelle pour s'assurer que la table et la chaise ont la bonne taille
            common_table_and_chair.scaling = new Vector3(0.006, 0.006, 0.006); // Ajuste selon la taille du modèle

            // Activer les collisions pour le modèle
            common_table_and_chair.checkCollisions = true;

            // Si nécessaire, activer un environnement sombre
            console.log("Table et chaise importées, positionnées et visibles seulement dans l'obscurité !");
        } else {
            console.error("Erreur : Aucun modèle GLB chargé.");
        }
    } catch (error) {
        console.error("Erreur lors du chargement du modèle GLB de la table et chaise : ", error);
    }
}

// Appel de la fonction pour charger la table et la chaise
loadCommonTableAndChair();


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
let safe=null;
BABYLON.SceneLoader.ImportMesh("", "/models/", "antique_iron_safe.glb", scene, function (meshes) {
    safe = meshes[0]; // Récupérer l'objet principal du modèle

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



async function loadCupboard() {
    try {
        const result = await SceneLoader.ImportMeshAsync("", "/models/", "cupboard.glb", scene);
        if (result.meshes && result.meshes.length > 0) {
            let cupboard = result.meshes[0]; // Récupérer l'objet principal du modèle (armoire)

            // Ajuster la position pour placer l'armoire dans la scène
            cupboard.position = new Vector3(-2.5, 0, 4.75); // Ajuste en fonction de ta scène

            // Mise à l'échelle pour s'assurer que l'armoire a la bonne taille
            cupboard.scaling = new Vector3(0.008, 0.008, 0.008); // Ajuste selon la taille du modèle

            // Activer les collisions pour le modèle
            cupboard.checkCollisions = true;

            console.log("Armoire importée et positionnée !");
        } else {
            console.error("Erreur : Aucun modèle GLB chargé.");
        }
    } catch (error) {
        console.error("Erreur lors du chargement du modèle GLB de l'armoire : ", error);
    }
}

// Appel de la fonction pour charger l'armoire
loadCupboard();


// Chargement du modèle GLB pour les bras du FPS
// async function loadFpsArms() {
//     try {
//         const result = await SceneLoader.ImportMeshAsync("", "/models/", "fps_arms.glb", scene);
//         if (result.meshes && result.meshes.length > 0) {
//             const arms = result.meshes[0]; // Supposons que les bras sont dans meshes[0]
//             arms.scaling = new Vector3(0.01, 0.01, 0.01); // Ajuste la taille si nécessaire

//             // Synchroniser la position et la rotation des bras avec la caméra
//             scene.onBeforeRenderObservable.add(() => {
//                 const cameraForward = camera.getDirection(Vector3.Forward()).normalize();
                
//                 // Position des bras par rapport à la caméra
//                 arms.position = camera.position
//                     .add(cameraForward.scale(0.05)) // Distance devant la caméra
//                     .add(new Vector3(0, -0.1, 0)); // Ajustement vertical

//                 arms.rotation = camera.rotation; // Synchronisation avec la caméra
//             });

//             console.log("Bras FPS importés et positionnés !");
//         } else {
//             console.error("Erreur : Aucun modèle GLB chargé.");
//         }
//     } catch (error) {
//         console.error("Erreur lors du chargement du modèle GLB des bras FPS : ", error);
//     }
// }

// // Appel de la fonction pour charger les bras
// loadFpsArms();







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




let equippedItemName = null; // Nom de l'objet équipé
let keyHand = null;
// Fonction pour équiper un objet
function equipItem(item) {
    if (!inventory[item]) return; // Si l'objet n'est pas dans l'inventaire, ne rien faire
    if (equippedItemName === item) {
        unequipItem();
        equippedItemName = null;
        updateInventoryText();
        return;
    }

    unequipItem(); // Retire l'objet précédemment équipé

    switch (item) {
        case "key": // 🔑 Ajout de la clé avec le modèle 3D
            // Charger le modèle de la clé (clé.glb)
            BABYLON.SceneLoader.ImportMesh("", "/models/", "key.glb", scene, function (meshes) {
                let keyHand = meshes[0]; // Récupère le modèle de la clé (premier mesh)                
                // Positionne la clé dans la main droite du personnage
                keyHand.parent = camera;
                keyHand.position = new BABYLON.Vector3(0.22, -0.05, 0.4); // On va ajuster cette position plus bas
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
                equippedItemName = item; // Met à jour le nom de l'objet équipé
                

            });
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



//
// Importation de l'UI Babylon.js
// Panneau de notification
var notificationPanel = new BABYLON.GUI.Rectangle();
notificationPanel.width = "40%";
notificationPanel.height = "10%";
notificationPanel.cornerRadius = 10;
notificationPanel.color = "White";
notificationPanel.thickness = 3;
notificationPanel.background = "black";
notificationPanel.isVisible = false;
notificationPanel.top = "-30%"; // Position initiale hors écran
advancedTexture.addControl(notificationPanel);

var notificationText = new BABYLON.GUI.TextBlock();
notificationText.text = "";
notificationText.color = "white";
notificationText.fontSize = 24;
notificationPanel.addControl(notificationText);

// Fonction pour créer une animation avec callback
function animateNotification(property, from, to, onEnd = null) {
    let animation = new BABYLON.Animation(
        "notifAnim",
        property,
        60,
        BABYLON.Animation.ANIMATIONTYPE_STRING,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    let keys = [];
    keys.push({ frame: 0, value: from });
    keys.push({ frame: 20, value: to });
    animation.setKeys(keys);

    notificationPanel.animations = [];
    notificationPanel.animations.push(animation);

    let animatable = scene.beginAnimation(notificationPanel, 0, 20, false);
    
    if (onEnd) {
        animatable.onAnimationEnd = onEnd;
    }
}

// Fonction pour afficher une notification animée
function showNotification(message, color) {
    notificationText.text = message;
    notificationText.color = color;
    notificationPanel.isVisible = true;

    // Masquer après 3 secondes avec une animation de sortie
    setTimeout(() => {
            notificationPanel.isVisible = false;
    }, 3000);
}

var puzzlePanel = new BABYLON.GUI.Rectangle();
puzzlePanel.width = "50%";
puzzlePanel.height = "40%";
puzzlePanel.cornerRadius = 10;
puzzlePanel.color = "White";
puzzlePanel.thickness = 4;
puzzlePanel.background = "black";
puzzlePanel.isVisible = false;
advancedTexture.addControl(puzzlePanel);

// Création d'une grille pour aligner les chiffres horizontalement
var grid = new BABYLON.GUI.Grid();
grid.width = "100%";
grid.height = "80%";

// Ajouter 4 colonnes pour chaque chiffre
grid.addColumnDefinition(0.25);
grid.addColumnDefinition(0.25);
grid.addColumnDefinition(0.25);
grid.addColumnDefinition(0.25);

puzzlePanel.addControl(grid);

// Code secret
var colors = ["red", "blue", "green", "cyan"];
var selectors = [];
var enteredCode = [0, 0, 0, 0];
var secretCode = [3, 2, 1, 6];  // Exemple de code secret


// Création des cases de chiffres avec des couleurs différentes


for (let i = 0; i < 4; i++) {
    let stackPanel = new BABYLON.GUI.StackPanel();
    stackPanel.width = "100%";

    let label = new BABYLON.GUI.TextBlock();
    label.text = enteredCode[i].toString();
    label.color = colors[i];
    label.fontSize = 40;
    stackPanel.addControl(label);

    let buttonUp = BABYLON.GUI.Button.CreateSimpleButton("up" + i, "▲");
    buttonUp.width = "80px";
    buttonUp.height = "40px";
    buttonUp.onPointerClickObservable.add(() => {
        enteredCode[i] = (enteredCode[i] + 1) % 10;
        label.text = enteredCode[i].toString();
    });
    stackPanel.addControl(buttonUp);

    let buttonDown = BABYLON.GUI.Button.CreateSimpleButton("down" + i, "▼");
    buttonDown.width = "80px";
    buttonDown.height = "40px";
    buttonDown.onPointerClickObservable.add(() => {
        enteredCode[i] = (enteredCode[i] - 1 + 10) % 10;
        label.text = enteredCode[i].toString();
    });
    stackPanel.addControl(buttonDown);

    grid.addControl(stackPanel, 0, i); // Ajout dans la grille, ligne 0, colonne i
    selectors.push(label);
}

// Bouton pour valider le code
var validateButton = BABYLON.GUI.Button.CreateSimpleButton("validate", "Valider");
validateButton.top = "90px"; // Descend le bouton de 20 pixels
validateButton.width = "150px";
validateButton.height = "50px";
validateButton.color = "white";
validateButton.background = "green";
validateButton.onPointerClickObservable.add(() => {
    if (JSON.stringify(enteredCode) === JSON.stringify(secretCode)) {
        showNotification("✔️ Code correct ! Le coffre s'ouvre.", "green");
        puzzlePanel.isVisible = false;
        safe.dispose(); // Supprime le coffre
        BABYLON.SceneLoader.ImportMesh("", "/models/", "antique_iron_safe_open.glb", scene, function (meshes) {
            let safe = meshes[0]; // Récupérer l'objet principal du modèle
        
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

        
    } else {
        showNotification("❌ Mauvais code ! Réessayez.", "red");
        puzzlePanel.isVisible = false;
    }
});
puzzlePanel.addControl(validateButton);



// Intégration dans le clic sur le coffre
scene.onPointerDown = function (evt, pickResult) { 
    if (pickResult.hit) {
        console.log(pickResult.pickedMesh.name);
        if (pickResult.pickedMesh.name === "flashlight") collectItem("flashlight");
        if (pickResult.pickedMesh.name === "Object_2") collectItem("key");
        if (pickResult.pickedMesh.name === "Safe_LP_M_SafeFrontPanel_0") puzzlePanel.isVisible = true;
        
    }
};


// Intégration dans le clic sur le coffre
scene.registerBeforeRender(checkLighting);



// Boucle de rendu
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());