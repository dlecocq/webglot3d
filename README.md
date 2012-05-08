webglot3d
=========

This is a code base that I developed mostly in the 3-4 months after 
attending SIGGRAPH Asia 2009, and learning about WebGL. At the time
I was very interested in visualization, and mathematical rendering
in particular. My vision was that `webglot` could be a library for
performing some normally computationally-intensive visualization in
the browser. I wrote this while a student at 
[King Abdullah Univeristy of Science and Technology](http://www.kaust.edu.sa/),
and it was the basis for a [SIGGRAPH 2010 talk](http://dl.acm.org/citation.cfm?id=1837072). There's also a 
[video](http://vimeo.com/9584857) of a demo run of the project.

__NOTE__: I have not run much of this since it was under active development.
It has not necessarily aged well, in the sense that I've not been able
to easily run it under modern versions of Chrome or WebKit. My 
suspicion is just that it requires a few tweaks to calls to the 
underlying WebGL APIs, as has been necessary in the past. Also, please
excuse any anti-idioms -- I was relatively new to JavaScript at the 
time, and I look back at much of it now with a shake of the head :-/

Primitives
==========

datasurface
-----------
Based on volumetric data, render isosurfaces with raytracing. When an 
isosurface is found, the isosurface normal is approximated at that point
for the purposes of shading.

__NOTE__: The volumes I originally used came from the [Volume Library](http://www9.informatik.uni-erlangen.de/External/vollib/), and 
cannot currently be redistributed after the modifications I made. I've
only recently contacted the maintainer of this library to see what options
there are.

function isosurface
-------------------
Similar to the datasurface, in that it performs isosurface rendering, but
it is driven by a user-provided time-varying function rather than data.

flowsurface
-----------
Performs texture advection based on the gradient of a function `f(x,y,t)`,
and then applies that texture to a 3D rendering of that surface

parametric surface
------------------
Supports cylindrical, spherical, and cartesian coordinates to render a 
parametric surface as described by a user-provided function.

nurbs
-----
I originally began working on support to render NURBS, but, it turns out
that it's hard and time-consuming, and it was soon set aside for other
projects and features.

