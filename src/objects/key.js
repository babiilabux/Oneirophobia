import { SceneLoader, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";

export async function createKey(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "key.glb", scene);
  const key = result.meshes[0];

  key.position = new Vector3(2, 1.05, -2);
  key.scaling = new Vector3(0.001, 0.001, 0.001);
  key.rotation.x = Math.PI / 2; // Rotation pour l'alignement

  // Matériau émissif
  const emissiveMaterial = new StandardMaterial("keyMat", scene);
  emissiveMaterial.emissiveColor = new Color3(0.85, 0.73, 0.83);
  key.material = emissiveMaterial;

  key.checkCollisions = true;

  return key;
}