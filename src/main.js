import { Engine } from "@babylonjs/core";
import { createScene1 } from "./scenes/scene1";

// Initialisation de l'engin Babylon.js
const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

// Création de la scène
const scene = createScene1(engine);

// Boucle de rendu
engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => engine.resize());
