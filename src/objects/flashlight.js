import { MeshBuilder, StandardMaterial, Color3, SpotLight, Vector3, ShadowGenerator } from "@babylonjs/core";

export function createFlashlight(scene, camera) {
  const flashlight = MeshBuilder.CreateCylinder("flashlight", { height: 0.3, diameter: 0.1 }, scene);
  const flashlightMaterial = new StandardMaterial("flashlightMat", scene);
  flashlightMaterial.diffuseColor = new Color3(1, 1, 0); // Jaune vif
  flashlightMaterial.emissiveColor = new Color3(0.85, 0.73, 0.83); // Émission douce
  flashlight.material = flashlightMaterial;

  flashlight.parent = camera;
  flashlight.position = new Vector3(-0.15, -0.15, 0.4);
  flashlight.rotation = new Vector3(0, 0, 0);

  // Création du spotlight
  const spotlight = new SpotLight(
    "spotlight",
    camera.position,
    camera.getDirection(Vector3.Forward()),
    Math.PI / 3,
    2,
    scene
  );
  spotlight.intensity = 50;
  spotlight.range = 15;
  spotlight.diffuse = new Color3(1.0, 0.78, 0.4); // Lumière chaude
  spotlight.specular = new Color3(0.8, 0.6, 0.3);

  // Mise à jour continue de la position et direction de la lumière
  scene.onBeforeRenderObservable.add(() => {
    spotlight.position = camera.position.add(camera.getDirection(Vector3.Forward()).scale(0.5));
    spotlight.direction = camera.getDirection(Vector3.Forward());
  });

  // Ombres douces
  const shadowGenerator = new ShadowGenerator(1024, spotlight);
  shadowGenerator.usePoissonSampling = true;

  flashlight.spotlight = spotlight;

  return flashlight;
}