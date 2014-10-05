
var url = "https://lh6.ggpht.com/fR_IJDfD1becp10IEaG2ly07WO4WW0LdZGUaNSrscqpgr9PI53D3Cp0yd2dXOgyux8w=w300";
var name = "dropbox_icon.jpg";

pictures = ["http://cs.kennesaw.edu/images/rotating/cddept_450x300.jpg",
            "http://www.revisionbuddies.com/wp-content/uploads/2013/10/computer-science.jpg",
            "http://educationcareerarticles.com/wp-content/uploads/2013/01/Computer-Science-Program.jpg",
            "http://www.ukessays.co.uk/images/essays/computer-science-essays.jpg"
            ];
names = ["finger", "globe", "laptop", "transistor"];
// TODO ADD METHODS TO GET PICTURE URL AND NAME STRINGS

index = Math.random() * 4;
index = Math.floor(index);

url = pictures[index];
name = names[index];

console.log(index + " "  +url +  " hi " + name);

var options = {
  files:[{'url':url, 'filename':name}],
  success: function() {
    console.log("success");
  },
  progress: function(progress) {
      progress = progress.toFixed(2);
      progress = progress * 100;
      console.log(progress + "% done");
  },
  cancel: function() {
    console.log("cancelled");
  },
  error: function(errormessage) {
    console.log(errormessage);
  }
};

  var button = Dropbox.createSaveButton(options);
  document.getElementById("downloadButton").appendChild(button);