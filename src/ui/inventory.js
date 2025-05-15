import { AdvancedDynamicTexture, Rectangle, StackPanel, TextBlock, Button, Control } from "@babylonjs/gui/2D";

export function createInventory(scene) {
  const uiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  const inventoryPanel = new Rectangle();
  inventoryPanel.width = "300px";
  inventoryPanel.height = "100%";
  inventoryPanel.thickness = 0;
  inventoryPanel.background = "rgba(0, 0, 0, 0.8)";
  inventoryPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  inventoryPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  inventoryPanel.isVisible = false;
  uiTexture.addControl(inventoryPanel);

  const inventoryLayout = new StackPanel();
  inventoryLayout.width = "100%";
  inventoryLayout.height = "100%";
  inventoryLayout.paddingTop = "10px";
  inventoryLayout.paddingLeft = "10px";
  inventoryLayout.paddingRight = "10px";
  inventoryPanel.addControl(inventoryLayout);

  const closeButton = Button.CreateSimpleButton("closeBtn", "❌");
  closeButton.width = "30px";
  closeButton.height = "30px";
  closeButton.color = "white";
  closeButton.background = "transparent";
  closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  closeButton.onPointerUpObservable.add(() => {
    inventoryPanel.isVisible = false;
  });
  inventoryLayout.addControl(closeButton);

  const titleText = new TextBlock();
  titleText.text = "Inventaire";
  titleText.height = "40px";
  titleText.color = "white";
  titleText.fontSize = 24;
  titleText.paddingBottom = "10px";
  titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  inventoryLayout.addControl(titleText);

  const itemList = new StackPanel();
  itemList.height = "200px";
  itemList.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  inventoryLayout.addControl(itemList);

  const itemDescription = new TextBlock();
  itemDescription.text = "Sélectionnez un objet pour voir sa description";
  itemDescription.color = "white";
  itemDescription.fontSize = 16;
  itemDescription.textWrapping = true;
  itemDescription.height = "80px";
  itemDescription.paddingTop = "10px";
  inventoryLayout.addControl(itemDescription);

  return { inventoryPanel, itemList, itemDescription };
}
