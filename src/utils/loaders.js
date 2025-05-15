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

export function loadBook(scene) {
  SceneLoader.ImportMeshAsync("", "/models/", "book.glb", scene).then((result) => {
    const book = result.meshes[0];
    book.position = new Vector3(-2.7, 1.8, 4.25);
    book.scaling = new Vector3(1, 1, 1);
    book.rotation.y = Math.PI / 2;
    book.checkCollisions = true;
  });
}

export async function loadDesk(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "desk.glb", scene);
  const desk = result.meshes[0];
  desk.position = new Vector3(4, 0, 4.25);
  desk.scaling = new Vector3(1.25, 1.25, 1.25);
  desk.checkCollisions = true;
  return desk;
}

export function loadCommonTableAndChair(scene) {
  SceneLoader.ImportMeshAsync("", "/models/", "common_table_and_chair.glb", scene).then((result) => {
    if (result.meshes && result.meshes.length > 0) {
      let common_table_and_chair = result.meshes[0];
      common_table_and_chair.position = new Vector3(2, 0, -2);
      common_table_and_chair.scaling = new Vector3(0.006, 0.006, 0.006);
      common_table_and_chair.checkCollisions = true;
    }
  });
}

export async function loadKey(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "key.glb", scene);
  const key = result.meshes[0];
  key.position = new Vector3(2, 1.05, -2);
  key.scaling = new Vector3(0.001, 0.001, 0.001);
  key.rotation.x = Math.PI / 2;
  key.checkCollisions = true;
  return key;
}

export async function loadSafe(scene) {
  const result = await SceneLoader.ImportMeshAsync("", "/models/", "antique_iron_safe.glb", scene);
  const safe = result.meshes[0];
  safe.position = new Vector3(4, 0.6, 9);
  safe.scaling = new Vector3(1.1, 1.1, 1.1);
  safe.checkCollisions = true;
  return safe;
}
