import { SceneLoader } from "@babylonjs/core";

export function loadBed(scene) {
  SceneLoader.ImportMeshAsync("", "/models/", "bed_agape.glb", scene).then((result) => {
    if (result.meshes && result.meshes.length > 0) {
      let bed = result.meshes[0];
      bed.position = new Vector3(-3.2, 0, -3.7);
      bed.scaling = new Vector3(0.015, 0.015, 0.015);
      bed.rotation.y = Math.PI / 2;
      bed.checkCollisions = true;
    }
  });
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

export function loadDesk(scene) {
  SceneLoader.ImportMeshAsync("", "/models/", "desk.glb", scene).then((result) => {
    if (result.meshes && result.meshes.length > 0) {
      let desk = result.meshes[0];
      desk.position = new Vector3(4, 0, 4.25);
      desk.scaling = new Vector3(1.25, 1.25, 1.25);
      desk.checkCollisions = true;
    }
  });
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
