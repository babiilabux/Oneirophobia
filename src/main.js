let audioEngine;

async function initAudio() {
  const audioEngine = await BABYLON.CreateAudioEngineAsync();
  await audioEngine.unlock();
  // Création d'une engine audio
}

const createScene = async() => {
  await initAudio();


  const canvas = document.getElementById("renderCanvas"); // Assurez-vous que le canvas a l'ID 'renderCanvas'
  const engine = new BABYLON.Engine(canvas, true); // création engine
  const scene = new BABYLON.Scene(engine); // création de d'une scène

  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
  box.position.y = 0.5; // modification de la hauteur de la boite

  const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10});

  /*----------------Gestion des sons----------------*/

  const campagneSound = BABYLON.CreateStreamingSoundAsync("ambientSound", "../sounds/sondehors.mp3", { loop: true, autoplay: true }, audioEngine); // Son de la scène
  // const doorOpen = BABYLON.CreateStreamingSoundAsync("door open", "URLS", scene, null, { loop: false, autoplay: false }); 
  

  // Boucle de rendu
  engine.runRenderLoop(() => {
    scene.render();
  });

  // Redimensionnement de la fenêtre après rendu
  window.addEventListener("resize", () => {
    engine.resize();
  });

  return scene;
}

// Appel de la fonction pour créer la scène
createScene();
