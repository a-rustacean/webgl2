#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 2) in vec2 aCoordinate;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 vCoordinate;

void main() {
  vCoordinate = aCoordinate;
  gl_PointSize = 100.0;
  gl_Position = projection * view * model * vec4(aPosition, 1.0);
}