import { Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, StackPanel, TextBlock } from "@babylonjs/gui/2D";
import { startGame } from "../main";  // Importer la fonction startGame

export function createMenuScene(engine, canvas) {
    const scene = new Scene(engine);
    
    

    // Créer l'UI du menu
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    const menuPanel = new StackPanel();
    advancedTexture.addControl(menuPanel);
    menuPanel.width = "300px";
    menuPanel.height = "200px";
    menuPanel.top = "150px";
    menuPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    menuPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    // Titre du menu
    const title = new TextBlock();
    title.text = "Bienvenue dans le jeu";
    title.fontSize = 24;
    title.color = "white";
    menuPanel.addControl(title);

    // Bouton "Démarrer"
    const startButton = Button.CreateSimpleButton("startButton", "Démarrer");
    startButton.width = "200px";
    startButton.height = "40px";
    startButton.color = "white";
    startButton.background = "green";
    startButton.onPointerDownObservable.add(() => {
        startGame();
        advancedTexture.dispose();  // Masque le menu
    });
    menuPanel.addControl(startButton);

    // Bouton "Quitter"
    const exitButton = Button.CreateSimpleButton("exitButton", "Quitter");
    exitButton.width = "200px";
    exitButton.height = "40px";
    exitButton.color = "white";
    exitButton.background = "red";
    exitButton.onPointerDownObservable.add(() => {
        window.close();
    });
    menuPanel.addControl(exitButton);

    return scene;
}
