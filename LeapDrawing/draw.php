<!DOCTYPE html>
<html>
  <head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>LeapClass</title>
  <script>
  <?php
$abc = $_REQUEST['vid'];
if( $abc == 'cs61a')
  echo 'vidid="zx1mIYbyk3s";';
else if( $abc == 'physics')
  echo 'vidid="LDtDNHMveBQ";';
else 
  echo 'vidid="'.$abc.'";';

  ?>
  </script>
  <script src="leap-0.6.2.min.js"></script>
  <script src="jquery-1.11.1.min.js"></script>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script src="klass.js"></script>
  <link rel="stylesheet" type="text/css" href="klass.css">
  </head>
<body>
  <div id="layertop">
    <div class="eye1">
      <canvas id="canvas"></canvas>
    </div>
    <div class="eye2">
      <canvas id="canvas2"></canvas>
    </div>
  </div>
  <div id="layervideo">
    <div class="eye1">
      <div id="player1"></div>
    </div>
    <div class="eye2">
      <div id="player2"></div>
    </div>
  </div>
</body>
</html>
