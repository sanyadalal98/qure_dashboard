(function(global){
	function getData(qType, cb){
		var auth = "";
		var url = "https://content.dropboxapi.com/2/files/download"
		var today = new Date();
		var string1 = today.getDate() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + today.getFullYear();
		var yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		var string2 = yesterday.getDate() + "-" + ("0" + (yesterday.getMonth() + 1)).slice(-2) + "-" + yesterday.getFullYear();
		if(qType == "qXR"){	
			var folder = "/CXR-Reports/";
			var path1 = folder + string1 + ".csv";
			var path2 = folder + string2 + ".csv";
			jQuery.ajax({
				type: 'POST',
				url: url,
				headers:{
					'Authorization': auth,
					'Dropbox-API-Arg': JSON.stringify({"path": path1})
				},
				success: function(data, textStatus, jqXHR){
					cb(csvJSON(data));
				},
				error: function(jqXHR, exception){
					if(jqXHR.status == 409){
						jQuery.ajax({
							type: 'POST',
							url: "https://content.dropboxapi.com/2/files/download",
							headers:{
								'Authorization': auth,
								'Dropbox-API-Arg': JSON.stringify({"path": path2})
							},
							success: function(data, textStatus, jqXHR){
								cb(csvJSON(data));
							}
						});
					}
					
				}
			});
		}
		
		else if (qType == "qER"){
    		var folder = "/qER-Reports/";
			var path1 = folder + string1 + ".csv";
			var path2 = folder + string2 + ".csv";
			jQuery.ajax({
				type: 'POST',
				url: url,
				headers:{
					'Authorization': auth,
					'Dropbox-API-Arg': JSON.stringify({"path": path1})
				},
				success: function(data, textStatus, jqXHR){
					cb(csvJSON(data));
				},
				error: function(jqXHR, exception){
					if(jqXHR.status == 409){
						jQuery.ajax({
							type: 'POST',
							url: "https://content.dropboxapi.com/2/files/download",
							headers:{
								'Authorization': auth,
								'Dropbox-API-Arg': JSON.stringify({"path": path2})
							},
							success: function(data, textStatus, jqXHR){
								cb(csvJSON(data));
							}
						});
					}
					
				}
			});
		}

		else if(qType == "onsite"){
			jQuery.ajax({
				type: 'POST',
				url: url,
				headers:{
					'Authorization': auth,
					'Dropbox-API-Arg': JSON.stringify({"path": "/Onsite-Reports/onsite.csv"})
				},
				success: function(data, textStatus, jqXHR){
					cb(csvJSON(data));
				},
			});
		}
	}

	function csvJSON(csv){
		return global.csv({
			output: "csv"
		})
		.fromString(csv)
		.then(function(result){
			return result;
		})

	}

	global.getData = getData;
})(window);
