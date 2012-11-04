(function start() {
    var canvas = document.getElementById("game-canvas");

    // If we don't have a GL context, give up now
    if (!initWebGL(canvas)) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }
})();

function initWebGL(canvas) {
    var gl;
   
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // Only continue if WebGL is available and working
    if (!gl) return;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);                  // Set clear color to black, fully opaque
    gl.enable(gl.DEPTH_TEST);                           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);  // Clear the color as well as the depth buffer.

    return gl;
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
