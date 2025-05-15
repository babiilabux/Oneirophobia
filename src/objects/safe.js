import { SceneLoader, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";

export async function createSafe(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "antique_iron_safe.glb", scene);
  const safe = result.meshes[0];

  safe.position = new Vector3(4, 0.6, 9);
  safe.scaling = new Vector3(1.1, 1.1, 1.1);

  // Matériau émissif
  const emissiveMaterial = new StandardMaterial("safeMat", scene);
  emissiveMaterial.emissiveColor = new Color3(0.85, 0.73, 0.83);
  safe.material = emissiveMaterial;

  safe.checkCollisions = true;

  return safe;
}