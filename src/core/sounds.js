// soundManager.js
import { Sound, CreateAudioEngineAsync } from "@babylonjs/core";

export function playAmbientSound(scene, soundPath, volume = 0.5) {
    // Charger le son d'ambiance
    var ambientSound = new BABYLON.Sound("AmbientSound", soundPath, scene, null, {
        loop: true, // Jouer en boucle
        autoplay: true, // Commencer automatiquement
        volume: volume // Régler le volume
    });

    // Retourner l'objet son pour un contrôle ultérieur si nécessaire
    return ambientSound;
}