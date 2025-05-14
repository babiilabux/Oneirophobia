export function createPuzzlePanel(scene) {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  const puzzlePanel = new BABYLON.GUI.Rectangle();
  puzzlePanel.width = "50%";
  puzzlePanel.height = "40%";
  puzzlePanel.cornerRadius = 10;
  puzzlePanel.color = "White";
  puzzlePanel.thickness = 4;
  puzzlePanel.background = "black";
  puzzlePanel.isVisible = false;
  advancedTexture.addControl(puzzlePanel);

  const grid = new BABYLON.GUI.Grid();
  grid.width = "100%";
  grid.height = "80%";

  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);

  puzzlePanel.addControl(grid);

  const colors = ["red", "blue", "green", "cyan"];
  const selectors = [];
  const enteredCode = [0, 0, 0, 0];
  const secretCode = [3, 2, 1, 6];

  for (let i = 0; i < 4; i++) {
    let stackPanel = new BABYLON.GUI.StackPanel();
    stackPanel.width = "100%";

    let label = new BABYLON.GUI.TextBlock();
    label.text = enteredCode[i].toString();
    label.color = colors[i];
    label.fontSize = 40;
    stackPanel.addControl(label);

    let buttonUp = BABYLON.GUI.Button.CreateSimpleButton("up" + i, "▲");
    buttonUp.width = "80px";
    buttonUp.height = "40px";
    buttonUp.onPointerClickObservable.add(() => {
      enteredCode[i] = (enteredCode[i] + 1) % 10;
      label.text = enteredCode[i].toString();
    });
    stackPanel.addControl(buttonUp);

    let buttonDown = BABYLON.GUI.Button.CreateSimpleButton("down" + i, "▼");
    buttonDown.width = "80px";
    buttonDown.height = "40px";
    buttonDown.onPointerClickObservable.add(() => {
      enteredCode[i] = (enteredCode[i] - 1 + 10) % 10;
      label.text = enteredCode[i].toString();
    });
    stackPanel.addControl(buttonDown);

    grid.addControl(stackPanel, 0, i);
    selectors.push(label);
  }

  const validateButton = BABYLON.GUI.Button.CreateSimpleButton("validate", "Valider");
  validateButton.top = "90px";
  validateButton.width = "150px";
  validateButton.height = "50px";
  validateButton.color = "white";
  validateButton.background = "green";
  validateButton.onPointerClickObservable.add(() => {
    if (JSON.stringify(enteredCode) === JSON.stringify(secretCode)) {
      showNotification("✔️ Code correct ! Le coffre s'ouvre.", "green");
      puzzlePanel.isVisible = false;
      // Supprimer le coffre et ouvrir le coffre
    } else {
      showNotification("❌ Mauvais code ! Réessayez.", "red");
      puzzlePanel.isVisible = false;
    }
  });
  puzzlePanel.addControl(validateButton);

  return puzzlePanel;
}
