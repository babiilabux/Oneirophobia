import { AdvancedDynamicTexture, StackPanel, TextBlock, Button } from "@babylonjs/gui/2D";

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

export function showIntroText(scene) {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
  const introPanel = new StackPanel();
  advancedTexture.addControl(introPanel);
  introPanel.width = "600px";
  introPanel.height = "150px";
  introPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  introPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

  const background = new BABYLON.GUI.Rectangle();
  background.width = "100%";
  background.height = "100%";
  background.background = "rgba(0, 0, 0, 1)";
  introPanel.addControl(background);

  textBlock = new BABYLON.GUI.TextBlock();
  textBlock.text = introText[currentTextIndex];
  textBlock.fontSize = 24;
  textBlock.color = "white";
  textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  introPanel.addControl(textBlock);

  const skipButton = BABYLON.GUI.Button.CreateSimpleButton("skipBtn", "SKIP");
  skipButton.width = "100px";
  skipButton.height = "40px";
  skipButton.color = "white";
  skipButton.background = "red";
  skipButton.top = "10px";
  skipButton.onPointerUpObservable.add(() => {
    skipIntro();
  });
  introPanel.addControl(skipButton);
}

function nextIntroText() {
  if (!canAdvanceText) return;

  canAdvanceText = false;
  setTimeout(() => {
    canAdvanceText = true;
  }, 1000);

  currentTextIndex++;
  if (currentTextIndex < introText.length) {
    textBlock.text = introText[currentTextIndex];

    if (introText[currentTextIndex].includes("*")) {
      textBlock.color = "white";
      textBlock.fontStyle = "bold italic";
    } else if (introText[currentTextIndex].includes("Inconnu")) {
      textBlock.color = "purple";
      textBlock.fontStyle = "italic";
    } else {
      textBlock.color = "white";
      textBlock.fontStyle = "normal";
    }
  } else {
    setTimeout(() => {
      startGame();
    }, 300);
  }
}

function skipIntro() {
  currentTextIndex = introText.length;
  nextIntroText();
}

function startGame() {
  // Masquer l'interface du texte d'introduction
  // ...
}

export function initGame(scene) {
  showIntroText(scene);
  scene.onKeyboardObservable.add((keyboardInfo) => {
    if (keyboardInfo.event.code === "Space" && canAdvanceText) {
      nextIntroText();
    }
  });
}
