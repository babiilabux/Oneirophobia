import { Animation } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "@babylonjs/gui/2D";

export function animateProperty(target, property, from, to, duration, scene, onEnd = null) {
  const animation = new Animation(
    "propertyAnimation",
    property,
    60,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [
    { frame: 0, value: from },
    { frame: 60, value: to },
  ];

  animation.setKeys(keys);
  target.animations = [animation];

  const animatable = scene.beginAnimation(target, 0, 60, false);
  if (onEnd) {
    animatable.onAnimationEnd = onEnd;
  }
}

export function showNotification(scene, message, color = "white", duration = 3000) {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  const notificationPanel = new Rectangle();
  notificationPanel.width = "40%";
  notificationPanel.height = "10%";
  notificationPanel.cornerRadius = 10;
  notificationPanel.color = "White";
  notificationPanel.thickness = 3;
  notificationPanel.background = "black";
  notificationPanel.isVisible = true;
  advancedTexture.addControl(notificationPanel);

  const notificationText = new TextBlock();
  notificationText.text = message;
  notificationText.color = color;
  notificationText.fontSize = 24;
  notificationPanel.addControl(notificationText);

  setTimeout(() => {
    notificationPanel.isVisible = false;
    advancedTexture.dispose();
  }, duration);
}