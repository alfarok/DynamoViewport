// Viewport Settings
function init() {
    // THREE JS //
    let frustumSize = 80;
    let aspect = window.innerWidth / window.innerHeight;
    perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
    orthoCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );
    camera = perspectiveCamera;

    scene = new THREE.Scene();
    scene.add(camera);

    let ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    let pointLight = new THREE.PointLight(0xffffff, 1);
    camera.add(pointLight);

    material = new THREE.MeshPhongMaterial({
        color: 0xbbbbbb, specular: 0x111111, shininess: 100, side: THREE.DoubleSide
    });

    wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x2d2d2d, wireframe: true
    });

    buildSceneHelpers();
    
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, preserveDrawingBuffer: true } );
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    camera.position.set( 0, 20, 100 );
    controls.update();

    document.body.appendChild( renderer.domElement );

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener( 'mousemove', onMouseMove, false );

    // GUI //
    let Menu = function() {
        // Set default values
        this.Speed = 0.0000;
        this.ShaderColor = '#bbbbbb';
        this.WireframeColor = '#2d2d2d'
        this.BackgroundColor = '#2d2d2d';
        this.Shader = function() { toggleShader() };
        this.Wireframe = function() { toggleWireframe() };
        this.Grid = function() { toggleGrid() };
        this.Axes = function() { toggleAxes() };
    };
    
    // Instantiate Menu
    menu = new Menu();
    let gui = new dat.GUI({ autoPlace: false });
    gui.close(); // Collapsed state as default

    // Top level folders
    let colorFolder = gui.addFolder('Style');
    let animateFolder = gui.addFolder('Animate');
    let toggleFolder = gui.addFolder('Hide/Show');

    animateFolder.add(menu, 'Speed', 0.000, 0.001);
    let shaderColorController = colorFolder.addColor(menu, 'ShaderColor');
    shaderColorController.onChange( function( colorValue ) {
        newColorValue=colorValue.replace( '#','0x' );
        material.color.setHex(newColorValue);
        this.ShaderColor = colorValue;
    });
    let wireframeColorController = colorFolder.addColor(menu, 'WireframeColor');
    wireframeColorController.onChange( function( colorValue ) {
        newColorValue=colorValue.replace( '#','0x' );
        wireframeMaterial.color.setHex(newColorValue);
        this.WireframeColor =  colorValue;
    });
    let backgroundColorController = colorFolder.addColor(menu, 'BackgroundColor');
    backgroundColorController.onChange( function( colorValue ) {
        document.body.style.background = colorValue;
    });

    toggleFolder.add(menu, 'Shader');
    toggleFolder.add(menu, 'Wireframe');
    toggleFolder.add(menu, 'Grid');
    toggleFolder.add(menu, 'Axes');

    let GUIContainer = document.getElementById('gui-container');
    GUIContainer.appendChild(gui.domElement);

    window.requestAnimationFrame(render);
}

function render(time) {

    // TODO: this is inefficient but just a sample of animation
    if(menu.Speed > 0)
    {
        scene.traverse (function (object) {
            if (object.name === 'meshGeometry' ||
                object.name === 'wireframeGeometry' ||
                object.name === "lineGeometry" ||
                object.name === "pointGeometry"
            ) { 
                object.rotation.x = time * menu.Speed;
                object.rotation.y = time * menu.Speed;
                object.rotation.z = time * menu.Speed;
            }
        });
    }
    renderer.render( scene, camera );
    requestAnimationFrame( render );
    controls.update();
}

// Events //

function onMouseMove( event ) {
    event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
    // TODO: this should update for both cameras
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// Helper Functions //

function buildSceneHelpers() {
    const size = 100;
    const step = 5;

    let gridHelper = new THREE.Geometry();
    let lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });

    for (let i = -size; i <= size; i += step) {
        gridHelper.vertices.push(new THREE.Vector3(-size, 0, i));
        gridHelper.vertices.push(new THREE.Vector3(size, 0, i));

        gridHelper.vertices.push(new THREE.Vector3(i, 0, -size));
        gridHelper.vertices.push(new THREE.Vector3(i, 0, size));
    }

    let gridLines = new THREE.LineSegments(gridHelper, lineMaterial, THREE.LinePieces);
    gridLines.name = "grid";
    scene.add(gridLines);

    let axesHelper = new THREE.AxesHelper(100);
    axesHelper.name = "axes";
    axesHelper.translateY(.001);
    axesHelper.rotateX(-Math.PI / 2);
    scene.add(axesHelper);
}

// Hide/Show Functions //

// TODO: this resets when a subsequent render() action is invoked
function toggleShader() {
    scene.traverse (function (object) {
        if (object.name === 'meshGeometry') { 
            if(object.visible === false) { object.visible = true; }
            else { object.visible = false; } 
        }
    });

    // Update visibility status
    if(materialVisibility == false) { materialVisibility = true; }
    else {materialVisibility = false; }
}

