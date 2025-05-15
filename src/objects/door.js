import { MeshBuilder, PBRMaterial, Texture, Vector3, Animation } from "@babylonjs/core";

export function createDoor(scene, camera) {
  const doorMaterial = new PBRMaterial("doorMat", scene);
  doorMaterial.albedoTexture = new Texture("../Textures/wood_door.jpg", scene);
  doorMaterial.roughness = 0.8;
  doorMaterial.metallic = 0.0;

  const door = MeshBuilder.CreateBox("door", { height: 3, width: 1.4, depth: 0.1 }, scene);
  door.material = doorMaterial;
  door.position = new Vector3(0, 1.5, 5);
  door.checkCollisions = true;

  let doorOpen = false;

  scene.onKeyboardObservable.add((kbInfo) => {
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key === " ") {
      const distance = Vector3.Distance(door.position, camera.position);
      if (distance < 2.5 && !doorOpen) {
        openDoor(door, scene);
        doorOpen = true;
      }
    }
  });

  return door;
}

function openDoor(door, scene) {
  const animation = new Animation(
    "doorOpen",
    "rotation.y",
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [
    { frame: 0, value: 0 },
    { frame: 30, value: Math.PI / 2 },
  ];

  animation.setKeys(keys);
  door.animations = [animation];
  scene.beginAnimation(door, 0, 30, false);
}