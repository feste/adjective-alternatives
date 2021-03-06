function caps(a) {return a.substring(0,1).toUpperCase() + a.substring(1,a.length);}
function uniform(a, b) { return ( (Math.random()*(b-a))+a ); }
function showSlide(id) { $(".slide").hide(); $("#"+id).show(); }
function shuffle(v) { newarray = v.slice(0);for(var j, x, i = newarray.length; i; j = parseInt(Math.random() * i), x = newarray[--i], newarray[i] = newarray[j], newarray[j] = x);return newarray;} // non-destructive.
function sample(v) {return(shuffle(v)[0]);}
function rm(v, item) {if (v.indexOf(item) > -1) { v.splice(v.indexOf(item), 1); }}
function rm_sample(v) {var item = sample(v); rm(v, item); return item;}
var startTime;

//27 boy names
var names = ["Alex", "Ben", "Calvin", "David", "Eric", "Fred", "George", "Harry", "Ivan", "Jake", "Kyle", "Larry", "Mike", "Nathan", "Oliver", "Peter", "Rick", "Sam", "Trevor", "Victor", "Will", "Xavior", "Zach", "Adam", "Brian", "Chris", "Daniel"];
var domains = ["height", "age", "price"];
var items = {
  height: ["tree", "mountain", "building"],
  age: ["New Yorker", "new parent", "college student"],
  price: ["coffee maker", "laptop", "watch"]
}
var values = {
  height: {
    tree: ["40ft", "50ft", "100ft"],
    mountain: ["5,000ft", "10,000ft", "20,000ft"],
    building: ["100ft", "200ft", "1,000ft"]
  },
  age: {
    "New Yorker": ["45", "60", "80"],
    "new parent": ["35", "45", "60"],
    "college student": ["30", "40", "60"]
  },
  price: {
    "coffee maker": ["$100", "$200", "$300"],
    laptop: ["$1,000", "$2,000", "$3,000"],
    watch: ["$500", "$1,000", "$3,000"]
  },
}

var trials = [];

for (var i=0; i<domains.length; i++) {
  var domain = domains[i];
  for (var j=0; j<3; j++) {
    var item = items[domain][j];
    for (var k=0; k<3; k++) {
      var value = values[domain][item][k];
      trials.push({dom: domain, item:item, val:value});
    }
  }
}

var nQs = trials.length;

$(document).ready(function() {
  showSlide("consent");
  $("#mustaccept").hide();
  startTime = Date.now();
});

var experiment = {
  data: {},
  
  instructions: function() {
    if (turk.previewMode) {
      $("#instructions #mustaccept").show();
    } else {
      showSlide("instructions");
      $("#begin").click(function() { experiment.trial(0); })
    }
  },
  
  trial: function(qNumber) {
    $('.bar').css('width', ( (qNumber / nQs)*100 + "%"));
    var trialData = {};
    $(".err").hide();
    $("#numError").hide();
    showSlide("trial");

    var trial = rm_sample(trials);
    var domain = trial.dom;
    var item = trial.item;
    var value = trial.val;
    var name = rm_sample(names);

    $(".domain").html(domain);
    $(".item").html(item);
    $(".value").html(value);
    $(".name").html(name);

    trialData["name"] = name;
    trialData["item"] = item;
    trialData["domain"] = domain;
    trialData["value"] = value;

    var nExtraResponses = 0;

    $(".continue").click(function() {
      var response = $("#response").val();
      if (response.length > 0) {
        var isNumber = /[0-9]|(two|thousand|eighty|sixty|forty|five|four)/.test(response);
        if (!isNumber) {
          $(".continue").unbind("click");
          $("#addAnAnswer").unbind("click");
          $(".err").hide();
          trialData["extraResponses"] = [];
          for (var i=0;i<nExtraResponses;i++) {
            var extraResponse = $("#response" + i).val();
            trialData["extraResponses"].push(extraResponse)
          }
          $("#moreAnswers").html("");
          trialData["response"] = response;
          experiment.data["trial" + qNumber] = trialData;
          $("#response").val("");
          if (qNumber + 1 < nQs) {
            experiment.trial(qNumber+1);
          } else {
            experiment.questionaire();
          }
        } else {
          $("#numError").show();
        }
      } else {
        $(".err").show();
      }
    })

    $("#addAnAnswer").click(function() {
      var baseQ = $("#baseQ").html();
      $("#moreAnswers").append('<p>' + name + ' says, "The ' + item + ' was <input type="text" id="response' + nExtraResponses + '"></input>."</p>');
      nExtraResponses++;
    })
  },
  
  questionaire: function() {
    //disable return key
    $(document).keypress( function(event){
     if (event.which == '13') {
        event.preventDefault();
      }
    });
    //progress bar complete
    $('.bar').css('width', ( "100%"));
    showSlide("questionaire");
    $("#formsubmit").click(function() {
      rawResponse = $("#questionaireform").serialize();
      pieces = rawResponse.split("&");
      var age = pieces[0].split("=")[1];
      var lang = pieces[1].split("=")[1];
      var comments = pieces[2].split("=")[1];
      if (lang.length > 0) {
        experiment.data["language"] = lang;
        experiment.data["comments"] = comments;
        experiment.data["age"] = age;
        var endTime = Date.now();
        experiment.data["duration"] = endTime - startTime;
        showSlide("finished");
        setTimeout(function() { turk.submit(experiment.data) }, 1000);
      }
    });
  }
}
  