// TODO: this resets when a subsequent render() action is invoked
function toggleWireframe() {
    scene.traverse (function (object) {
        if (object.name === 'wireframeGeometry') { 
            if(object.visible === false) { object.visible = true; }
            else { object.visible = false; } 
        }
    });

    // Update visibility status
    if(wireframeMaterialVisibility == false) { wireframeMaterialVisibility = true; }
    else { wireframeMaterialVisibility = false; }
}

function toggleGrid() {
    let grid = scene.getObjectByName('grid');
    if (grid.visible === true) { grid.visible = false; }
    else { grid.visible = true; }
}

function toggleAxes() {
    let axes = scene.getObjectByName('axes');
    if (axes.visible === true) { axes.visible = false; }
    else { axes.visible = true; }
}

// Helper function to build THREE objects from render package json
function renderDynamoMesh(groupData) {
    console.log(scene.children.length);

    // JSON data
    let name = groupData.name;
    let status = groupData.transactionType;
    let visibility = groupData.displayPreview;
    let vertices = groupData.vertices;
    let normals = groupData.normals;
    let points = groupData.points;
    let lines = groupData.lines;

    // Action based on request status
    switch(status) {
        // A Dynamo node has been removed from the graph
        case "remove":
            // Remove the geometry for the removed node
            var child = scene.getObjectByName(name)
            scene.remove(child);

            break;

        // A Dynamo nodes display preview has been toggled (only triggered when set to false)
        case "togglePreview":
            var child = scene.getObjectByName(name);
            if (visibility === true) {
                child.visible = true;
            }
            else {
                child.visible = false;
            }

            break;

        // An incoming update could be to create or update existing node geometry
        case "update":
            var child = scene.getObjectByName(name)
            if(child != null) {
                // Remove any existing geometry for this node
                scene.remove(child);
            }

            // Generator a new geometry instance in the scene
            let nodeGeometry = geometryGenerator(name, vertices, normals, points, lines, visibility);
            // Add geometry collection to scene
            scene.add(nodeGeometry);

            break;

        default:
            // Unknown request status type, abort
            break;
    }
}

// Generator new geometry in threejs scene from render data
function geometryGenerator(name, vertices, normals, points, lines, visibility) {
    // Groups make working with sets of objects syntactically clearer
    // but are almost indentical to a traditional object.
    // Each group contains all the geometry for a single node.
    let nodeGeomGroup = new THREE.Group();
    nodeGeomGroup.name = name;

    // DRAW MESHES //

    // Verify input data contains mesh data
    if (vertices.length > 0 /*&& faces.length > 0*/)
    {
        // For each mesh construct a mesh object
        for (let i = 0; i < vertices.length; i++)
        {
            let geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices[i], 3));
            geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute(normals[i], 3));
            let mesh = new THREE.Mesh(geometry, material);
            let wireframe = new THREE.Mesh(geometry, wireframeMaterial);
            mesh.name = "meshGeometry";
            wireframe.name = "wireframeGeometry";

            // Check mesh shader visibility from UI
            if (materialVisibility == false) { mesh.visible = false; }

            // Check mesh wireframe visibility from UI
            if (wireframeMaterialVisibility == false) { wireframe.visible = false; }

            // Add to group collection
            nodeGeomGroup.add(mesh);
            nodeGeomGroup.add(wireframe);
        }     
    }

    // DRAW LINES //

    // TODO: why do small L-shaped lines initially render for points?

    // Verify input data contains line data
    if (lines.length > 0)
    {
        let lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 10 // doesn't do anything - known issue
        });

        // For each line construct a line object
        for (let i = 0; i < lines.length; i++) {
            let lineGeometry = new THREE.Geometry();
            lineGeometry.vertices = [];

            for (let j = 0; j < lines[i].length; j += 3) {
                lineGeometry.vertices.push(new THREE.Vector3(lines[i][j], lines[i][j + 1], lines[i][j + 2]));
            }

            let line = new THREE.Line(lineGeometry, lineMaterial);
            line.name = "lineGeometry";

            // Add group to collection
            nodeGeomGroup.add(line);
        }
    }

    // DRAW POINTS //

    // Verify input data contains point data
    if (points.length > 0) {

        let pointMaterial = new THREE.PointsMaterial({ color: 0x009eff, size: 5, sizeAttenuation: false, side: THREE.DoubleSide });

        // For each point set construct a point object
        for (let i = 0; i < points.length; i++) {
            let pointGeometry = new THREE.Geometry();
            pointGeometry.vertices = [];

            for (let j = 0; j < points[i].length; j += 3) {
                pointGeometry.vertices.push(new THREE.Vector3(points[i][j], points[i][j + 1], points[i][j + 2]));
            }

            let pointCloud = new THREE.Points(pointGeometry, pointMaterial);
            pointCloud.name = "pointGeometry";

            // Add to group collection
            nodeGeomGroup.add(pointCloud);
        }
    }

    // If displayPreview is false set group visible property before adding to scene
    if (visibility == false) {
        nodeGeomGroup.visible = false;
    }

    return nodeGeomGroup;
}