import { MeshBuilder, PBRMaterial, Texture, Vector3, Animation, Color3 } from "@babylonjs/core";

export function createDoor(scene, camera) {
  const doorPBRMaterial = new PBRMaterial("doorPBRMat", scene);
  doorPBRMaterial.albedoTexture = new Texture("../Textures/wood_door.jpg", scene);
  doorPBRMaterial.metallicTexture = new Texture("../Textures/wood_roughness.jpg", scene);
  doorPBRMaterial.roughness = 0.8;
  doorPBRMaterial.bumpTexture = new Texture("../Textures/wood_normal.jpg", scene);
  doorPBRMaterial.invertNormalMapX = true;
  doorPBRMaterial.invertNormalMapY = true;
  doorPBRMaterial.metallic = 0.0;
  doorPBRMaterial.backFaceCulling = false;

  const door = MeshBuilder.CreateBox("door", { height: 3, width: 1.4, depth: 0.1 }, scene);
  door.setPivotPoint(new Vector3(0.7, 0, 0));
  door.material = doorPBRMaterial;
  door.position = new Vector3(0, 1.5, 5);
  door.checkCollisions = true;

  let doorOpen = false;

  scene.onKeyboardObservable.add((kbInfo) => {
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key === " ") {
      const distance = Vector3.Distance(door.position, camera.position);
      if (distance < 2.5 && equippedItem && equippedItem.name === '__root__') {
        if (!doorOpen) {
          openDoor();
        }
      }
    }
  });

  function openDoor() {
    doorOpen = true;
    const animation = new Animation(
      "doorOpenAnimation",
      "rotation.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keys = [
      { frame: 0, value: 0 },
      { frame: 30, value: Math.PI / 2 }
    ];

    animation.setKeys(keys);
    door.animations = [animation];
    scene.beginAnimation(door, 0, 30, false);
  }

  return door;
}
