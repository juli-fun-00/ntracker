

var PlayerWidth= 1024;
var PlayerHeight= 576;
			


function GazePlayerAPI() {
	//------------------------
	this.Resume = function() {
		replayer.resume(replayer.getCurrentTime());
	}
	//------------------------
	this.Pause = function() {
		replayer.pause();
	}
	//------------------------
	var loadid = null;
	var bisRady = false;
	this._ShowLoadingContent = function(bloading = false) {
		ShowLoadingContent(bloading);
	}
	var _ofsetT = -1;
	var _LastSpeed = 1;

	function ShowLoadingContent(bloading = false) {
		//return;
		try {
			if (loadid == null) loadid = document.getElementById("loadid");
			if (bloading) {
				if (loadid.style.display == 'none') {
					loadid.style.display = 'block';
					bisRady = false;
					//if(false)
					if (replayer != null) {
						_LastSpeed = replayer.config.speed;
						//var aa=  document.getElementById("skip");
						// if(aa.checked)
						if (replayer.config.speed < 4) replayer.config.speed = 4;
					}
					if (false) // tmp skip loading
					{
						_ofsetT = replayer.getTimeOffset();
						replayer.pause();
					}
					window.setTimeout(function() {
						bisRady = true
					}, 2000);
				}
			} else {
				if (loadid.style.display == 'block') {
					//if(false)
					if (replayer != null) {
						replayer.config.speed = _LastSpeed;
					}
					loadid.style.display = 'none';
					if (true) try {
						replayer.iframe.contentWindow.Clearheatmap();
						if (true) {
							window.setTimeout(function() {
								replayer.iframe.contentWindow.Clearheatmap();
							}, 100);
						}
					}
					catch (w) {}
				}
			}
		} catch (e) {}
	}
	let events = []; //= [];
	let GazeResultEvents = []; //= [];
	var replayer = null;
	var __replayer = null;
	var LastTimeR = 0;
	var bReinitHeatMap = false;

	function ReinitHeatMap() {
		bReinitHeatMap = true;
		return;
		try {
			replayer.iframe.contentWindow._Initheatmap(0);
		} catch (e) {}
	}
	///////////////////////////////
	////////////////////process events////////////////////////////////
	var _LastStarttime = 0;

	function GetGazeEventsWin(time, win) {
		var BestIx = 0;
		var BestDif = 99999999999999;
		var fLen = GazeResultEvents.length;
		if (fLen == 0) return null;
		for (i = 0; i < fLen; i++) {
			if (GazeResultEvents[i].time == null) continue;
			if (GazeResultEvents[i].time > time) break;
			var dif = Math.abs(GazeResultEvents[i].time - time);
			if (dif < BestDif) {
				BestDif = dif;
				BestIx = i;
			} else break;
		}
		if (BestDif > 1500) return null;
		var out = [];
		out.push(GazeResultEvents[BestIx]);
		for (i = BestIx; i > 0; i--) {
			if (GazeResultEvents[i].time - time + win < 0) break;
			out.push(GazeResultEvents[i]);
		}
		var data = [];
		return out;
	}
	//---------------------
	function GetGazeEvents(starttime, time) {
		const _maxTdif = 10000;
		if (starttime <= 0) starttime = _LastStarttime;
		if (_LastStarttime > time || time - _LastStarttime > _maxTdif) {
			var out = GetGazeEvent(time);
			if (_LastStarttime == out.time) return null;
			if (out) _LastStarttime = out.time;
			//if(false)
			return [out];
		}
		var BestIx = 0;
		var BestDif = 99999999999999;
		var fLen = GazeResultEvents.length;
		if (fLen == 0) return null;
		for (i = 0; i < fLen; i++) {
			if (GazeResultEvents[i].time == null) continue;
			if (GazeResultEvents[i].time <= _LastStarttime) continue;
			var dif = Math.abs(GazeResultEvents[i].time - starttime);
			if (dif < BestDif) {
				BestDif = dif;
				BestIx = i;
			} else break;
		}
		if (BestDif > _maxTdif) return null;
		var BestIx2 = BestIx;
		var BestDif2 = 99999999999999;
		for (i = BestIx; i < fLen; i++) {
			if (GazeResultEvents[i].time == null) continue;
			var dif = Math.abs(GazeResultEvents[i].time - time);
			if (dif < BestDif2) {
				BestDif2 = dif;
				BestIx2 = i;
			} else break;
		}
		if (BestDif2 > _maxTdif) return null;
		var out = [];
		for (i = BestIx; i <= BestIx2; i++) out.push(GazeResultEvents[i])
		// if(out.length < 2)
		//  return null;
		_LastStarttime = GazeResultEvents[BestIx2].time;
		return out;
	}
	//------------------------------------
	function GetGazeEvent(time) {
		var BestIx = 0;
		var BestDif = 99999999999999;
		var fLen = GazeResultEvents.length;
		if (fLen == 0) return null;
		//if(LastGetGazeEvent == null)
		//  LastGetGazeEvent =  GazeResultEvents[0] ;
		for (i = 0; i < fLen; i++) {
			if (GazeResultEvents[i].time == null) continue;
			if (GazeResultEvents[i].time > time) break;
			var dif = Math.abs(GazeResultEvents[i].time - time);
			if (dif < BestDif) {
				BestDif = dif;
				BestIx = i;
			} else break;
		}
		//if (BestDif > 200) return null;
		if (BestDif > 500) return null;
		var out = GazeResultEvents[BestIx];
		if (false) //smooth
		{
			var out = GazeResultEvents[BestIx];
			var next = GazeResultEvents[BestIx + 1];;
			var t1 = Math.abs(out.time - time);
			var t2 = Math.abs(next.time - time);
			var alfa = t2 / (t1 + t2);
			alfa = alfa * alfa;
			var cp = Object.assign({}, out);
			cp.docX = alfa * cp.docX + (1.0 - alfa) * next.docX;
			cp.docY = alfa * cp.docY + (1.0 - alfa) * next.docY;
			out = cp;
		}
		LastGetGazeEvent = out;
		return out;
	}
	//------------------
	function ShiftStartRec() {
		try {
			var t = null;
			var ix = 0;
			var ixEndSesion = -1;
			for (i = 0; i < events.length; i++)
				if (events[i].type == 13)
			// if(events[i].type == 10)
			{
				ix = i;
				if (true) // next event
					ix++;
				//t = events[ix].timestamp + 100;
				t = events[ix].timestamp - 100;
				break;
			}
			if (t != null)
				for (i = 0; i < ix; i++) events[i].timestamp = t;
			for (i = 0; i < events.length; i++)
				if (events[i].type == 14) {
					ixEndSesion = i;
					break;
				}
			if (ixEndSesion > 0) {
				events = events.slice(0, ixEndSesion);
			}
		} catch (ee) {}
	}
	//-------------------------
	function ShiftLodingTime() {
		try {
			if (true) //extract gaze events
			{
				if (GazeResultEvents.length < 1)
					for (i = 0; i < events.length; i++) {
						if (events[i].type == 20) {
							var Gazeevent = events[i].data;
							GazeResultEvents.push(Gazeevent);
						}
					}
			}
			for (i = 1; i < events.length; i++) {
				if (events[i].type == 4 || events[i].type == 2) {
					var t = events[i].timestamp;
					for (j = i; j >= 0; j--)
						//if (events[j].type == 3) {
						if (events[j].type == 10) {
							t = events[j].timestamp;
							break;
						}
					var d = events[i].timestamp - t;
					t += 500;
					if (events[i].timestamp > t) events[i].timestamp = t; //+1200;
				}
			}
			/*



	for (i = 1; i < events.length; i++) {

		if (events[i].type == 4 || events[i].type == 2) {

			var t = events[i].timestamp;

			for (j = i; j >= 0; j--)

				if (events[j].type == 3) {

					t = events[j].timestamp;

					break;

				}

			var d = events[i].timestamp - t;



            t +=1000;

            if(events[i].timestamp > t)

			        events[i].timestamp = t; //+1200;

		}

	}

    */
			if (true) //gaze duration
			{
				var _min = 200;
				var fLen = GazeResultEvents.length;
				if (fLen == 0) return;
				GazeResultEvents[0].duration = 33;
				GazeResultEvents[fLen - 1].duration = 33;
				for (i = 1; i < fLen - 1; i++) {
					var d1 = GazeResultEvents[i].time - GazeResultEvents[i - 1].time;
					var d2 = GazeResultEvents[i + 1].time - GazeResultEvents[i].time;
					//  GazeResultEvents[i].duration  = (d1 + d2)/2;
					GazeResultEvents[i].duration = d1;
					if (GazeResultEvents[i].duration < _min) _min = GazeResultEvents[i].duration;
					//console.log( i + " d : " +    GazeResultEvents[i].duration);
				}
				for (i = 1; i < fLen - 1; i++)
					if (GazeResultEvents[i].duration > 3 * _min) GazeResultEvents[i].duration = 3 * _min;
			}
		} catch (ee) {}
	}
	//----------------------
	var eventsLoading = [];

	function ProcessLoadingEvents() {
		try {
			//for (i = 1; i < events.length; i++) {
			for (i = 0; i < events.length; i++) {
				if (events[i].type == 10) // ini loading
				{
					events[i].timestamp -= 5; // 50;
					eventsLoading.push(events[i]);
				}
				if (events[i].type == 4) // end loading
				// if(events[i].type == 11 )// end loading
				{
					var cp = Object.assign({}, events[i]);
					cp.type = 11;
					cp.timestamp -= 500;
					eventsLoading.push(cp);
				}
			}
			for (i = 1; i < eventsLoading.length; i++) {
				if (eventsLoading[i].type == 11) {
					if (eventsLoading[i - 1].type == 10)
						if (eventsLoading[i].timestamp <= eventsLoading[i - 1].timestamp) eventsLoading[i].timestamp = eventsLoading[i - 1].timestamp + 100;
				}
			}
			if (true) // loading hide gaze heatmap
			{} // end loading hide gaze
			if (true) //tmp no firtst
				eventsLoading[0].type = 11;
			return;
			for (i = 1; i < events.length; i++) {
				if (events[i].type > 4) {
					if (events[i].type == 10) // ini loading
						events[i].timestamp -= 10; // 50;
					eventsLoading.push(events[i]);
				}
			}
		} catch (ee) {}
	}
	//----------------------
	function isLoading(time) {
		// 10 loadint // 11 finishloading // 12 err loading
		var e = null;
		for (i = 0; i < eventsLoading.length; i++) {
			//if (eventsLoading[i].timestamp > time) break;
			//e = eventsLoading[i];
			if (eventsLoading[i].timestamp > time) break;
			e = eventsLoading[i];
		}
		if (e == null) return false;
		if (e.type != 11) return true;
		return false;
	}

	function GetEndLoadingTime(time) {
		// 10 loadint // 11 finishloading // 12 err loading
		var e = null;
		for (i = 0; i < eventsLoading.length; i++) {
			if (eventsLoading[i].type == 11)
				if (eventsLoading[i].timestamp >= time) {
					e = eventsLoading[i];
					break;
				}
		}
		if (e == null) return time;
		//if (e.type != 11) return true;
		return e.timestamp;
	}
	////////////////////end process events////////////////////////////////
	var PlayerContainer = null;
	this.SetCountainer = function(elem) {
		PlayerContainer = elem;
	}
	//----------------------
	this.PlayResultsData = function(data) {
		try {
			this.FinishPlay();
		} catch (e) {}
		events = data.webevents;
		GazeResultEvents = data.gazeevents;
		ProcessLoadingEvents();
		ShiftLodingTime();
		//ProcessLoadingEvents();
		PlayResults();
	}
	//----
	//===============================
	function lzw_decode(s) {
		var dict = new Map(); // Use a Map!
		var data = Array.from(s + "");
		//var data = (s + "").split("");
		var currChar = data[0];
		var oldPhrase = currChar;
		var out = [currChar];
		var code = 256; //codeInit;
		var phrase;
		for (var i = 1; i < data.length; i++) {
			var currCode = data[i].codePointAt(0);
			if (currCode < 256) {
				phrase = data[i];
			} else {
				phrase = dict.has(currCode) ? dict.get(currCode) : (oldPhrase + currChar);
			}
			out.push(phrase);
			var cp = phrase.codePointAt(0);
			currChar = String.fromCodePoint(cp); //phrase.charAt(0);
			dict.set(code, oldPhrase + currChar);
			code++;
			if (code === 0xd800) {
				code = 0xe000;
			}
			oldPhrase = phrase;
		}
		// if(false)
		//if(bUseUnicode)//decode
		{
			var ss = out.join("");
			var data = (ss + "").split("");
			//var  data = out;//Array.from(back + "");
			var uint8array = new Uint8Array(data.length); //[];// new TextEncoder("utf-8").encode(s);
			for (var i = 0; i < data.length; i++)
				//uint8array.push(data[i].codePointAt(0));
				uint8array[i] = data[i].codePointAt(0);
			var back = new TextDecoder().decode(uint8array);
			return back;
		}
		return out.join("");
	}
	//===============================
	this.PlayResultsGet = function(SesionId) {
		InitGUI();
		ShowLoadingContent(true);
		if (false) {
			var url = 'https://app.gazerecorder.com/GetWebRec.php?SesionID=' + SesionId;
			$.get(url, function(json_string, status) {
				var data = JSON.parse(json_string);
				events = data.webevents;
				GazeResultEvents = data.gazeevents;
				ShiftLodingTime();
				ProcessLoadingEvents();
				PlayResults();
			});
		}
		if (true) //compress
		{
			let req = new XMLHttpRequest();
			var url = "https://app.gazerecorder.com/GetWebRec.php?&compress=1&SesionID=" + SesionId;
			req.open("GET", url);
			req.send(null);
			req.onload = function() {
				var ss = "";
				var s = req.response;
				var back = lzw_decode(s);
				if (true) {
					const space = "} , {";
					// const space = "} , \n{";
					// const space = "}   ,    {";
					var nn = back.length;
					nn++;
					var n = back.lastIndexOf(space);
					//n/=2;
					back = back.substr(0, n + 2);
					s = "[ " + back + "]";
					ss = back;
				} else {
					s = "[ " + back.substring(0, back.length - 2) + "]";
				}
				var data = null;
				try {
					data = JSON.parse(s);
					events = data
				} catch (e) {
					events = [];
					var dd = ss.split("} , ");
					for (i = 0; i < dd.length - 1; i++) {
						try {
							var event = JSON.parse(dd[i] + "}");
							events.push(event);
						} catch (ee) {}
					}
					var a = 1;
				}
				if (events.length < 2) {
					console.log(" events.length", events.length);
					return;
				}
				try {
					ProcessLoadingEvents();
					//ShiftStartRec();
					var url = new URL(window.location.href);
					var AllSesion = url.searchParams.get("allsession");
					if (AllSesion == null) ShiftStartRec();
					ShiftLodingTime();
					//ProcessLoadingEvents();
					PlayResults();
				} catch (ee) {
					ShowLoadingContent(false);
				}
			}
		} //end compress
	}
	//------------------------
	var ScriptHeatMapAdded = false;
	var ScriptYouTubeAdded = false;
	//------------------------
	function InitializeGazePlot() {
		//if( ScriptAdded)
		//return;
		//ScriptAdded = true;
		var doc = replayer.iframe.contentDocument || replayer.iframe.contentWindow.document;
		///////////////////////
		var ok = false;
		try {
			var headd = doc.head;
			// var firstScriptTag = doc.getElementsByTagName('script')[0];
			if (headd != null) ok = true;
		} catch (e) {}
		if (!ok) {
			window.setTimeout(InitializeGazePlot, 100);
		}
		/////////////////////////
		if (typeof replayer.iframe.contentWindow.Initheatmap === 'undefined') {
			var script = doc.createElement('script');
			script.onload = function() {
				replayer.iframe.contentWindow.CheckInitializedHeatMap();
				//do stuff with the script
				//StartGazePloLoop();
				ScriptHeatMapAdded = true;
				replayer.iframe.contentWindow._Initheatmap(0);
			};
			//script.src = "https://gazerecorder.com/webrecorder/heatmapLive.js";
			script.src = "https://app.gazerecorder.com/heatmapLive.js";
			//doc.head.appendChild(script); //or something of the likes
			var headd = replayer.iframe.contentWindow.document.head;
			headd.appendChild(script); //or something of the likes
			console.log(" add heat map script");
			/*

			  if(false)//result debug

			{

			     var tag = doc.createElement('script');

			     tag.src = "https://app.gazerecorder.com/WebRecIFrameDebug.js";

			     var firstScriptTag = doc.getElementsByTagName('script')[0];

			     firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			}

			*/
			if (!ScriptYouTubeAdded)
				if (true) //youtube
			{
				var tag = doc.createElement('script');
				tag.onload = function() {
					ScriptYouTubeAdded = true;
					var a = 1;
					a++;
				};
				tag.src = "https://app.gazerecorder.com/youtubeplayer.js";
				//  var firstScriptTag = doc.getElementsByTagName('script')[0];
				//  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
				//  var scriptyt = doc.createElement('script');
				// scriptyt.src ="https://app.gazerecorder.com/youtubeplayer.js";
				headd.appendChild(tag); //or something of the likes
			}
		}
		try {
			if (ScriptHeatMapAdded) replayer.iframe.contentWindow._Initheatmap(0);
		} catch (e) {}
	}
	//------------------
	var GazePloLoop = null;
	var _InactiveCount = 0;
	var _LastGazePlotTime = Date.now();

	function _StartGazePloLoop() {
		var dif = Date.now() - _LastGazePlotTime;
		//if(dif < 10)
		if (dif < 30) {
			window.setTimeout(function() {
				requestAnimationFrame(_StartGazePloLoop);
			}, 3);
			//requestAnimationFrame(_StartGazePloLoop);
			return;
		}
		//console.log(" _StartGazePloLoop dt" + dif );
		_LastGazePlotTime = Date.now();
		try {
			if (!bisRady) {
				requestAnimationFrame(_StartGazePloLoop);
				return;
			}
			var doc = replayer.iframe.contentDocument;
			var win = replayer.iframe.contentWindow;
			var t = replayer.baselineTime + replayer.timer.timeOffset;
			t += 33;
			if (t == LastTimeR) // pause
			{
				_InactiveCount++;
				// if(_InactiveCount > 2)
				{
					ShowLoadingContent(false);
					requestAnimationFrame(_StartGazePloLoop);
					return;
				}
			} else _InactiveCount = 0;
			ShowLoadingContent(isLoading(t));
			LastTimeR = t;
			//console.log(" baselineTime" + replayer.baselineTime + " ofset " +replayer.timer.timeOffset  );
			var x = -100;
			var y = -100;
			var GazeData = GetGazeEvent(t);
			var scrollY = Math.max(doc.body.scrollTop, win.scrollY)
			var scrollX = Math.max(doc.body.scrollLeft, win.scrollX)
			//if (GazeData == null)    requestAnimationFrame(_StartGazePloLoop);
			if (GazeData != null) {
				x = GazeData.docX;
				y = GazeData.docY;
				if (true) {
					var scrollY = Math.max(doc.body.scrollTop, win.scrollY)
					var scrollX = Math.max(doc.body.scrollLeft, win.scrollX)
					x += scrollX;
					y += scrollY;
				}
			}
			if (true) //iframe/////
			{
				//if(false)
				if (true) //add heatmap
				{
					try {
						var _heatmapIFrame = replayer.iframe.contentWindow.heatmap;
						if (ScriptHeatMapAdded)
							if (_heatmapIFrame != null)
								if (GazeData != null) {
									//if (GazeData.state != -1)//if (GazeData.state == 0) {
									doc.getElementById('heatmapContainer').style.zIndex = "999999";
									doc.getElementById('heatmapContainerWrapper').style.zIndex = "999999";
									if (false) replayer.iframe.contentWindow._adddata_(x, y, 1);
									else {
										var GazeE = GetGazeEvents(-1, t);
										if (GazeE) {
											//  console.log(" GazeE.length " + GazeE.length );
											for (i = 0; i < GazeE.length; i++) {
												if (GazeE[i].state != 0) continue;
												var v = GazeE[i].duration / 33;
												//  v*=2;
												// v*= replayer.config.speed ;
												replayer.iframe.contentWindow._adddata_(GazeE[i].docX + scrollX, GazeE[i].docY + scrollY, v);
											}
										}
									}
								}
					} catch (eee) {
						console.log(" heat map exeption");
					}
				} ////////////////end add heatmap//////////////////////
				if (true) //////gaze plot//////
				{
					//var _img = document.getElementById("gazeimg");
					var _img = doc.getElementById("gazeimg");
					if (_img == null) {
						var itm = document.createElement('div');
						itm.id = 'gazeimg';
						itm.style = 'position: absolute;	display:none;	top: 120px;	left: 100px;	width: 120px;	height: 120px;	border-radius: 50%;	border: solid 2px  rgba(255, 255,255, .2);	box-shadow: 0 0 100px 3px rgba(125, 125,125, .9);	pointer-events: none;	z-index: 999999';
						doc.body.appendChild(itm);
						_img = itm;
					}
					// if (GazeData != null) 
					{
						x -= _img.clientWidth / 2;
						y -= _img.clientHeight / 2;
						//if (GazeData != null) 
						{
							var _x = x + "px";
							var _y = y + "px";
							var dif = Math.sqrt((x - _Lastx) * (x - _Lastx) + (y - _Lasty) * (y - _Lasty));
							if (dif > 8)
							//if(true)
							{
								_img.style.left = _x;
								_img.style.top = _y;
								_Lastx = x;
								_Lasty = y;
								if (_img.style.display != 'block') _img.style.display = 'block';
								//  console.log("  change position"  )
							} else {
								// console.log(" no change position"  )
							}
						}
						if (GazeData == null) {
							_img.style.display = 'none';
						}
						if (GazeData.state != 0) _img.style.display = 'none';
					}
				} //////end gaze plot//////
			} //end iframe/////
		} catch (tt) {};
		requestAnimationFrame(_StartGazePloLoop);
	}
	//------------------
	function StartGazePloLoop() {
		_StartGazePloLoop();
		return;
		if (GazePloLoop != null) clearInterval(GazePloLoop);
		GazePloLoop = setInterval(function() {
			try {
				if (!bisRady) return;
				var doc = replayer.iframe.contentDocument;
				var win = replayer.iframe.contentWindow;
				var t = replayer.baselineTime + replayer.timer.timeOffset;
				if (t == LastTimeR) // pause
				{
					_InactiveCount++;
					// if(_InactiveCount > 2)
					{
						// var isloadin=isLoading(t);
						// if(!_SkipLoading)
						//  if(!isLoading(t))
						ShowLoadingContent(false);
						return;
					}
				} else _InactiveCount = 0;
				ShowLoadingContent(isLoading(t));
				LastTimeR = t;
				//console.log(" baselineTime" + replayer.baselineTime + " ofset " +replayer.timer.timeOffset  );
				var x = -100;
				var y = -100;
				var GazeData = GetGazeEvent(t);
				var scrollY = Math.max(doc.body.scrollTop, win.scrollY)
				var scrollX = Math.max(doc.body.scrollLeft, win.scrollX)
				if (GazeData == null) return;
				if (GazeData != null) {
					x = GazeData.docX;
					y = GazeData.docY;
					if (true) {
						var scrollY = Math.max(doc.body.scrollTop, win.scrollY)
						var scrollX = Math.max(doc.body.scrollLeft, win.scrollX)
						x += scrollX;
						y += scrollY;
					}
				}
				if (true) //iframe/////
				{
					//if(false)
					if (true) //add heatmap
					{
						try {
							var _heatmapIFrame = replayer.iframe.contentWindow.heatmap;
							if (ScriptHeatMapAdded)
								if (_heatmapIFrame != null)
									if (GazeData != null) {
										//if (GazeData.state != -1)//if (GazeData.state == 0) {
										doc.getElementById('heatmapContainer').style.zIndex = "999999";
										doc.getElementById('heatmapContainerWrapper').style.zIndex = "999999";
										if (false) replayer.iframe.contentWindow._adddata_(x, y, 1);
										else {
											var GazeE = GetGazeEvents(-1, t);
											if (GazeE) {
												//  console.log(" GazeE.length " + GazeE.length );
												for (i = 0; i < GazeE.length; i++) replayer.iframe.contentWindow._adddata_(GazeE[i].docX + scrollX, GazeE[i].docY + scrollY, 1);
											}
										}
									}
						} catch (eee) {
							console.log(" heat map exeption");
						}
					} ////////////////end add heatmap//////////////////////
					if (true) //////gaze plot//////
					{
						//var _img = document.getElementById("gazeimg");
						var _img = doc.getElementById("gazeimg");
						if (_img == null) {
							//var itm = document.getElementById("gazeimg")
							//_img = itm.cloneNode(true);
							var itm = document.createElement('div');
							itm.id = 'gazeimg';
							itm.style = 'position: absolute;	display:none;	top: 120px;	left: 100px;	width: 120px;	height: 120px;	border-radius: 50%;	border: solid 2px  rgba(255, 255,255, .2);	box-shadow: 0 0 100px 3px rgba(125, 125,125, .9);	pointer-events: none;	z-index: 9999';
							doc.body.appendChild(itm);
						}
						//x -= _img.width / 2;
						//y -= _img.height / 2;
						x -= _img.clientWidth / 2;
						y -= _img.clientHeight / 2;
						if (GazeData != null) {
							var _x = x + "px";
							var _y = y + "px";
							var dif = Math.sqrt((x - _Lastx) * (x - _Lastx) + (y - _Lasty) * (y - _Lasty));
							//if(_img.style.left !=_x || _img.style.top !=_y )
							if (dif > 5) {
								_img.style.left = _x;
								_img.style.top = _y;
								_Lastx = x;
								_Lasty = y;
								if (_img.style.display != 'block') _img.style.display = 'block';
								//  console.log("  change position"  )
							} else {
								// console.log(" no change position"  )
							}
						}
						if (false) {
							if (GazeData.state != 0) _img.style.display = 'none';
							else _img.style.display = 'block';
						}
					} //////end gaze plot//////
					return;
				} //end iframe/////
			} catch (tt) {};
			//}, 35);
		}, 30);
		//}, 200);
	}
	//--------------------
	var _Lastx = 0;
	var _Lasty = 0;
	/*



	class Replayer {

	  public wrapper: HTMLDivElement;



	  constructor(events: eventWithTime[], config?: Partial<playerConfig>);



	  public on(event: string, handler: mitt.Handler): void;

	  public setConfig(config: Partial<playerConfig>): void;

	  public getMetaData(): playerMetaData;

	  public getTimeOffset(): number;

	  public play(timeOffset?: number): void;

	  public pause(): void;

	  public resume(timeOffset?: number): void;

	}



	type playerConfig = {

	  speed: number;

	  root: Element;

	  loadTimeout: number;

	  skipInactive: Boolean;

	};



	type playerMetaData = {

	  totalTime: number;

	};



	*/
	//---------------------------
	var __replayer_ = null;
	this.FinishPlay = function() {
		ScriptHeatMapAdded = false;
		if (__replayer_ != null) delete __replayer_;
		if (GazePloLoop != null) clearInterval(GazePloLoop);
		if (PlayerContainer != null) PlayerContainer.innerHTML = '';
	}
	//---------------------------
	var _SkipLoading = true;

	function PlayResults() {
		InitGUI();
		//this.FinishPlay();
		//ShowLoadingContent(false);
		ShowLoadingContent(true);
		if (false) {
			replayer = new rrweb.Replayer(events);
			replayer.play();
			replayer.setConfig({
				speed: 1,
				root: document.body,
				loadTimeout: 10,
				skipInactive: true
			});
		} else {
			var containter = document.body;
			if (PlayerContainer != null) {
				containter = PlayerContainer;
				containter.style.display = 'block';
			}
			if (__replayer_ != null) delete __replayer_;
			__replayer = new rrwebPlayer({
				target: containter,
				data: {
					events,
					autoPlay: true,
					skipInactive: false
				},
			});
			__replayer_ = __replayer;
			replayer = __replayer._state.replayer;
			if (true) {
				var cc = document.getElementsByClassName('switch svelte-a6h7w7')[0];
				cc.style.display = 'none';
			}
		}
		//////////////events//////////
		try {
			replayer.on("load-stylesheet-end", () => {
				var a = 1;
				a++;
			});
			//replayer.on("fullsnapshot-rebuilded", () => {replayer.iframe.contentWindow._Initheatmap(0);});
			//replayer.on("fullsnapshot-rebuilded", ReinitHeatMap);
			//replayer.on("start", ReinitHeatMap);
			//replayer.on("resize", ReinitHeatMap);
			replayer.on("finish", () => {
				console.log(" finish");
			});
			// replayer.on("load-stylesheet-start", () => { console.log(" fload-stylesheet-start"  );});
			// replayer.on("load-stylesheet-end", () => { console.log(" fload-stylesheet-end"  );});
			// replayer.on("skip-start", () => { console.log(" skip-start"  );});
			replayer.on("FullsnapshotStart", () => {
				//	console.log("fullsnapshot start");
				//  ShowLoadingContent(true);
			});
			replayer.on("fullsnapshot-rebuilded", () => {
				bisRady = true;
				console.log(" fullsnapshot-rebuilded");
				if (_SkipLoading) {
					if (false) {
						var t = replayer.baselineTime + replayer.timer.timeOffset;
						var tt = GetEndLoadingTime(t);
						var dd = tt - t;
						console.log("shift t " + dd);
						if (dd > 100) replayer.resume(replayer.timer.timeOffset + dd);
						// window.setTimeout(function() { ShowLoadingContent(false);}, 200);
						// ShowLoadingContent(false);
					}
				}
				if (false) // tmp skip loading
				{
					try {
						if (_ofsetT > -1) {
							var t = _ofsetT + 1000
							_ofsetT = -1;
							//replayer.resume(_ofsetT + 1000);
							try {
								replayer.play(t);
							} catch (ee) {}
							ShowLoadingContent(false);
						}
					} catch (e) {}
				}
				InitializeGazePlot();
			});
			if (false) {
				replayer.iframe.contentDocument.addEventListener("DOMNodeInserted", function(ev) {
					replayer.iframe.contentWindow._Initheatmap(0);
				}, false);
				replayer.iframe.contentDocument.addEventListener("DOMAttrModified", function(ev) {
					replayer.iframe.contentWindow._Initheatmap(0);
				}, false);
				replayer.iframe.contentDocument.addEventListener("DOMSubtreeModified", function(ev) {
					replayer.iframe.contentWindow._Initheatmap(0);
				}, false);
			}
		} catch (ee) {}
		////////////events////////
		StartGazePloLoop();
		// InitializeGazePlot();
	}

	function getCoords(elem) { // crossbrowser version
		var box = elem.getBoundingClientRect();
		var body = document.body;
		var docEl = document.documentElement;
		var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
		var clientTop = docEl.clientTop || body.clientTop || 0;
		var clientLeft = docEl.clientLeft || body.clientLeft || 0;
		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;
		return {
			top: Math.round(top),
			left: Math.round(left)
		};
	}
	///////////
	var bGuiInitialized = false;

	function InitGUI() {
		if (bGuiInitialized) return;
		bGuiInitialized = true;
		var _html = '<div id="loadid"  style= " height:100%; width:100%;left: 0px; position: fixed; top: 0%;display:none;opacity: 0.93; background-color: black;z-index: 9999;" > <h1 align="center" style="color: white;"> Loading...</h1> <div class="loader"></div> </div> <div id="_playerdiv_" style="background-color: white;position: absolute;top: 50%;left: 50%;margin-right: -50%; transform: translate(-50%, -50%) "></div>';
		var _style = ' <link rel="stylesheet" href="https://app.gazerecorder.com/GazePlayerStyle.css"/>'
		_html = _style + _html;
		document.body.insertAdjacentHTML('beforeend', _html);
		if (PlayerContainer == null) PlayerContainer = document.getElementById("_playerdiv_");
		PlayerContainer.style.backgroundColor = "white";
		if (false) //buttons
		{
			document.getElementById("loadid");
			var cc = document.getElementsByClassName('rr-controller__btns svelte-1cgfpn0')[0];
			var _gazeplot = '<div class="switch svelte-a6h7w7"><input type="checkbox" id="showHeatMapid" class="svelte-a6h7w7"> <label for="HeatMap" class="svelte-a6h7w7"></label> <span class="label svelte-a6h7w7">Heat Map</span></div>';
			cc.innerHTML += _gazeplot;
		}
		return;
		var r = document.getElementsByClassName('rr-player__frame svelte-1wetjm2')[0];
		var rr = document.getElementsByClassName('rr-player__frame.svelte-1wetjm2')[0];
		loadid.style.display = 'none';
		if (loadid == null) loadid = document.getElementById("loadid");
		loadid = document.createElement('div');
		loadid.style = document.getElementById("loadid").style;
		loadid.style.position = "relative";
		var ll = document.createElement('div');
		ll.clasName = "loader";
		loadid.appendChild(ll);
		r.appendChild(loadid);
		//loadid = document.getElementById("loadid");
	}
	/////////////////////////////
};
var GazePlayer = new GazePlayerAPI();
////////////////////////////////////
var rrwebPlayer = function() {
	"use strict";

	function e() {}

	function t(e, t) {
		for (var i in t) e[i] = t[i];
		return e
	}

	function i(e, t) {
		for (var i in t) e[i] = 1;
		return e
	}

	function n(e) {
		e()
	}

	function r(e, t) {
		e.appendChild(t)
	}

	function s(e, t, i) {
		e.insertBefore(t, i)
	}

	function o(e) {
		e.parentNode.removeChild(e)
	}

	function a(e) {
		return document.createElement(e)
	}

	function l(e) {
		return document.createElementNS("http://www.w3.org/2000/svg", e)
	}

	function c(e) {
		return document.createTextNode(e)
	}

	function u(e, t, i, n) {
		e.addEventListener(t, i, n)
	}

	function h(e, t, i, n) {
		e.removeEventListener(t, i, n)
	}

	function f(e, t, i) {
		null == i ? e.removeAttribute(t) : e.setAttribute(t, i)
	}

	function d(e, t) {
		e.data = "" + t
	}

	function p(e, t, i) {
		e.style.setProperty(t, i)
	}

	function m(e, t, i) {
		e.classList[i ? "add" : "remove"](t)
	}

	function g() {
		return Object.create(null)
	}

	function v(e) {
		e._lock = !0, w(e._beforecreate), w(e._oncreate), w(e._aftercreate), e._lock = !1
	}

	function y(e, t) {
		e._handlers = g(), e._slots = g(), e._bind = t._bind, e._staged = {}, e.options = t, e.root = t.root || e, e.store = t.store || e.root.store, t.root || (e._beforecreate = [], e._oncreate = [], e._aftercreate = [])
	}

	function w(e) {
		for (; e && e.length;) e.shift()()
	}
	var b, _ = {
			destroy: function(t) {
				this.destroy = e, this.fire("destroy"), this.set = e, this._fragment.d(!1 !== t), this._fragment = null, this._state = {}
			},
			get: function() {
				return this._state
			},
			fire: function(e, t) {
				var i = e in this._handlers && this._handlers[e].slice();
				if (i)
					for (var n = 0; n < i.length; n += 1) {
						var r = i[n];
						if (!r.__calling) try {
							r.__calling = !0, r.call(this, t)
						} finally {
							r.__calling = !1
						}
					}
			},
			on: function(e, t) {
				var i = this._handlers[e] || (this._handlers[e] = []);
				return i.push(t), {
					cancel: function() {
						var e = i.indexOf(t);
						~e && i.splice(e, 1)
					}
				}
			},
			set: function(e) {
				this._set(t({}, e)), this.root._lock || v(this.root)
			},
			_recompute: e,
			_set: function(e) {
				var i = this._state,
					n = {},
					r = !1;
				for (var s in e = t(this._staged, e), this._staged = {}, e) this._differs(e[s], i[s]) && (n[s] = r = !0);
				r && (this._state = t(t({}, i), e), this._recompute(n, this._state), this._bind && this._bind(n, this._state), this._fragment && (this.fire("state", {
					changed: n,
					current: this._state,
					previous: i
				}), this._fragment.p(n, this._state), this.fire("update", {
					changed: n,
					current: this._state,
					previous: i
				})))
			},
			_stage: function(e) {
				t(this._staged, e)
			},
			_mount: function(e, t) {
				this._fragment[this._fragment.i ? "i" : "m"](e, t || null)
			},
			_differs: function(e, t) {
				return e != e ? t == t : e !== t || e && "object" == typeof e || "function" == typeof e
			}
		},
		k = function() {
			return (k = Object.assign || function(e) {
				for (var t, i = 1, n = arguments.length; i < n; i++)
					for (var r in t = arguments[i]) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
				return e
			}).apply(this, arguments)
		};
	! function(e) {
		e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment"
	}(b || (b = {}));
	var x = /\/\*[^*]*\*+([^\/*][^*]*\*+)*\//g;

	function M(e, t) {
		void 0 === t && (t = {});
		var i = 1,
			n = 1;

		function r(e) {
			var t = e.match(/\n/g);
			t && (i += t.length);
			var r = e.lastIndexOf("\n");
			n = -1 === r ? n + e.length : e.length - r
		}

		function s() {
			var e = {
				line: i,
				column: n
			};
			return function(t) {
				return t.position = new o(e), d(), t
			}
		}
		var o = function() {
			return function(e) {
				this.start = e, this.end = {
					line: i,
					column: n
				}, this.source = t.source
			}
		}();
		o.prototype.content = e;
		var a = [];

		function l(r) {
			var s = new Error(t.source + ":" + i + ":" + n + ": " + r);
			if (s.reason = r, s.filename = t.source, s.line = i, s.column = n, s.source = e, !t.silent) throw s;
			a.push(s)
		}

		function c() {
			return f(/^{\s*/)
		}

		function u() {
			return f(/^}/)
		}

		function h() {
			var t, i = [];
			for (d(), p(i); e.length && "}" !== e.charAt(0) && (t = N() || E());) !1 !== t && (i.push(t), p(i));
			return i
		}

		function f(t) {
			var i = t.exec(e);
			if (i) {
				var n = i[0];
				return r(n), e = e.slice(n.length), i
			}
		}

		function d() {
			f(/^\s*/)
		}

		function p(e) {
			var t;
			for (void 0 === e && (e = []); t = m();) !1 !== t && e.push(t), t = m();
			return e
		}

		function m() {
			var t = s();
			if ("/" === e.charAt(0) && "*" === e.charAt(1)) {
				for (var i = 2;
					"" !== e.charAt(i) && ("*" !== e.charAt(i) || "/" !== e.charAt(i + 1));) ++i;
				if (i += 2, "" === e.charAt(i - 1)) return l("End of comment missing");
				var o = e.slice(2, i - 2);
				return n += 2, r(o), e = e.slice(i), n += 2, t({
					type: "comment",
					comment: o
				})
			}
		}

		function g() {
			var e = f(/^([^{]+)/);
			if (e) return S(e[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(e) {
				return e.replace(/,/g, "‌")
			}).split(/\s*(?![^(]*\)),\s*/).map(function(e) {
				return e.replace(/\u200C/g, ",")
			})
		}

		function v() {
			var e = s(),
				t = f(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
			if (t) {
				var i = S(t[0]);
				if (!f(/^:\s*/)) return l("property missing ':'");
				var n = f(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/),
					r = e({
						type: "declaration",
						property: i.replace(x, ""),
						value: n ? S(n[0]).replace(x, "") : ""
					});
				return f(/^[;\s]*/), r
			}
		}

		function y() {
			var e, t = [];
			if (!c()) return l("missing '{'");
			for (p(t); e = v();) !1 !== e && (t.push(e), p(t)), e = v();
			return u() ? t : l("missing '}'")
		}

		function w() {
			for (var e, t = [], i = s(); e = f(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/);) t.push(e[1]), f(/^,\s*/);
			if (t.length) return i({
				type: "keyframe",
				values: t,
				declarations: y()
			})
		}
		var b, _ = T("import"),
			k = T("charset"),
			M = T("namespace");

		function T(e) {
			var t = new RegExp("^@" + e + "\\s*([^;]+);");
			return function() {
				var i = s(),
					n = f(t);
				if (n) {
					var r = {
						type: e
					};
					return r[e] = n[1].trim(), i(r)
				}
			}
		}

		function N() {
			if ("@" === e[0]) return function() {
				var e = s(),
					t = f(/^@([-\w]+)?keyframes\s*/);
				if (t) {
					var i = t[1];
					if (!(t = f(/^([-\w]+)\s*/))) return l("@keyframes missing name");
					var n, r = t[1];
					if (!c()) return l("@keyframes missing '{'");
					for (var o = p(); n = w();) o.push(n), o = o.concat(p());
					return u() ? e({
						type: "keyframes",
						name: r,
						vendor: i,
						keyframes: o
					}) : l("@keyframes missing '}'")
				}
			}() || function() {
				var e = s(),
					t = f(/^@media *([^{]+)/);
				if (t) {
					var i = S(t[1]);
					if (!c()) return l("@media missing '{'");
					var n = p().concat(h());
					return u() ? e({
						type: "media",
						media: i,
						rules: n
					}) : l("@media missing '}'")
				}
			}() || function() {
				var e = s(),
					t = f(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
				if (t) return e({
					type: "custom-media",
					name: S(t[1]),
					media: S(t[2])
				})
			}() || function() {
				var e = s(),
					t = f(/^@supports *([^{]+)/);
				if (t) {
					var i = S(t[1]);
					if (!c()) return l("@supports missing '{'");
					var n = p().concat(h());
					return u() ? e({
						type: "supports",
						supports: i,
						rules: n
					}) : l("@supports missing '}'")
				}
			}() || _() || k() || M() || function() {
				var e = s(),
					t = f(/^@([-\w]+)?document *([^{]+)/);
				if (t) {
					var i = S(t[1]),
						n = S(t[2]);
					if (!c()) return l("@document missing '{'");
					var r = p().concat(h());
					return u() ? e({
						type: "document",
						document: n,
						vendor: i,
						rules: r
					}) : l("@document missing '}'")
				}
			}() || function() {
				var e = s();
				if (f(/^@page */)) {
					var t = g() || [];
					if (!c()) return l("@page missing '{'");
					for (var i, n = p(); i = v();) n.push(i), n = n.concat(p());
					return u() ? e({
						type: "page",
						selectors: t,
						declarations: n
					}) : l("@page missing '}'")
				}
			}() || function() {
				var e = s();
				if (f(/^@host\s*/)) {
					if (!c()) return l("@host missing '{'");
					var t = p().concat(h());
					return u() ? e({
						type: "host",
						rules: t
					}) : l("@host missing '}'")
				}
			}() || function() {
				var e = s();
				if (f(/^@font-face\s*/)) {
					if (!c()) return l("@font-face missing '{'");
					for (var t, i = p(); t = v();) i.push(t), i = i.concat(p());
					return u() ? e({
						type: "font-face",
						declarations: i
					}) : l("@font-face missing '}'")
				}
			}()
		}

		function E() {
			var e = s(),
				t = g();
			return t ? (p(), e({
				type: "rule",
				selectors: t,
				declarations: y()
			})) : l("selector missing")
		}
		return function e(t, i) {
			var n = t && "string" == typeof t.type;
			var r = n ? t : i;
			for (var s = 0, o = Object.keys(t); s < o.length; s++) {
				var a = o[s],
					l = t[a];
				Array.isArray(l) ? l.forEach(function(t) {
					e(t, r)
				}) : l && "object" == typeof l && e(l, r)
			}
			n && Object.defineProperty(t, "parent", {
				configurable: !0,
				writable: !0,
				enumerable: !1,
				value: i || null
			});
			return t
		}((b = h(), {
			type: "stylesheet",
			stylesheet: {
				source: t.source,
				rules: b,
				parsingErrors: a
			}
		}))
	}

	function S(e) {
		return e ? e.replace(/^\s+|\s+$/g, "") : ""
	}
	var T = {
		script: "noscript",
		altglyph: "altGlyph",
		altglyphdef: "altGlyphDef",
		altglyphitem: "altGlyphItem",
		animatecolor: "animateColor",
		animatemotion: "animateMotion",
		animatetransform: "animateTransform",
		clippath: "clipPath",
		feblend: "feBlend",
		fecolormatrix: "feColorMatrix",
		fecomponenttransfer: "feComponentTransfer",
		fecomposite: "feComposite",
		feconvolvematrix: "feConvolveMatrix",
		fediffuselighting: "feDiffuseLighting",
		fedisplacementmap: "feDisplacementMap",
		fedistantlight: "feDistantLight",
		fedropshadow: "feDropShadow",
		feflood: "feFlood",
		fefunca: "feFuncA",
		fefuncb: "feFuncB",
		fefuncg: "feFuncG",
		fefuncr: "feFuncR",
		fegaussianblur: "feGaussianBlur",
		feimage: "feImage",
		femerge: "feMerge",
		femergenode: "feMergeNode",
		femorphology: "feMorphology",
		feoffset: "feOffset",
		fepointlight: "fePointLight",
		fespecularlighting: "feSpecularLighting",
		fespotlight: "feSpotLight",
		fetile: "feTile",
		feturbulence: "feTurbulence",
		foreignobject: "foreignObject",
		glyphref: "glyphRef",
		lineargradient: "linearGradient",
		radialgradient: "radialGradient"
	};
	var N = /([^\\]):hover/g;

	function E(e) {
		var t = M(e, {
			silent: !0
		});
		return t.stylesheet ? (t.stylesheet.rules.forEach(function(t) {
			"selectors" in t && (t.selectors || []).forEach(function(t) {
				if (N.test(t)) {
					var i = t.replace(N, "$1.\\:hover");
					e = e.replace(t, t + ", " + i)
				}
			})
		}), e) : e
	}

	function I(e, t, i) {
		switch (e.type) {
			case b.Document:
				return t.implementation.createDocument(null, "", null);
			case b.DocumentType:
				return t.implementation.createDocumentType(e.name, e.publicId, e.systemId);
			case b.Element:
				var n = function(e) {
						var t = T[e.tagName] ? T[e.tagName] : e.tagName;
						return "link" === t && e.attributes._cssText && (t = "style"), t
					}(e),
					r = void 0;
				for (var s in r = e.isSVG ? t.createElementNS("http://www.w3.org/2000/svg", n) : t.createElement(n), e.attributes)
					if (e.attributes.hasOwnProperty(s) && !s.startsWith("rr_")) {
						var o = e.attributes[s];
						o = "boolean" == typeof o ? "" : o;
						var a = "textarea" === n && "value" === s,
							l = "style" === n && "_cssText" === s;
						if (l && i && (o = E(o)), a || l) {
							for (var c = t.createTextNode(o), u = 0, h = Array.from(r.childNodes); u < h.length; u++) {
								var f = h[u];
								f.nodeType === r.TEXT_NODE && r.removeChild(f)
							}
							r.appendChild(c);
							continue
						}
						if ("iframe" === n && "src" === s) continue;
						try {
							e.isSVG && "xlink:href" === s ? r.setAttributeNS("http://www.w3.org/1999/xlink", s, o) : r.setAttribute(s, o)
						} catch (e) {}
					} else e.attributes.rr_width && (r.style.width = e.attributes.rr_width), e.attributes.rr_height && (r.style.height = e.attributes.rr_height);
				return r;
			case b.Text:
				return t.createTextNode(e.isStyle && i ? E(e.textContent) : e.textContent);
			case b.CDATA:
				return t.createCDATASection(e.textContent);
			case b.Comment:
				return t.createComment(e.textContent);
			default:
				return null
		}
	}

	function C(e, t, i, n, r) {
		void 0 === n && (n = !1), void 0 === r && (r = !0);
		var s = I(e, t, r);
		if (!s) return null;
		if (e.type === b.Document && (t.close(), t.open(), s = t), s.__sn = e, i[e.id] = s, (e.type === b.Document || e.type === b.Element) && !n)
			for (var o = 0, a = e.childNodes; o < a.length; o++) {
				var l = a[o],
					c = C(l, t, i, !1, r);
				c ? s.appendChild(c) : console.warn("Failed to rebuild", l)
			}
		return s
	}
	var L, D, A, F, z = {
		map: {},
		getId: function(e) {
			return e.__sn ? e.__sn.id : -1
		},
		getNode: function(e) {
			return z.map[e] || null
		},
		removeNodeFromMap: function(e) {
			var t = e.__sn && e.__sn.id;
			delete z.map[t], e.childNodes && e.childNodes.forEach(function(e) {
				return z.removeNodeFromMap(e)
			})
		},
		has: function(e) {
			return z.map.hasOwnProperty(e)
		}
	};

	function O(e) {
		return e = e || Object.create(null), {
			on: function(t, i) {
				(e[t] || (e[t] = [])).push(i)
			},
			off: function(t, i) {
				e[t] && e[t].splice(e[t].indexOf(i) >>> 0, 1)
			},
			emit: function(t, i) {
				(e[t] || []).slice().map(function(e) {
					e(i)
				}), (e["*"] || []).slice().map(function(e) {
					e(t, i)
				})
			}
		}
	}! function(e) {
		e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom"
	}(L || (L = {})),
	function(e) {
		e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove"
	}(D || (D = {})),
	function(e) {
		e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd"
	}(A || (A = {})),
	function(e) {
		//!!!  e.Start = "start", e.Pause = "pause", e.Resume = "resume", e.Resize = "resize", e.Finish = "finish", e.FullsnapshotRebuilded = "fullsnapshot-rebuilded", e.LoadStylesheetStart = "load-stylesheet-start", e.LoadStylesheetEnd = "load-stylesheet-end", e.SkipStart = "skip-start", e.SkipEnd = "skip-end", e.MouseInteraction = "mouse-interaction"
		e.FullsnapshotStart = "FullsnapshotStart", e.Start = "start", e.Pause = "pause", e.Resume = "resume", e.Resize = "resize", e.Finish = "finish", e.FullsnapshotRebuilded = "fullsnapshot-rebuilded", e.LoadStylesheetStart = "load-stylesheet-start", e.LoadStylesheetEnd = "load-stylesheet-end", e.SkipStart = "skip-start", e.SkipEnd = "skip-end", e.MouseInteraction = "mouse-interaction"
	}(F || (F = {}));
	var R = Object.freeze({
		default: O
	});
	var P, j = (function(e, t) {
			! function() {
				e.exports = {
					polyfill: function() {
						var e = window,
							t = document;
						if (!("scrollBehavior" in t.documentElement.style && !0 !== e.__forceSmoothScrollPolyfill__)) {
							var i, n = e.HTMLElement || e.Element,
								r = 468,
								s = {
									scroll: e.scroll || e.scrollTo,
									scrollBy: e.scrollBy,
									elementScroll: n.prototype.scroll || l,
									scrollIntoView: n.prototype.scrollIntoView
								},
								o = e.performance && e.performance.now ? e.performance.now.bind(e.performance) : Date.now,
								a = (i = e.navigator.userAgent, new RegExp(["MSIE ", "Trident/", "Edge/"].join("|")).test(i) ? 1 : 0);
							e.scroll = e.scrollTo = function() {
								void 0 !== arguments[0] && (!0 !== c(arguments[0]) ? p.call(e, t.body, void 0 !== arguments[0].left ? ~~arguments[0].left : e.scrollX || e.pageXOffset, void 0 !== arguments[0].top ? ~~arguments[0].top : e.scrollY || e.pageYOffset) : s.scroll.call(e, void 0 !== arguments[0].left ? arguments[0].left : "object" != typeof arguments[0] ? arguments[0] : e.scrollX || e.pageXOffset, void 0 !== arguments[0].top ? arguments[0].top : void 0 !== arguments[1] ? arguments[1] : e.scrollY || e.pageYOffset))
							}, e.scrollBy = function() {
								void 0 !== arguments[0] && (c(arguments[0]) ? s.scrollBy.call(e, void 0 !== arguments[0].left ? arguments[0].left : "object" != typeof arguments[0] ? arguments[0] : 0, void 0 !== arguments[0].top ? arguments[0].top : void 0 !== arguments[1] ? arguments[1] : 0) : p.call(e, t.body, ~~arguments[0].left + (e.scrollX || e.pageXOffset), ~~arguments[0].top + (e.scrollY || e.pageYOffset)))
							}, n.prototype.scroll = n.prototype.scrollTo = function() {
								if (void 0 !== arguments[0])
									if (!0 !== c(arguments[0])) {
										var e = arguments[0].left,
											t = arguments[0].top;
										p.call(this, this, void 0 === e ? this.scrollLeft : ~~e, void 0 === t ? this.scrollTop : ~~t)
									} else {
										if ("number" == typeof arguments[0] && void 0 === arguments[1]) throw new SyntaxError("Value could not be converted");
										s.elementScroll.call(this, void 0 !== arguments[0].left ? ~~arguments[0].left : "object" != typeof arguments[0] ? ~~arguments[0] : this.scrollLeft, void 0 !== arguments[0].top ? ~~arguments[0].top : void 0 !== arguments[1] ? ~~arguments[1] : this.scrollTop)
									}
							}, n.prototype.scrollBy = function() {
								void 0 !== arguments[0] && (!0 !== c(arguments[0]) ? this.scroll({
									left: ~~arguments[0].left + this.scrollLeft,
									top: ~~arguments[0].top + this.scrollTop,
									behavior: arguments[0].behavior
								}) : s.elementScroll.call(this, void 0 !== arguments[0].left ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, void 0 !== arguments[0].top ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop))
							}, n.prototype.scrollIntoView = function() {
								if (!0 !== c(arguments[0])) {
									var i = function(e) {
											for (; e !== t.body && !1 === f(e);) e = e.parentNode || e.host;
											return e
										}(this),
										n = i.getBoundingClientRect(),
										r = this.getBoundingClientRect();
									i !== t.body ? (p.call(this, i, i.scrollLeft + r.left - n.left, i.scrollTop + r.top - n.top), "fixed" !== e.getComputedStyle(i).position && e.scrollBy({
										left: n.left,
										top: n.top,
										behavior: "smooth"
									})) : e.scrollBy({
										left: r.left,
										top: r.top,
										behavior: "smooth"
									})
								} else s.scrollIntoView.call(this, void 0 === arguments[0] || arguments[0])
							}
						}

						function l(e, t) {
							this.scrollLeft = e, this.scrollTop = t
						}

						function c(e) {
							if (null === e || "object" != typeof e || void 0 === e.behavior || "auto" === e.behavior || "instant" === e.behavior) return !0;
							if ("object" == typeof e && "smooth" === e.behavior) return !1;
							throw new TypeError("behavior member of ScrollOptions " + e.behavior + " is not a valid value for enumeration ScrollBehavior.")
						}

						function u(e, t) {
							return "Y" === t ? e.clientHeight + a < e.scrollHeight : "X" === t ? e.clientWidth + a < e.scrollWidth : void 0
						}

						function h(t, i) {
							var n = e.getComputedStyle(t, null)["overflow" + i];
							return "auto" === n || "scroll" === n
						}

						function f(e) {
							var t = u(e, "Y") && h(e, "Y"),
								i = u(e, "X") && h(e, "X");
							return t || i
						}

						function d(t) {
							var i, n, s, a, l = (o() - t.startTime) / r;
							a = l = l > 1 ? 1 : l, i = .5 * (1 - Math.cos(Math.PI * a)), n = t.startX + (t.x - t.startX) * i, s = t.startY + (t.y - t.startY) * i, t.method.call(t.scrollable, n, s), n === t.x && s === t.y || e.requestAnimationFrame(d.bind(e, t))
						}

						function p(i, n, r) {
							var a, c, u, h, f = o();
							i === t.body ? (a = e, c = e.scrollX || e.pageXOffset, u = e.scrollY || e.pageYOffset, h = s.scroll) : (a = i, c = i.scrollLeft, u = i.scrollTop, h = l), d({
								scrollable: a,
								method: h,
								startTime: f,
								startX: c,
								startY: u,
								x: n,
								y: r
							})
						}
					}
				}
			}()
		}(P = {
			exports: {}
		}, P.exports), P.exports).polyfill,
		B = function() {
			function e(e, t) {
				void 0 === t && (t = []), this.timeOffset = 0, this.actions = t, this.config = e
			}
			return e.prototype.addAction = function(e) {
				var t = this.findActionIndex(e);
				this.actions.splice(t, 0, e)
			}, e.prototype.addActions = function(e) {
				var t;
				(t = this.actions).push.apply(t, e)
			}, e.prototype.start = function() {
				this.actions.sort(function(e, t) {
					return e.delay - t.delay
				}), this.timeOffset = 0;
				var e = performance.now(),
					t = this.actions,
					i = this.config,
					n = this;
				this.raf = requestAnimationFrame(function r(s) {
					/*

					    for (n.timeOffset += (s - e) * i.speed, e = s; t.length;) {

					        var o = t[0];

					        if (!(n.timeOffset >= o.delay)) break;

					        t.shift(), o.doAction()

					    }(t.length > 0 || n.config.liveMode) && (n.raf = requestAnimationFrame(r))



					    */
					try {
						for (n.timeOffset += (s - e) * i.speed, e = s; t.length;) {
							var o = t[0];
							if (!(n.timeOffset >= o.delay)) break;
							t.shift(), o.doAction()
						}(t.length > 0 || n.config.liveMode) && (n.raf = requestAnimationFrame(r))
					} catch (eee) {
						var aa = 1;
						aa++;
					}
				})
			}, e.prototype.clear = function() {
				this.raf && cancelAnimationFrame(this.raf), this.actions.length = 0
			}, e.prototype.findActionIndex = function(e) {
				for (var t = 0, i = this.actions.length - 1; t <= i;) {
					var n = Math.floor((t + i) / 2);
					if (this.actions[n].delay < e.delay) t = n + 1;
					else {
						if (!(this.actions[n].delay > e.delay)) return n;
						i = n - 1
					}
				}
				return t
			}, e
		}(),
		q = O || R,
		Y = function() {
			function e(e, t) {
				if (this.events = [], this.emitter = q(), this.baselineTime = 0, this.noramlSpeed = -1, this.missingNodeRetryMap = {}, e.length < 2) throw new Error("Replayer need at least 2 events.");
				this.events = e, this.handleResize = this.handleResize.bind(this);
				var i = {
					speed: 1,
					root: document.body,
					loadTimeout: 5000,//0, tmp v1.2
					skipInactive: !1,
					showWarning: !0,
					showDebug: !1,
					blockClass: "rr-block",
					liveMode: !1,
					insertStyleRules: []
				};
				this.config = Object.assign({}, i, t), this.timer = new B(this.config), j(), "NodeList" in window && !NodeList.prototype.forEach && (NodeList.prototype.forEach = Array.prototype.forEach), this.setupDom(), this.emitter.on("resize", this.handleResize)
			}
			return e.prototype.on = function(e, t) {
				this.emitter.on(e, t)
			}, e.prototype.setConfig = function(e) {
				var t = this;
				Object.keys(e).forEach(function(i) {
					t.config[i] = e[i]
				}), this.config.skipInactive || (this.noramlSpeed = -1)
			}, e.prototype.getMetaData = function() {
				var e = this.events[0];
				return {
					totalTime: this.events[this.events.length - 1].timestamp - e.timestamp
				}
			}, e.prototype.getCurrentTime = function() {
				return this.timer.timeOffset + this.getTimeOffset()
			}, e.prototype.getTimeOffset = function() {
				return this.baselineTime - this.events[0].timestamp
			}, e.prototype.play = function(e) {
				void 0 === e && (e = 0), this.timer.clear(), this.baselineTime = this.events[0].timestamp + e;
				for (var t = new Array, i = 0, n = this.events; i < n.length; i++) {
					var r = n[i],
						s = r.timestamp < this.baselineTime,
						o = this.getCastFn(r, s);
					s ? o() : t.push({
						doAction: o,
						delay: this.getDelay(r)
					})
				}
				this.timer.addActions(t), this.timer.start(), this.emitter.emit(F.Start)
			}, e.prototype.pause = function() {
				this.timer.clear(), this.emitter.emit(F.Pause)
			}, e.prototype.resume = function(e) {
				void 0 === e && (e = 0), this.timer.clear(), this.baselineTime = this.events[0].timestamp + e;
				for (var t = new Array, i = 0, n = this.events; i < n.length; i++) {
					var r = n[i];
					if (!(r.timestamp <= this.lastPlayedEvent.timestamp || r === this.lastPlayedEvent)) {
						var s = this.getCastFn(r);
						t.push({
							doAction: s,
							delay: this.getDelay(r)
						})
					}
				}
				this.timer.addActions(t), this.timer.start(), this.emitter.emit(F.Resume)
			}, e.prototype.addEvent = function(e) {
				this.getCastFn(e, !0)()
			}, e.prototype.setupDom = function() {
				//  this.wrapper = document.createElement("div"), this.wrapper.classList.add("replayer-wrapper"), this.config.root.appendChild(this.wrapper), this.mouse = document.createElement("div"), this.mouse.classList.add("replayer-mouse"), this.wrapper.appendChild(this.mouse), this.iframe = document.createElement("iframe"), this.iframe.setAttribute("sandbox", "allow-same-origin"), this.iframe.setAttribute("scrolling", "no"), this.iframe.setAttribute("style", "pointer-events: none"), this.wrapper.appendChild(this.iframe)
				this.wrapper = document.createElement("div"), this.wrapper.classList.add("replayer-wrapper"), this.config.root.appendChild(this.wrapper), this.mouse = document.createElement("div"), this.mouse.classList.add("replayer-mouse"), this.wrapper.appendChild(this.mouse), this.iframe = document.createElement("iframe"), this.iframe.setAttribute("sandbox", "allow-scripts allow-same-origin"), this.iframe.setAttribute("scrolling", "no"), this.iframe.setAttribute("style", "pointer-events: none"), this.wrapper.appendChild(this.iframe)
			}, e.prototype.handleResize = function(e) {
				this.iframe.width = e.width + "px", this.iframe.height = e.height + "px"
			}, e.prototype.getDelay = function(e) {
				try {
					if (e.type === L.IncrementalSnapshot && e.data.source === D.MouseMove) {
						var t = e.data.positions[0].timeOffset,
							i = e.timestamp + t;
						return e.delay = i - this.baselineTime, i - this.baselineTime
					}
					try //!!!!!!!
					{
						return e.delay = e.timestamp - this.baselineTime, e.timestamp - this.baselineTime
					} catch (eee) //!!!!!!!
					{
						var aaa = 1;
						aaa++;
					}
				} catch (eee) {
					return 0;
				}
			}, e.prototype.getCastFn = function(e, t) {
				var i, n = this;
				switch (void 0 === t && (t = !1), e.type) {
					case L.DomContentLoaded:
					case L.Load:
						break;
					case L.Meta:
						i = function() {
							return n.emitter.emit(F.Resize, {
								width: e.data.width,
								height: e.data.height
							})
						};
						break;
					case L.FullSnapshot:
						i = function() {
							n.rebuildFullSnapshot(e), n.iframe.contentWindow.scrollTo(e.data.initialOffset)
						};
						break;
					case L.IncrementalSnapshot:
						i = function() {
							if (n.applyIncremental(e, t), e === n.nextUserInteractionEvent && (n.nextUserInteractionEvent = null, n.restoreSpeed()), n.config.skipInactive && !n.nextUserInteractionEvent) {
								for (var i = 0, r = n.events; i < r.length; i++) {
									var s = r[i];
									if (!(s.timestamp <= e.timestamp) && n.isUserInteraction(s)) {
										s.delay - e.delay > 1e4 * n.config.speed && (n.nextUserInteractionEvent = s);
										break
									}
								}
								if (n.nextUserInteractionEvent) {
									n.noramlSpeed = n.config.speed;
									var o = n.nextUserInteractionEvent.delay - e.delay,
										a = {
											speed: Math.min(Math.round(o / 5e3), 360)
										};
									n.setConfig(a), n.emitter.emit(F.SkipStart, a)
								}
							}
						}
				}
				return function() {
					i && i(), n.lastPlayedEvent = e, e === n.events[n.events.length - 1] && (n.restoreSpeed(), n.emitter.emit(F.Finish))
				}
			}, e.prototype.rebuildFullSnapshot = function(e) {
				this.emitter.emit(F.FullsnapshotStart); //!!!!!!!!
				/*



             if(  this.iframe.contentDocument.getElementById("_loadid_") == null)

             {

                var _html =  '<div id="_loadid_"  style= " height:100%; width:100%;left: 0px; position: fixed; top: 0%;display:none;opacity: 0.93; background-color: black;z-index: 9999;" > <h1 align="center" style="color: white;"> Loading...</h1> <div class="loader"></div> </div> ';

                 this.iframe.contentDocument.body.insertAdjacentHTML('beforeend', _html);

             }



                this.iframe.contentDocument.getElementById("_loadid_").style.display = 'block' ;

                */
				Object.keys(this.missingNodeRetryMap).length && console.warn("Found unresolved missing node map", this.missingNodeRetryMap), this.missingNodeRetryMap = {}, z.map = function(e, t, i) {
					void 0 === i && (i = !0);
					var n = {};
					return [C(e, t, n, !1, i), n]
				}(e.data.node, this.iframe.contentDocument)[1];
				var t = document.createElement("style"),
					i = this.iframe.contentDocument,
					n = i.documentElement,
					r = i.head;
				n.insertBefore(t, r);
				/////!!!! for (var s, o = (s = this.config.blockClass, ["iframe, ." + s + " { background: #ccc }", "noscript { display: none !important; }"]).concat(this.config.insertStyleRules), a = 0; a < o.length; a++) t.sheet.insertRule(o[a], a);
				for (var s, o = (s = this.config.blockClass, ["iframe, ." + s + " { background: #111 }", "noscript { display: none !important; }"]).concat(this.config.insertStyleRules), a = 0; a < o.length; a++) t.sheet.insertRule(o[a], a);
				this.emitter.emit(F.FullsnapshotRebuilded), this.waitForStylesheetLoad()
				// , this.iframe.contentDocument.getElementById("_loadid_").style.display = 'none' ;
				//// , this.iframe.contentDocument.getElementById("_loadid_").parentNode.removeChild(element);
			}, e.prototype.waitForStylesheetLoad = function() {

				if(false)
					return; //!!!!!
				try {
					var e = this,
						t = this.iframe.contentDocument.head;
					if (t) {
						var i, n = new Set;
						t.querySelectorAll('link[rel="stylesheet"]').forEach(function(t) {
							t.sheet || (0 === n.size && (e.pause(), e.emitter.emit(F.LoadStylesheetStart), i = window.setTimeout(function() {
								e.resume(e.getCurrentTime()), i = -1
							}, e.config.loadTimeout)), n.add(t), t.addEventListener("load", function() {
								n.delete(t), 0 === n.size && -1 !== i && (e.resume(e.getCurrentTime()), e.emitter.emit(F.LoadStylesheetEnd), i && window.clearTimeout(i))
							}))
						})
					}
				} catch (ee) {
					console.log("waitForStylesheetLoad exeption");
					e.resume(e.getCurrentTime());
				}
			}, e.prototype.applyIncremental = function(e, t) {
				var i = this,
					n = e.data;
				switch (n.source) {
					case D.Mutation:
						n.removes.forEach(function(e) {
							var t = z.getNode(e.id);
							if (!t) return i.warnNodeNotFound(n, e.id);
							var r = z.getNode(e.parentId);
							if (!r) return i.warnNodeNotFound(n, e.parentId);
							try { ///////mmmmm heat map remove node !!!!!!
								z.removeNodeFromMap(t), r && r.removeChild(t)
							} catch (yy) {} ///////mmmmm
						});
						var r = k({}, this.missingNodeRetryMap),
							s = [],
							o = function(e) {
								try {
									var t = z.getNode(e.parentId);
									if (!t) return s.push(e);
									var n = C(e.node, i.iframe.contentDocument, z.map, !0),
										o = null,
										a = null;
									e.previousId && (o = z.getNode(e.previousId)), e.nextId && (a = z.getNode(e.nextId)), -1 !== e.previousId && -1 !== e.nextId ? (o && o.nextSibling && o.nextSibling.parentNode ? t.insertBefore(n, o.nextSibling) : a && a.parentNode ? t.insertBefore(n, a) : t.appendChild(n), (e.previousId || e.nextId) && i.resolveMissingNode(r, t, n, e)) : r[e.node.id] = {
										node: n,
										mutation: e
									}
								} catch (eee) {}
							};
						for (n.adds.forEach(function(e) {
								o(e)
							}); s.length;) {
							if (s.every(function(e) {
									return !Boolean(z.getNode(e.parentId))
								})) return s.forEach(function(e) {
								return i.warnNodeNotFound(n, e.node.id)
							});
							var a = s.shift();
							o(a)
						}
						Object.keys(r).length && Object.assign(this.missingNodeRetryMap, r), n.texts.forEach(function(e) {
							var t = z.getNode(e.id);
							if (!t) return i.warnNodeNotFound(n, e.id);
							t.textContent = e.value
						}), n.attributes.forEach(function(e) {
							try {
								var t = z.getNode(e.id);
								if (!t) return i.warnNodeNotFound(n, e.id);
								for (var r in e.attributes)
									if ("string" == typeof r) {
										var s = e.attributes[r];
										null !== s ? t.setAttribute(r, s) : t.removeAttribute(r)
									}
							} catch (e) {}
						});
						break;
					case D.MouseMove:
						if (t) {
							var l = n.positions[n.positions.length - 1];
							this.moveAndHover(n, l.x, l.y, l.id)
						} else n.positions.forEach(function(t) {
							var r = {
								doAction: function() {
									i.moveAndHover(n, t.x, t.y, t.id)
								},
								delay: t.timeOffset + e.timestamp - i.baselineTime
							};
							i.timer.addAction(r)
						});
						break;
					case D.MouseInteraction:
						if (-1 === n.id) break;
						var c = new Event(A[n.type].toLowerCase());
						if (!(u = z.getNode(n.id))) return this.debugNodeNotFound(n, n.id);
						switch (this.emitter.emit(F.MouseInteraction, {
							type: n.type,
							target: u
						}), n.type) {
							case A.Blur:
								u.blur && u.blur();
								break;
							case A.Focus:
								u.focus && u.focus({
									preventScroll: !0
								});
								break;
							case A.Click:
							case A.TouchStart:
							case A.TouchEnd:
								t || (this.moveAndHover(n, n.x, n.y, n.id), this.mouse.classList.remove("active"), this.mouse.offsetWidth, this.mouse.classList.add("active"));
								break;
							default:
								u.dispatchEvent(c)
						}
						break;
					case D.Scroll:
						if (-1 === n.id) break;
						if (!(u = z.getNode(n.id))) return this.debugNodeNotFound(n, n.id);
						if (u === this.iframe.contentDocument) this.iframe.contentWindow.scrollTo({
							top: n.y,
							left: n.x,
							behavior: t ? "auto" : "smooth"
						});
						else try {
							u.scrollTop = n.y, u.scrollLeft = n.x
						} catch (e) {}
						break;
					case D.ViewportResize:
						this.emitter.emit(F.Resize, {
							width: n.width,
							height: n.height
						});
						break;
					case D.Input:
						if (-1 === n.id) break;
						var u;
						if (!(u = z.getNode(n.id))) return this.debugNodeNotFound(n, n.id);
						try {
							u.checked = n.isChecked, u.value = n.text
						} catch (e) {}
				}
			}, e.prototype.resolveMissingNode = function(e, t, i, n) {
				var r = n.previousId,
					s = n.nextId,
					o = r && e[r],
					a = s && e[s];
				if (o) {
					var l = o,
						c = l.node,
						u = l.mutation;
					t.insertBefore(c, i), delete e[u.node.id], delete this.missingNodeRetryMap[u.node.id], (u.previousId || u.nextId) && this.resolveMissingNode(e, t, c, u)
				}
				if (a) {
					var h = a;
					c = h.node, u = h.mutation;
					t.insertBefore(c, i.nextSibling), delete e[u.node.id], delete this.missingNodeRetryMap[u.node.id], (u.previousId || u.nextId) && this.resolveMissingNode(e, t, c, u)
				}
			}, e.prototype.moveAndHover = function(e, t, i, n) {
				this.mouse.style.left = t + "px", this.mouse.style.top = i + "px";
				var r = z.getNode(n);
				if (!r) return this.debugNodeNotFound(e, n);
				this.hoverElements(r)
			}, e.prototype.hoverElements = function(e) {
				try {
					this.iframe.contentDocument.querySelectorAll(".\\:hover").forEach(function(e) {
						e.classList.remove(":hover")
					});
					for (var t = e; t;) t.classList.add(":hover"), t = t.parentElement
				} catch (eee) {
					console.log("hoverElements exeption");
				}
			}, e.prototype.isUserInteraction = function(e) {
				return e.type === L.IncrementalSnapshot && (e.data.source > D.Mutation && e.data.source <= D.Input)
			}, e.prototype.restoreSpeed = function() {
				if (-1 !== this.noramlSpeed) {
					var e = {
						speed: this.noramlSpeed
					};
					this.setConfig(e), this.emitter.emit(F.SkipEnd, e), this.noramlSpeed = -1
				}
			}, e.prototype.warnNodeNotFound = function(e, t) {
				this.config.showWarning && console.warn("[replayer]", "Node with id '" + t + "' not found in", e)
			}, e.prototype.debugNodeNotFound = function(e, t) {
				this.config.showDebug && console.log("[replayer]", "Node with id '" + t + "' not found in", e)
			}, e
		}();

	function H(e) {
		let t = "";
		return Object.keys(e).forEach(i => {
			t += `${i}: ${e[i]};`
		}), t
	}

	function X(e, t = 2) {
		const i = Math.pow(10, t - 1);
		if (e < i)
			for (e = String(e); String(i).length > e.length;) e = "0" + e;
		return e
	}! function(e, t) {
		void 0 === t && (t = {});
		var i = t.insertAt;
		if (e && "undefined" != typeof document) {
			var n = document.head || document.getElementsByTagName("head")[0],
				r = document.createElement("style");
			r.type = "text/css", "top" === i && n.firstChild ? n.insertBefore(r, n.firstChild) : n.appendChild(r), r.styleSheet ? r.styleSheet.cssText = e : r.appendChild(document.createTextNode(e))
		}
	}('body{margin:0}.replayer-wrapper{position:relative}.replayer-mouse{position:absolute;width:20px;height:20px;transition:.05s linear;background-size:contain;background-position:50%;background-repeat:no-repeat;background-image:url("data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnICBmaWxsPSIjMDAwMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGRhdGEtbmFtZT0iTGF5ZXIgMSIgdmlld0JveD0iMCAwIDUwIDUwIiB4PSIwcHgiIHk9IjBweCI+PHRpdGxlPkRlc2lnbl90bnA8L3RpdGxlPjxwYXRoIGQ9Ik00OC43MSw0Mi45MUwzNC4wOCwyOC4yOSw0NC4zMywxOEExLDEsMCwwLDAsNDQsMTYuMzlMMi4zNSwxLjA2QTEsMSwwLDAsMCwxLjA2LDIuMzVMMTYuMzksNDRhMSwxLDAsMCwwLDEuNjUuMzZMMjguMjksMzQuMDgsNDIuOTEsNDguNzFhMSwxLDAsMCwwLDEuNDEsMGw0LjM4LTQuMzhBMSwxLDAsMCwwLDQ4LjcxLDQyLjkxWm0tNS4wOSwzLjY3TDI5LDMyYTEsMSwwLDAsMC0xLjQxLDBsLTkuODUsOS44NUwzLjY5LDMuNjlsMzguMTIsMTRMMzIsMjcuNThBMSwxLDAsMCwwLDMyLDI5TDQ2LjU5LDQzLjYyWiI+PC9wYXRoPjwvc3ZnPg==")}.replayer-mouse:after{content:"";display:inline-block;width:20px;height:20px;border-radius:10px;background:#4950f6;transform:translate(-10px,-10px);opacity:.3}.replayer-mouse.active:after{animation:a .2s ease-in-out 1}@keyframes a{0%{opacity:.3;width:20px;height:20px;border-radius:10px;transform:translate(-10px,-10px)}50%{opacity:.5;width:10px;height:10px;border-radius:5px;transform:translate(-5px,-5px)}}');
	const W = 1e3,
		U = 60 * W,
		G = 60 * U;

	function $(e) {
		if (e <= 0) return "00:00";
		const t = Math.floor(e / G);
		e %= G;
		const i = Math.floor(e / U);
		e %= U;
		const n = Math.floor(e / W);
		return t ? `${X(t)}:${X(i)}:${X(n)}` : `${X(i)}:${X(n)}`
	}

	function Q() {
		return document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement
	}

	function V(e) {
		y(this, e), this._state = t({}, e.data), this._intro = !!e.intro, this._fragment = function(e, t) {
			var i, l, p, g, v, y, w, b;

			function _() {
				e.set({
					checked: l.checked
				})
			}
			return {
				c() {
					i = a("div"), l = a("input"), p = c("\n  "), g = a("label"), v = c(" "), y = a("span"), w = c(t.label), u(l, "change", _), f(l, "type", "checkbox"), l.id = t.id, l.disabled = t.disabled, l.className = "svelte-a6h7w7", g.htmlFor = t.id, g.className = "svelte-a6h7w7", y.className = "label svelte-a6h7w7", i.className = "switch svelte-a6h7w7", m(i, "disabled", t.disabled)
				},
				m(e, n) {
					s(e, i, n), r(i, l), l.checked = t.checked, r(i, p), r(i, g), r(i, v), r(i, y), r(y, w), b = !0
				},
				p(e, t) {
					e.checked && (l.checked = t.checked), e.id && (l.id = t.id), e.disabled && (l.disabled = t.disabled), e.id && (g.htmlFor = t.id), e.label && d(w, t.label), e.disabled && m(i, "disabled", t.disabled)
				},
				i(e, t) {
					b || this.m(e, t)
				},
				o: n,
				d(e) {
					e && o(i), h(l, "change", _)
				}
			}
		}(this, this._state), e.target && (this._fragment.c(), this._mount(e.target, e.anchor)), this._intro = !0
	}
	t(V.prototype, _);
	var Z = {
		loopTimer() {
			const e = this;
			this.timer = requestAnimationFrame(function t() {
				try {
					const {
						meta: i,
						isPlaying: n,
						replayer: r
					} = e.get();
					if (!n) return void(e.timer = null);
					const s = r.timer.timeOffset + r.getTimeOffset();
					e.set({
						currentTime: s
					}), s < i.totalTime && requestAnimationFrame(t)
				} catch (eee) {
					var a = 1;
					a++;
				}
			})
		},
		play() {
			const {
				replayer: e,
				currentTime: t
			} = this.get();
			t > 0 ? e.resume(t) : (this.set({
				isPlaying: !0
			}), e.play(t))
		},
		pause() {
			const {
				replayer: e
			} = this.get();
			e.pause()
		},
		toggle() {
			const {
				isPlaying: e
			} = this.get();
			e ? this.pause() : this.play()
		},
		setSpeed(e) {
			const {
				replayer: t,
				currentTime: i,
				isPlaying: n
			} = this.get();
			t.pause(), t.setConfig({
				speed: e
			}), this.set({
				speed: e
			}), n && t.resume(i)
		},
		handleProgressClick(e) {
			const {
				meta: t,
				replayer: i,
				isPlaying: n,
				isSkipping: r
			} = this.get();
			if (r) return;
			const s = this.refs.progress.getBoundingClientRect();
			let o = (e.clientX - s.left) / s.width;
			o < 0 ? o = 0 : o > 1 && (o = 1);
			const a = t.totalTime * o;
			this.set({
				currentTime: a
			}), i.play(a), n || i.pause()
		}
	};

	function J() {
		const {
			isPlaying: e
		} = this.get();
		e && this.pause()
	}

	function K({
		changed: e,
		current: t,
		previous: i
	}) {
		if (t.replayer && !i) {
			if (window.replayer = t.replayer, setTimeout(() => {
					this.set({
						isPlaying: !0
					})
				}, 0), t.replayer.play(0), !t.autoPlay) {
				let e = !1;
				t.replayer.on("fullsnapshot-rebuilded", () => {
					e || (e = !0, t.replayer.pause())
				})
			}
			t.replayer.on("pause", () => {
				this.set({
					isPlaying: !1
				})
			}), t.replayer.on("resume", () => {
				this.set({
					isPlaying: !0
				})
			}), t.replayer.on("finish", () => {
				this.timer = null, this.set({
					isPlaying: !1,
					currentTime: 0
				})
			}), t.replayer.on("skip-start", e => {
				e.isSkipping = !0, this.set(e)
			}), t.replayer.on("skip-end", e => {
				e.isSkipping = !1, this.set(e)
			})
		}
		e.isPlaying && t.isPlaying && !this.timer && this.loopTimer(), e.skipInactive && t.replayer.setConfig({
			skipInactive: t.skipInactive
		})
	}

	function ee(e) {
		const {
			component: t,
			ctx: i
		} = this._svelte;
		t.setSpeed(i.s)
	}

	function te(e, t, i) {
		const n = Object.create(e);
		return n.s = t[i], n
	}

	function ie(e, t) {
		var i, n, r = t.showController && ne(e, t);
		return {
			c() {
				r && r.c(), i = document.createComment("")
			},
			m(e, t) {
				r && r.m(e, t), s(e, i, t), n = !0
			},
			p(t, n) {
				n.showController ? (r ? r.p(t, n) : (r = ne(e, n)) && r.c(), r.i(i.parentNode, i)) : r && r.o(function() {
					r.d(1), r = null
				})
			},
			i(e, t) {
				n || this.m(e, t)
			},
			o(e) {
				n && (r ? r.o(e) : e(), n = !1)
			},
			d(e) {
				r && r.d(e), e && o(i)
			}
		}
	}

	function ne(e, t) {
		var i, n, l, f, g, v, y, w, b, _, k, x, M, S, T, N, E, I, C, L, D = $(t.currentTime),
			A = $(t.meta.totalTime),
			F = {};

		function z(t) {
			e.handleProgressClick(t)
		}

		function O(e) {
			return e.isPlaying ? se : re
		}
		var R = O(t),
			P = R(e, t);

		function j(t) {
			e.toggle()
		}
		for (var B = [1, 2, 4, 8], q = [], Y = 0; Y < B.length; Y += 1) q[Y] = oe(e, te(t, B, Y));
		var H = {
			id: "skip",
			disabled: t.isSkipping,
			label: "skip inactive"
		};
		void 0 !== t.skipInactive && (H.checked = t.skipInactive, F.checked = !0);
		var X = new V({
			root: e.root,
			store: e.store,
			data: H,
			_bind(t, i) {
				var n = {};
				!F.checked && t.checked && (n.skipInactive = i.checked), e._set(n), F = {}
			}
		});

		function W(t) {
			e.fire("fullscreen")
		}
		return e.root._beforecreate.push(() => {
			X._bind({
				checked: 1
			}, X.get())
		}), {
			c() {
				i = a("div"), n = a("div"), l = a("span"), f = c(D), g = c("\n    "), v = a("div"), y = a("div"), w = c("\n      "), b = a("div"), _ = c("\n    "), k = a("span"), x = c(A), M = c("\n  "), S = a("div"), T = a("button"), P.c(), N = c("\n    ");
				for (var e = 0; e < q.length; e += 1) q[e].c();
				E = c("\n    "), X._fragment.c(), I = c("\n    "), (C = a("button")).innerHTML = '<svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><defs><style type="text/css"></style></defs><path d="M916 380c-26.4 0-48-21.6-48-48L868 223.2 613.6 477.6c-18.4 18.4-48.8 18.4-68 0-18.4-18.4-18.4-48.8 0-68L800 156 692 156c-26.4 0-48-21.6-48-48 0-26.4 21.6-48 48-48l224 0c26.4 0 48 21.6 48 48l0 224C964 358.4 942.4 380 916 380zM231.2 860l108.8 0c26.4 0 48 21.6 48 48s-21.6 48-48 48l-224 0c-26.4 0-48-21.6-48-48l0-224c0-26.4 21.6-48 48-48 26.4 0 48 21.6 48 48L164 792l253.6-253.6c18.4-18.4 48.8-18.4 68 0 18.4 18.4 18.4 48.8 0 68L231.2 860z" p-id="1286"></path></svg>', l.className = "rr-timeline__time svelte-1cgfpn0", y.className = "rr-progress__step svelte-1cgfpn0", p(y, "width", t.percentage), b.className = "rr-progress__handler svelte-1cgfpn0", p(b, "left", t.percentage), u(v, "click", z), v.className = "rr-progress svelte-1cgfpn0", m(v, "disabled", t.isSkipping), k.className = "rr-timeline__time svelte-1cgfpn0", n.className = "rr-timeline svelte-1cgfpn0", u(T, "click", j), T.className = "svelte-1cgfpn0", u(C, "click", W), C.className = "svelte-1cgfpn0", S.className = "rr-controller__btns svelte-1cgfpn0", i.className = "rr-controller svelte-1cgfpn0"
			},
			m(t, o) {
				s(t, i, o), r(i, n), r(n, l), r(l, f), r(n, g), r(n, v), r(v, y), e.refs.step = y, r(v, w), r(v, b), e.refs.handler = b, e.refs.progress = v, r(n, _), r(n, k), r(k, x), r(i, M), r(i, S), r(S, T), P.m(T, null), r(S, N);
				for (var a = 0; a < q.length; a += 1) q[a].m(S, null);
				r(S, E), X._mount(S, null), r(S, I), r(S, C), L = !0
			},
			p(i, n) {
				if (t = n, L && !i.currentTime || D === (D = $(t.currentTime)) || d(f, D), L && !i.percentage || (p(y, "width", t.percentage), p(b, "left", t.percentage)), i.isSkipping && m(v, "disabled", t.isSkipping), L && !i.meta || A === (A = $(t.meta.totalTime)) || d(x, A), R !== (R = O(t)) && (P.d(1), (P = R(e, t)).c(), P.m(T, null)), i.isSkipping || i.speed) {
					B = [1, 2, 4, 8];
					for (var r = 0; r < B.length; r += 1) {
						const n = te(t, B, r);
						q[r] ? q[r].p(i, n) : (q[r] = oe(e, n), q[r].c(), q[r].m(S, E))
					}
					for (; r < q.length; r += 1) q[r].d(1);
					q.length = B.length
				}
				var s = {};
				i.isSkipping && (s.disabled = t.isSkipping), !F.checked && i.skipInactive && (s.checked = t.skipInactive, F.checked = void 0 !== t.skipInactive), X._set(s), F = {}
			},
			i(e, t) {
				L || this.m(e, t)
			},
			o(e) {
				L && (X && X._fragment.o(e), L = !1)
			},
			d(t) {
				t && o(i), e.refs.step === y && (e.refs.step = null), e.refs.handler === b && (e.refs.handler = null), h(v, "click", z), e.refs.progress === v && (e.refs.progress = null), P.d(), h(T, "click", j),
					function(e, t) {
						for (var i = 0; i < e.length; i += 1) e[i] && e[i].d(t)
					}(q, t), X.destroy(), h(C, "click", W)
			}
		}
	}

	function re(e, t) {
		var i, n;
		return {
			c() {
				i = l("svg"), f(n = l("path"), "d", "M170.65984 896l0-768 640 384zM644.66944 512l-388.66944-233.32864 0 466.65728z"), f(i, "class", "icon"), f(i, "viewBox", "0 0 1024 1024"), f(i, "version", "1.1"), f(i, "xmlns", "http://www.w3.org/2000/svg"), f(i, "xmlns:xlink", "http://www.w3.org/1999/xlink"), f(i, "width", "16"), f(i, "height", "16")
			},
			m(e, t) {
				s(e, i, t), r(i, n)
			},
			d(e) {
				e && o(i)
			}
		}
	}

	function se(e, t) {
		var i, n;
		return {
			c() {
				i = l("svg"), f(n = l("path"), "d", "M682.65984 128q53.00224 0 90.50112 37.49888t37.49888 90.50112l0 512q0 53.00224-37.49888 90.50112t-90.50112 37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224 37.49888-90.50112t90.50112-37.49888zM341.34016 128q53.00224 0 90.50112 37.49888t37.49888 90.50112l0 512q0 53.00224-37.49888 90.50112t-90.50112 37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224 37.49888-90.50112t90.50112-37.49888zM341.34016 213.34016q-17.67424 0-30.16704 12.4928t-12.4928 30.16704l0 512q0 17.67424 12.4928 30.16704t30.16704 12.4928 30.16704-12.4928 12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928zM682.65984 213.34016q-17.67424 0-30.16704 12.4928t-12.4928 30.16704l0 512q0 17.67424 12.4928 30.16704t30.16704 12.4928 30.16704-12.4928 12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928z"), f(i, "class", "icon"), f(i, "viewBox", "0 0 1024 1024"), f(i, "version", "1.1"), f(i, "xmlns", "http://www.w3.org/2000/svg"), f(i, "xmlns:xlink", "http://www.w3.org/1999/xlink"), f(i, "width", "16"), f(i, "height", "16")
			},
			m(e, t) {
				s(e, i, t), r(i, n)
			},
			d(e) {
				e && o(i)
			}
		}
	}

	function oe(e, t) {
		var i, n, l;
		return {
			c() {
				i = a("button"), n = c(t.s), l = c("x"), i._svelte = {
					component: e,
					ctx: t
				}, u(i, "click", ee), i.disabled = t.isSkipping, i.className = "svelte-1cgfpn0", m(i, "active", t.s === t.speed && !t.isSkipping)
			},
			m(e, t) {
				s(e, i, t), r(i, n), r(i, l)
			},
			p(e, n) {
				t = n, i._svelte.ctx = t, e.isSkipping && (i.disabled = t.isSkipping), (e.speed || e.isSkipping) && m(i, "active", t.s === t.speed && !t.isSkipping)
			},
			d(e) {
				e && o(i), h(i, "click", ee)
			}
		}
	}

	function ae(e) {
		y(this, e), this.refs = {}, this._state = t({
			currentTime: 0,
			isPlaying: !1,
			isSkipping: !1,
			skipInactive: !0,
			speed: 1
		}, e.data), this._recompute({
			replayer: 1,
			currentTime: 1,
			meta: 1
		}, this._state), this._intro = !!e.intro, this._handlers.update = [K], this._handlers.destroy = [J], this._fragment = ie(this, this._state), this.root._oncreate.push(() => {
			this.fire("update", {
				changed: i({}, this._state),
				current: this._state
			})
		}), e.target && (this._fragment.c(), this._mount(e.target, e.anchor), v(this)), this._intro = !0
	}
	t(ae.prototype, _), t(ae.prototype, Z), ae.prototype._recompute = function(e, t) {
		e.replayer && this._differs(t.meta, t.meta = function({
			replayer: e
		}) {
			return e.getMetaData()
		}(t)) && (e.meta = !0), (e.currentTime || e.meta) && this._differs(t.percentage, t.percentage = function({
			currentTime: e,
			meta: t
		}) {
			return `${100*Math.min(1,e/t.totalTime)}%`
		}(t)) && (e.percentage = !0)
	};
	const le = 80;
	//  const le = 0;//!!!!!!!!!!!!!!
	var ce = {
		updateScale(e, t) {
			const {
				width: i,
				height: n
				//   } = this.get(), r = i / t.width, s = n / t.height; !!!!!!!!
			} = this.get(), r = i / t.width, s = n / t.height > 0 ? n / t.height : 1;
			//if(r <=0) r= 1;//!!!!!!!!
			// if(s <=0) r= 1;//!!!!!!!!!
			e.style.transform = `scale(${Math.min(r,s,1)})` + "translate(-50%, -50%)"
		},
		fullscreen() {
			var e;
			this.refs.player && (Q() ? document.exitFullscreen ? document.exitFullscreen() : document.mozExitFullscreen ? document.mozExitFullscreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : document.msExitFullscreen && document.msExitFullscreen() : (e = this.refs.player).requestFullscreen ? e.requestFullscreen() : e.mozRequestFullScreen ? e.mozRequestFullScreen() : e.webkitRequestFullscreen ? e.webkitRequestFullscreen() : e.msRequestFullscreen && e.msRequestFullscreen())
		},
		addEventListener(e, t) {
			const {
				replayer: i
			} = this.get();
			i.on(e, t)
		},
		addEvent(e) {
			replayer.addEvent(e)
		}
	};

	function ue() {
		const {
			events: e
		} = this.get(), t = new Y(e, {
			speed: 1,
			root: this.refs.frame,
			skipInactive: !0,
			showWarning: !0
		});
		var i;
		t.on("resize", e => this.updateScale(t.wrapper, e)), this.set({
			replayer: t
		}), this.fullscreenListener = (i = (() => {
			Q() ? setTimeout(() => {
				const {
					width: e,
					height: i
				} = this.get();
				this._width = e, this._height = i;
				const n = {
					width: document.body.offsetWidth,
					height: document.body.offsetHeight - le
				};
				this.set(n), this.updateScale(t.wrapper, {
					width: t.iframe.offsetWidth,
					height: t.iframe.offsetHeight
				})
			}, 0) : (this.set({
				width: this._width,
				height: this._height
			}), this.updateScale(t.wrapper, {
				width: t.iframe.offsetWidth,
				height: t.iframe.offsetHeight
			}))
		}), document.addEventListener("fullscreenchange", i), document.addEventListener("webkitfullscreenchange", i), document.addEventListener("mozfullscreenchange", i), document.addEventListener("MSFullscreenChange", i), () => {
			document.removeEventListener("fullscreenchange", i), document.removeEventListener("webkitfullscreenchange", i), document.removeEventListener("mozfullscreenchange", i), document.removeEventListener("MSFullscreenChange", i)
		})
	}

	function he() {
		this.fullscreenListener && this.fullscreenListener()
	}

	function fe(e, t) {
		var i, n = {
				replayer: t.replayer,
				showController: t.showController,
				autoPlay: t.autoPlay,
				skipInactive: t.skipInactive
			},
			r = new ae({
				root: e.root,
				store: e.store,
				data: n
			});
		return r.on("fullscreen", function(t) {
			e.fullscreen()
		}), {
			c() {
				r._fragment.c()
			},
			m(e, t) {
				r._mount(e, t), i = !0
			},
			p(e, t) {
				var i = {};
				e.replayer && (i.replayer = t.replayer), e.showController && (i.showController = t.showController), e.autoPlay && (i.autoPlay = t.autoPlay), e.skipInactive && (i.skipInactive = t.skipInactive), r._set(i)
			},
			i(e, t) {
				i || this.m(e, t)
			},
			o(e) {
				i && (r && r._fragment.o(e), i = !1)
			},
			d(e) {
				r.destroy(e)
			}
		}
	}

////////init palyer gui/////

	function de(e) {
		var n, l, u, h, f, d, p;
		y(this, e), this.refs = {}, this._state = t({
			showController: !0,
			//width: 1024,
			//height: 576,

			width: PlayerWidth,
			height: PlayerHeight,




			events: [],
			autoPlay: !0,
			skipInactive: !0,
			replayer: null
		}, e.data), this._recompute({
			width: 1,
			height: 1
		}, this._state), this._intro = !!e.intro, this._handlers.destroy = [he], this._fragment = (n = this, l = this._state, p = l.replayer && fe(n, l), {
			c() {
				u = a("div"), h = a("div"), f = c("\n  "), p && p.c(), h.className = "rr-player__frame svelte-1wetjm2", h.style.cssText = l.style, u.className = "rr-player svelte-1wetjm2", u.style.cssText = l.playerStyle
			},
			m(e, t) {
				s(e, u, t), r(u, h), n.refs.frame = h, r(u, f), p && p.m(u, null), n.refs.player = u, d = !0
			},
			p(e, t) {
				d && !e.style || (h.style.cssText = t.style), t.replayer ? (p ? p.p(e, t) : (p = fe(n, t)) && p.c(), p.i(u, null)) : p && p.o(function() {
					p.d(1), p = null
				}), d && !e.playerStyle || (u.style.cssText = t.playerStyle)
			},
			i(e, t) {
				d || this.m(e, t)
			},
			o(e) {
				d && (p ? p.o(e) : e(), d = !1)
			},
			d(e) {
				e && o(u), n.refs.frame === h && (n.refs.frame = null), p && p.d(), n.refs.player === u && (n.refs.player = null)
			}
		}), this.root._oncreate.push(() => {
			ue.call(this), this.fire("update", {
				changed: i({}, this._state),
				current: this._state
			})
		}), e.target && (this._fragment.c(), this._mount(e.target, e.anchor), v(this)), this._intro = !0
	}
	return t(de.prototype, _), t(de.prototype, ce), de.prototype._recompute = function(e, t) {
		(e.width || e.height) && (this._differs(t.style, t.style = function({
			width: e,
			height: t
		}) {
			return H({
				width: `${e}px`,
				height: `${t}px`
			})
		}(t)) && (e.style = !0), this._differs(t.playerStyle, t.playerStyle = function({
			width: e,
			height: t
		}) {
			return H({
				width: `${e}px`,
				height: `${t+le}px`
			})
		}(t)) && (e.playerStyle = !0))
	}, de
}();