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
  SceneLoader
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { createEngine } from "../core/engine.js";
import { createCamera } from "../core/camera";
import { createLighting } from "../core/lighting.js";
import { playAmbientSound } from "../core/sounds.js";
import { showIntroText, nextIntroText, skipIntro } from "../ui/intro.js";
import { canPlay, canAdvanceText, introText, currentTextIndex } from "../ui/intro.js";
import { AdvancedDynamicTexture, StackPanel, TextBlock, Button, Rectangle, Control, Grid } from "@babylonjs/gui/2D";

export function setupScene2(engine, canvas, goToScene1){
    const scene = new Scene(engine);
    const camera = createCamera(scene, canvas);

    // Décor simple
    const ground = MeshBuilder.CreateGround("ground2", { width: 10, height: 10 }, scene);
    const mat = new StandardMaterial("mat2", scene);
    mat.diffuseColor = new Color3(0.2, 0.5, 0.8);
    ground.material = mat;

    // Un cube au centre
    const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
    box.position = new Vector3(0, 1, 0);

    // UI avec bouton retour
    const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    const btn = Button.CreateSimpleButton("toScene1", "Retour à la scène 1");
    btn.width = "200px";
    btn.height = "60px";
    btn.color = "white";
    btn.background = "green";
    btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    btn.top = "-40px";
    btn.onPointerUpObservable.add(() => {
        goToScene1();
    });
    ui.addControl(btn);

    engine.runRenderLoop(() => scene.render());

    return () => {
        ui.dispose();
        scene.dispose();
    };

}
