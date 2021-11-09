	/* handle ACs sort order change request */
	function onClickACHeader(col){
		var ah = document.getElementById("aircrafts-head");
		if(aircrafts_table_sort_col == col){
			if(aircrafts_table_sort_ascending)aircrafts_table_sort_ascending=false; else aircrafts_table_sort_ascending=true;}
		aircrafts_table_sort_col = col;
		aircrafts_table_sort_numeric = aircrafts_table_column_numerics[col];
		if(aircrafts_table_sort_ascending)
			ah.getElementsByTagName("TH")[col].style.background = "#600000";
		else
			ah.getElementsByTagName("TH")[col].style.background = "#006000";
	}
	
	var layerGroup = L.layerGroup().addTo(mymap);

	const primary_icaos = []; // primary receiver icaos
	var aircrafts_positions = ["",0,0]; // all visible flights with callsign, lat, lon
	var second_ac_data = null; // supplementary / secondary receiver aircraft json - null if error
	var second_stat_data = null; // supplementary / secondary receiver statistics json - null if error

	var ac_count = 0, ac_with_pos_count = 0, ac_msgs = 0, ac_max_distance = 0, ac_max_distance_all_time = 0;

	// circular and altitude reception statistics
	// [receiver_label, angle (in int 0-359), min_distance, max_distance, max_distance_rssi, min_alt, max_alt]
	var receiver_circular_stats = [];
	for(i=0;i<360;i++)receiver_circular_stats.push([receiver_label,i,999,0,99,99999,0]);
	for(i=0;i<360;i++)receiver_circular_stats.push([second_receiver_label,i,999,0,99,99999,0]);

	// table sorting variables
	var aircrafts_table_sort_col = 8, aircrafts_table_sort_ascending = true, aircrafts_table_sort_numeric = true;
	const aircrafts_table_column_numerics = [false,false,true,false,true,true,true,true,true,true,true,true,false,false];

	function refreshAircrafts(){
		getJSON("http://" + receiver_domain + "/dump1090-fa/data/aircraft.json",
			function(err,data){
				if(err==null){
					document.getElementById("ecam-display").value.replace("  ADSB 1 FAIL",""); 
					// fetch secondary receiver data json, if enabled
					if( second_receiver_enabled ){
						getJSON("http://" + second_receiver_domain + "/dump1090-fa/data/aircraft.json",
							function(err,data){
								second_ac_data = null;
								if(err==null){ 
									second_ac_data = data;
				 					document.getElementById("ecam-display").value.replace("  ADSB 2 FAIL","");
								} else {
									document.getElementById("ecam-display").value += "  ADSB 2 FAIL";  
				 				}
							});
					}
					// begin update by clearing all the map data and redrawing the alti-bar box
					layerGroup.clearLayers();
					drawAltiBox();
					var ah = document.getElementById("aircrafts-head");
					var headHTML = "<th style='text-align: left;' onClick='onClickACHeader(0)'>Callsign</th><th onClick='onClickACHeader(1)'>Cat</th><th onClick='onClickACHeader(2)'>Track</th><th onClick='onClickACHeader(3)'>Squawk</th><th onClick='onClickACHeader(4)'>Alt</th><th onClick='onClickACHeader(5)'>Rate</th><th onClick='onClickACHeader(6)'>GS</th><th onClick='onClickACHeader(7)'>TAS</th><th onClick='onClickACHeader(8)'>Dist</th><th onClick='onClickACHeader(9)'>RSSI</th><th onClick='onClickACHeader(10)'>Seen</th><th onClick='onClickACHeader(11)'>Msgs</th><th onClick='onClickACHeader(12)'>Recvd</th><th onClick='onClickACHeader(13)'>L/D</th>";
					ah.innerHTML = headHTML;
					var al = document.getElementById("aircrafts-body");
					//al.innerHTML = "";
					var outHTML = "";

					// calculate zoom corrections for the aircraft map marker
					var zoom_correction_lat = 0.01, zoom_correction_lon = 0.02;
					var zoom_level = mymap.getZoom();
					if(zoom_level){
						zoom_correction_lat = 0.01 * (36/Math.pow(zoom_level,2));
						zoom_correction_lon = 0.02 * (36/Math.pow(zoom_level,2));
					}					

					ac_count = 0; ac_with_pos_count = 0; ac_msgs = 0; ac_max_distance = 0; 
					while( primary_icaos.length > 0 ) primary_icaos.pop(); // clear up primary icaos list
					while( aircrafts_positions.length > 0 ) aircrafts_positions.pop(); // clear up aircraft positions
					// parse through all the primary receiver aircrafts
					for(var key in data.aircraft)
					{
						var aci = data.aircraft[key];
						var lat=0, lon=0, altitude=-1, rate=0, track=-1, tas=-1, gs=-1, squawk="", seen=-1, rssi=0.0, msgs=0, cat="";
						var roll = 0, nav_altitude = 0, nav_heading = 0, nav_qnh = 0, mach = 0;
						var flight="", icao="";
						var position_received = ""; // which receiver had the position
						var company_name = "";

						ac_count++;	// update all aircrafts count

						if( aci.hex ) icao = aci.hex;
						primary_icaos.push(icao);

						var second_aci = null;
						// check secondary receiver data if this ac is in there
						if( second_ac_data )
							for( var k2 in second_ac_data.aircraft ){
								var tmp_aci = second_ac_data.aircraft[k2];
								if(tmp_aci) 
									if( tmp_aci.hex == icao ){
										second_aci = tmp_aci;
										break; 
									}
							}

						if(aci.flight)flight = aci.flight; else if(second_aci) if(second_aci.flight) flight = second_aci.flight;
						if(flight)company_name = findCompany(flight);
						if(!company_name) company_name = "";
						if(aci.squawk)squawk = aci.squawk; else if(second_aci) if(second_aci.squawk) squawk = second_aci.squawk;
						lat = aci.lat;
						lon = aci.lon;
						if(lat&&lon) position_received = receiver_label;
						if(!lat && second_aci) { if(second_aci.lat){ lat = second_aci.lat; position_received = second_receiver_label; } }
						if(!lon && second_aci) { if(second_aci.lon){ lon = second_aci.lon; position_received = second_receiver_label; } }
						if(position_received) ac_with_pos_count++;
						if(aci.alt_baro)altitude = aci.alt_baro; else if(second_aci) if(second_aci.alt_baro) altitude = second_aci.alt_baro;
						if(aci.baro_rate)rate = aci.baro_rate; else if(second_aci) if(second_aci.baro_rate) rate = second_aci.baro_rate;
						if(aci.track)track = Math.floor(aci.track); else if(second_aci) if(second_aci.track) track = Math.floor(second_aci.track);
						if(aci.tas)tas = aci.tas; else if(second_aci) if(second_aci.tas) tas = second_aci.tas;
						if(aci.gs)gs = aci.gs; else if(second_aci) if(second_aci.gs) gs = second_aci.gs;
						if(aci.rssi)rssi = aci.rssi;
						if(aci.seen)seen = aci.seen;
						if(aci.messages)msgs = aci.messages;
						ac_msgs+=msgs;
						if(aci.category)cat = aci.category;

						if(aci.roll)roll = aci.roll;
						if(aci.nav_altitude_mcp)nav_altitude = aci.nav_altitude_mcp;
						if(aci.nav_heading)nav_heading = aci.nav_heading;
						if(aci.nav_qnh)nav_qnh = aci.nav_qnh;
						if(aci.mach)mach = aci.mach;

						if(track<0)track="";
						if(altitude<0)altitude="";
						if(tas<0)tas="";
						if(gs<0)gs="";
						if(seen<0)seen="";
						if(seen>=100)seen = Math.floor(seen); 

						// Add flight to aircrafts_positions
						if(lat && lon)
							aircrafts_positions.push([flight,lat,lon]);

						// FD update
						if(flight == FD_flight){
		 					FD_tas = -1; FD_gs = -1; FD_altitude = -1; FD_rate = 0; FD_track = 0; FD_roll = 0; FD_mach = -1; FD_nav_altitude = -1; FD_nav_heading = -1;
							FD_effective_flight = FD_flight;
							FD_tas = tas;
							FD_gs = gs;
							FD_altitude = altitude;
							FD_rate = rate;
							FD_roll = roll;
							FD_mach = mach;
							FD_track = track;
							FD_nav_altitude = nav_altitude;
							FD_nav_heading = nav_heading;
							FD_nav_qnh = nav_qnh;
						}

						var distance = -1;
						if( lat && lon ) 
							if( position_received == receiver_label) {
								distance = getDistanceFromLatLonInKm(receiver_lat,receiver_lon,lat,lon,'km');
							} else {
								distance = getDistanceFromLatLonInKm(second_receiver_lat,second_receiver_lon,lat,lon,'km');								
							}
						if( distance > ac_max_distance ) ac_max_distance = Math.floor(distance);
						if( ac_max_distance > ac_max_distance_all_time) ac_max_distance_all_time = ac_max_distance;

						if( filters_map_checked ){
							if( lat && lon ){
								var map_center = mymap.getCenter();
								var ac_distance_to_center = getDistanceFromLatLonInKm(map_center.lat,map_center.lng,lat,lon,'km');
								// console.log("AC distance to center [" + map_center.lat + "," + map_center.lng +"]: " + ac_distance_to_center);
								if( ac_distance_to_center > filters_map_distance ) continue;
							} else continue;
						}

						//console.log(flight + " " + lat + "," + lon + " " + altitude);
						outHTML += "<tr>";
						var flight_style = " text-align: left;";
						var pos_style = "background: #101050;";
						if( position_received == second_receiver_label ) pos_style = "background: #101090;"; 
						if( !lat && !lon ) pos_style = "color: #8080A2;";
						var seen_style = "";
						if( seen > 15.0 ) seen_style = " color: #F07072";  
						if( seen > (1*60) ) pos_style += " text-decoration: line-through; text-decoration-color: #F00000;";
						var rssi_style = "";
						if( rssi >= -3.0 ) rssi_style = " color: #FFFFFF; background: #901010; ";
						var distance_style = "";
						if( distance < 50 ) distance_style = " color: #F07072";
						if( distance < 0 ) { distance = " "; distance_style = " color: #000000:"; }
						var squawk_style = "";
						if( squawk == "7700" || squawk == "7600" || squawk == "7500" ) squawk_style = " background: #FF0000; color: #FFFFFF; font-weight: bold;";

						var cat_explanation = "";
						switch(cat){
							case "A1" : { cat_explanation = "Class A1: Light"; break; }
							case "A2" : { cat_explanation = "Class A2: Small"; break; }
							case "A3" : { cat_explanation = "Class A3: Large"; break; }
							case "A4" : { cat_explanation = "Class A4: High vortext"; break; }
							case "A5" : { cat_explanation = "Class A5: Heavy"; break; }
							case "A6" : { cat_explanation = "Class A6: High Performance"; break; }
							case "A7" : { cat_explanation = "Class A7: Helicopter"; break; } 
							default: { break; }
						}

						var more_info = "Roll: " + roll + "\nSet heading: " + nav_heading + "\nSet altitude: " + nav_altitude + "\nSet QNH: " + nav_qnh;

						var avail = receiver_label;
						if(position_received==receiver_label) avail = "<span style='color: #80FF81; font-weight: bold;'>" + receiver_label + "</span>";
						if(second_aci && position_received!=second_receiver_label) avail += "+" + second_receiver_label;
						else if(second_aci && position_received==second_receiver_label) avail += "+<span style='color: #50FF51; font-weight: bold;'>" + second_receiver_label + "</span>";

						var flight_title = "ICAO hex: " + icao;
						if(selected_company_name) flight_title += "\nCompany: " + selected_company_name;
						if(selected_company_phrase) flight_title += "\nATC callsign: " + selected_company_phrase + " " + flight.substring(3);

						var near_airport = "", landing_departing = "";
						var ld_style = "text-align: center;";
						var ld_title = "";
						if( altitude < 10000 ){ // determine landing and departing aircrafts
							if( cat != "" && cat != "A1" && cat != "A7" ) // forget about light aircrafts and helicopters (too vague conditions for those)
								if( rate > 500 ){ // over +500 ft/min, could be departing if near runway
									for(i=0; i<nearest_longer_runways.length; i++){
										// within 30 miles (although not nautical miles)
										if(getDistanceFromLatLonInKm(nearest_longer_runways[i][4],nearest_longer_runways[i][5],lat,lon,'m')<30){
											near_airport = nearest_longer_runways[i][0];
											landing_departing = "D";
											ld_style += " background: #FFFFFF; color: #006F00;";
											ld_title = "Most likely departing from " + near_airport;
											break;
										}
									}
								} else if( rate < -250 ){ // steeper than -250 ft/min, could be landing if near runway
									for(i=0; i<nearest_longer_runways.length; i++){
										// within 30 miles (although not nautical miles)
										if(getDistanceFromLatLonInKm(nearest_longer_runways[i][4],nearest_longer_runways[i][5],lat,lon,'m')<30){
											near_airport = nearest_longer_runways[i][0];
											landing_departing = "L";
											ld_style += " background: #FFFFFF; color: #FF0000;";
											ld_title = "Most likely landing to " + near_airport;
											break;
										}
									}
								}
						}

						// update circular and altitude statistics
						if( lat && lon ){
							if(position_received==receiver_label){ 
								var angle = Math.floor(getAngleBetweenTwoLatLon(receiver_lat,receiver_lon,lat,lon));
								// [receiver_label, angle (in int 0-359), min_distance, max_distance, max_distance_rssi, min_alt, max_alt]
								for(i=0;i<360;i++){
									if(receiver_circular_stats[i][0] == receiver_label && receiver_circular_stats[i][1] == angle){
										if(distance < receiver_circular_stats[i][2]){ receiver_circular_stats[i][2]=distance; receiver_circular_stats[i][5]=altitude; }
										if(distance > receiver_circular_stats[i][3]){ receiver_circular_stats[i][3]=distance; receiver_circular_stats[i][4]=rssi; receiver_circular_stats[i][6]=altitude; }
										break;
									} 
								}
							}
							if(position_received==second_receiver_label){
								var angle = getAngleBetweenTwoLatLon(second_receiver_lat,second_receiver_lon,lat,lon);
								for(i=360;i<receiver_circular_stats.length;i++){
									if(receiver_circular_stats[i][0] == second_receiver_label && receiver_circular_stats[i][1] == angle){
										if(distance < receiver_circular_stats[i][2]){ receiver_circular_stats[i][2]=distance; receiver_circular_stats[i][5]=altitude; }
										if(distance > receiver_circular_stats[i][3]){ receiver_circular_stats[i][3]=distance; receiver_circular_stats[i][4]=rssi; receiver_circular_stats[i][6]=altitude; }
										break;
									} 
								}
							}
						}

						outHTML += "<td style='"+ pos_style + flight_style +"' onmouseover='showFD(\"" + flight + "\")' onmouseout='hideFD()'  onclick='clickOpenFD(\"" + flight + "\")' title='" + flight_title + "'>" + flight + "</td><td style='"+ pos_style +"' title='" + cat_explanation +"'>" + cat + "</td><td style='"+ pos_style +"' title='" + more_info + "'>" + track + "</td><td style='"+ pos_style + squawk_style +"' title='" + flight_title + "'>" + squawk + "</td><td style='"+ pos_style +"'>" + altitude + "</td><td style='"+ pos_style +"'>" + rate + "</td><td style='"+ pos_style +"'>" + Math.floor(gs) + "</td><td style='"+ pos_style +"'>" + Math.floor(tas) + "</td><td style='" + pos_style + distance_style + "'>" + Math.floor(distance) + "</td><td style='"+ pos_style + rssi_style + "'>" + rssi + "</td><td style='"+ pos_style + seen_style + "'>" + seen + "</td><td style='"+ pos_style + "'>" + msgs + "</td><td style='"+ pos_style + "'>" + avail + "</td><td style='"+ pos_style + ld_style + "' title='"+ ld_title +"'><a href='#" + near_airport + "'>" + landing_departing + "</a></td>"; 

						outHTML += "</tr>";
						//console.log( "|" + al.innerHTML + "|" );

						// refresh altimeter graph
						if( altitude > 0 ){
							if(canvas.getContext){
								const ctx = canvas.getContext("2d");
								if(flight)
									drawLine(ctx,[56,500-(altitude/100)],[69,500-(altitude/100)],'red',1);
								else
									drawLine(ctx,[56,500-(altitude/100)],[69,500-(altitude/100)],'darkyellow',1);
								var rate_prefix = " ";
								if(rate>70) {
									rate_prefix = "↑";
									ctx.strokeStyle = "green";
								} else if (rate<-70) {
									rate_prefix = "↓";
									ctx.strokeStyle = "red";
								} else { 
									ctx.strokeStyle = "blue";
								}
								ctx.font = "small-caps normal 9px sans-serif";
								if( seen < 20 ){
									ctx.strokeText(rate_prefix + " " + flight,74,500-(altitude/100)+4);
									ctx.strokeText((Math.floor(altitude/100)),31,500-(altitude/100)+4);
								}	
							}
						}

						// update map
						if( lat!=null && lon!=null ) 
						{
							// add position marker
							if(cat.substring(0,1)=="A" || cat.substring(0,1) == "")
								var ac = L.rectangle([[lat-zoom_correction_lat, lon-zoom_correction_lon], [lat+zoom_correction_lat,lon+zoom_correction_lon]], {
									color: '#00FF00',
									fillColor: '#000',
									fillOpacity: 0.9,
									radius: 2300
								}).addTo(layerGroup);
							else
								var ac = L.rectangle([[lat-0.00001, lon-0.00002], [lat+0.0001,lon+0.00002]], {
									color: '#FF00FF',
									fillColor: '#000',
									fillOpacity: 0.9,
									radius: 100
								}).addTo(layerGroup);
							// add heading line, variable by ground speed - indicating the ac position in the next 1 min if speed and heading are preserved
							var speed_km = gs *1.852;
							var headline_len = speed_km / 60;                           
							nextpoint_lat = 0; nextpoint_lon = 0;
							if( track ) calcNextPoint(lat,lon,track,headline_len); // indicator with km distance calculated from gs
							if( nextpoint_lat != 0 && nextpoint_lon != 0 ) {
							var headline = L.polyline([ [lat,lon],[nextpoint_lat,nextpoint_lon] ], { color: 'yellow', weight: 2, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroup);
							}
							// add tooltip text
							var st_track = "-";
							if( track )st_track = Math.floor(track);
							var	st_alt = "FL" + Math.floor(altitude/100),
								st_rate = "-",
								st_squawk = "[<span style='color: #9092e0;'>" + squawk + "</span>]";
							if( !aci.squawk )st_squawk = ""; 
							if( (squawk == "7700") || (squawk == "7600") || (squawk == "7500") )
								st_squawk = "<span style='color: #ff0000; font-size: 1.2em;'><b> EM </b> [" + squawk + "]</span>";
							if( altitude < 5000 ) st_alt = altitude;
							if( rate > 0 ) st_rate = "&uarr;<span style='color:#40c041;'>" + rate + "</span>";
							if( rate < 0 ) st_rate = "&darr;<span style='color:#c04041;'>" + (-rate) + "</span>";
							if( !flight && !squawk )
								ac.bindTooltip(" " + st_track + "&deg; " + Math.floor(gs) + " " + st_alt + " " + st_rate, { permanent: true, direction: 'center', offset: [35,19] });
							else
								ac.bindTooltip("<span style='color: #70f072;'><b>" + flight + "</b></span> " + st_squawk + "<br/>" + st_track + "&deg; " + Math.floor(gs) + " " + st_alt + " " + st_rate, { permanent: true, direction: 'center', offset: [35,19] });
						}
					}
					al.innerHTML = outHTML; // populate aircraft table
					sortTable("aircrafts",aircrafts_table_sort_col,aircrafts_table_sort_ascending,aircrafts_table_sort_numeric); // sort by column 8 = distance, ascending, numeric information
					//debugTable();
					// insert footer with total counts to stats
					var footHTML = "";
					footHTML = "<tr>";
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_count + "</td>";
					footHTML += "<td colspan='2'>aircrafts in total</td>";					
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_with_pos_count + "</td>";
					footHTML += "<td colspan='2'>with positions</td>";
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_max_distance + "</td>";
					footHTML += "<td colspan='2'>km max dist.now</td>";
					/*					
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_msgs + "</td>";					
					footHTML += "<td colspan='2'>msgs</td>";					
					*/
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_max_distance_all_time + "</td>";
					footHTML += "<td colspan='2'>km this session</td>";					
					footHTML += "</tr>";
					document.getElementById("stats-footer").innerHTML = footHTML;					
				} else {
					document.getElementById("ecam-display").value += "  ADSB 1 FAIL"; 
				}
			}
		);
	}
	
	refreshAircrafts();
	var refreshACInterval = setInterval(refreshAircrafts, aircraft_refresh_rate);