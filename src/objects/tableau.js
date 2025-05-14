import { MeshBuilder, PBRMaterial, Texture, Vector3 } from "@babylonjs/core";

export function createTableau(scene, position, rotation, texturePath) {
  const tableauMaterial = new PBRMaterial("tableauMat", scene);
  tableauMaterial.albedoTexture = new Texture(texturePath, scene);
  tableauMaterial.albedoTexture.level = 0.8;
  tableauMaterial.metallic = 0.0;
  tableauMaterial.roughness = 0.8;
  tableauMaterial.metallicTexture = new Texture("../Textures/wood_roughness.jpg", scene);
  tableauMaterial.useRoughnessFromMetallicTextureAlpha = false;
  tableauMaterial.bumpTexture = new Texture("../Textures/wood_normal.jpg", scene);
  tableauMaterial.invertNormalMapX = true;
  tableauMaterial.invertNormalMapY = true;

  const tableau = MeshBuilder.CreatePlane("tableau", { width: 2, height: 1.3 }, scene);
  tableau.position = position;
  tableau.rotation = rotation;
  tableau.material = tableauMaterial;

  let currentRotation = 0;
  tableau.actionManager = new BABYLON.ActionManager(scene);
  tableau.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
      currentRotation += BABYLON.Tools.ToRadians(-22.5);
      tableau.rotation.z = currentRotation;
    })
  );

  return tableau;
}
