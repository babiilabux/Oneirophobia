import { HemisphericLight, Vector3 } from "@babylonjs/core";
import { CONFIG } from "../config";

export function createLight(scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = CONFIG.lightIntensity;
    return light;
}
