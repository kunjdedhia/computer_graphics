/** 
  * @desc Homework 7
  * @name Kunj Dedhia kdedhia@umass.edu
*/

Subset of Features implemented - 

1. Anti-aliasing (2pts) - I implemented regular super-sampling (16x) and then I use the average of all values as the pixel color. 
	a. within render(), raytracer.js Line 45 to Line 53

2. Ambient Occlusion (6pts) - I implemented ambient occlusion by sampling NS successful rays. If the ray intersects something, it counts 0, otherwise it counts 1. The 1 is then multiplied by the dot product of that ray direction and shading normal. Then I sum up the results and divide by NS. I normalize the factor and multiply it with the shading color. 
	a. within shading(), raytracer.js Line 165 to Line 187

3. Image-based Lighting (8pts) - This has been implemented in a new scene constructed in the file 10.ball_glass_mirror_ibl.html and is included in the scenes folder. All the probes have been placed in scenes/all_probes/ and this directory must be maintained for it to run correctly. My implementation uses the ray's direction to index into the environment map and return a color. That way I see an image that looks as if the environment map is the background. This will helps to verify if I am accessing the environment map correctly.
	a. getEnvIntensity(): returns the color from the envmap corresponding to the ray (raytracer.js Line 68 to Line 91)
	b. rgbeToFloat(): converts rgbe to float pixel values (raytracer.js Line 70 to Line 76)
	c. within shading(): IBL shading (raytracer.js Line 190 to Line 215)


Screenshots: I have taken screenshots of all the renders and included them in the submission. They're placed inside feature_img/

Note: The screenshots included in the submission have been rendered with 300 successful rays, however, for simplicity I reduced the number to 100 in the submission file. The rendering time is extremely high if Ambient Occlusion or Image-based Lighting is run with Anti-Aliasing