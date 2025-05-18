import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

let inventory = { flashlight: false, key: false };
let equippedItemName = null;
let equippedItem = null;
let inventoryPanel, inventoryLayout, itemList, itemDescription, helpButton, titleText;
let uiTexture = null;
let camera = null;
let scene = null;

// Permet d'initialiser l'inventaire et son UI
export function createInventoryUI(_scene, _camera) {
    scene = _scene;
    camera = _camera;
    uiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    // Panel principal
    inventoryPanel = new GUI.Rectangle();
    inventoryPanel.width = "300px";
    inventoryPanel.height = "100%";
    inventoryPanel.thickness = 0;
    inventoryPanel.background = "rgba(0, 0, 0, 0.8)";
    inventoryPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    inventoryPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    inventoryPanel.isVisible = false;
    uiTexture.addControl(inventoryPanel);

    // Layout
    inventoryLayout = new GUI.StackPanel();
    inventoryLayout.width = "100%";
    inventoryLayout.height = "100%";
    inventoryLayout.paddingTop = "10px";
    inventoryLayout.paddingLeft = "10px";
    inventoryLayout.paddingRight = "10px";
    inventoryPanel.addControl(inventoryLayout);

    // Bouton de fermeture
    const closeButton = GUI.Button.CreateSimpleButton("closeBtn", "❌");
    closeButton.width = "30px";
    closeButton.height = "30px";
    closeButton.color = "white";
    closeButton.background = "transparent";
    closeButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeButton.onPointerUpObservable.add(() => {
        inventoryPanel.isVisible = false;
    });
    inventoryLayout.addControl(closeButton);

    // Titre
    titleText = new GUI.TextBlock();
    titleText.text = "Inventaire";
    titleText.height = "40px";
    titleText.color = "white";
    titleText.fontSize = 24;
    titleText.paddingBottom = "10px";
    titleText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    inventoryLayout.addControl(titleText);

    // Liste des objets
    itemList = new GUI.StackPanel();
    itemList.height = "200px";
    itemList.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    inventoryLayout.addControl(itemList);

    // Zone de description
    itemDescription = new GUI.TextBlock();
    itemDescription.text = "Sélectionnez un objet pour voir sa description";
    itemDescription.color = "white";
    itemDescription.fontSize = 16;
    itemDescription.textWrapping = true;
    itemDescription.height = "80px";
    itemDescription.paddingTop = "10px";
    inventoryLayout.addControl(itemDescription);

    // Bouton aide
    helpButton = GUI.Button.CreateSimpleButton("helpBtn", "Afficher les commandes");
    helpButton.width = "100%";
    helpButton.height = "40px";
    helpButton.color = "white";
    helpButton.background = "#666";
    helpButton.paddingTop = "20px";
    helpButton.onPointerUpObservable.add(() => {
        alert("Commandes :\n- [1] Équiper lampe\n- [2] Équiper clé\n- [R] Déséquiper\n- [E/I] Inventaire\n- [Esc] Fermer");
    });
    inventoryLayout.addControl(helpButton);

    updateInventoryUI();
}

// Met à jour l'affichage de l'inventaire
export function updateInventoryUI() {
    if (!itemList) return;
    itemList.clearControls();

    const createItemButton = (id, label, description) => {
        const isEquipped = equippedItemName === id;
        const btn = GUI.Button.CreateSimpleButton(id + "Btn", label);
        btn.width = "100%";
        btn.height = "30px";
        btn.color = "white";
        btn.background = isEquipped ? "#8854d0" : "#444";
        btn.onPointerUpObservable.add(() => {
            itemDescription.text = description;
            equipItem(id);
            updateInventoryUI();
        });
        itemList.addControl(btn);
    };

    if (inventory.flashlight) {
        createItemButton("flashlight", "Lampe torche", "Lampe torche : Permet d'éclairer les zones sombres.");
    }
    if (inventory.key) {
        createItemButton("key", "Clé", "Clé : Permet d’ouvrir une porte verrouillée.");
    }
    if (!inventory.flashlight && !inventory.key) {
        itemDescription.text = "(Inventaire vide)";
    }
}

// Ajoute un objet à l'inventaire
export function addItem(item) {
    inventory[item] = true;
    updateInventoryUI();
}

// Retire un objet de l'inventaire
export function removeItem(item) {
    inventory[item] = false;
    if (equippedItemName === item) {
        unequipItem();
    }
    updateInventoryUI();
}

// Vérifie si un objet est dans l'inventaire
export function hasItem(item) {
    return !!inventory[item];
}

// Équipe un objet
export function equipItem(item) {
    if (!inventory[item]) return;
    if (equippedItemName === item) {
        unequipItem();
        equippedItemName = null;
        updateInventoryUI();
        return;
    }
    unequipItem();
    equippedItemName = item;
    // Ici tu peux ajouter la logique pour afficher l'objet dans la main du joueur
    // (ex: charger le mesh, le placer dans la main, etc.)
    updateInventoryUI();
}

// Déséquipe l'objet
export function unequipItem() {
    equippedItemName = null;
    // Ici tu peux ajouter la logique pour retirer l'objet de la main du joueur
    updateInventoryUI();
}

// Affiche/masque l'inventaire
export function toggleInventory() {
    if (inventoryPanel) inventoryPanel.isVisible = !inventoryPanel.isVisible;
}

// Pour accès dans main.js
export function getEquippedItemName() {
    return equippedItemName;
}
export function getInventory() {
    return { ...inventory };
}