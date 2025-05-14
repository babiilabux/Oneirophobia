import { MeshBuilder, StandardMaterial, Color3, SpotLight, Vector3 } from "@babylonjs/core";

export function createFlashlight(scene) {
  const flashlight = MeshBuilder.CreateCylinder("flashlight", { height: 0.3, diameter: 0.1 }, scene);
  const flashlightMaterial = new StandardMaterial("flashlightMat", scene);
  flashlightMaterial.diffuseColor = new Color3(1, 1, 0);
  flashlightMaterial.emissiveColor = new Color3(0.85, 0.73, 0.83);
  flashlight.material = flashlightMaterial;
  flashlight.position = new Vector3(0, 2, 2);
  flashlight.setEnabled(false);

  const spotlight = new SpotLight("spotlight", new Vector3(0, 2, 2), new Vector3(0, 0, 1), Math.PI / 3, 2, scene);
  spotlight.diffuse = new Color3(1, 0.8, 0.6);
  spotlight.specular = new Color3(1, 1, 1);
  spotlight.intensity = 100;
  spotlight.range = 20;
  spotlight.falloffType = SpotLight.FALLOFF_EXPONENTIAL;
  spotlight.angle = Math.PI / 3;
  spotlight.position = new Vector3(0, 2, 2);

  return { flashlight, spotlight };
}
