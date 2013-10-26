var canvas;
var gl;
var cubeVerticesBuffer;
var cubeVerticesTextureCoordBuffer;
var cubeVerticesIndexBuffer;
var cubeRotation = 0;
var lastCubeUpdateTime = 0;
var cubeImage;
var cubeTexture;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var textureCoordAttribute;
var perspectiveMatrix;
var horizAspect = 480 / 640;
require([], function start() {
    var canvas = document.getElementById('game-canvas');
    if(!(gl = initWebGL(canvas))) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }
    initShaders();
    initBuffers();
    initTextures();
    setInterval(drawScene, 15);
});
function initWebGL(canvas) {
    var gl;
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if(!gl) {
        return;
    }
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return gl;
}
function initBuffers() {
    cubeVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    var vertices = [
        -1, 
        -1, 
        1, 
        1, 
        -1, 
        1, 
        -1, 
        1, 
        1, 
        1, 
        1, 
        1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVerticesTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
    var textureCoordinates = [
        0, 
        1, 
        1, 
        1, 
        0, 
        0, 
        1, 
        0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    cubeVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
    var cubeVertexIndices = [
        0, 
        1, 
        2, 
        1, 
        2, 
        3
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}
function initTextures() {
    cubeTexture = gl.createTexture();
    cubeImage = new Image();
    cubeImage.onload = function () {
        handleTextureLoaded(cubeImage, cubeTexture);
    };
    cubeImage.src = "img/cubetexture.png";
}
function handleTextureLoaded(image, texture) {
    console.log("handleTextureLoaded, image = " + image);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100);
    loadIdentity();
    mvTranslate([
        -0, 
        0, 
        -6
    ]);
    mvPushMatrix();
    mvRotate(cubeRotation, [
        1, 
        0, 
        1
    ]);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();
}
function initShaders() {
    var fragmentShader = getShader(gl, 'fragment-shader');
    var vertexShader = getShader(gl, 'vertex-shader');
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
    gl.useProgram(shaderProgram);
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);
}
function getShader(gl, id) {
    var shaderScript;
    var theSource;
    var currentChild;
    var shader;

    shaderScript = document.getElementById(id);
    if(!shaderScript) {
        return null;
    }
    theSource = "";
    currentChild = shaderScript.firstChild;
    while(currentChild) {
        if(currentChild.nodeType == 3) {
            theSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }
    if(shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        if(shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
    }
    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}
function reshape(gl) {
    var canvas = document.getElementById('game-canvas');
    if(canvas.clientWidth == canvas.width && canvas.clientHeight == canvas.height) {
        return;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
function loadIdentity() {
    mvMatrix = Matrix.I(4);
}
function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
}
function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([
        v[0], 
        v[1], 
        v[2]
    ])).ensure4x4());
}
function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}
var mvMatrixStack = [];
function mvPushMatrix(m) {
    if(m) {
        mvMatrixStack.push(m.dup());
        mvMatrix = m.dup();
    } else {
        mvMatrixStack.push(mvMatrix.dup());
    }
}
function mvPopMatrix() {
    if(!mvMatrixStack.length) {
        throw ("Can't pop from an empty matrix stack.");
    }
    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
}
function mvRotate(angle, v) {
    var inRadians = angle * Math.PI / 180;
    var m = Matrix.Rotation(inRadians, $V([
        v[0], 
        v[1], 
        v[2]
    ])).ensure4x4();
    multMatrix(m);
}
