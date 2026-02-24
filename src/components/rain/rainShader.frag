#version 300 es

precision mediump float;

in float v_opacity;
out vec4 fragColor;

// Rain color: rgb(174, 194, 224)
void main() {
    fragColor = vec4(0.682f, 0.761f, 0.878f, v_opacity);
}
