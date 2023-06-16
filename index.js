import * as THREE from "three";
import { LineMaterial } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/lines/Line2.js";
import { LineGeometry } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/lines/LineGeometry.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/postprocessing/UnrealBloomPass.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// effects
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0;
bloomPass.strength = 1;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

function getPositions() {
  const points = [];
  points.push(0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0); // face
  points.push(0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1); // face
  points.push(0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1); // the rest
  const arr = points.map(v => v -= 0.5);
  return arr;
}
function getBox(index) {
  const hue = 0.8 - index / 19;
  const material = new LineMaterial({
    color: new THREE.Color().setHSL(hue, 1.0, 0.5),
    linewidth: 9,
    transparent: true,
    opacity: 0.25,
    blendMode: THREE.AdditiveBlending,
  });
  material.resolution.set(w, h);

  const geometry = new LineGeometry();
  geometry.setPositions(getPositions());
  const mesh = new Line2(geometry, material);
  mesh.scale.setScalar(1.0 + index * 0.1);
  const rotationSpeed = 0.0005;
  const offset = 1.0 - index * 0.03;
  mesh.update = (t) => {
    mesh.rotation.x = Math.sin(offset + t * rotationSpeed) * 2;
    mesh.rotation.y = Math.sin(offset + t * rotationSpeed) * 2;
  }
  return mesh;
}

const boxGroup = new THREE.Group();
scene.add(boxGroup);
function addBoxes(numBoxes) {
  for (let i = 0; i < numBoxes; i += 1) {
    let box = getBox(i);
    boxGroup.add(box);
  }
}
addBoxes(16);
boxGroup.update = (t) => {
  boxGroup.children.forEach((box) => {
    box.update(t);
  });
}
function animate(timeStamp) {
  timeStamp += 0.000001;
  requestAnimationFrame(animate);
  boxGroup.update(timeStamp);
  composer.render(scene, camera);
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