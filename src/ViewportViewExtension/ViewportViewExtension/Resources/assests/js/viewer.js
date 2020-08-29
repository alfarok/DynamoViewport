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
    //

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

// Hide/Show Functions //

// TODO: this resets when a subsequent render() action is invoked
function toggleShader() {
    scene.traverse (function (object) {
        if (object.name === 'meshGeometry') { 
            if(object.visible === false) { object.visible = true; }
            else { object.visible = false; } 
        }
    });
}

// TODO: this resets when a subsequent render() action is invoked
function toggleWireframe() {
    scene.traverse (function (object) {
        if (object.name === 'wireframeGeometry') { 
            if(object.visible === false) { object.visible = true; }
            else { object.visible = false; } 
        }
    });
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

// TODO: this needs serious cleanup - possible to handle most of this on the C# side?
// It also seems there is a bug or timing issue that gets geometry cache out of sync?
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

    // TODO: Dynamic mesh - should update verts not remove
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
            var wireframe = new THREE.Mesh(geometry, wireframeMaterial);
            mesh.name = "meshGeometry";
            wireframe.name = "wireframeGeometry";
            nodeGeomGroup.add(mesh);
            nodeGeomGroup.add(wireframe);
        }     
    }
    
    // TODO: why do small L-shaped lines initially render for points?
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
            line.name = "lineGeometry";
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
            pointCloud.name = "pointGeometry";
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