var date = new Date();

var day = date.getDate();
var month = date.getMonth()+1;  //+1 because for some reason the months start counting from 0
var year = date.getFullYear();

//defaults to today
var customDate = day+"."+month+"."+year;

//checks if the number is less than 10 and then adds a zero in front
var hours = (date.getHours()<10?'0':'') + date.getHours();
var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();

//puts the time in XX:XX format
var time = hours+":"+minutes;

//functions that happen onload
document.body.onload = function(){
  theatreAreas();
  animation();
}

//function that converts xml to json
// https://davidwalsh.name/convert-xml-json
// Changes XML to JSON
function xmlToJson(xml) {

	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

//creates the select menu for theatres
function theatreAreas() {
  var api ="http://www.finnkino.fi/eng/xml/TheatreAreas/";
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", api, true);
  xmlhttp.send();
  xmlhttp.onreadystatechange = function() {
    if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var xmlDoc = xmlhttp.responseXML;

      //takes the values from the finnkino api
      var theatreId = xmlDoc.getElementsByTagName("ID");
      var theatre = xmlDoc.getElementsByTagName("Name");

      var list = "<select id='areaList' class='custom-select' onchange='if(this.selectedIndex)chooseArea();'>";

      //creates the select menu
      for(i = 0; i < theatre.length; i++) {
          list += "<option value='"+theatreId[i].childNodes[0].nodeValue+"'>"+theatre[i].childNodes[0].nodeValue+"</option>";
      }
      list += "</select>";

      //puts the menu into the theatres span
      $("#theatres").html(list);

      //fades in the menus
      $('#menu').fadeIn(1000);

    }
  }
  dateList();
}

//creates the date select menu
function dateList(){
  var api = "http://www.finnkino.fi/xml/ScheduleDates/"
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", api, true);
  xmlhttp.send();
  xmlhttp.onreadystatechange = function() {
      if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var xmlDoc = xmlhttp.responseXML;
        var json = xmlToJson(xmlDoc); //converts xml to json

        var list = "<select id='dateList' class='custom-select' onchange='if(this.selectedIndex)chooseArea();'>";
        var dates = json.Dates.dateTime;

        //creates the select menu
        list += "<option value=''>Choose date</option>";
        for(i = 0; i < dates.length; i++){

          //searches the date substrings from the api
          var date = dates[i]["#text"];
          var year = date.substring(0,4);
          var month = date.substring(5,7);
          var day = date.substring(8,10);
          var fullDate = day+'.'+month+'.'+year;

          //creates the options
          list += "<option value='"+fullDate+"'>"+fullDate+"</option>";
        }
        list += "</select>";

        //puts the date select into the menu
        $("#dates").html(list);
      }
  }
  timeList();
}


//creates the time select menu
function timeList(){
  var list = "<select id='timeList' class='custom-select' onchange='if(this.selectedIndex)chooseTime();'>";
  list += "<option value=''>Choose starting time</option>";

  for(var i=8; i<=24; i++){
    var forTime = (i<10?'0':'')+i+":00";

    //if i is 24 it will write 00:00 instead
    if(forTime=="24:00"){
      list += "<option value='00:00'>00:00</option>";
    }else{
      list += "<option value='"+forTime+"'>"+forTime+"</option>";
    }
  }
  list += "</select>";

  //puts the time select into menu
  $("#times").html(list);
}

//function for selecting the time
function chooseTime(){
  var timeList = document.getElementById("timeList");
  var timeSelect = timeList.options[timeList.selectedIndex].value;

  //changes time to the selected value
  time=timeSelect;
  chooseArea();
}



function chooseArea(){

  //value from theatre select
  var list = document.getElementById("areaList");
  var select = list.options[list.selectedIndex].value;

  //value from date selecr
  var dateList = document.getElementById("dateList");
  var dateSelect = dateList.options[dateList.selectedIndex].value;

  //defaults date to today
  if(dateSelect==""){
    dateSelect = customDate;
  }

  //api changes based on users selections
  var api = "http://www.finnkino.fi/eng/xml/Schedule/?area="+select+"&dt="+dateSelect;

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", api, true);
  xmlhttp.send();
  xmlhttp.onreadystatechange = function() {

      if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var xmlDoc = xmlhttp.responseXML;
        var json = xmlToJson(xmlDoc); //converts xml to json

        var show = json.Schedule.Shows.Show;

        var list = "<table id='movieTable' class='table'>";

        //creates the movie table based on api data
        for(var i=0; i < show.length; i++){

          //searching data from api

          var img = show[i].Images.EventSmallImagePortrait["#text"];
          var title = show[i].Title["#text"];
          var theatre = show[i].TheatreAndAuditorium["#text"];
          var start = show[i].dttmShowStart["#text"];

          //gets the substring for start time in XX:XX form
          var startSub = start.substring(11,16);
          var end = show[i].dttmShowEnd["#text"];

          //gets the substring for end time in XX:XX form
          var endSub = end.substring(11,16);
          var rating = show[i].Rating["#text"];
          var type = show[i].EventSeries["#text"];
          var showUrl = show[i].EventURL["#text"];
          var genre = show[i].Genres["#text"];

          //if a time isn't selected, defaults to current time
          if(startSub>time){
            list += '<tr>';
            list += '<td><img src="'+img+'"></td>';
            list += '<td>';

            //checks ratings from api and creates icons based on the values
            if(rating=="S"){
              list += '<li><h3>'+title+' <span class="text-success">&#9416;</span></h3></li>';
            }else if(rating==7){
              list += '<li><h3>'+title+' <span class="text-success">&#9318;</span></h3></li>';
            }else if(rating==12){
              list += '<li><h3>'+title+' <span class="text-warning">&#9323;</span></h3></li>';
            }else if(rating==16){
              list += '<li><h3>'+title+' <span class="text-warning">&#9327;</span></h3></li>';
            }else if(rating==18){
              list += '<li><h3>'+title+' <span class="text-danger">&#9329;</span></h3></li>';
            }else{
              list += '<li><h3>'+title+' </h3></li>';
            }

            list += '<li>'+dateSelect+', '+startSub+'-'+endSub+'</li>';
            list += '<li>'+theatre+'</li>';

            //checks if there is one or more genres
            if(genre.indexOf(",")!=-1){
              list += '<li>Genres: '+genre+'</li>';
            }else{
              list += '<li>Genre: '+genre+'</li>';
            }

            list += '</td>';

            //creates a button that redirects to the movie page on finnkino
            list += '<td><a href="'+showUrl+'" class="btn btn-outline-success" role="button" target="_blank">View at Finnkino</a></td>';
            list += '</tr>';
            }
          }

          list+="</table>";

          //puts the table into the info span
          $("#info").html(list);

          //fade animation
          $('#movieTable').fadeIn(1000);

        //if there's nothing on movieTable, it will give an error
        if($('#movieTable').is(':empty')){
          $('#info').html("Sorry, we couldn't find anything to match your search...");
          $('#info').fadeIn(1000);
        }
      }
  }
}

function animation(){
  $('.container').fadeIn(1000);
}
