export function showNotification(message, color) {
  const notificationPanel = new BABYLON.GUI.Rectangle();
  notificationPanel.width = "40%";
  notificationPanel.height = "10%";
  notificationPanel.cornerRadius = 10;
  notificationPanel.color = "White";
  notificationPanel.thickness = 3;
  notificationPanel.background = "black";
  notificationPanel.isVisible = false;
  notificationPanel.top = "-30%";

  const notificationText = new BABYLON.GUI.TextBlock();
  notificationText.text = message;
  notificationText.color = color;
  notificationText.fontSize = 24;
  notificationPanel.addControl(notificationText);

  // Ajouter l'animation et la logique pour afficher/masquer la notification
  // ...

  return notificationPanel;
}
