<?php
	//Upload file to Binder using Binder ID and Access Token
    $upload_file = "Michael.jpg";
    $target_url = "https://api.moxtra.com/".$_REQUEST['binderid']."/pageupload?file=".$upload_file."&access_token=".$_REQUEST['access_token'];
    $file_name_with_full_path = realpath(getcwd().$upload_file);
    $post = array('file'=>'@'.$file_name_with_full_path);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,$target_url);
    curl_setopt($ch, CURLOPT_POST,1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    $result=curl_exec ($ch);
    curl_close ($ch);
?>