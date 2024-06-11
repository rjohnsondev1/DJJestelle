

uniform sampler2D pointTexture;
varying vec3 vColor;




void main() {
    vec2 uv = gl_PointCoord;
    float distanceToCenter = length(uv - .5);
    float alpha = 0.05 / distanceToCenter - 0.1;
    gl_FragColor = vec4(vColor, 1);
    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
}