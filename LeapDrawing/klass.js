var x = false;

var canvas;
var context;
var h, w, curx, cury, curz;
var points;
var lines;

$(document).ready(function(){
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	lines = [];
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

function average(ar, start, end){
	start = Math.max(0, start);
	end = Math.min(end, ar.length-1);
	var avgx = 0, avgy = 0, j = 0;
	for(var i = start; i<end; i+=2){
		avgx += ar[i];
		avgy += ar[i+1];
		j++;
	}
	return [avgx/j, avgy/j];
}

function drawLine(ar){
	if( ar.length == 0) return;
	context.beginPath();
	context.moveTo(ar[0], ar[1]);
	for(var i = 2; i<ar.length; i+=2){
		pt = average(ar, i-2*3, i+2*4);
		context.lineTo(pt[0], pt[1]);
	}
	context.lineWidth = 10;
	context.lineCap = 'round';
	context.stroke();
}

function drawStuff() {
	clearCanvas();
	var val = Math.abs(Math.floor(curz*255).toString(16));
	context.fillStyle="#"+val+val+val;
	context.fillRect(w*curx, h*(1-cury), 30, 30);
	if( points !== undefined)
		drawLine(points);
	for(var i = 0; i<lines.length; i++)
		drawLine(lines[i]);
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
					ipos = [pt[0]/200+.75, pt[1]/200-0.25, pt[2]/100+0.1];
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


Leap.loop({enableGestures: true}, function (frame) {
	var info = frameInfo(frame);
	if( info[1].length != 0 ){
		curx = info[1][0];
		cury = info[1][1];
		curz = info[1][2];
		if( curz < 0 ) {
			if(points === undefined)
				points = [];
			points.push(w*curx);
			points.push(h*(1-cury));
		}else{
			if( points !== undefined)
				lines.push(points);
			points = [];
		}
	}else{
		curx = curz = cury = -1;
	}
	var gg = frame.gestures;
	if (gg.length > 0) {
		for(var i = 0; i<gg.length; i++){
			var g = gg[i];
			if( g.type == "circle"){
				console.log(g.id+" radius: " + g.radius.toFixed(1) + " mm, "
                        + "progress: " + g.progress.toFixed(2) + " rotations");
			}
		}
	}
	var s = "";
	for(var i = 0; i < info[1].length; i++)
		s += info[1][i].toFixed(2) + ", ";
	//$("#status").html(info[0] +  s + " " + (info[1].length !=0));
	drawStuff();
});

