// This code was inspired by Harry Richman, just modified it to fit what I want.

// coordinates: 0 = front, 1 = right, 2 = up,
//              3 = back,  4 = left,  5 = down

Cube = function(colors, x, y, z) {
  this.colors = colors;
  this.x = x; this.y = y; this.z = z;
}

Cube.prototype.draw = function(ctx, x, y) {
  var fillColors = this.colors;
  
  ctx.save();
  ctx.translate(x,y);

  // down face
  ctx.save();
  ctx.translate(0, 60);
  drawParallelogram(fillColors[5], ctx, 60, 0, -20, 40);
  ctx.restore();
  
  // left face
  ctx.save();
  drawParallelogram(fillColors[4], ctx, 0, 60, -20, 40);
  ctx.restore();
   
  // back face 
  ctx.save();
  drawParallelogram(fillColors[3], ctx, 60, 0, 0, 60);
  ctx.restore();
  
  // up face
  ctx.save();
  drawParallelogram(fillColors[2], ctx, 60, 0, -20, 40, 0);
  ctx.restore();
  
  // right face
  ctx.save();
  ctx.translate(60,0);
  drawParallelogram(fillColors[1], ctx, 0, 60, -20, 40, 0.25);
  ctx.restore();

  // front face
  ctx.save();
  ctx.translate(-20,40);
  drawParallelogram(fillColors[0], ctx, 60, 0, 0, 60, 0.1);
  ctx.restore();

  ctx.restore();
}

drawParallelogram = function(color, ctx, x1, y1, x2, y2, shading) {
  ctx.save();
  
  // 1. Draw the Black "Plastic" Border
  ctx.lineJoin = "round";
  ctx.lineWidth = 4; // Thicker border looks like plastic gaps
  ctx.strokeStyle = "#111"; 

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x1+x2, y1+y2);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();

  // 2. Fill the Sticker Color
  ctx.fillStyle = color;
  ctx.fill();

  // 3. Apply Shading (The Secret Sauce)
  if (shading) {
    ctx.fillStyle = "rgba(0,0,0," + shading + ")";
    ctx.fill();
  }

  // 4. Add a "Glossy" highlight at the top
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}
Cube.prototype.setColors = function(colors) {
  this.colors = colors;
}

Cube.prototype.rotate_x = function() {
    cycle(this.colors, [1, 5, 4, 2]);
}

Cube.prototype.rotate_y = function() {
    cycle(this.colors, [0, 2, 3, 5]);
}

Cube.prototype.rotate_z = function() {
    cycle(this.colors, [0, 4, 3, 1]);
}

Cube.prototype.rotate_xn = function(n) {
    for (var i=0; i<n; i++) this.rotate_x()
}

Cube.prototype.rotate_yn = function(n) {
    for (var i=0; i<n; i++) this.rotate_y()
}

Cube.prototype.rotate_zn = function(n) {
    for (var i=0; i<n; i++) this.rotate_z();
}

cycle = function(list, indices) {
    first = list[indices[0]];
    for (var i = 1; i < indices.length; i++) {
        list[indices[i-1]] = list[indices[i]];
    }
    list[indices[i-1]] = first; // i = length of list
}

drawQuad = function(color, ctx, x1, y1, x2, y2, x3, y3) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x3,y3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}