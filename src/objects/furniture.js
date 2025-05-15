import { SceneLoader, Vector3 } from "@babylonjs/core";

export async function loadBed(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "bed_agape.glb", scene);
  const bed = result.meshes[0];
  bed.position = new Vector3(-3.2, 0, -3.7);
  bed.scaling = new Vector3(0.015, 0.015, 0.015);
  bed.rotation.y = Math.PI / 2;
  bed.checkCollisions = true;
  return bed;
}

export async function loadDesk(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "desk.glb", scene);
  const desk = result.meshes[0];
  desk.position = new Vector3(4, 0, 4.25);
  desk.scaling = new Vector3(1.25, 1.25, 1.25);
  desk.checkCollisions = true;
  return desk;
}