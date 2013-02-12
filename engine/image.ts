
//class GSize {
//	constructor(public float width, public float height) {}
//}

var gl;
var cubeImage;
var cubeTexture;
var cubeVerticesBuffer;
var cubeVerticesTextureCoordBuffer;
var cubeVerticesIndexBuffer;


export class Texture {

	//private _name: 0;

    constructor(public gl) {
        // assigning public vars is atomatic if the public keyword is used in the constuctor
        // this.gl = gl;
    }

	initTextures() {
		var gl = this.gl;
	    cubeTexture = gl.createTexture();
	    cubeImage = new Image();
	    cubeImage.onload = () => { this.handleTextureLoaded(cubeImage, cubeTexture); }
	    cubeImage.src = "../img/cubetexture.png";
	    //cubeImage.src = "GameAtlas.png";
	    //cubeImage.src = "galaxies_alpha.png";
	    //cubeImage.src = "http://localhost:8000/galaxies_alpha.png";

	    //locally i.e. file://galexies_alpha.png
	    // run chrome with the --allow-file-access-from-files flag
	    // `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files`

	    // local server
	    // python -m SimpleHTTPServer
	    // http://localhost:8000/game.html

	    // usually I use models so prolly want to compile with 
	    // `tsc --module amd game.ts`
	}
	 
	handleTextureLoaded(image, texture) {
		var gl = this.gl;
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

	initBuffers() {
		var gl = this.gl;
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
	    //var textureCoordinates = [
	        // Front
	      //  0.0,  0.0,
	      //  1.0,  0.0,
	      //  0.0,  1.0,
	      //  1.0,  1.0
	        //0.0,  1.0,
	        //1.0,  1.0,
	        //0.0,  0.0,
	        //1.0,  0.0
	    //];
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
}