#version 300 es
precision mediump float;

uniform sampler2D uSampler;

in vec2 vCoordinate;

out vec4 fragColor;

void main() {
  fragColor = texture(uSampler, vCoordinate);
}