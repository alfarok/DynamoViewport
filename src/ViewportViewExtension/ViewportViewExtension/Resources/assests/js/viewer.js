// Viewport Settings
function init() {
    // THREE JS //
    var frustumSize = 80;
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
        color: 0xbb00ff /*bbbbbb*/, specular: 0x111111, shininess: 100, side: THREE.DoubleSide
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
        //this.message = 'simple gui';
        this.Speed = 0.0005;
        this.ShaderColor = '#bb00ff';
        this.WireframeColor = '#2d2d2d'
        this.BackgroundColor = '#2d2d2d';
        this.Shader = function() { toggleShader() };
        this.Wireframe = function() { toggleWireframe() };
        this.Grid = function() { toggleGrid() };
        this.Axes = function() { toggleAxes() };
        this.Screenshot = function() { printScreen() };
    };
    
    // Instantiate Menu
    menu = new Menu();
    let gui = new dat.GUI({ autoPlace: false });
    gui.close(); // Collapsed state as default

    // Top level folders
    let colorFolder = gui.addFolder('Style');
    let animateFolder = gui.addFolder('Animate');
    let toggleFolder = gui.addFolder('Hide/Show');
    //gui.add(menu, 'message');
    animateFolder.add(menu, 'Speed', 0, 0.001);
    let shaderColorController = colorFolder.addColor(menu, 'ShaderColor');
    shaderColorController.onChange( function( colorValue ) {
        colorValue=colorValue.replace( '#','0x' );
        material.color.setHex(colorValue);
    });
    let wireframeColorController = colorFolder.addColor(menu, 'WireframeColor');
    wireframeColorController.onChange( function( colorValue ) {
        colorValue=colorValue.replace( '#','0x' );
        wireframeMaterial.color.setHex(colorValue);
    });
    let backgroundColorController = colorFolder.addColor(menu, 'BackgroundColor');
    backgroundColorController.onChange( function( colorValue ) {
        document.body.style.background = colorValue;
    });
    toggleFolder.add(menu, 'Shader');
    toggleFolder.add(menu, 'Wireframe');
    toggleFolder.add(menu, 'Grid');
    toggleFolder.add(menu, 'Axes');
    gui.add(menu, 'Screenshot');

    let GUIContainer = document.getElementById('gui-container');
    GUIContainer.appendChild(gui.domElement);
    //

    window.requestAnimationFrame(render);
}

