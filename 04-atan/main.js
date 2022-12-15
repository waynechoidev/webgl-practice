const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
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

vec3 hsb2rgb( in vec3 c ){
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                           6.0)-3.0)-1.0,
                   0.0,
                   1.0 );
  rgb = rgb*rgb*(3.0-2.0*rgb);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

float PI = 3.141592;

out vec4 color;
void main() {
  vec2 coord = gl_FragCoord.xy / resolution;
  vec3 colorData = vec3(0.0);
  
  // colorData = vec3(coord.x, 1.0, coord.y);
  // colorData = hsb2rgb(vec3(coord.x,1.0,coord.y));

  coord = coord * 2.0 - 1.0;
  float angle = atan(coord.y, coord.x);
  // angle += PI;
  // angle += sin(time) * 5.0;
  angle += PI + sin(time) * 5.0;
  angle /= 2.0 * PI;
  angle *= 20.0;

  float dist = length(coord);

  colorData = hsb2rgb(vec3(angle, dist, 1.0));
  
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
