import { SceneLoader, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, TextBlock, Button, Rectangle, Control } from "@babylonjs/gui/2D";

export async function loadBed(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "bed_agape.glb", scene);
  const bed = result.meshes[0];
  bed.position = new Vector3(-3.2, 0, -3.7);
  bed.scaling = new Vector3(0.015, 0.015, 0.015);
  bed.rotation.y = Math.PI / 2;
  bed.checkCollisions = true;
  return bed;
}

export async function loadDesk(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "desk.glb", scene);
  const desk = result.meshes[0];
  desk.position = new Vector3(4, 0, 4.25);
  desk.scaling = new Vector3(1.25, 1.25, 1.25);
  desk.checkCollisions = true;
  return desk;
}

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
let advancedTexture = null;
let introPanel = null;

export function showIntro(scene, onIntroEnd) {
  advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("IntroUI", true, scene);

  introPanel = new StackPanel();
  introPanel.width = "600px";
  introPanel.height = "150px";
  introPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  introPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  advancedTexture.addControl(introPanel);

  const background = new Rectangle();
  background.width = "100%";
  background.height = "100%";
  background.background = "rgba(0, 0, 0, 1)";
  introPanel.addControl(background);

  textBlock = new TextBlock();
  textBlock.text = introText[currentTextIndex];
  textBlock.fontSize = 24;
  textBlock.color = "white";
  textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  introPanel.addControl(textBlock);

  const skipButton = Button.CreateSimpleButton("skipBtn", "SKIP");
  skipButton.width = "100px";
  skipButton.height = "40px";
  skipButton.color = "white";
  skipButton.background = "red";
  skipButton.onPointerUpObservable.add(() => {
    endIntro(onIntroEnd);
  });
  introPanel.addControl(skipButton);

  scene.onKeyboardObservable.add((keyboardInfo) => {
    if (keyboardInfo.event.code === "Space" && canAdvanceText) {
      nextIntroText(onIntroEnd);
    }
  });
}

function nextIntroText(onIntroEnd) {
  if (!canAdvanceText) return;

  canAdvanceText = false;
  setTimeout(() => {
    canAdvanceText = true;
  }, 300);

  currentTextIndex++;
  if (currentTextIndex < introText.length) {
    textBlock.text = introText[currentTextIndex];
  } else {
    endIntro(onIntroEnd);
  }
}

function endIntro(onIntroEnd) {
  if (introPanel) {
    introPanel.dispose();
    advancedTexture.dispose();
  }
  onIntroEnd();
}


export function initGame(scene, camera) {
  // Désactiver les contrôles de la caméra pendant l'intro
  camera.detachControl();

  // Lancer l'intro
  showIntro(scene, () => {
    console.log("Introduction terminée. Le jeu commence !");
    
    // Réactiver les contrôles de la caméra
    camera.attachControl();

    // Afficher une notification pour guider le joueur
    console.log("Utilisez les touches ZQSD pour vous déplacer et la souris pour regarder autour de vous.");
  });
}