function render(time) {
    //mesh.rotation.x = mesh2.rotation.x = time * menu.Speed;
    //mesh.rotation.y = mesh2.rotation.y = time * menu.Speed;

    if(raycasting) {
        // Find intersections
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( scene.children );
        if ( intersects.length > 0 ) {
            if ( INTERSECTED != intersects[0].object && intersects[0].object instanceof THREE.Mesh ) {
                if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                INTERSECTED.material.color.setHex( 0x555555 );
            }
        } else {
            if ( INTERSECTED ) {
                INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            }
            INTERSECTED = null;
        }
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
    // TODO this should update for both cameras
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

    for (var i = -size; i <= size; i += step) {
        gridHelper.vertices.push(new THREE.Vector3(-size, 0, i));
        gridHelper.vertices.push(new THREE.Vector3(size, 0, i));

        gridHelper.vertices.push(new THREE.Vector3(i, 0, -size));
        gridHelper.vertices.push(new THREE.Vector3(i, 0, size));
    }

    let gridLines = new THREE.Line(gridHelper, lineMaterial, THREE.LinePieces);
    gridLines.name = "grid";
    scene.add(gridLines);

    let axesHelper = new THREE.AxesHelper(100);
    axesHelper.name = "axes";
    axesHelper.translateY(.001);
    axesHelper.rotateX(-Math.PI / 2);
    scene.add(axesHelper);
}

function printDebugger() {
    var debuggerUI = document.getElementById('debugTable');
    scene.traverse (function (object) {
        debuggerUI.innerHTML += "<tr><td>{ " + object.type + ":</td><td>" + object.uuid + " }</td></tr><br/>";
        // if (object instanceof THREE.Mesh) { Do something to all meshes }
    });
}

function printScreen() {
    try {
        renderer.render(scene, camera);
        renderer.domElement.toBlob(function(blob) {
            let a = document.createElement('a');
            let url = URL.createObjectURL(blob);
            a.href = url;
            a.download = 'canvas.png';
            a.click();
        }, 'image/png', 1.0);
    } 
    catch(e) {
        console.log('Unable to capture screenshot.');
        return;
    }
}

// Hide/Show Functions //

function toggleDebug() {
    var chbox = document.getElementById('debugActive');
    var debuggerUI = document.getElementById('debugTable');
    if(chbox.checked) { 
        debuggerUI.innerHTML = "";
        printDebugger();
        debuggerUI.style = "display: inline;"; 
    }
    else { debuggerUI.style = "display: none;"; }
}

function toggleShader() {
    // TODO this is a temp hack
    if(mesh.visible === false) { mesh.visible = true; }
    else { mesh.visible = false; }
}

function toggleWireframe() {
    // TODO this is a temp hack
    if(mesh2.visible === false) { 
        mesh2.visible = true; 
        /*
        scene.traverse (function (object) {
            if (object instanceof THREE.Mesh) { 
                object.visible = true; 
            }
        });
        */
    }
    else { 
        mesh2.visible = false; 
        /*
        scene.traverse (function (object) {
            if (object instanceof THREE.Mesh) { 
                object.visible = false; 
            }
        });
        */
    }
}

function toggleRaycasting() {
    var chbox = document.getElementById('raycastingActive');
    if(chbox.checked) { raycasting = true; }
    else { raycasting = false; }
}

function toggleOrtho() {
    var chbox = document.getElementById('orthoActive');
    if(chbox.checked) { 
        camera = orthoCamera;
        camera.position.set(0, 0, 400);
    }
    else { 
        camera = perspectiveCamera;
        camera.position.set(0, 20, 100);
    }
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

// TODO this needs serious cleanup - possible to handle most of this on the C# side?
// Helper function to build THREE objects from render package json
function renderDynamoMesh(groupData) {

    var name = groupData.name;
    var status = groupData.transactionType;

    if (status == "remove") {
        console.log("existing object removed");
        // need to get ALL objects with this name
        var group = scene.getObjectByName(name);
        scene.remove(group);
        nodeGeomGroups.pop(group);
        activeNodes.pop(name);
        return;
    }
    else if (status == "togglePreview") {
        console.log("hide/show object preview");
        var group = scene.getObjectByName(name);
        if (groupData.displayPreview == true) {
            group.visible = true;
        }
        else {
            group.visible = false;
        }
        //return;
    }

    // TODO Dynamic mesh - should update verts not remove
    // if object already exists remove it and redraw
    if (activeNodes.indexOf(name) >= 0) {
        console.log("existing object updated");
        var group = scene.getObjectByName(name);
        scene.remove(group);
        nodeGeomGroups.pop(group);
    }

    // new object
    else {
        console.log("new object added");
        console.log(name);
        activeNodes.push(name);
    }

    // Groups make working with sets of objects syntactically clearer
    // but are almost indentical to a traditional object.
    // Here each group contains all the geometry for a single active node.
    var nodeGeomGroup = new THREE.Group();
    nodeGeomGroup.name = name;
    
    // MESHES from render package
    // lists (each mesh) of lists (each meshes vertices/faces)
    var vertices = groupData.vertices;
    var normals = groupData.normals;

    // verify groupData contains mesh objects
    if (vertices.length > 0 /*&& faces.length > 0*/)
    {
        // for each mesh construct meshObject and add to group
        for (var i = 0; i < vertices.length; i++)
        {
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices[i], 3));
            geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute(normals[i], 3));
            var mesh = new THREE.Mesh(geometry, material);
            mesh.name = name;
            nodeGeomGroup.add(mesh);
        }     
    }
    
    // TODO why do small L-shaped lines initially render for points?
    // LINES from render package
    var lines = groupData.lines;

    // verify groupData contains line objects
    if (lines.length > 0)
    {
        var lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 10 // doesn't do anything - known issue
        });

        // for each line construct lineObject and add to group
        for (var i = 0; i < lines.length; i++) {
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices = [];

            for (var j = 0; j < lines[i].length; j += 3) {
                lineGeometry.vertices.push(new THREE.Vector3(lines[i][j], lines[i][j + 1], lines[i][j + 2]));
            }

            var line = new THREE.Line(lineGeometry, lineMaterial);
            line.name = name;
            nodeGeomGroup.add(line);
        }
    }

    // Points from render package
    var points = groupData.points;

    // verify groupData contains line objects
    if (points.length > 0) {

        var pointMaterial = new THREE.PointsMaterial({ color: 0x009eff, size: 5, sizeAttenuation: false, side: THREE.DoubleSide });

        // for each point set construct pointObject and add to group
        for (var i = 0; i < points.length; i++) {
            var pointGeometry = new THREE.Geometry();
            pointGeometry.vertices = [];

            for (var j = 0; j < points[i].length; j += 3) {
                pointGeometry.vertices.push(new THREE.Vector3(points[i][j], points[i][j + 1], points[i][j + 2]));
            }

            var pointCloud = new THREE.Points(pointGeometry, pointMaterial);
            pointCloud.name = name;
            nodeGeomGroup.add(pointCloud);
        }
    }

    // If displayPreview is false set group visible property before adding to scene
    if (groupData.displayPreview == false) {
        nodeGeomGroup.visible = false;
    }

    nodeGeomGroups.push(nodeGeomGroup);
    scene.add(nodeGeomGroup);

    console.log(scene);
}