import * as THREE from "three";
import { LineMaterial } from "jsm/lines/LineMaterial.js";
import { Line2 } from "jsm/lines/Line2.js";
import { LineSegmentsGeometry } from "jsm/lines/LineSegmentsGeometry.js";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";
import getLayer from "./getLayer.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// ctrls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// effects
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
// bloomPass.threshold = 0;
// bloomPass.strength = 1;
// bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const geometry = new THREE.DodecahedronGeometry();
function getBox(index) {
  const hue = 0.8 - index / 36;
  const material = new LineMaterial({
    color: new THREE.Color().setHSL(hue, 1.0, 0.5),
    linewidth: 4,
    transparent: true,
    opacity: 0.25,
    blendMode: THREE.AdditiveBlending,
  });
  material.resolution.set(w, h);

  const edges = new THREE.EdgesGeometry(geometry, 1);
  const lineGeo = new LineSegmentsGeometry();
  lineGeo.fromEdgesGeometry(edges);
  const lines = new Line2(lineGeo, material);
  
  lines.scale.setScalar(1.0 + index * 0.025);
  const rotationSpeed = 0.0005;
  const offset = 1.0 - index * 0.01;
  lines.update = (t) => {
    lines.rotation.x = Math.sin(offset + t * rotationSpeed) * 2;
    lines.rotation.y = Math.sin(offset + t * rotationSpeed) * 2;
  }
  return lines;
}

const boxGroup = new THREE.Group();
scene.add(boxGroup);
function addBoxes(numBoxes) {
  for (let i = 0; i < numBoxes; i += 1) {
    let box = getBox(i);
    boxGroup.add(box);
  }
}
addBoxes(32);
boxGroup.update = (t) => {
  boxGroup.children.forEach((box) => {
    box.update(t);
  });
}
const gradientBackground = getLayer({
  hue: 0.6,
  numSprites: 8,
  opacity: 0.04,
  radius: 10,
  size: 24,
  z: -10.5,
});
// scene.add(gradientBackground);

function animate(timeStamp) {
  timeStamp += 0.000001;
  requestAnimationFrame(animate);
  boxGroup.update(timeStamp);
  composer.render(scene, camera);
  controls.update();
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);

// Inspired by "Neon Cube" - Hazel Quantock 2019
// https://www.shadertoy.com/view/tlf3zH