/** @type {WebGLProgram} */
let program;
/** @type {WebGL2RenderingContext} */
let gl;
/** @type {HTMLCanvasElement} */
let canvas;
/** @type {Image} */
let image;
/** @type {WebGLTexture} */
let texture;

/**
 * 
 * @param {string} path
 * @returns {Promise<string>}
 */
async function readFile(path) { return await (await fetch(path)).text() };

/**
 * 
 * @param {number} deg
 * @return {number}
 */
function degToRad(deg) { return deg * (Math.PI / 180) };


/**
 * 
 * @param {string} path
 * @returns {Promise<Image>}
 */
function readImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = path;
  })
}

let i = 0;

/**
 * 
 * @param {number} deltatime
 * @returns {void}
 */
async function update(deltatime) {
  gl.clearColor(18 / 255, 18 / 255, 18 / 255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.useProgram(program);
  
  const bufferData = [
    1, -1, 0,   1, 0,
    1, 1, 0,    1, 1,
    -1, -1, 0,  0, 0,
    -1, 1, 0,   0, 1,
    -1, -1, 0,  0, 0,
    1, 1, 0,    1, 1
  ];
  
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
  
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 4 * 5, 0);
  gl.enableVertexAttribArray(0);
  
  // gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 4 * 8, 4 * 3);
  // gl.enableVertexAttribArray(1);
  
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 4 * 5, 4 * 3);
  gl.enableVertexAttribArray(2);
  
  const model = glMatrix.mat4.create();
  const view = glMatrix.mat4.create();
  const projection = glMatrix.mat4.create();
  
  glMatrix.mat4.perspective(
    projection,
    degToRad(75),
    canvas.width / canvas.height,
    0.01, 1000
  );
  //i += deltatime * 100;
  
  glMatrix.mat4.translate(model, model, [0, 0, 0]);
  glMatrix.mat4.lookAt(view, [0, 0, 5], [0, 0, 0], [0, 1, 0])
  glMatrix.mat4.rotateZ(model, model, degToRad(i));
  
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "model"),
    false,
    model
  );
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "view"),
    false,
    view
  );
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "projection"),
    false,
    projection
  );
  
  gl.drawArrays(gl.TRIANGLES, 0, bufferData.length / 5);
};

async function start() {
  /** @type {HTMLCanvasElement} */
  canvas = document.getElementById("canvas");
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  gl = canvas.getContext("webgl2");
  gl.viewport(0, 0, canvas.width, canvas.height);
  if (!gl) return console.warn("webgl not supported!");

  program = gl.createProgram();

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const vertexShaderSource = await readFile("./sdr/vertex.glsl");
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  const vertexShaderLog = gl.getShaderInfoLog(vertexShader);
  if (vertexShaderLog) return console.warn(vertexShaderLog, "\nsource:\n", vertexShaderSource);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  const fragmentShaderSource = await readFile("./sdr/fragment.glsl");
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);
  const fragmentShaderLog = gl.getShaderInfoLog(fragmentShader);
  if (fragmentShaderLog) return console.warn(fragmentShaderLog, "\nsource:\n", fragmentShaderSource);

  gl.linkProgram(program);
  gl.useProgram(program);

  image = await readImage("/sources/image.jpeg");

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0)
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
}

start().then(() => {
  let prev = performance.now();
  const loop = () => {
    const current = performance.now();
    update((current - prev) / 1000);
    prev = current;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});