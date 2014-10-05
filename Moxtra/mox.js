
function randStr(){
	var s = "gobears";
	var str = "";
	for(var i = 0; i<10; i++)
		str += s.charAt(Math.floor(s.length * Math.random()));
	return str;
}


var client_id = "r0QI6GjJbaI";
var client_secret = "kRKfGYmyDR0";
var timestamp = new Date().getTime();
var unique_id = randStr();

var hash = CryptoJS.HmacSHA256(client_id + unique_id + timestamp, client_secret);
var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
var signature = hashInBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');


function getToken() {
	var init_options = {
	    uniqueid: unique_id,
	    firstname: "Golden",
	    lastname: "Bear (" + new Date().getTime()%100+ ")",
	    timestamp: timestamp,
	    signature: signature,
	    get_accesstoken: function(result) {
	        console.log("access_token " + result.access_token);
	        console.log("access_token: " + result.access_token + " expires in: " + result.expires_in);
	        startmox(result.access_token);
	    },
	    error: function(result) {
	        console.log("error code: " + result.error_code + " message: " + result.error_message);
	    }
	};
	Moxtra.setup(init_options);
}

function startmox(access_token) {
    var options = {
        iframe: true,
        extension: { "show_dialogs": { "meet_invite": true } },
        tagid4iframe: "container",
        iframewidth: (window.innerWidth-3)+"px",
        iframeheight: window.innerHeight+"px",
        access_token: access_token,
        start_meet: function(event) {
        	$("#status").html("Key: " + event.session_key);
        	//console.log(event.session_key);
            //alert("session key: " + event.session_key + " session id: " + event.session_id + " binder id: " + event.binder_id);
        },
        error: function(event) {
            //alert("error code: " + event.error_code + " message: " + event.error_message);
        },
        end_meet: function(event) {
            //alert("Meet end event");
        }
    };
    Moxtra.meet(options);
}

function joinmox() {
    var options = {
        session_key: prompt("Session Key:",""),
        user_name: prompt("Name:",""),
        iframewidth: (window.innerWidth-3)+"px",
        iframeheight: window.innerHeight+"px",
        iframe: true,
        extension: { "show_dialogs": { "meet_invite": true } },
        start_meet: function(event) {
            //alert("session key: " + event.session_key + " session id: " + event.session_id);
        },
        error: function(event) {
            //alert("error code: " + event.error_code + " message: " + event.error_message);
        },
        end_meet: function(event) {
            //alert("Meet ended by host event");
        },
        exit_meet: function(event) {
            //alert("Meet exit event");
        }
    };
    Moxtra.joinMeet(options);
}