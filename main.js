import * as THREE from './node_modules/three/build/three.module.js';
import * as TWEEN from './node_modules/@tweenjs/tween.js/dist/tween.esm.js';
import { OrbitControls } from './OrbitControls.js';
import { MouseMeshInteraction } from './MouseMeshInteraction.js';

let camera, scene, renderer, controls, mmi;
let orbs = [
	{
		name: 'yellow',
		positions: [-100, 0, -100],
		color: 0xffff00
	},
	{
		name: 'blue',
		positions: [100, 0, -50],
		color: 0x4b9deb
	},
];

init();

window.addEventListener('resize', resize);

function init() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 500 );
	camera.position.y = 200;
	camera.position.z = 120;

	scene = new THREE.Scene();
	Array.from({length: 300}).forEach(addStar);

	// init event handler factory
	mmi = new MouseMeshInteraction(scene, camera);

	// add orbs 
	orbs.forEach(orb => {
		addOrb(orb.name, ...orb.positions, orb.color);
		mmi.addHandler(orb.name, 'click', (mesh) => {
			console.log('mesh has been clicked');
			fitCameraToSelection(camera, controls, mesh);
		});
	});

	renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#bg'),
	});
	// renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	controls = new OrbitControls(camera, renderer.domElement);

	const grid = new THREE.GridHelper(400, 20);
	scene.add( grid );

	animate();
}

// https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/24
function fitCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
	const box = new THREE.Box3();
	box.expandByObject( selection );
	const size = box.getSize( new THREE.Vector3() );
	const center = box.getCenter( new THREE.Vector3() );

	
	const maxSize = Math.max( size.x, size.y, size.z );
	const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
	const fitWidthDistance = fitHeightDistance / camera.aspect;
	const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
	
	const direction = controls.target.clone()
		.sub( camera.position )
		.normalize()
		.multiplyScalar( distance );
  
	controls.maxDistance = distance * 10;
	controls.target.copy( center );
	
	camera.near = distance / 100;
	camera.far = distance * 100;
	camera.updateProjectionMatrix();
	
	// set camera's position to the front of the selection without animation
	// camera.position.copy( controls.target ).sub(direction);

	// animate camera's moving forward effect
	let targetPos = new THREE.Vector3().copy(controls.target).sub(direction);
	new TWEEN.Tween(camera.position)
      .to(targetPos)
	  .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate(() =>
        camera.position.set(camera.position.x + 10, camera.position.y +10, camera.position.z + 10)
      )
      .start();
	
	controls.update();
}

function addOrb(name, x, y, z, color) {
	let geometry = new THREE.SphereGeometry(15, 32, 16);
	let material = new THREE.MeshBasicMaterial({ color });
	let orb = new THREE.Mesh(geometry, material);
	orb.name = name;
	orb.position.set(x, y, z);
	scene.add(orb);
}

function addStar() {
	let geometry = new THREE.SphereGeometry(0.25, 24, 24);
	let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
	let star = new THREE.Mesh(geometry, material);
	let [x, y, z] = Array.from({length: 3}).map(() => THREE.MathUtils.randFloatSpread(100));
	star.position.set(x, y, z);
	scene.add(star);
}

function animate() {
	requestAnimationFrame( animate );
	TWEEN.update();
	mmi.update();
	controls.update();
	renderer.render( scene, camera );
}

function resize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}