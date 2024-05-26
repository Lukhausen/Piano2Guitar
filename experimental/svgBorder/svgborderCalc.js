import { createSVGWindow } from 'svgdom'
const { SVG, registerWindow } = require('@svgdotjs/svg.js');

// Create an SVG window
const window = createSVGWindow();
const document = window.document;

// Register window and document
registerWindow(window, document);

// Create an SVG canvas and a path element
const canvas = SVG(document.documentElement);
const path = canvas.path("M579-480 285-774q-15-15-14.5-35.5T286-845q15-15 35.5-15t35.5 15l307 308q12 12 18 27t6 30q0 15-6 30t-18 27L356-115q-15 15-35 14.5T286-116q-15-15-15-35.5t15-35.5l293-293Z");

// Calculate the bounding box
const bbox = path.bbox();

console.log(bbox);
