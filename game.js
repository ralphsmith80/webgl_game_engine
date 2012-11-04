(function start() {
    var canvas = document.getElementById("game-canvas");
    if(!initWebGL(canvas)) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }
})();
function initWebGL(canvas) {
    var gl;
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if(!gl) {
        return;
    }
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return gl;
}
function reshape(gl) {
    var canvas = document.getElementById('game-canvas');
    if(canvas.clientWidth == canvas.width && canvas.clientHeight == canvas.height) {
        return;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
