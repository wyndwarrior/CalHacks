// function load() {
  var options = {
    files : 
      [{'url' : "https://lh6.ggpht.com/fR_IJDfD1becp10IEaG2ly07WO4WW0LdZGUaNSrscqpgr9PI53D3Cp0yd2dXOgyux8w=w300",
       'filename' : 'Sample picture'}],
    success: function() {
      console.log("all files saved");
    },
    progress: function(progress) {
      progress = progress * 100;
      progress = progress.toFixed(2);
      console.log(progress + "% done");
    },
    cancel: function() {
      console.log("User cancelled upload");
    },
    error: function() {
      console.log("Something went wrong with the upload");
    }
  }
  var button = Dropbox.createSaveButton(options);
  document.getElementById("dropboxButton").appendChild(button);
// }