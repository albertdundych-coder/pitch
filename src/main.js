
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 20, 50);
 
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
 
const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;
 
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);
 
////////////////////////////////////////////////////////////
 
const pitchWidth = 50;
const pitchLength = 80;
 
const footballPitch = new THREE.Mesh(
  new THREE.PlaneGeometry(pitchWidth, pitchLength),
  new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.9 })
);
footballPitch.rotation.x = -Math.PI / 2;
footballPitch.receiveShadow = true;
scene.add(footballPitch);
 
///////////////////////////////////////////////////////////
 
const linesMaterial = new THREE.MeshStandardMaterial({ color: 'white' });
 
function addLine(width, length, x, z) {
  const line = new THREE.Mesh(new THREE.PlaneGeometry(width, length), linesMaterial);
  line.rotation.x = -Math.PI / 2;
  line.position.set(x, 0.1, z);
  line.receiveShadow = true;
  scene.add(line);
  return line;
}
 

addLine(50, 1, 0, 0);
 
addLine(30, 1, 0, 28);
addLine(30, 1, 0, -28);
 
addLine(1, 12, 14.5, 34);
addLine(1, 12, -14.5, 34);
addLine(1, 12, 14.5, -34);
addLine(1, 12, -14.5, -34);
 
const centreCircle = new THREE.Mesh(new THREE.RingGeometry(9.5, 10.5, 100), linesMaterial);
centreCircle.rotation.x = -Math.PI / 2;
centreCircle.position.set(0, 0.1, 0);
scene.add(centreCircle);
 
///////////////////////////////////////////////////////////
 
const postRadius = 0.25;
const postHeight = 3; 
const goalWidth = 8;   
 
const goalMaterial = new THREE.MeshStandardMaterial({
  color: 'white',
  roughness: 0.2,
  metalness: 0.1
});
 
function createGoal(z) {
  const goal = new THREE.Group();
 
  const postGeometry = new THREE.CylinderGeometry(postRadius, postRadius, postHeight);


  const leftPost = new THREE.Mesh(postGeometry, goalMaterial);
  leftPost.position.set(-goalWidth / 2, postHeight / 2, 0);
  leftPost.castShadow = true;
  goal.add(leftPost);
 
  const rightPost = new THREE.Mesh(postGeometry, goalMaterial);
  rightPost.position.set(goalWidth / 2, postHeight / 2, 0);
  rightPost.castShadow = true;
  goal.add(rightPost);

  const crossbar = new THREE.Mesh(
    new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + postRadius * 2),
    goalMaterial
  );
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, postHeight, 0);
  crossbar.castShadow = true;
  goal.add(crossbar);
 
  goal.position.set(0, 0, z);
  scene.add(goal);
  return goal;
}
 

createGoal(pitchLength / 2);
createGoal(-pitchLength / 2);
 
////////////////////////////////////////////////////////////
 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
 
function animate() {
  requestAnimationFrame(animate);
  control.update();
  renderer.render(scene, camera);
}
 
animate();
 