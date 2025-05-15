import { AdvancedDynamicTexture, Rectangle, Grid, StackPanel, TextBlock, Button } from "@babylonjs/gui/2D";

export function createPuzzlePanel(scene, onCorrectCode) {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  const puzzlePanel = new Rectangle();
  puzzlePanel.width = "50%";
  puzzlePanel.height = "40%";
  puzzlePanel.cornerRadius = 10;
  puzzlePanel.color = "White";
  puzzlePanel.thickness = 4;
  puzzlePanel.background = "black";
  puzzlePanel.isVisible = false;
  advancedTexture.addControl(puzzlePanel);

  const grid = new Grid();
  grid.width = "100%";
  grid.height = "80%";
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);
  puzzlePanel.addControl(grid);

  const colors = ["red", "blue", "green", "cyan"];
  const enteredCode = [0, 0, 0, 0];
  const secretCode = [3, 2, 1, 6];

  for (let i = 0; i < 4; i++) {
    const stackPanel = new StackPanel();
    stackPanel.width = "100%";

    const label = new TextBlock();
    label.text = enteredCode[i].toString();
    label.color = colors[i];
    label.fontSize = 40;
    stackPanel.addControl(label);

    const buttonUp = Button.CreateSimpleButton("up" + i, "▲");
    buttonUp.width = "80px";
    buttonUp.height = "40px";
    buttonUp.onPointerClickObservable.add(() => {
      enteredCode[i] = (enteredCode[i] + 1) % 10;
      label.text = enteredCode[i].toString();
    });
    stackPanel.addControl(buttonUp);

    const buttonDown = Button.CreateSimpleButton("down" + i, "▼");
    buttonDown.width = "80px";
    buttonDown.height = "40px";
    buttonDown.onPointerClickObservable.add(() => {
      enteredCode[i] = (enteredCode[i] - 1 + 10) % 10;
      label.text = enteredCode[i].toString();
    });
    stackPanel.addControl(buttonDown);

    grid.addControl(stackPanel, 0, i);
  }

  const validateButton = Button.CreateSimpleButton("validate", "Valider");
  validateButton.width = "150px";
  validateButton.height = "50px";
  validateButton.color = "white";
  validateButton.background = "green";
  validateButton.onPointerClickObservable.add(() => {
    if (JSON.stringify(enteredCode) === JSON.stringify(secretCode)) {
      onCorrectCode();
      puzzlePanel.isVisible = false;
    }
  });
  puzzlePanel.addControl(validateButton);

  return puzzlePanel;
}
