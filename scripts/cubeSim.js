// This code was inspired by Harry Richman, just modified it to fit what I want.

var T = .9; // set transparency

var green = "rgba(20,200,20,"+T+")";
var red =   "rgba(255,0,0,"+T+")";
var white = "rgba(255,255,255,"+T+")";
var blue =  "rgba(0,0,255,"+T+")";
var orange = "rgba(255,160,0,"+T+")";
var yellow = "rgba(255,255,0,"+T+")";

var colors = [green, red, white, blue, orange, yellow]; // set colors for virtual cube

var cube3 = new Cube3(colors);
var context = null;

$(function() {
  context = $("#canvas")[0].getContext('2d');
  
  draw();
  cube3.lastSolved = new Date();
  cube3.isSolving = false;
  cube3.moveCount = 0;
  cube3.prev_times = [];

  $(document).keypress(function(event) {

    if (cube3.isSolved()) {
       $("#timer").replaceWith("<p id='timer' class='small'>Press spacebar to scramble</p>");
       reset_timer();
    }
    
    var c = String.fromCharCode(event.which);
    
    if (c in cubeActions) {
        eval(cubeActions[c]);
        cube3.moveCount += 1;
    }

    draw();
    if (cube3.isSolving && cube3.isSolved()) {
        var time = $("#timer").html();
        cube3.prev_times.push(parseFloat(time));
        if (cube3.prev_times.length > 5) {
            cube3.prev_times.shift();      // remove first element
            $("#times li:first").remove();
        }
        $("#times").append('<li>' + time + '</li>');
        show_avg();
        cube3.isSolving = false;
        cube3.moveCount = 0;
    } 

    if (c == ' ') return false;  // escape page-down functionality
   
  });

});

var cubeActions = {'h': 'cube3.rotate_f()',
                   'g': 'cube3.rotate_fp()',
                   'i': 'cube3.rotate_r()',
                   'k': 'cube3.rotate_rp()',
                   'j': 'cube3.rotate_u()',
                   'f': 'cube3.rotate_up()',
                   'w': 'cube3.rotate_b()',
                   'o': 'cube3.rotate_bp()',
                   'd': 'cube3.rotate_l()',
                   'e': 'cube3.rotate_lp()',
                   's': 'cube3.rotate_d()',
                   'l': 'cube3.rotate_dp()',
                   
                   'b': 'cube3.rotate_x()',
                   'n': 'cube3.rotate_x()',
                   't': 'cube3.rotate_xp()',
                   'y': 'cube3.rotate_xp()',
                   'a': 'cube3.rotate_y()',
                   ';': 'cube3.rotate_yp()',
                   'q': 'cube3.rotate_z()',
                   'p': 'cube3.rotate_zp()',

                   'u': 'cube3.rotate_R()',
                   'm': 'cube3.rotate_Rp()',
                   'v': 'cube3.rotate_L()',
                   'r': 'cube3.rotate_Lp()',

                   '5': 'cube3.rotate_m()',
                   '6': 'cube3.rotate_mp()',
                   '2': 'cube3.rotate_e()',
                   '9': 'cube3.rotate_ep()',
                   '0': 'cube3.rotate_s()',
                   '1': 'cube3.rotate_sp()',
                   
                   '\\': 'cube3.toggle_transparency()',
                   ' ': 'get_scramble()'};

var cubeRotations = ['rotate_f', 'rotate_fp',
                     'rotate_r', 'rotate_rp',
                     'rotate_u', 'rotate_up',
                     'rotate_b', 'rotate_bp',
                     'rotate_l', 'rotate_lp',
                     'rotate_d', 'rotate_dp'];
function draw() {
  // clear everything first
  context.clearRect(0, 0, canvas.width, canvas.height);
  cube3.draw(context, 80, 30);
}

function get_scramble() {
    for (var i = 0; i < 30; i++) {
        var n = Math.floor(Math.random() * 12);
        var r = cubeRotations[n];
        cube3[r](); 
    }
    reset_timer();
    cube3.isSolving = true; 
}
    
function update_timer() {
    if (cube3.isSolved()) {
        return;  // only update during solves
    }
    var d = new Date();
    var t = (d.getTime() - cube3.lastSolved.getTime()) / 1000;
    $("#timer").replaceWith("<p id='timer'>" + t + '</p>');
    t = setTimeout("update_timer()", 10);
}

function reset_timer() {
    cube3.lastSolved = new Date();
    cube3.moveCount = 0;
    update_timer();
}

show_avg = function() {
    var sum = 0;
    for (var i in cube3.prev_times) {
        var t = cube3.prev_times[i];
        sum += t;
    }
    var avg = Math.round(100 * sum / cube3.prev_times.length) / 100;
    $("#avg").html("<small>average:</small> " + avg); 
}
