import { MeshBuilder, PBRMaterial, Texture, Vector3, ActionManager, ExecuteCodeAction } from "@babylonjs/core";

export function createTableau(scene, position, rotation, texturePath) {
  const tableauMaterial = new PBRMaterial("tableauMat", scene);
  tableauMaterial.albedoTexture = new Texture(texturePath, scene);
  tableauMaterial.roughness = 0.8;
  tableauMaterial.metallic = 0.0;

  const tableau = MeshBuilder.CreatePlane("tableau", { width: 2, height: 1.3 }, scene);
  tableau.position = position;
  tableau.rotation = rotation;
  tableau.material = tableauMaterial;

  // Rotation au clic
  let currentRotation = 0;
  tableau.actionManager = new ActionManager(scene);
  tableau.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      currentRotation += Math.PI / 8; // Rotation de 22.5°
      tableau.rotation.z = currentRotation;
    })
  );

  return tableau;
}