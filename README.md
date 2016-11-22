# Image Recolorer

This is a fun little proof-of-concept piece.  Load an image and then load a separate image that will be used as a property reference.

### Things you can do:

  - Grayscale an image
  - Recolor an image using the color profile of the reference image. There are several color selection options:
  -- Replace the colors in the image with the colors of the reference image (correlated based on frequency of appearance)
  -- Replace colors based on hue, luminosity or saturation in the two images
  - There are several flagging options, use a point value only once, or allow it to be sampled multiple times
  - Change how property selection is weighted
  - Allow recursive image manipulation (don't reset image properties between manipulations)

### Why?

Why not? It's fun, and I enjoy exploring how random changes can create new art.

[Demo site][demo]

License
----

MIT



[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [demo]: <https://nancyobrien.github.io/Image-Recolorer/>

