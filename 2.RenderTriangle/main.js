const util = new WebGLUtils();
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = util.getGLContext(canvas);

const triangleCoords = [0.0, -1.0, 0.0, 1.0, 1.0, -1.0];
//Step1 : Write shaders
const vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main () {
    gl_Position = vec4(position, 0.0, 1.0);//x,y,z,w
}`;
const fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
void main () {
    color = vec4(0.0, 0.0, 1.0, 1.0);//r,g,b,a
}`;
//Step2 : Create Program from shaders
const program = util.getProgram(gl, vertexShader, fragmentShader);
//Step3 : Create Buffers
const buffer = util.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(triangleCoords)
);
//Step4 : Link GPU variable to CPU and sending data
gl.useProgram(program);
const position = util.linkGPUAndCPU(
  {
    program: program,
    gpuVariable: "position",
    channel: gl.ARRAY_BUFFER,
    buffer: buffer,
    dims: 2,
    dataType: gl.FLOAT,
    normalize: gl.FALSE,
    stride: 0,
    offset: 0,
  },
  gl
);
//Step5 : Render Triangle
gl.drawArrays(gl.TRIANGLES, 0, 3);
