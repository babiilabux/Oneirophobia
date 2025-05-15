import { SceneLoader, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, TextBlock, Button, Rectangle, Control } from "@babylonjs/gui/2D";
import { startGame } from "../main.js";

// === Texte qui défile ===
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
let introPanel = null; // Référence globale au panneau d'introduction

export function showIntroText(introTexture, textBlock, introPanel, introText, currentTextIndex, camera) {
  // Vérifier si les variables sont définies
  if (!introTexture) {
        console.error("Erreur : introTexture");
        return;
    } else if (!textBlock) {
        console.error("Erreur : textBlock");
        return;
    } else if (!introPanel) {
        console.error("Erreur : introPanel");
        return;
    } else if (!introText) {
        console.error("Erreur : introText");
        return;
    } else if (!currentTextIndex) {
        console.error("Erreur : currentTextIndex");
        return;
    } else if (!camera) {
        console.error("Erreur : camera");
        return;
    }

    // init panneau de d'introduction
    introPanel = new BABYLON.GUI.StackPanel();
    introTexture.addControl(introPanel);

    introPanel.width = "600px";
    introPanel.height = "150px";
    introPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    introPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    // Fond sombre avec une légère transparence
    const background = new BABYLON.GUI.Rectangle();
    background.width = "100%";
    background.height = "100%";
    background.background = "rgba(0, 0, 0, 1)";
    introPanel.addControl(background);

    // Créer un TextBlock pour afficher les phrases
    textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = introText[currentTextIndex];
    textBlock.fontSize = 24;
    textBlock.color = "white";
    textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    introPanel.addControl(textBlock);

    // Ajouter le bouton "Skip" pour sauter l'introduction
    const skipButton = BABYLON.GUI.Button.CreateSimpleButton("skipBtn", "SKIP");
    skipButton.width = "100px";
    skipButton.height = "40px";
    skipButton.color = "white";
    skipButton.background = "red";
    skipButton.top = "10px";
    skipButton.onPointerUpObservable.add(() => {
        skipIntro(introTexture, camera); // Quand on clique sur "SKIP", on saute l'intro
    });
    introPanel.addControl(skipButton);
}



// Afficher le texte suivant
export function nextIntroText(canAdvanceText, currentTextIndex, textBlock, introPanel) {
    if (!canAdvanceText) return;

    canAdvanceText = false; // Empêche les appels multiples rapides
    setTimeout(() => {
        canAdvanceText = true; // Autorise à nouveau le changement de texte après 1 seconde
    }, 1000);

    currentTextIndex++;
    if (currentTextIndex < introText.length) {
        textBlock.text = introText[currentTextIndex];

        // Changer la couleur et le style du texte selon le contenu
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
            startGame(introPanel, textBlock); // Lancer le jeu après la fin de l'intro
        }, 300);
    }
}


export function skipIntro(introTexture, introPanel, camera) {
    currentTextIndex = introText.length; // Avancer directement à la fin
    nextIntroText(); // Change le texte à la fin et commence le jeu

    // Supprimer tous les contrôles d'interface 2D, y compris l'intro
    if (introPanel) {
        

        introPanel.dispose();
        introPanel = null; // Réinitialiser la variable de référence
    }

    // Désactiver l'affichage de l'interface 2D
    introTexture.dispose();

    // Permettre au joueur de commencer à jouer
    canPlay = true;
    
    // Réactiver le contrôle de la caméra pour le jeu
    camera.attachControl(canvas, true); // Reprendre le contrôle de la caméra proprement
}