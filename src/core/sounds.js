// soundManager.js
import { Sound, Engine } from "@babylonjs/core";

export async function playAmbientSound(scene, soundPath, volume = 0.5) {
    // Vérifier si l'audio engine est disponible
    if (!Engine.audioEngine) {
        console.warn("Audio engine non disponible. Initialisation...");
        Engine.audioEngine = new BABYLON.AudioEngine(); // Initialiser l'audio engine
    }

    // Vérifier si l'audio engine est bien initialisé
    if (!Engine.audioEngine) {
        throw new Error("Impossible d'initialiser l'audio engine.");
    }

    // Débloquer l'audio engine si nécessaire
    if (Engine.audioEngine.unlock) {
        await Engine.audioEngine.unlock();
    }

    // Charger le son d'ambiance
    const ambientSound = new Sound("ambientSound", soundPath, scene, null, {
        loop: true, // Jouer en boucle
        autoplay: true, // Commencer automatiquement
        volume: volume // Régler le volume
    });

    return ambientSound;
}