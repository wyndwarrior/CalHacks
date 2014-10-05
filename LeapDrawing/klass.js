var x = false;

var canvas;
var context;
var canvas2, context2;
var h, w, curx, cury, curz;
var lastCircle = 0;
var points;
var lines;
var ytplayer;
var recording = false, drawing = false;
var imgHand = null, imgPen = null;
var drawcursor = true;


var img1 = new Image();
img1.src = "hand.png";
img1.onload = function() {
	imgHand = img1;
};

var img2 = new Image();
img2.src = "marker.png";
img2.onload = function() {
	imgPen = img2;
};

$(document).ready(function(){
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	canvas2 = document.getElementById('canvas2');
    context2 = canvas2.getContext('2d');

	lines = [];
	window.addEventListener('resize', resizeCanvas, false);
	resizeCanvas();

});

var players = [];

var scale = 0.9;

function screenshot(){
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src= 'http://localhost:1337/?'+Math.random();
	head.appendChild(script);
}

function onYouTubeIframeAPIReady() {
	players = [new YT.Player('player1', {
		height: window.innerHeight,
		width: window.innerWidth*scale/2,
		videoId: 'zx1mIYbyk3s',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	}),new YT.Player('player2', {
		height: window.innerHeight,
		width: window.innerWidth*scale/2,
		videoId: 'zx1mIYbyk3s',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	})];
}

function onPlayerReady(event) {
	playVideo();
}

function onPlayerStateChange(event) {
	/*if (event.data == YT.PlayerState.PLAYING && !done) {
		setTimeout(stopVideo, 6000);
		done = true;
	}*/
}

function playVideo(){
	players[0].mute();
	if( players[1].unMute !== undefined )
		players[1].unMute();
	for(var i in players)
		if( players[i].playVideo !== undefined )
			players[i].playVideo();
}

function stopVideo() {
	for(var i in players)
		players[i].stopVideo();
}

function pauseVideo() {
	for(var i in players)
		players[i].pauseVideo();
}

function resizeCanvas() {
    canvas2.width = canvas.width = w = window.innerWidth/2*scale;
    canvas2.height = canvas.height = h = window.innerHeight;
    drawStuff();
}

function clearCanvas(canvas, context){
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
	context.lineWidth = 6;
	context.lineCap = 'round';
	context.strokeStyle = 'red';
	context.stroke();
}

function drawImg(img, x, y, width, height, alpha){
	context.globalAlpha = alpha;
	if( img )
		context.drawImage(img, x, y, width, height);
	context.globalAlpha = 1;
}

function drawStuff() {
	clearCanvas(canvas, context);
	clearCanvas(canvas2, context2);
	if( drawcursor ){
		if( curz < 0 ){
			drawImg(imgPen, curx*w, (1-cury)*h, 55.3*(3+curz), 23.9*(3+curz), 1);
		}else if( curz < 0.3){
			drawImg(imgPen, curx*w, (1-cury)*h, 55.3*(3+curz), 23.9*(3+curz), 1-curz/0.3);
			drawImg(imgHand, curx*w, (1-cury)*h, 30*(4+curz), 21.2*(4+curz), curz/0.3);
		}else{
			drawImg(imgHand, curx*w, (1-cury)*h, 30*(4+curz), 21.2*(4+curz), 1);
		}
	}
	if( points !== undefined)
		drawLine(points);
	for(var i = 0; i<lines.length; i++)
		drawLine(lines[i]);
	context2.drawImage(canvas, 0, 0);
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
	var pointing = true, total = 0;
	for(var i = 0; i<5; i++){
		if( (fingers[i] == 0) == (i == 1))
			pointing = false;
		if( fingers[i] )
			total++;
	}
	return [pointing, ipos, total];
}

function didCircle(direction){
	console.log(direction);
	if( drawing )
		return;
	if( direction ){
		if( recording ){
			drawcursor = false;
			drawStuff();
			screenshot();
			playVideo();
			recording = false;
			setTimeout(function(){
				drawcursor = true;
				lines = [];
				points = [];
			}, 400);
		}
	}else{
		if( lines && lines.length){
			lines.splice(lines.length-1, 1);
		}
		if( !recording ){
			startRecording();
		}
	}
}

function startRecording(){
	if( !recording ){
		setTimeout(function(){
			recording = true;
		}, 1000);
		lines = [];
		points = [];
		pauseVideo();
	}
}


Leap.loop({enableGestures: true}, function (frame) {
	var info = frameInfo(frame);
	if( info[1].length != 0 ){
		curx = info[1][0];
		cury = info[1][1];
		curz = info[1][2];
		if( recording ){
			if( drawing ? curz < 0.1 : curz < 0 ) {
				if(points === undefined)
					points = [];
				drawing = true;
				points.push(w*curx);
				points.push(h*(1-cury));
			}else{
				if( points !== undefined && points.length)
					lines.push(points);
				points = [];
				drawing = false;
			}
		}
	}else{
		curx = curz = cury = -1;
	}
	var gg = frame.gestures;
	if (gg.length > 0) {
		for(var i = 0; i<gg.length; i++){
			var g = gg[i];
			if( g.type == "circle"){
				if( info[2] != 2) 
					continue;
				var time = new Date().getTime();
				if( g.progress > 2 &&  time - lastCircle >= 1000){
					lastCircle = time;
					didCircle(g.normal[2] < 0);
				}
			}else if( g.type == "screenTap"){

			}
		}
	}
	var s = "";
	for(var i = 0; i < info[1].length; i++)
		s += info[1][i].toFixed(2) + ", ";
	//$("#status").html(info[0] +  s + " " + (info[1].length !=0));
	drawStuff();
});




