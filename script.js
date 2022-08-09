import { ImageViewer } from "./360-image-viewer.js";
import { InputController } from "./input-controller.js";

const imageViewer = new ImageViewer();
const inputController = new InputController("input-controller");
const x = document.getElementById("x");
const y = document.getElementById("y");

inputController.events.addEventListener("right", () => {
  x.innerText = parseInt(x.innerHTML) + 1;
});

inputController.events.addEventListener("left", () => {
  x.innerText = parseInt(x.innerHTML) - 1;
});

inputController.events.addEventListener("up", () => {
  y.innerText = parseInt(y.innerHTML) + 1;
});

inputController.events.addEventListener("down", () => {
  y.innerText = parseInt(y.innerHTML) - 1;
});
