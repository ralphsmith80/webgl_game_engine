define(["require", "exports"], function(require, exports) {
    var gl;
    var cubeImage;
    var cubeTexture;
    var cubeVerticesBuffer;
    var cubeVerticesTextureCoordBuffer;
    var cubeVerticesIndexBuffer;
    var Texture = (function () {
        function Texture(gl) {
            this.gl = gl;
        }
        Texture.prototype.initTextures = function () {
            var _this = this;
            var gl = this.gl;
            cubeTexture = gl.createTexture();
            cubeImage = new Image();
            cubeImage.onload = function () {
                _this.handleTextureLoaded(cubeImage, cubeTexture);
            };
            cubeImage.src = "../img/cubetexture.png";
        };
        Texture.prototype.handleTextureLoaded = function (image, texture) {
            var gl = this.gl;
            console.log("handleTextureLoaded, image = " + image);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        Texture.prototype.initBuffers = function () {
            var gl = this.gl;
            cubeVerticesBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
            var vertices = [
                -1, 
                -1, 
                1, 
                1, 
                -1, 
                1, 
                1, 
                1, 
                1, 
                -1, 
                1, 
                1
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            cubeVerticesTextureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
            var textureCoordinates = [
                0, 
                0, 
                1, 
                0, 
                1, 
                1, 
                0, 
                1
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
            cubeVerticesIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
            var cubeVertexIndices = [
                0, 
                1, 
                2, 
                0, 
                2, 
                3
            ];
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
        };
        return Texture;
    })();
    exports.Texture = Texture;    
})

