// This code was inspired by Harry Richman, just modified it to fit what I want.

function Cube3(colors) {

  var clear = "rgba(0,0,0,0)"; // internal cubie face color
  //var black = "rbga(255,0,0,1)";

  this.internal_color = clear;
  this.colors = colors;
  this.isClear = true;
  
  this.cubies = {};
    
  var int = this.internal_color;
  for (x in {"F":1, "_":0, "B":-1}) {
    for (y in {"R":1, "_":0, "L":-1}) {
      for (z in {"U":1, "_":0, "D":-1}) {
        var cubie_colors = [int,int,int,int,int,int]; // initialize cubies
        
        switch (x) {                                  // assign colors based on position
          case "F": cubie_colors[0] = colors[0]; break;
          case "B": cubie_colors[3] = colors[3];
        }
        switch (y) {
          case "R": cubie_colors[1] = this.colors[1]; break;
          case "L": cubie_colors[4] = this.colors[4];
        }
        switch (z) {
          case "U": cubie_colors[2] = this.colors[2]; break;
          case "D": cubie_colors[5] = this.colors[5];
        }
        this.cubies[x+y+z] = new Cube(cubie_colors,x,y,z);
      }
    }
  }
}

Cube3.prototype.toggle_transparency = function() {
  if (this.isClear) {
    var black = "rgba(0,0,0,1)";
    this.internal_color = black;
  } else {
    var clear = "rgba(0,0,0,0)";
    this.internal_color = clear;
  }
  this.isClear = !this.isClear;
  this.setInternalColors();
 
}

Cube3.prototype.setInternalColors = function() {
  var int = this.internal_color;
  
  for (x in {"F":1, "_":0, "B":-1}) {
    for (y in {"R":1, "_":0, "L":-1}) {
      for (z in {"U":1, "_":0, "D":-1}) {
        
        var pos = x+y+z;
        var cubie = this.cubies[pos];
        // set front-back
        if (x=="F" || x=="_") cubie.colors[3] = int;
        if (x=="B" || x=="_") cubie.colors[0] = int;
        // set left-right
        if (y=="R" || y=="_") cubie.colors[4] = int;
        if (y=="L" || y=="_") cubie.colors[1] = int;
        // set up-down
        if (z=="U" || z=="_") cubie.colors[5] = int;
        if (z=="D" || z=="_") cubie.colors[2] = int;
      }
    }
  }
}

Cube3.prototype.isSolved = function() {
    var sides = ["F", "R", "U", "B", "L", "D"];
    for (s in sides) {
        var i = s % 3;
        switch (i) {
            case 0: f = sides[s] + "__"; break;
            case 1: f = "_" + sides[s] + "_"; break;
            case 2: f = "__" + sides[s]; 
        }
        var color = this.cubies[f].colors[s]; // identify color of each side s
        for (c in this.cubies) {
            if (c[i] == sides[s] && this.cubies[c].colors[s] != color) {
                return false;
            }
        }
    }
    return true;
}

Cube3.orient = function(condition, set, rotate) {
  for (i in set) {
    if (condition(i)) rotate(set[i]);
  }
}

Cube3.permute_cycle = function(set, indices) {
  var temp = set[indices[0]];
  for (var i = 1; i < indices.length; i++) {
    set[indices[i - 1]] = set[indices[i]];
  }
  set[indices[i - 1]] = temp;
}

Cube3.get_rotate = function(condition, rotate, cycle1, cycle2) {
  return function() {
    Cube3.orient(condition, this.cubies, rotate);
    Cube3.permute_cycle(this.cubies, cycle1);
    Cube3.permute_cycle(this.cubies, cycle2);
  }
}

Cube3.get_inverse = function(rotate) {
    return function() {
        this[rotate](); this[rotate](); this[rotate]();
    }
}

Cube3.prototype.rotate_f = Cube3.get_rotate(function(p){return(p[0]=="F")}, 
                              function(c){c.rotate_xn(3)}, 
                              ["FRU","FLU","FLD","FRD"], 
                              ["FR_","F_U","FL_","F_D"]); 

Cube3.prototype.rotate_r = Cube3.get_rotate(function(p){return(p[1]=="R")}, 
                              function(c){c.rotate_yn(3)}, 
                              ["FRU","FRD","BRD","BRU"], 
                              ["FR_","_RD","BR_","_RU"]);

Cube3.prototype.rotate_u = Cube3.get_rotate(function(p){return (p[2]=="U")}, 
                              function(c){c.rotate_zn(3)}, 
                              ["FRU","BRU","BLU","FLU"], 
                              ["_RU","B_U","_LU","F_U"]);
              
