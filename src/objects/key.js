import { SceneLoader, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export function createKey(scene) {
  let key = null;

  SceneLoader.ImportMesh(
    "",
    "/models/",
    "key.glb",
    scene,
    function (meshes) {
      key = meshes[0];
      key.position = new Vector3(2, 1.05, -2);
      key.scaling = new Vector3(0.001, 0.001, 0.001);
      key.rotation.x = Math.PI / 2;
      key.checkCollisions = true;

      let emissiveMaterial = new StandardMaterial("emissiveMat", scene);
      emissiveMaterial.emissiveColor = new Color3(0.85, 0.73, 0.83);
      emissiveMaterial.diffuseColor = new Color3(0, 0, 0);
      emissiveMaterial.specularColor = new Color3(0, 0, 0);

      meshes.forEach((mesh) => {
        mesh.material = emissiveMaterial;
        mesh.isPickable = true;
      });

      console.log("Meshes importés :", meshes);
    },
    null,
    function (scene, message, exception) {
      console.error("Erreur de chargement :", message, exception);
    }
  );

  return key;
}
