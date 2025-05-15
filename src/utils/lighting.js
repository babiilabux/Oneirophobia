export function checkLighting(scene, threshold = 0.5, onLowLight = () => {}, onHighLight = () => {}) {
  let lightIntensity = 0;

  scene.lights.forEach((light) => {
    if (light.isEnabled() && light.intensity) {
      lightIntensity += light.intensity;
    }
  });

  if (lightIntensity > threshold) {
    onHighLight();
  } else {
    onLowLight();
  }
}

export function registerLightingCheck(scene, threshold, onLowLight, onHighLight) {
  scene.onBeforeRenderObservable.add(() => {
    checkLighting(scene, threshold, onLowLight, onHighLight);
  });
}