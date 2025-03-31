const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const colors = ["white", "red", "blue", "orange", "green", "yellow"];

const rubiksCube = new THREE.Group();
scene.add(rubiksCube);
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const cubes = [];
const size = 1;
const gap = -0.02;
const offset = size + gap;

for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            const geometry = new THREE.BoxGeometry(size, size, size, 5, 5, 5);
            
            const materials = [
                new THREE.MeshBasicMaterial({ color: colors[0], side: THREE.FrontSide }), // Blanc
                new THREE.MeshBasicMaterial({ color: colors[1], side: THREE.FrontSide }), // Rouge
                new THREE.MeshBasicMaterial({ color: colors[2], side: THREE.FrontSide }), // Bleu
                new THREE.MeshBasicMaterial({ color: colors[3], side: THREE.FrontSide }), // Orange
                new THREE.MeshBasicMaterial({ color: colors[4], side: THREE.FrontSide }), // Vert
                new THREE.MeshBasicMaterial({ color: colors[5], side: THREE.FrontSide })  // Jaune
            ];
             
            const cube = new THREE.Mesh(geometry, materials);
            cube.position.set(x * offset, y * offset, z * offset);
            
            const edges = new THREE.EdgesGeometry(geometry);
            const lineMaterial = new THREE.LineBasicMaterial({ color: "black", linewidth: 15 });
            const wireframe = new THREE.LineSegments(edges, lineMaterial);
            cube.add(wireframe);
            
            rubiksCube.add(cube);
            cubes.push(cube);
        }
    }
}

camera.position.set(5, 5, 10);
camera.lookAt(0, 0, 0);

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener("mousedown", (event) => {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    
    rubiksCube.rotation.y += deltaX * 0.005;
    rubiksCube.rotation.x += deltaY * 0.005;
    
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

function rotateFace(axis, index, direction) {
    const angle = Math.PI / 2 * direction;
    const selectedCubes = cubes.filter(cube => Math.round(cube.position[axis]) === index);

    const group = new THREE.Group();
    selectedCubes.forEach(cube => {
        rubiksCube.remove(cube);
        group.add(cube);
    });
    rubiksCube.add(group);

    new TWEEN.Tween(group.rotation)
        .to({ [axis]: group.rotation[axis] + angle }, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            // Mise à jour des positions et orientations après la rotation
            selectedCubes.forEach(cube => {
                const pos = new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z);
                const rot = new THREE.Euler(cube.rotation.x, cube.rotation.y, cube.rotation.z);

                // Appliquer la rotation sur la position et l'orientation
                pos.applyAxisAngle(
                    new THREE.Vector3(axis === "x" ? 1 : 0, axis === "y" ? 1 : 0, axis === "z" ? 1 : 0),
                    angle
                );
                rot[axis] += angle;

                // Ajuster les positions pour éviter les erreurs de flottants
                cube.position.set(Math.round(pos.x * 100) / 100, Math.round(pos.y * 100) / 100, Math.round(pos.z * 100) / 100);
                cube.rotation.set(
                    Math.round(rot.x / (Math.PI / 2)) * (Math.PI / 2),
                    Math.round(rot.y / (Math.PI / 2)) * (Math.PI / 2),
                    Math.round(rot.z / (Math.PI / 2)) * (Math.PI / 2)
                );

                rubiksCube.add(cube);
            });

            rubiksCube.remove(group);
        })
        .start();
}



const buttons = [
    { label: "F", action: () => rotateFace('z', 1, 1) },
    { label: "F'", action: () => rotateFace('z', 1, -1) },
    { label: "B", action: () => rotateFace('z', -1, 1) },
    { label: "B'", action: () => rotateFace('z', -1, -1) },
    { label: "R", action: () => rotateFace('x', 1, 1) },
    { label: "R'", action: () => rotateFace('x', 1, -1) },
    { label: "L", action: () => rotateFace('x', -1, 1) },
    { label: "L'", action: () => rotateFace('x', -1, -1) },
    { label: "U", action: () => rotateFace('y', 1, 1) },
    { label: "U'", action: () => rotateFace('y', 1, -1) },
    { label: "D", action: () => rotateFace('y', -1, 1) },
    { label: "D'", action: () => rotateFace('y', -1, -1) }
];

const controlsContainer = document.createElement("div");
controlsContainer.style.position = "absolute";
controlsContainer.style.top = "50%";
controlsContainer.style.right = "20px";
controlsContainer.style.transform = "translateY(-50%)";
document.body.appendChild(controlsContainer);


buttons.forEach(({ label, action }) => {
    const button = document.createElement("button");
    button.innerText = label;
    button.style.display = "block";
    button.style.margin = "5px";
    button.style.padding = "10px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.addEventListener("click", action);
    controlsContainer.appendChild(button);
});

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
