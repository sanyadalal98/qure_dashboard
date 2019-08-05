//navbar button functions
$(function(){
	//button handling
	$(".navbar-toggler").blur(function (event) {
    	var screenWidth = window.innerWidth;
    	if (screenWidth <= 991) {
      		$("#navbarNav").collapse('hide');
    	}
  	});

  	$(".navbar-toggler").click(function (event) {
    	$(event.target).focus();
  	});

  	/**function initMap(){
		var locations = [
			["India", 28.7041, 77.1025],
			["Phillipines", 14.5995 , 120.9842]
		];
		var bounds = new google.maps.LatLngBounds();
		var mapOptions = {
        	mapTypeId: 'roadmap',
        	//center: {lat: 19.0760, lng: 72.8777},
    	};
		var map = new google.maps.Map(document.getElementById("map"), mapOptions);
		for(var i = 0; i < locations.length; i++){
			var position = new google.maps.LatLng(locations[i][1], locations[i][2]);
			bounds.extend(position);
			var marker = new google.maps.Marker({
				position: position,
				map: map,
				title: locations[i][0]
			});
			map.fitBounds(bounds);
		}
		var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        	this.setZoom(14);
        	google.maps.event.removeListener(boundsListener);
    	});
	}
	**/
});

(function(global){

	var startDate = new Date(2018, 5, 20);

	var diffBetweenDays = function(aDate){
		var oneDay = 24*60*60*1000;
		var today = new Date();
		return (Math.round(Math.abs((aDate.getTime() - today.getTime())/(oneDay))));
	}

	//all these clients are counted as one client
	var misc = ["stardigital", "stardigital.path" ,"samarpan", "shrisai.path", "parate", "abhinav_ngp","ramdev", "path_unmapped", "vision.path"];
	var qureTesting = ["devqure", "testing", "scanportal", "Source object"];

	var aiTbPositive = function(data){		
		var total = 0;
		for(var entry in data){
			total += parseInt(data[entry][3]);
		}
		document.getElementById("tb-positive").innerHTML = total;
		return total;
	}

	var totalScans = function(data){
		var total = 0;
		for(var entry in data){
			total += parseInt(data[entry][2]);
		}
		return total;
	}

	var runTimeqXR = function(data){
		var n = 0;
		var rtime = 0;
		for(var entry in data){
			var procTime = parseInt(data[entry][4]);
			if(procTime <= 120){
				rtime += (procTime * parseInt(data[entry][2]));
				n += parseInt(data[entry][2]);
			}
		}
		rtime = (rtime/n);
		document.getElementById("runtime-qXR").innerHTML = rtime.toFixed(2) + "s";
	}

	var runTimeqER = function(data){
		var n = 0;
		var rtime = 0;
		for(var entry in data){
			var procTime = parseInt(data[entry][3]);
			if(procTime > 0){
				rtime += (procTime * parseInt(data[entry][2]));
				n += parseInt(data[entry][2]);
			}
		}
		rtime = (rtime/n);
		document.getElementById("runtime-qER").innerHTML = rtime.toFixed(2) + "s";
	}

	var qXRCalc = function(data, possData){
		var total = 22625 + totalScans(data);
		var parts = possData.split(" ");
		total += parseInt(parts[0]);
		aiTbPositive(data);
		document.getElementById("total-qXR").innerHTML = total;
		runTimeqXR(data); 
	}

	var qERCalc = function(data, possData){
		var total = 561 + totalScans(data);
		var parts = possData.split(" ");
		total += parseInt(parts[1]);
		document.getElementById("total-qER").innerHTML = total;
		runTimeqER(data);
	}

	function onsiteSum(data){
		var qER = 0;
		var qXR = 0;
		for(var entry in data){
			if((data[entry][2] == "qER") ||(data[entry][2] == "qCHECK-qER")){
				qER += parseInt(data[entry][3]);
			}
			if((data[entry][2] == "qXR") ||(data[entry][2] == "qCHECK-qXR")){
				qXR += parseInt(data[entry][3]);
			}
		}
		return (qXR + " " + qER);
	}

	var avgScans = function(data1, data2, possData){
		var parts = possData.split(" ");
		var total = totalScans(data1) + totalScans(data2) + parseInt(parts[0]) + parseInt(parts[1]);
		var avg = (total/(diffBetweenDays(startDate)));
		document.getElementById("avg-scans").innerHTML = avg.toFixed(2);
	}

	var createDictionary = function(data, arr){
		var dictionary = [];
		var repeats = ["accesstb_unmapped","fivecqure"]
		for(var entry in data){
			var clientName = data[entry][1];
			if((repeats.includes(clientName)) || (qureTesting.includes(clientName))) continue; // ignored because they exist under a different name
			if(misc.includes(clientName)){
				clientName = "Miscellaneous";
			}
			var today = new Date();
			var timeParts = data[entry][0].split('-');
			var date = new Date(parseInt(timeParts[0]), parseInt(timeParts[1]), 0);
			if((date.getMonth() == today.getMonth()) && (date.getFullYear() == today.getFullYear())){
					date = today;
			}
			if(!dictionary.some(e => e.date === date)){
				dictionary.push({date: date, clients:[clientName]});
			}
			if(dictionary.some(e => e.date === date)){
				if(!dictionary.some(e => e.clients.includes(clientName))){
					e.clients.push(clientName);
				}
			}
		}
		//sort dictionary by date
		dictionary.sort(function(a, b) {
  			 return new Date(a.date).getTime() - new Date(b.date).getTime() 
		});
		//add clients cumulatively
		for(var i = 1; i < dictionary.length; i++){
			for(client in dictionary[i-1].clients){
				if(!dictionary[i].clients.includes(dictionary[i-1].clients[client])){
					dictionary[i].clients.push(dictionary[i-1].clients[client]);
				}
			}
		}

		//remove repeated points
		for(var j = 0 ; j < 10; j ++){
			for(var i = 0; i < dictionary.length - 1; i++){
				if(dictionary[i].date.getTime() === dictionary[i+1].date.getTime()){
					dictionary.splice(i,1);
				}
			}
		}

		//send points to array of points
		for(var i = 0; i < dictionary.length; i++){
			var xPoint = dictionary[i].date;
			var yPoint = dictionary[i].clients.length;
			arr.push({t: xPoint, y: yPoint});
		}
	}

	var makeChart = function(data1, data2){
		var dataPointsqER = [];
		var dataPointsqXR = [];
		createDictionary(data1, dataPointsqXR);
		createDictionary(data2, dataPointsqER);
		var markedPoints = [];
		for(var i = 0; i < dataPointsqXR.length; i++){
			markedPoints.push(dataPointsqXR[i].t)
		}
		var ctx = document.getElementById("client-graph").getContext("2d");
		var myChart = new Chart(ctx, {
			type: 'line',
			data:{
				labels: markedPoints,
				datasets: [{
					label: 'qXR',
					borderColor: 'rgba(52, 152, 219, 1)',
					backgroundColor: 'rgba(52, 152, 219, 0.3)',
					fill: false,
					data: dataPointsqXR,

				},
				{
					label: 'qER',
					borderColor: 'rgba(245, 176, 65, 1)',
					backgroundColor: 'rgba(245, 176, 65, 0.3)',
					fill: false,
					data: dataPointsqER,

				}]
			},
			options: {
				scales: {
					xAxes: [{
						type: 'time',
						time: {
							unit: 'month',
							unitStepSize: 1,
							displayFormats:{
								month: 'MMM YYYY'
							}
						},
						ticks:{
							callback: function(dataLabel, index){
								return index % 4 === 0 ? dataLabel : ''; 
							}
						},
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					}],
					yAxes: [{
						scaleLabel:{
							display: true,
							labelString: 'Number of clients'
						},
						ticks: {
							suggestedMax: 40
						}
					}]
				}
			}
		});
	}

	var qERdict = {};
	var qXRdict = {};

	//each pair of clients in repeated clients is ONE client that exists under 2 names => it needs to be merged
	var mergeClients = function(){
		var repeatedClients = ["accesstb", "accesstb_unmapped", "fivec", "fivecqure"];
		for(var n = 0; n < repeatedClients.length - 1 ; n+=2){
			var start2 = qXRdict[repeatedClients[n+1]].start;
			var last2 = qXRdict[repeatedClients[n+1]].last;
			if(start2 < qXRdict[repeatedClients[n]].start){
				qXRdict[repeatedClients[n]].start = start2;
			}
			if(last2 > qXRdict[repeatedClients[n]].last){
				qXRdict[repeatedClients[n]].last = last2;
			}
			qXRdict[repeatedClients[n]].uploads = qXRdict[repeatedClients[n]].uploads + qXRdict[repeatedClients[n+1]].uploads;
			qXRdict[repeatedClients[n]].avg = ((qXRdict[repeatedClients[n]].uploads)/(diffBetweenDays(qXRdict[repeatedClients[n]].start))).toFixed(2)
			delete qXRdict[repeatedClients[n+1]];
		}
	}
	

	var makeTable = function(data1, data2){
		//data2 is qER
		for(var entry in data2){
			var clientName = data2[entry][1];
			if(qureTesting.includes(clientName)) continue;
			var datePieces = data2[entry][0].split('-');
			var date = new Date(parseInt(datePieces[0]), (parseInt(datePieces[1]) - 1), parseInt(datePieces[2]));
			if(qERdict[clientName] === undefined){
				qERdict[clientName] = {};
				if((clientDetails[clientName] !== undefined) && (clientDetails[clientName].fullName.length > 1)){
					qERdict[clientName].name = clientDetails[clientName].fullName;
				}
				else{
				qERdict[clientName].name = clientName;
				}
				if((clientDetails[clientName] !== undefined) && (clientDetails[clientName].country.length > 1)){
					qERdict[clientName].location = clientDetails[clientName].country;
				}
				else{
					qERdict[clientName].location = "";
				}
				qERdict[clientName].start = date;
				qERdict[clientName].last = date;
				qERdict[clientName].type = "qER";
				qERdict[clientName].uploads = parseInt(data2[entry][2]);
				var avgScans = (parseInt(qERdict[clientName].uploads))/(diffBetweenDays(date));
				qERdict[clientName].avg = avgScans.toFixed(2);
			}
			else if(qERdict[clientName] !== undefined){
				qERdict[clientName].uploads += parseInt(data2[entry][2]);
				if(qERdict[clientName].start > date){
					qERdict[clientName].start = date;
				}
				if(qERdict[clientName].last < date){
					qERdict[clientName].last = date;
				}
				qERdict[clientName].avg = ((qERdict[clientName].uploads)/(diffBetweenDays(qERdict[clientName].start))).toFixed(2);
			}
		}
		//data1 is qXR
		for(var entry in data1){
			var clientName = data1[entry][1];
			if(qureTesting.includes(clientName)) continue;
			if(misc.includes(clientName)){
				clientName = "Others: PATH";
			}
			var datePieces = data1[entry][0].split('-');
			var date = new Date(parseInt(datePieces[0]), (parseInt(datePieces[1]) - 1), parseInt(datePieces[2]));
			if(qXRdict[clientName] === undefined){
				qXRdict[clientName] = {};
				if((clientDetails[clientName] !== undefined) && (clientDetails[clientName].fullName.length > 1)){
					qXRdict[clientName].name = clientDetails[clientName].fullName;
				}
				else{
				qXRdict[clientName].name = clientName;
				}
				if((clientDetails[clientName] !== undefined) && (clientDetails[clientName].country.length > 1)){
					qXRdict[clientName].location = clientDetails[clientName].country;
				}
				else{
					qXRdict[clientName].location = "";
				}
				qXRdict[clientName].start = date;
				qXRdict[clientName].last = date;
				qXRdict[clientName].type = "qXR";
				qXRdict[clientName].uploads = parseInt(data1[entry][2]);
				var avgScans = parseInt(qXRdict[clientName].uploads)/(diffBetweenDays(date));
				qXRdict[clientName].avg = avgScans.toFixed(2);
			}
			else if(qXRdict[clientName] !== undefined){
				qXRdict[clientName].uploads = parseInt(qXRdict[clientName].uploads) + parseInt(data1[entry][2]);
				if(qXRdict[clientName].start > date){
					qXRdict[clientName].start = date;
				}
				if(qXRdict[clientName].last < date){
					qXRdict[clientName].last = date;
				}
				qXRdict[clientName].avg = (parseInt(qXRdict[clientName].uploads)/(diffBetweenDays(qXRdict[clientName].start))).toFixed(2);
			}
		}
		//merge repeated qXR clients
		mergeClients();

		//sort by most active client to least active client
		
		qXRdict = Object.keys(qXRdict).sort(function(a, b){
  			return new Date(qXRdict[b].last).getTime() - new Date(qXRdict[a].last).getTime(); 
		}).reduce(function(acc, key){
			acc[key] = qXRdict[key];
			return acc;
		}, {});

		//maybe qXR[a]

		qERdict = Object.keys(qERdict).sort(function(a, b){
  			return new Date(qERdict[b].last).getTime() - new Date(qERdict[a].last).getTime(); 
		}).reduce(function(acc, key){
			acc[key] = qERdict[key];
			return acc;
		}, {});


		var i = 1;
		var html = "";
		for(var client in qXRdict){
			var timeParts = qXRdict[client].last.toString().split(' ');
			html += "<tr>";
			html += "<th scope='row'>" + i + "</th>";
			html += "<td>" + qXRdict[client].name + "</td>";
			html += "<td>" + qXRdict[client].location + "</td>";
			html += "<td class='text-center'><i class='fa fa-check' aria-hidden='true'></i></td>";
			html += "<td></td>";
			html += "<td>" + qXRdict[client].uploads + "</td>";
			html += "<td>" + qXRdict[client].avg + "</td>";
			html += "<td>" + timeParts[0] +" "+ timeParts[1] +" "+ timeParts[2] +" "+ timeParts[3] + "</td>";
			html += "</tr>";
			i++;
		}
		for(var client in qERdict){
			var timeParts = qERdict[client].last.toString().split(' ');
			html += "<tr>";
			html += "<th scope='row'>" + i + "</th>";
			html += "<td>" + qERdict[client].name + "</td>";
			html += "<td>" + qERdict[client].location + "</td>";
			html += "<td></td>"
			html += "<td class='text-center'><i class='fa fa-check' aria-hidden='true'></i></td>";
			html += "<td>" + qERdict[client].uploads + "</td>";
			html += "<td>" + qERdict[client].avg + "</td>";
			html += "<td>" + timeParts[0] +" "+ timeParts[1] +" "+ timeParts[2] +" "+ timeParts[3] + "</td>";
			html += "</tr>";
			i++;
		}
		document.getElementById('insertHere').innerHTML = html;
	}

	function makeTable2(data){
		var onsiteTable = {};
		for(var entry in data){
			var source = data[entry][0];
			onsiteTable[source] = {};
			onsiteTable[source].name = source;
			onsiteTable[source].location = data[entry][1];
			onsiteTable[source].type = data[entry][2];
			onsiteTable[source].uploads = data[entry][3];
		}

		onsiteTable = Object.keys(onsiteTable).sort().reduce(function(acc, key){
			acc[key] = onsiteTable[key];
			return acc;
		}, {});

		var i = 1;
		var html = "";
		for(var client in onsiteTable){
			html += "<tr>";
			html += "<th scope='row'>" + i + "</th>";
			html += "<td>" + onsiteTable[client].name + "</td>";
			html += "<td>" + onsiteTable[client].location + "</td>";
			if(onsiteTable[client].type == "qXR") {
				html += "<td class='text-center'><i class='fa fa-check' aria-hidden='true'></i></td>";
				html += "<td></td>";
				html += "<td></td>";
			}
			else if(onsiteTable[client].type == "qCHECK-qXR") {
				html += "<td class='text-center'><i class='fa fa-check' aria-hidden='true'></i></td>";
				html += "<td></td>";
				html += "<td class='text-center'><i class='fa fa-check' aria-hidden='true'></i></td>";
			}
			else if(onsiteTable[client].type == "qER"){
				html += "<td></td>";
				html += "<td class='text-center'><i class='fa fa-check' aria-hidden='true'></i></td>";
				html += "<td></td>";
			}
			else{
				html += "<td></td>";
				html += "<td class='text-center'><i class='fa fa-check' aria-hidden='true'></i></td>";
				html += "<td class='text-center'><i class='fa fa-check' aria-hidden='true'></i></td>";
			}
			html += "<td>" + onsiteTable[client].uploads + "</td>";
			html += "</tr>";
			i++;
		}
		document.getElementById('insertHere2').innerHTML = html;
	}

	function makeCall(qType) {
  		var promise = new Promise(function(resolve, reject) {
    		getData(qType, function(result) {
      			resolve(result)
    		});    
  		})
  		return promise;
	}

	document.addEventListener("DOMContentLoaded", function(event){
		Promise.all([
  			makeCall("qXR"),
  			makeCall("qER"),
  			makeCall("onsite")
		])
		.then((results => {
			qXRCalc(results[0], onsiteSum(results[2]));
			qERCalc(results[1], onsiteSum(results[2]));
			avgScans(results[0], results[1], onsiteSum(results[2]));
			makeChart(results[0], results[1]);
			makeTable(results[0], results[1]);
			makeTable2(results[2]);

		}));
  	});

})(window);