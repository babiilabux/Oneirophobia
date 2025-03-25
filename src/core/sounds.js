import { Sound, AudioEngine } from "@babylonjs/core";


(async () => {
    const audioEngine = await BABYLON.CreateAudioEngineAsync();

    // Create sounds here, but don't call `play()` on them, yet ...

    // Wait until audio engine is ready to play sounds.
    await audioEngine.unlock();

    // Start sound playback ...
})();


































/*export async function playSound(scene, soundPath) {
    return new Promise((resolve, reject) => {
        const sound = new Sound(
            "Sound",
            soundPath,
            scene,
            null,
            {
                loop: false,
                autoplay: false,
                volume: 1.0
            },
            () => {
                console.log("Son chargé et prêt à être joué.");
                resolve(sound);
            },
            (error) => {
                console.error("Erreur lors du chargement du son :", error);
                reject(error);
            }
        );

        // Jouer le son après un clic utilisateur
        window.addEventListener("click", () => {
            sound.play();
        });

        // Logs pour vérifier la lecture du son
        sound.play = () => {
            console.log("Le son commence à jouer.");
        };

        sound.onended = () => {
            console.log("Le son a fini de jouer.");
        };
    });
}*/
