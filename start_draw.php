<!DOCTYPE html>
<?php
    //Moxtra App Credentials from developer.moxtra.com
    $client_id = "r0QI6GjJbaI"; 
    $client_secret = "kRKfGYmyDR0";
 
    //User Information
    $unique_id = "1234567890"; //Unique ID of how user is identified in your system
    $firstname = "John"; 
    $lastname = "Doe";
 
    //Create Signature
    date_default_timezone_set('UTC'); 
    $timestamp = timest1000;
    $hmac256_string = hash_hmac('sha256', $client_id."".$unique_id."".$timestamp, $client_secret, true);
    $signature = rtrim(strtr(base64_encode($hmac256_string), '+/', '-_'), '='); 
 
    //Post data to setup/initialize user 
    $data_string = "client_id=".$client_id."&client_secret=".$client_secret."&grant_type=http://www.moxtra.com/auth_uniqueid&uniqueid="
        .$unique_id."&timestamp=".$timestamp."&signature=".$signature."&firstname=".$firstname."&lastname=".$lastname;
    $uri = "https://api.moxtra.com/oauth/token";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,$uri);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS,$data_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    $result = json_decode($result, true);
 
    //Get Access Token on Successful Setup & Initialization of the User
    $access_token = $result['access_token'];

    function uploadToBinder(){
        //Upload file to Binder using Binder ID and Access Token
        $target_url = "https://api.moxtra.com/".$_REQUEST['binderid']."/pageupload?file=README.md&access_token=".$_REQUEST['access_token'];
        $file_name_with_full_path = realpath(getcwd().'/Users/home/Documents/Collo/README.md');
        $post = array('file'=>'@'.$file_name_with_full_path);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$target_url);
        curl_setopt($ch, CURLOPT_POST,1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        $result=curl_exec ($ch);
        curl_close ($ch);
    }
?>
<html>
    <head>
        <title>Moxtra SDK Demo</title>
        <meta charset="UTF-8" />
    </head>
    <body>
        <!-- Start Draw Button -->
        <h3><a id="startDraw" href="javascript:javascript:start_draw();">Start Draw</a></h3>
        
        <!-- Container to hold the Draw UI -->
        <div id="draw-container" style="position:absolute; top:100px; left:150px;"></div>
 
        <!-- Include Moxtra JavaScript Library -->
        <script type="text/javascript" src="https://www.moxtra.com/api/js/moxtra-latest.js" id="moxtrajs" 
            data-client-id="<?php echo $client_id;?>"></script>
 
        <!-- Required External JavaScript Libraries -->
        <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
        
        <!-- Start Draw Function -->
        <script type="text/javascript">
        function start_draw() {
            var draw_options = {
                iframe: true, //To open the draw screen in the same window within an iFrame.
                tagid4iframe: "draw-container",
                iframewidth: "1000px",
                iframeheight: "750px",
                access_token: "<?php echo $access_token; ?>",
                start_annotate: function(event) {
                    console.log("Draw Started - session_id: "+event.session_id+"\nbinder_id: "+event.binder_id+"\naccess_token: <?php echo $access_token; ?>");
                    // console.log("<?php print_r( $result; ) ?>");
                    // Call function to upload file to binder on successful start of Draw
                    method="POST";
                    url="upload_file2binder.php?binderid="+event.binder_id+"&access_token=<?php echo $access_token; ?>";
                    callFileUpload(url);
                },
                error: function(event) {
                    console.log("error code: " + event.error_code + " message: " + event.error_message);
                },
                stop_annotate: function(event) {
                    console.log("Share URL: " + event.share_url + " Binder ID: " + event.binder_id + " Download URL: " + event.download_url);
                }
            };
            Moxtra.annotate(draw_options);
        }
        </script>
 
        <!-- Ajax call to upload the file to annotate -->
        <script type="text/javascript">
        function callFileUpload(url) {
            var httpc = new XMLHttpRequest();
            httpc.open("POST", url, true);
            httpc.send(null);
        }
        </script>
 
    </body>
</html>