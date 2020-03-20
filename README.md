# maybelater
A deferred rendering engine in WebGL.

## Goals
### Scene setup
- [x] Create basic project that serves a static HTML page with a bundled script.
- [x] Import scene-helpers.js from webgl-hello and add a blank canvas.
- [x] Create scene graph object, with separate arrays for light, geometry, and cameras.
- [x] Add cube and render scene.
- [x] Add FPS counter.
- [x] Add basic Material class with phong variables.
- [x] Add basic Light class and allow a single light in the scene.
- [x] Add many objects to scene randomly.

### G-buffer
- [x] Render entire scene to FBO.
- [x] Output red, green, and blue to 3 separate FBO color attachments.
- [x] Render albedo to g-buffer FBO.
- [x] Display albedo buffer in debug window.
- [x] Render normal to g-buffer FBO.
- [x] Render specular contrib to g-buffer FBO.
- [x] Display albedo + normal + specular contrib + depth buffers in debug window.

### L-buffer
- [x] Render a sphere to FBO for a single point light (debug).
- [ ] Render all geometry in light's sphere of influence as white to FBO (debug).
- [ ] Render diffuse to l-buffer FBO.
- [ ] Render specular to l-buffer FBO.
- [ ] Accumulate diffuse and specular for each light to create final image.

### Final pass
- [x] Render textured quad to screen.

### Other stuff
- [ ] Add specular intensity to Material class.
- [ ] Add specular intensity to Phong calculation.
- [ ] Pack g-buffer info into 2 textures instead of 3 (diffuse.rgb + specular intensity, normal.xyz + shininess).
- [ ] Integrate basic obj file loader (parse-obj.js from webgl-hello).
- [ ] Add obj file to scene graph.
- [ ] Add some heirarchical model to scene graph.
- [ ] Integrate key capture library (maybe keypress).
- [ ] Add multiple cameras, with the ability to switch between them using keystrokes.
- [ ] Animate some of the objects.
- [ ] Change lighting to Blinn-Phong.
- [ ] Grok Blinn-Phong differences enough to validate that it's working as expected.
- [ ] Add Fresnel factor to specular lighting.
- [ ] Add per-pixel fog using g-buffer depth.
- [ ] Add SSAO.
- [ ] Implement deferred lighting (should be its own section).