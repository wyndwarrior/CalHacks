var x = false;

var canvas;
var context;
var h, w, curx, cury, curz;
var points;

$(document).ready(function(){
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	points = [];
	window.addEventListener('resize', resizeCanvas, false);
	resizeCanvas();
});

function resizeCanvas() {
    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;
    drawStuff();
}

function clearCanvas(){
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.restore();
}

function drawLine(ar){
	if( ar.length == 0) return;
	context.beginPath();
	context.moveTo(ar[0], ar[1]);
	for(var i = 2; i<ar.length; i+=2){
		context.lineTo(ar[i], ar[i+1]);
	}
	context.stroke();
}

function drawStuff() {
	clearCanvas();
	var val = Math.abs(Math.floor(curz*255).toString(16));
	context.fillStyle="#"+val+val+val;
	context.fillRect(w*curx, h*(1-cury), 30, 30);
	drawLine(points);
}

function frameInfo(frame){
	var fingers = [0,0,0,0,0];
	var p = frame.pointables;
	var ipos = [];
	for(var i = 0; i<p.length; i++){
		var pp = p[i];
		if( !pp.tool ){
			if( pp.extended ){
				fingers[pp.type]++;
				if( pp.type == 1){
					var pt = pp.tipPosition;
					ipos = [pt[0]/200+.5, pt[1]/200-0.25, pt[2]/100+0.5];
				}
			}
		}
	}
	var pointing = true;
	for(var i = 0; i<5; i++){
		if( (fingers[i] == 0) == (i == 1))
			pointing = false;
	}
	return [pointing, ipos];
}


Leap.loop(function (frame) {
	var info = frameInfo(frame);
	if( info[1].length != 0 ){
		curx = info[1][0];
		cury = info[1][1];
		curz = info[1][2];
		if( curz < 0 ) {
			points.push(w*curx);
			points.push(h*(1-cury));
		}
	}else{
		curx = curz = cury = -1;
	}
	var s = "";
	for(var i = 0; i < info[1].length; i++)
		s += info[1][i].toFixed(2) + ", ";
	//$("#status").html(info[0] +  s + " " + (info[1].length !=0));
	drawStuff();
});

