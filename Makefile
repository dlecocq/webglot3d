FILES = box.js datasurface.js emptytexture.js flow.js grapher.js \
	isosurface.js nurbs.js p_curve.js p_surface.js pde.js pde3d.js \
	primitive.js ray.js screen.js sphere.js stopwatch.js surface.js \
	texture.js

doc: $(FILES)
	jsdoc.pl $(FILES)	

documentation: doc
