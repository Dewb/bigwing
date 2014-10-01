inlets = 1
outlets = 2

var _api_key = "";
var _filename = "";
var profileData = {};
var analysisData = {};

var me = this.box;
var globalThis = this;
var trackProfileTask = undefined;

function api_key(v) {
	_api_key = v;
}

function track_md5(md5) {
	analyze("md5", md5);
}

function track_id(id) {
	analyze("id", id);
}

function analyze(param, value, filename) {
	if (_api_key == "") {
		post("Echo Nest API key not set!\n");
		return;
	}
	
	if (filename != undefined) {
		post("Analyzing track", filename, "\n");
	}
	_filename = filename;

	if (trackProfileTask != undefined) {
		trackProfileTask.cancel();
	}
	
	trackProfileTask = new Task(function() {
		getTrackProfile(param, value);
	}, globalThis);
	
	trackProfileTask.interval = 3000;
	trackProfileTask.repeat();
}

function getTrackProfile(param, value) {
	post("Requesting track profile for " + param + " " + value + "\n");

	var url = "http://developer.echonest.com/api/v4/track/profile?api_key=" + _api_key + "&format=json&" + param + "=" + value + "&bucket=audio_summary";
	var req = new XMLHttpRequest();
	req.open("GET", url);
	req.onreadystatechange = profileReadyStateChange;
	req.send();
}

function profileReadyStateChange() {
	if (this.readyState == 4) {
	 	profileData = JSON.parse(this.responseText).response;
		analysisData = {};
		updateDictViews();
		
		post("Response:", profileData.status.message, "\n");
		
		var keepTrying = false;
		if (profileData.status.code == 0) {
			post("Analysis status:", profileData.track.status, "\n");
			if (profileData.track.status == "complete") {		
				post(profileData.track.artist + " - " +
			    	profileData.track.title + " (" +
			     	profileData.track.audio_summary.tempo + " bpm)\n");
				me.message("getTrackAnalysis", profileData.track.audio_summary.analysis_url);
			} else {
				keepTrying = true;
			}
		} else if (profileData.status.code == 5) {
			// Unknown identifier, need to upload file for analysis
			if (_filename != undefined && _filename != "") {
				me.message("upload", _filename);
			}
		}
		
		if (!keepTrying) {
			trackProfileTask.cancel();
		}
	}
}

function getTrackAnalysis(url) {
	var req = new XMLHttpRequest();
	req.open("GET", url);
	req.onreadystatechange = analysisReadyStateChange;
	req.send();
	post("Requesting detailed analysis...\n");
}

function analysisReadyStateChange() {
	if (this.readyState == 4) {
		analysisData = JSON.parse(this.responseText);
		updateDictViews();
		
		post("Response:", analysisData.meta.detailed_status, "\n");
		if (analysisData.meta.status_code == 0) {
			post(analysisData.bars.length + " bars", 
			     analysisData.segments.length + " segments",
			     analysisData.tatums.length + " tatums\n");
			
			analysisComplete();
			return;
		}
	}	
}
		
function updateDictViews() {	
	jsobj_to_dict(profileData, new Dict("profile"));
	jsobj_to_dict(analysisData, new Dict("analysis"));
}

function analysisComplete() {
}

function upload(filename) {
	post("Uploading " + filename + " for analysis\n");
	
	var fileType = "wav";
	var req = new XMLHttpRequest();
	var url = "http://developer.echonest.com/api/v4/track/upload?api_key=" + _api_key + "&format=json&filetype=" + fileType;
	req.open("POST", url);
	req.setRequestHeader("Content-Type", "application/octet-stream");
	req._setRequestKey("filename_in", filename);
	req.onreadystatechange = uploadReadyStateChange;
	req.send();		
}

function uploadReadyStateChange() {
	if (this.readyState == 4) {
		var response = JSON.parse(this.responseText).response;
		post("Response:", response.status.message, "\n");
		if (response.status.code == 0) {
			post("Analysis status:", response.track.status, "\n")
			me.message("track_id", response.track.id);
			return;
		}
	}	
}

function jsobj_to_dict(o, d) {
	for (var keyIndex in o)	{
		var value = o[keyIndex];

		if (!(typeof value === "string" || typeof value === "number")) {
			var isEmpty = true;
			for (var anything in value) {
				isEmpty = false;
				break;
			}
			
			if (isEmpty) {
				value = new Dict();
			}
			else {
				var isArray = true;
				for (var valueKeyIndex in value) {
					if (isNaN(parseInt(valueKeyIndex))) {
						isArray = false;
						break;
					}
				}
			
				if (!isArray) {
					value = jsobj_to_dict(value, new Dict());
				} else {
					/*
					value = value.map(function(arrobj) {
						return jsobj_to_dict(arrobj, new Dict());
					});
					*/
				}
			}
		}
		d.set(keyIndex, value);
	}
	return d;
}