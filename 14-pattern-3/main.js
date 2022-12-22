const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;
const gl = canvas.getContext("webgl2");
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

const vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main () {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision mediump float;
uniform float time;
uniform vec2 resolution;

float circle(vec2 coord, float rad){
  vec2 pos = vec2(0.5)-coord;
  return smoothstep(1.0 - rad, 1.0 - rad + rad * 0.2, 1. - dot(pos,pos) * 3.14);
}

vec2 movingTiles(vec2 coord, float zoom, float speed){
  coord *=zoom;
  float newTime = time * speed;
  if( fract(newTime)>0.5 ){
      if (fract( coord.y * 0.5) > 0.5){
          coord.x += fract(newTime) * 2.0;
      } else {
          coord.x -= fract(newTime) * 2.0;
      }
  } else {
      if (fract( coord.x * 0.5) > 0.5){
          coord.y += fract(newTime) * 2.0;
      } else {
          coord.y -= fract(newTime) * 2.0;
      }
  }
  // return coord;
  return fract(coord);
}

out vec4 color;
void main() {
  vec2 coord = gl_FragCoord.xy / resolution;
  coord.x *= resolution.x / resolution.y;

  coord = movingTiles(coord, 10.0, 0.5);
  
  vec3 colorData = vec3(1.0 - circle(coord, 0.3));
  color = vec4(colorData, 1.0);
}
`;

const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vertexShader);
gl.compileShader(vs);
if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
  console.error(gl.getShaderInfoLog(vs));
}

const fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fragmentShader);
gl.compileShader(fs);
if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
  console.error(gl.getShaderInfoLog(fs));
}
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(program));
}
const vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1];

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

gl.useProgram(program);

const timer = new Date().getTime();

function render() {
  const seconds = (new Date().getTime() - timer) / 1000;
  const resolution = gl.getUniformLocation(program, "resolution");
  gl.uniform2fv(resolution, new Float32Array([canvas.width, canvas.height]));
  const time = gl.getUniformLocation(program, "time");
  gl.uniform1f(time, seconds);

  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, gl.FALSE, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  requestAnimationFrame(render);
}

render();
