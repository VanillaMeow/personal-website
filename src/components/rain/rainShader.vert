#version 300 es

layout(location = 0) in float a_x;
layout(location = 1) in float a_speed_t;
layout(location = 2) in float a_length_t;
layout(location = 3) in float a_phase;

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_drop_count;

out float v_opacity;

const int OPACITY_BUCKET_COUNT = 4;
const float OPACITY_BUCKETS[OPACITY_BUCKET_COUNT] = float[OPACITY_BUCKET_COUNT](0.1f, 0.2f, 0.3f, 0.4f);

// Speed range: 250–1248 px/s at 1080p baseline
const float MIN_SPEED = 250.0f / 1080.0f;
const float MAX_SPEED = 1248.0f / 1080.0f;

// Length range: 15–40 px at 1080p baseline
const float MIN_LEN = 15.0f / 1080.0f;
const float MAX_LEN = 40.0f / 1080.0f;

void main() {
    // gl_VertexID is 0 for the top vertex and 1 for the bottom vertex of each drop
    // This lets a single instance drive both endpoints of the line segment
    float isBottom = float(gl_VertexID);

    float speed = mix(MIN_SPEED, MAX_SPEED, a_speed_t);
    float length = mix(MIN_LEN, MAX_LEN, a_length_t);

    // Advance the drop's Y position over time, wrapping in [0, 1) so it loops
    float yNorm = fract(a_phase + speed * u_time);

    // Convert normalized coords to pixels, offsetting the bottom vertex by the drop length
    float px = a_x * u_resolution.x;
    float py = yNorm * u_resolution.y + isBottom * (length * u_resolution.y);

    // Map pixel coords to clip space
    // Y is flipped because pixel Y grows downward
    vec2 ndc = (vec2(px, py) / u_resolution) * 2.0f - 1.0f;
    gl_Position = vec4(ndc.x, -ndc.y, 0.0f, 1.0f);

    int perBucket = max(1, u_drop_count / OPACITY_BUCKET_COUNT);
    int bucket = min(gl_InstanceID / perBucket, OPACITY_BUCKET_COUNT - 1);
    v_opacity = OPACITY_BUCKETS[bucket];
}
