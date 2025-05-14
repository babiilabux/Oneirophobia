import { SceneLoader, StandardMaterial, Color3, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export function createSafe(scene) {
  let safe = null;
  SceneLoader.ImportMesh("", "/models/", "antique_iron_safe.glb", scene, function (meshes) {
    safe = meshes[0];
    safe.position = new Vector3(4, 0.6, 9);
    safe.scaling = new Vector3(1.1, 1.1, 1.1);
    safe.checkCollisions = true;

    let emissiveMaterial = new StandardMaterial("emissiveMat", scene);
    emissiveMaterial.emissiveColor = new Color3(0.85, 0.73, 0.83);
    emissiveMaterial.diffuseColor = new Color3(0, 0, 0);
    emissiveMaterial.specularColor = new Color3(0, 0, 0);

    meshes.forEach((mesh) => {
      mesh.material = emissiveMaterial;
      mesh.isPickable = true;
    });
  });

  return safe;
}