Cube3.prototype.rotate_b = Cube3.get_rotate(function(p){return(p[0]=="B")}, 
                              function(c){c.rotate_x()}, 
                              ["BRU","BRD","BLD","BLU"], 
                              ["BR_","B_D","BL_","B_U"]);

Cube3.prototype.rotate_l = Cube3.get_rotate(function(p){return(p[1]=="L")}, 
                              function(c){c.rotate_y()}, 
                              ["FLU","BLU","BLD","FLD"], 
                              ["FL_","_LU","BL_","_LD"]);

Cube3.prototype.rotate_d = Cube3.get_rotate(function(p){return(p[2]=="D")}, 
                              function(c){c.rotate_z()}, 
                              ["FRD","FLD","BLD","BRD"], 
                              ["_RD","F_D","_LD","B_D"]);

Cube3.prototype.rotate_s = Cube3.get_rotate(function(p) {return (p[0]=="_")},
                              function(c) {c.rotate_x()},
                              ["_RU","_RD","_LD","_LU"],
                              ["_R_","__D","_L_","__U"]);
Cube3.prototype.rotate_sp = function() {
    this.rotate_s(); this.rotate_s(); this.rotate_s();
}

Cube3.prototype.rotate_m = Cube3.get_rotate(function(p) {return (p[1]=="_")},
                              function(c) {c.rotate_y()},
                              ["F_U","B_U","B_D","F_D"],
                              ["F__","__U","B__","__D"]);
Cube3.prototype.rotate_mp = function() {
    this.rotate_m(); this.rotate_m(); this.rotate_m();
}

Cube3.prototype.rotate_e = Cube3.get_rotate(function(p) {return (p[2]=="_")},
                              function(c) {c.rotate_z()},
                              ["FR_","FL_","BL_","BR_"],
                              ["F__","_L_","B__","_R_"]);
Cube3.prototype.rotate_ep = function() {
    this.rotate_e(); this.rotate_e(); this.rotate_e();
}

Cube3.prototype.rotate_fp = Cube3.get_inverse("rotate_f");

Cube3.prototype.rotate_rp = Cube3.get_inverse("rotate_r"); 

Cube3.prototype.rotate_up = Cube3.get_inverse("rotate_u"); 

Cube3.prototype.rotate_bp = Cube3.get_inverse("rotate_b"); 

Cube3.prototype.rotate_lp = Cube3.get_inverse("rotate_l"); 

Cube3.prototype.rotate_dp = Cube3.get_inverse("rotate_d"); 

Cube3.prototype.rotate_x = function() {
    this.rotate_rp();
    this.rotate_m();
    this.rotate_l();
}

Cube3.prototype.rotate_xp = function() {
    this.rotate_r(); this.rotate_mp(); this.rotate_lp();
}

Cube3.prototype.rotate_y = function() {
    this.rotate_up();
    this.rotate_e();
    this.rotate_d();
}
Cube3.prototype.rotate_yp = function() {
    this.rotate_u(); this.rotate_ep(); this.rotate_dp();
}

Cube3.prototype.rotate_z = function() {
    this.rotate_fp();
    this.rotate_s();
    this.rotate_b();
}
Cube3.prototype.rotate_zp = function() {
    this.rotate_f(); this.rotate_sp(); this.rotate_bp();
}

Cube3.prototype.rotate_R = function() {
    this.rotate_r(); this.rotate_mp();
}

Cube3.prototype.rotate_Rp = function() {
    this.rotate_rp(); this.rotate_m();
}

Cube3.prototype.rotate_L = function() {
    this.rotate_l(); this.rotate_m();
}

Cube3.prototype.rotate_Lp = function() {
    this.rotate_lp(); this.rotate_mp();
}

Cube3.prototype.draw = function(ctx, px, py) {

  ctx.save();
  ctx.translate(px,py);
  
  var FR_H = 23; // horiz. cubie distance along x-coord
  var FR_V = 46; // vertical cubie distance along x-coord
  var UP = 69; // cubie distance along y- and z- coordinates
 
  var x_coords = {"B":[0, 0], "_":[-FR_H, FR_V], "F":[-2*FR_H, 2*FR_V]};
  var y_coords = {"L":[0, 0], "_":[UP, 0], "R":[2*UP, 0]};
  var z_coords = {"D":[0, 2*UP], "_":[0, UP], "U":[0, 0]};
  for (x in x_coords) {
    for (y in y_coords) {
      for (z in z_coords) {
        var h_pos = x_coords[x][0] + y_coords[y][0] + z_coords[z][0];
        var v_pos = x_coords[x][1] + y_coords[y][1] + z_coords[z][1];
        this.cubies[x+y+z].draw(ctx, h_pos, v_pos);
        //console.log(x+y+z+": "+this.cubies[x+y+z].colors);
      }
    }
  }
  ctx.restore();
}