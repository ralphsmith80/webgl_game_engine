var canvas;
var gl;

var cubeVerticesBuffer;
var cubeVerticesTextureCoordBuffer;
var cubeVerticesIndexBuffer;
var cubeVerticesIndexBuffer;
var cubeRotation = 0.0;
var lastCubeUpdateTime = 0;

var cubeImage;
var cubeTexture;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var textureCoordAttribute;
var perspectiveMatrix;


var horizAspect = 480.0/640.0;


(function start() {
    var canvas = document.getElementById('game-canvas');

    // If we don't have a GL context, give up now
    if (!(gl = initWebGL(canvas))) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }
    initShaders();
    initBuffers();
    initTextures();

    window.onload = drawScene;
    //setInterval(drawScene, 15); //60 fps = (1/60)*1000 = 16.66ms
})();

function initWebGL(canvas) {
    var gl;
   
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Only continue if WebGL is available and working
    if (!gl) return;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);                  // Set clear color to black, fully 
    //gl.clearDepth(1.0);                                 // Clear everything
    gl.enable(gl.DEPTH_TEST);                           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);  // Clear the color as well as the depth buffer.

    return gl;
}

function initBuffers() {
    // Create a buffer for the cube's vertices.
    cubeVerticesBuffer = gl.createBuffer();
    // Select the cubeVerticesBuffer as the one to apply vertex
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    // Now create an array of vertices for the cube.
    var vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0
    ];
   
    // Now pass the list of vertices into WebGL to build the shape. We
    // do this by creating a Float32Array from the JavaScript array,
    // then use it to fill the current vertex buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Map the texture onto the cube's faces.
    cubeVerticesTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);

    var textureCoordinates = [
        // Front
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex array for each face's vertices.
    cubeVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  
    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    var cubeVertexIndices = [
        0,  1,  2,      0,  2,  3    // front
    ]
  
    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}

function initTextures() {
    cubeTexture = gl.createTexture();
    cubeImage = new Image();
    cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
    cubeImage.src = "cubetexture.png";
    //cubeImage.src = "GameAtlas.png";
    //cubeImage.src = "galaxies_alpha.png";
    //cubeImage.src = "http://localhost:8000/galaxies_alpha.png";

    //locally i.e. file://galexies_alpha.png
    // run chrome with the --allow-file-access-from-files flag
    // `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files`

    // local server
    // python -m SimpleHTTPServer
    // http://localhost:8000/game.html
}
 
function handleTextureLoaded(image, texture) {
    console.log("handleTextureLoaded, image = " + image);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function drawScene() {
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Establish the perspective with which we want to view the
    // scene. Our field of view is 45 degrees, with a width/height
    // ratio of 640:480, and we only want to see objects between 0.1 units
    // and 100 units away from the camera.   
    perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
   
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    loadIdentity();
    
    // Now move the drawing position a bit to where we want to start
    // drawing the cube
    mvTranslate([-0.0, 0.0, -6.0]);

    // Save the current matrix, then rotate before we draw.
    mvPushMatrix();
    mvRotate(cubeRotation, [1, 0, 1]);
   
    // Draw the square by binding the array buffer to the cube's vertices
    // array, setting attributes, and pushing it to GL.
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
    // Set the texture coordinates attribute for the vertices.
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  
    // Specify the texture to map onto the faces.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
  
    // Draw the cube.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  
    // Restore the original matrix
    mvPopMatrix();

    //var currentTime = (new Date).getTime();
    //if (lastCubeUpdateTime) {
    //    var delta = currentTime - lastCubeUpdateTime;
    //    cubeRotation += (30 * delta) / 1000.0;
    //}
    //lastCubeUpdateTime = currentTime;
}

function initShaders() {
    var fragmentShader = getShader(gl, 'fragment-shader');
    var vertexShader = getShader(gl, 'vertex-shader');
       
    // Create the shader program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);
}

function getShader(gl, id) {
    var shaderScript, theSource, currentChild, shader;

    shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    theSource = "";
    currentChild = shaderScript.firstChild;

    while(currentChild) {
        //if (currentChild.nodeType == currentChild.TEXT_NODE) {
        if (currentChild.nodeType == 3) {
            theSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    // Now figure out what type of shader script we have,
    // based on its MIME type.
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        // Unknown shader type
        return null;
    }

    // Send the source to the shader object
    gl.shaderSource(shader, theSource);

    // Compile the shader program
    gl.compileShader(shader);  

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
        return null;  
    }

    return shader;
}

function reshape(gl)
{
    // if the display size of the canvas has changed
    // change the size we render at to match.
    var canvas = document.getElementById('game-canvas');
    if (canvas.clientWidth == canvas.width && canvas.clientHeight == canvas.height) {
        return;
    }
 
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
 
    // Set the viewport and projection matrix for the scene
    //gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    //g.perspectiveMatrix = new J3DIMatrix4();
    //g.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
    //g.perspectiveMatrix.perspective(30, canvas.clientWidth / canvas.clientHeight, 1, 10000);
}

//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}