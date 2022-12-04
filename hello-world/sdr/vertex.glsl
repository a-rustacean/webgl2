#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aColor;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 vColor;

void main() {
  vColor = aColor;
  gl_PointSize = 100.0;
  gl_Position = projection * view * model * vec4(aPosition, 1.0);
}