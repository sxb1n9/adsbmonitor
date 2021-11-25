	var receiver_noise = 0, receiver_signal = 0, receiver_peak = 0;
	var second_receiver_noise = 0, second_receiver_signal = 0, second_receiver_peak = 0;

	var receiver_snr_max = 0;
	var second_receiver_snr_max = 0;
	var receiver_msgs_1min = 0, receiver_msgs_1min_max = 0;
	var second_receiver_msgs_1min = 0, second_receiver_msgs_1min_max = 0;

	var stats_display_page = 1;
	const max_stats_display_page = 3;

	function refreshStats(){
		if(JSONError=="http://" + receiver_domain + receiver_stats_url_path){
			JSONError="";
			receiver_ok = false;
		}
		if(JSONError=="http://" + second_receiver_domain + second_receiver_stats_url_path){
			JSONError="";
			second_receiver_ok = false;
		}
		getJSON("http://" + receiver_domain + receiver_stats_url_path,
			function(err,data){
				if(err==null){
					receiver_ok = true;
					var sh = document.getElementById("stats-head");
					var label_style = "background: #206061; text-align: center; color: #FFFFFF;";
					var hrate_style = "background: #206071; text-align: center; color: #FFFFFF;";
					var h5_style = "background: #205061; text-align: center; color: #FFFFFF;";
					var h15_style = "background: #204051; text-align: center; color: #FFFFFF;";
					sh.innerHTML="<th style='"+label_style+"; width: 30px;'><br/>#</th><th style='"+hrate_style+"'>Msg<br/>Rate</th><th style='"+h5_style+"'>5 min<br/>Peak</th><th style='"+h5_style+"'><br/>Sig</th><th style='"+h5_style+"'><br/>Noise</th><th style='"+h5_style+"'><br/>Msgs</th><th style='"+h5_style+"'><br/>Pos</th><th style='"+h15_style+"'>15 min<br/>Peak</th><th style='"+h15_style+"'><br/>Sig</th><th style='"+h15_style+"'><br/>Noise</th><th style='"+h15_style+"'><br/>Msgs</th><th style='"+h15_style+"'><br/>Pos</th>";
					var st = document.getElementById("stats-body");
					var outHTML = "";
					//for(var key in data)
					{
						var msgs = 0.0, msgrate = 0.0; 
						var noise5 = 0.0, peak5 = 0.0, sig5 = 0.0, msgs5 = 0, pos5 = 0, ok5 = 0;
						var noise15 = 0.0, peak15 = 0.0, sig15 = 0.0, msgs15 = 0, pos15 = 0, ok15 = 0;

						if(data.last1min.messages) msgs = data.last1min.messages;
						receiver_msgs_1min = msgs;
						if(msgs > receiver_msgs_1min_max) receiver_msgs_1min_max = msgs;
						if(data.last1min.local.noise) receiver_noise = data.last1min.local.noise;
						if(data.last1min.local.signal) receiver_signal = data.last1min.local.signal;
						if(data.last1min.local.peak) receiver_peak = data.last1min.local.peak;
						msgrate = (msgs / 60).toFixed(1);

						if(data.last5min.local.noise) noise5 = data.last5min.local.noise;
						if(data.last5min.local.signal) sig5 = data.last5min.local.signal;
						if(data.last5min.local.peak_signal) peak5 = data.last5min.local.peak_signal;
						if(data.last5min.cpr.local_ok) ok5 = data.last5min.cpr.local_ok;									
						if(data.last5min.cpr.airborne) pos5 = data.last5min.cpr.airborne;
						if(data.last5min.messages) msgs5 = data.last5min.messages;

						if(data.last15min.local.noise) noise15 = data.last15min.local.noise;
						if(data.last15min.local.signal) sig15 = data.last15min.local.signal;
						if(data.last15min.local.peak_signal) peak15 = data.last15min.local.peak_signal;
						if(data.last15min.cpr.local_ok) ok15 = data.last15min.cpr.local_ok;
						if(data.last15min.cpr.airborne) pos15 = data.last15min.cpr.airborne;
						if(data.last15min.messages) msgs15 = data.last15min.messages;

						var stat_style = " text-align: center;";

						var rate_style = " color: #B0B0FF;";
						if(msgrate < 2) rate_style = " color: #FF1011;";
						if(msgrate > 50) rate_style = " color: #80FF81;";

						var sig5_style = "";
						if(sig5 > -3.0) sig5_style = " color: #FF1011;";

						var sig15_style = "";
						if(sig15 > -3.0) sig15_style = " color: #FF1011;";

						outHTML += "<tr>";

						outHTML += "<td style='" + stat_style + "'>" + receiver_label + "</td>" + "<td style='" + stat_style + rate_style + "'>" + msgrate + "</td>" + "<td style='" + stat_style + "'>" + peak5 + "</td>" + "<td style='" + stat_style + sig5_style + "'>" + sig5 + "</td>" + "<td style='" + stat_style + "'>" + noise5 + "</td>" + "<td style='" + stat_style + "'>" + msgs5 + "</td>" + "<td style='" + stat_style + "'>" + pos5 + "</td>" + "<td style='" + stat_style + "'>" + peak15 + "</td>" + "<td style='" + stat_style + sig15_style + "'>" + sig15 + "</td>" + "<td style='" + stat_style + "'>" + noise15 + "</td>" + "<td style='" + stat_style + "'>" + msgs15 + "</td>" + "<td style='" + stat_style + "'>" + pos15 + "</td>";

						outHTML += "</tr>";
					}
					// fetch secondary receiver data json, if enabled
					if( second_receiver_enabled ){
						getJSON("http://" + second_receiver_domain + second_receiver_stats_url_path,
								function(err,data){
									second_stat_data = null;
									if(err==null){
										second_receiver_ok = true;
										second_stat_data = data;
									}
								});
					}
					if( second_stat_data )
					{
						msgs = 0.0; msgrate = 0.0; 
						noise5 = 0.0; peak5 = 0.0; sig5 = 0.0; msgs5 = 0; pos5 = 0; ok5 = 0;
						noise15 = 0.0; peak15 = 0.0; sig15 = 0.0; msgs15 = 0; pos15 = 0; ok15 = 0;

						if(second_stat_data.last1min.messages) msgs = second_stat_data.last1min.messages;
						msgrate = (msgs / 60).toFixed(1);
						second_receiver_msgs_1min = msgs;
						if(msgs > second_receiver_msgs_1min_max) second_receiver_msgs_1min_max = msgs;
						if(second_stat_data.last1min.local.noise) second_receiver_noise = second_stat_data.last1min.local.noise;
						if(second_stat_data.last1min.local.signal) second_receiver_signal = second_stat_data.last1min.local.signal;
						if(second_stat_data.last1min.local.peak) second_receiver_peak = second_stat_data.last1min.local.peak;

						if(second_stat_data.last5min.local.noise) noise5 = second_stat_data.last5min.local.noise;
						if(second_stat_data.last5min.local.signal) sig5 = second_stat_data.last5min.local.signal;
						if(second_stat_data.last5min.local.peak_signal) peak5 = second_stat_data.last5min.local.peak_signal;
						if(second_stat_data.last5min.cpr.local_ok) ok5 = second_stat_data.last5min.cpr.local_ok;									
						if(second_stat_data.last5min.cpr.airborne) pos5 = second_stat_data.last5min.cpr.airborne;
						if(second_stat_data.last5min.messages) msgs5 = second_stat_data.last5min.messages;

						if(second_stat_data.last15min.local.noise) noise15 = second_stat_data.last15min.local.noise;
						if(second_stat_data.last15min.local.signal) sig15 = second_stat_data.last15min.local.signal;
						if(second_stat_data.last15min.local.peak_signal) peak15 = second_stat_data.last15min.local.peak_signal;
						if(second_stat_data.last15min.cpr.local_ok) ok15 = second_stat_data.last15min.cpr.local_ok;
						if(second_stat_data.last15min.cpr.airborne) pos15 = second_stat_data.last15min.cpr.airborne;
						if(second_stat_data.last15min.messages) msgs15 = second_stat_data.last15min.messages;

						stat_style = " text-align: center; background: #202021;";

						rate_style = " color: #B0B0FF;";
						if(msgrate < 10) rate_style = " color: #FF1011;";
						if(msgrate > 50) rate_style = " color: #80FF81;";

						var sig5_style = "";
						if(sig5 > -3.0) sig5_style = " color: #FF1011;";

						var sig15_style = "";
						if(sig15 > -3.0) sig15_style = " color: #FF1011;";

						outHTML += "<tr>";

						outHTML += "<td style='" + stat_style + "'>" + second_receiver_label + "</td>" + "<td style='" + stat_style + rate_style + "'>" + msgrate + "</td>" + "<td style='" + stat_style + "'>" + peak5 + "</td>" + "<td style='" + stat_style + sig5_style + "'>" + sig5 + "</td>" + "<td style='" + stat_style + "'>" + noise5 + "</td>" + "<td style='" + stat_style + "'>" + msgs5 + "</td>" + "<td style='" + stat_style + "'>" + pos5 + "</td>" + "<td style='" + stat_style + "'>" + peak15 + "</td>" + "<td style='" + stat_style + sig15_style + "'>" + sig15 + "</td>" + "<td style='" + stat_style + "'>" + noise15 + "</td>" + "<td style='" + stat_style + "'>" + msgs15 + "</td>" + "<td style='" + stat_style + "'>" + pos15 + "</td>";

						outHTML += "</tr>";
					}
					st.innerHTML = outHTML;
				}
			}
		);
    }

	refreshStats();
	var refreshStatsInterval = setInterval(refreshStats, stats_refresh_rate);

	// Stats display under the stats
	var sd_canvas = document.getElementById("stats-display");
	var sd_ctx = sd_canvas.getContext("2d");

	function initStatsDisplay(){
		// init canvas
		sd_ctx.clearRect(0,0,sd_canvas.width,sd_canvas.height);
		sd_ctx.font = "normal 12px sans-serif"; // small-caps

		// common pager symbols
		sd_ctx.lineWidth = 0.5;
		sd_ctx.fillStyle = "#BFBFFF";
		sd_ctx.strokeStyle = "white";
		sd_ctx.beginPath();
		sd_ctx.moveTo(0,29);
		sd_ctx.lineTo(6,30);
		sd_ctx.lineTo(6,50);
		sd_ctx.lineTo(0,51);
		sd_ctx.moveTo(0,29);
		sd_ctx.closePath();
		sd_ctx.stroke();

		sd_ctx.lineWidth = 1;
		sd_ctx.beginPath();
		sd_ctx.moveTo(4,35);
		sd_ctx.lineTo(0,40);
		sd_ctx.lineTo(4,45);
		sd_ctx.fill();
		sd_ctx.closePath();

		sd_ctx.lineWidth = 0.5;
		sd_ctx.fillStyle = "#AFAFFF";
		sd_ctx.strokeStyle = "white";
		sd_ctx.beginPath();
		sd_ctx.moveTo(450,29);
		sd_ctx.lineTo(444,30);
		sd_ctx.lineTo(444,50);
		sd_ctx.lineTo(450,51);
		sd_ctx.moveTo(450,29);
		sd_ctx.closePath();
		sd_ctx.stroke();

		sd_ctx.lineWidth = 1;
		sd_ctx.fillStyle = "#BFBFFF";
		sd_ctx.beginPath();
		sd_ctx.moveTo(446,35);
		sd_ctx.lineTo(450,40);
		sd_ctx.lineTo(446,45);
		sd_ctx.closePath();
		sd_ctx.fill();

		sd_ctx.lineWidth = 0.5;
		sd_ctx.fillStyle = "#AFAFFF";
		sd_ctx.strokeStyle = "white";
		sd_ctx.beginPath();
		sd_ctx.moveTo(450,59);
		sd_ctx.lineTo(444,60);
		sd_ctx.lineTo(444,80);
		sd_ctx.lineTo(450,80);
		sd_ctx.moveTo(450,60);
		sd_ctx.closePath();
		sd_ctx.stroke();

		sd_ctx.lineWidth = 1;
		sd_ctx.fillStyle = "#FF1F1F";
		sd_ctx.beginPath();
		sd_ctx.moveTo(450,67);
		sd_ctx.lineTo(446,67);
		sd_ctx.lineTo(446,73);
		sd_ctx.lineTo(450,73);
		sd_ctx.closePath();
		sd_ctx.fill();


		if(stats_display_page==1){

			// -- "M%" message rate against recorded max, current SNR gauge and PSNR bar 
			// M% and SNR gauges (always draw) 
			sd_ctx.beginPath();
			sd_ctx.lineWidth = 1;
			sd_ctx.fillStyle = "#AFAFFF";
			sd_ctx.strokeStyle = "white";
			sd_ctx.arc(60,40,40,0.8*Math.PI, 1.8*Math.PI);
			sd_ctx.moveTo(120,40);
			sd_ctx.arc(150,40,32,1*Math.PI, 2*Math.PI);
			sd_ctx.moveTo(150,40);
			sd_ctx.stroke();

			sd_ctx.beginPath();
			sd_ctx.lineWidth = 1;
			sd_ctx.fillStyle = "#AFAFFF";
			sd_ctx.strokeStyle = "white";
			//sd_ctx.moveTo(370,40);
			sd_ctx.arc(400,40,40,0.8*Math.PI, 1.8*Math.PI);
			sd_ctx.moveTo(270,40);
			sd_ctx.arc(300,40,32,1*Math.PI, 2*Math.PI);
			//sd_ctx.moveTo(320,40);
			sd_ctx.stroke();


			// M% gauge areas
			sd_ctx.lineWidth = 4;
			sd_ctx.strokeStyle = "#F01011";
			sd_ctx.beginPath();
			sd_ctx.arc(60,40,38,0.8*Math.PI, 0.9*Math.PI);
			sd_ctx.stroke();
			sd_ctx.beginPath();
			sd_ctx.strokeStyle = "#E0E011";
			sd_ctx.arc(60,40,38,0.9*Math.PI, 1.0*Math.PI);
			sd_ctx.stroke();
			sd_ctx.beginPath();
			sd_ctx.strokeStyle = "#10E011";
			sd_ctx.arc(60,40,38,1.4*Math.PI, 1.8*Math.PI);
			sd_ctx.stroke();

			if(second_receiver_enabled){
				sd_ctx.lineWidth = 4;
				sd_ctx.strokeStyle = "#F01011";
				sd_ctx.beginPath();
				sd_ctx.arc(400,40,38,0.8*Math.PI, 0.9*Math.PI);
				sd_ctx.stroke();
				sd_ctx.beginPath();
				sd_ctx.strokeStyle = "#E0E011";
				sd_ctx.arc(400,40,38,0.9*Math.PI, 1.0*Math.PI);
				sd_ctx.stroke();
				sd_ctx.beginPath();
				sd_ctx.strokeStyle = "#10E011";
				sd_ctx.arc(400,40,38,1.4*Math.PI, 1.8*Math.PI);
				sd_ctx.stroke();			
			}

			// SNR gauge areas
			sd_ctx.lineWidth = 4;
			sd_ctx.strokeStyle = "#F01011";
			sd_ctx.beginPath();
			sd_ctx.arc(150,40,30,1*Math.PI, 1.1*Math.PI);
			sd_ctx.stroke();
			sd_ctx.strokeStyle = "#E0E011";
			sd_ctx.beginPath();
			sd_ctx.arc(150,40,30,1.1*Math.PI, 1.3*Math.PI);
			sd_ctx.stroke();
			sd_ctx.beginPath();
			sd_ctx.strokeStyle = "#10E011";
			sd_ctx.arc(150,40,30,1.3*Math.PI, 2*Math.PI);
			sd_ctx.stroke();

			if(second_receiver_enabled){
				sd_ctx.lineWidth = 4;
				sd_ctx.strokeStyle = "#F01011";
				sd_ctx.beginPath();
				sd_ctx.arc(300,40,30,1*Math.PI, 1.1*Math.PI);
				sd_ctx.stroke();
				sd_ctx.strokeStyle = "#E0E011";
				sd_ctx.beginPath();
				sd_ctx.arc(300,40,30,1.1*Math.PI, 1.3*Math.PI);
				sd_ctx.stroke();
				sd_ctx.beginPath();
				sd_ctx.strokeStyle = "#10E011";
				sd_ctx.arc(300,40,30,1.3*Math.PI, 2*Math.PI);
				sd_ctx.stroke();			
			}

			// SNR value box
			sd_ctx.strokeStyle = "#609092";
			sd_ctx.beginPath();
			sd_ctx.lineWidth = 1;
			sd_ctx.strokeRect(120,45,60,20);		
			sd_ctx.strokeRect(117,42,66,26);		
			sd_ctx.closePath();
			sd_ctx.stroke();

			if(second_receiver_enabled)	sd_ctx.strokeStyle = "#609092";
				else 	sd_ctx.strokeStyle = "#606062";
			sd_ctx.beginPath();
			sd_ctx.lineWidth = 1;
			sd_ctx.strokeRect(270,45,60,20);		
			sd_ctx.strokeRect(267,42,66,26);		
			sd_ctx.closePath();
			sd_ctx.stroke();

			// PSNR lines
			sd_ctx.strokeStyle = "#FFFFFF";
			sd_ctx.beginPath();
			sd_ctx.lineWidth = 1;
			sd_ctx.moveTo(225,50);
			sd_ctx.lineTo(225,10);
			sd_ctx.moveTo(223,10);
			sd_ctx.lineTo(227,10);
			sd_ctx.moveTo(223,30);
			sd_ctx.lineTo(227,30);
			sd_ctx.moveTo(223,50);
			sd_ctx.lineTo(227,50);
			sd_ctx.stroke();

			// Labels
			sd_ctx.fillStyle = "#FFFFFF";
			sd_ctx.font = "normal 10px sans-serif"; // small-caps
			sd_ctx.fillText(receiver_label,2,8);
			if(second_receiver_enabled)sd_ctx.fillText(second_receiver_label,440,8);

			sd_ctx.fillText("M1",50,80);
			sd_ctx.fillStyle = "#AFAFFF";
			sd_ctx.fillText("%",66,80);
			sd_ctx.fillStyle = "#FFFFFF";
			sd_ctx.fillText("M1",390,80);
			sd_ctx.fillStyle = "#AFAFFF";
			sd_ctx.fillText("%",406,80);			

			sd_ctx.fillStyle = "#FFFFFF";
			sd_ctx.font = "normal 10px sans-serif"; // small-caps
			sd_ctx.fillText("SNR",132,80);
			sd_ctx.fillStyle = "#AFAFFF";
			sd_ctx.fillText(" dbi",151,80);
	//		if(second_receiver_enabled){
				sd_ctx.fillStyle = "#FFFFFF";
				sd_ctx.font = "normal 10px sans-serif"; // small-caps
				sd_ctx.fillText("SNR",282,80);
				sd_ctx.fillStyle = "#AFAFFF";
				sd_ctx.fillText(" dbi",301,80);			
	//		}

			sd_ctx.fillStyle = "#FFFFFF";
			sd_ctx.font = "normal 8px sans-serif"; // small-caps
			sd_ctx.fillText("-20",142,7);
			sd_ctx.fillText("-40",183,40);
			sd_ctx.fillText("-20",292,7);
			sd_ctx.fillText("-40",333,40);

			sd_ctx.fillStyle = "#FFFFFF";
			sd_ctx.font = "normal 10px sans-serif"; // small-caps
			sd_ctx.fillText("PSNR",213,80);

			// Message-rate percentage (against max value detected)
			sd_ctx.fillStyle = "#FFFF0F";
			sd_ctx.font = "normal 12px sans-serif"; // small-caps
			sd_ctx.beginPath();
			var percent = ((receiver_msgs_1min/receiver_msgs_1min_max)*100);
			if(!percent)percent = 0;
			var percent_str = percent.toFixed(0);
			var percent_dec_str = ((percent - Math.floor(percent))*10).toFixed(0);
			sd_ctx.fillText(percent_str,60,60);
			sd_ctx.font = "normal 10px sans-serif"; // small-caps
			sd_ctx.fillText("." + percent_dec_str + "%", 60+sd_ctx.measureText(percent_str).width+3,60);
			if(second_receiver_enabled){
				sd_ctx.fillStyle = "#FFFF0F";
				sd_ctx.font = "normal 12px sans-serif"; // small-caps
				sd_ctx.beginPath();
				var second_percent = ((second_receiver_msgs_1min/second_receiver_msgs_1min_max)*100);
				if(!second_percent)second_percent = 0;
				var second_percent_str = second_percent.toFixed(0);
				var second_percent_dec_str = ((second_percent - Math.floor(second_percent))*10).toFixed(0);
				sd_ctx.fillText(second_percent_str,400,60);
				sd_ctx.font = "normal 10px sans-serif"; // small-caps
				sd_ctx.fillText("." + second_percent_dec_str + "%", 400+sd_ctx.measureText(second_percent_str).width+3,60);
			}

			// SNR reading
			var receiver_snr = 0.0; 
			var second_receiver_snr = 0.0; 
			if(receiver_noise<0) receiver_snr = receiver_noise - receiver_signal;
			if(receiver_snr>receiver_snr_max) receiver_snr_max = receiver_snr;
			sd_ctx.font = "normal 12px sans-serif"; // small-caps
			sd_ctx.fillText(receiver_snr.toFixed(1),(175-sd_ctx.measureText(receiver_snr.toFixed(1)).width),60);
			if(second_receiver_enabled){
				if(second_receiver_noise<0) second_receiver_snr = second_receiver_noise - second_receiver_signal;
				if(second_receiver_snr>second_receiver_snr_max) second_receiver_snr_max = second_receiver_snr;
				sd_ctx.font = "normal 12px sans-serif"; // small-caps
				sd_ctx.fillText(second_receiver_snr.toFixed(1),(325-sd_ctx.measureText(second_receiver_snr.toFixed(1)).width),60);
			}

			// PSNR reading
			var receiver_psnr = 0.0; 
			var second_receiver_psnr = 0.0;
			if(receiver_noise<0) receiver_psnr = receiver_noise - receiver_peak;
			sd_ctx.font = "normal 8px sans-serif"; // small-caps
			sd_ctx.fillText(receiver_psnr.toFixed(1),(218-sd_ctx.measureText(receiver_psnr.toFixed(1)).width),60);
			if(second_receiver_enabled){
				if(second_receiver_noise<0) second_receiver_psnr = second_receiver_noise - second_receiver_peak;
				sd_ctx.fillText(second_receiver_psnr.toFixed(1),(248-sd_ctx.measureText(second_receiver_psnr.toFixed(1)).width),60);
			}

			// Msg percent needle
			sd_ctx.strokeStyle = "#E0E012";
			sd_ctx.lineWidth = 3;
			sd_ctx.beginPath();
			var percent_angle = 230+((percent/100)*180);
			var percent_pos = getAngleEndpoint(60,40,36,percent_angle);
			sd_ctx.moveTo(60, 40);
			sd_ctx.lineTo(percent_pos[0], percent_pos[1]);
			sd_ctx.stroke();
			if(second_receiver_enabled){
				sd_ctx.strokeStyle = "#E0E012";
				sd_ctx.lineWidth = 3;
				sd_ctx.beginPath();
				percent_angle = 230+((second_percent/100)*180);
				percent_pos = getAngleEndpoint(400,40,36,percent_angle);
				sd_ctx.moveTo(400, 40);
				sd_ctx.lineTo(percent_pos[0], percent_pos[1]);
				sd_ctx.stroke();
			}

			// SNR needle
			sd_ctx.strokeStyle = "#E0E012";
			sd_ctx.lineWidth = 3;
			sd_ctx.beginPath();
			var snr_angle = -90+((-receiver_snr/40)*180);
			var snr_pos = getAngleEndpoint(150,40,26,snr_angle);
			sd_ctx.moveTo(150, 35);
			sd_ctx.lineTo(snr_pos[0], snr_pos[1]);
			sd_ctx.stroke();
			if(second_receiver_enabled){
				sd_ctx.strokeStyle = "#E0E012";
				sd_ctx.lineWidth = 3;
				sd_ctx.beginPath();
				snr_angle = -90+((-second_receiver_snr/40)*180);
				snr_pos = getAngleEndpoint(300,40,26,snr_angle);
				sd_ctx.moveTo(300, 35);
				sd_ctx.lineTo(snr_pos[0], snr_pos[1]);
				sd_ctx.stroke();			
			}

			// PSNR needle only (start point -40dBi - under noise = gray, noise-to-signal = green, signal-to-peak = yellow, over -3 = red)
			sd_ctx.strokeStyle = "#909092";
			sd_ctx.lineWidth = 5;
			sd_ctx.beginPath();
			sd_ctx.moveTo(210, 50);
			var noise_y = Math.floor(10-(receiver_noise));
			if(noise_y>50) noise_y=50;
			sd_ctx.lineTo(210, noise_y);
			sd_ctx.stroke();

			sd_ctx.strokeStyle = "#10E012";
			sd_ctx.lineWidth = 5;
			sd_ctx.beginPath();
			sd_ctx.moveTo(210, noise_y);
			var signal_y = Math.floor(10-(receiver_signal));
			if(receiver_signal==0) signal_y=noise_y;
			sd_ctx.lineTo(210, signal_y);
			sd_ctx.stroke();

			sd_ctx.strokeStyle = "#E0E012";
			sd_ctx.lineWidth = 5;
			sd_ctx.beginPath();
			sd_ctx.moveTo(210, signal_y);
			var peak_y = Math.floor(10-(receiver_peak));
			if(receiver_peak>-3.0){
				peak_y = 13;
			}
			sd_ctx.lineTo(210, peak_y);
			sd_ctx.stroke();

			if( receiver_peak> -3.0 ){
				sd_ctx.strokeStyle = "#F01012";
				sd_ctx.lineWidth = 5;
				sd_ctx.beginPath();
				sd_ctx.moveTo(210, 13);
				sd_ctx.lineTo(210, Math.floor(10-(receiver_peak)));
				sd_ctx.stroke();			
			}

			if(second_receiver_enabled){
				sd_ctx.strokeStyle = "#909092";
				sd_ctx.lineWidth = 5;
				sd_ctx.beginPath();
				sd_ctx.moveTo(240, 50);
				noise_y = Math.floor(10-(second_receiver_noise));
				if(noise_y>50) noise_y=50;
				sd_ctx.lineTo(240, noise_y);
				sd_ctx.stroke();

				sd_ctx.strokeStyle = "#10E012";
				sd_ctx.lineWidth = 5;
				sd_ctx.beginPath();
				sd_ctx.moveTo(240, noise_y);
				signal_y = Math.floor(10-(second_receiver_signal));
				if(second_receiver_signal==0) signal_y=noise_y;
				sd_ctx.lineTo(240, signal_y);
				sd_ctx.stroke();

				sd_ctx.strokeStyle = "#E0E012";
				sd_ctx.lineWidth = 5;
				sd_ctx.beginPath();
				sd_ctx.moveTo(240, signal_y);
				peak_y = Math.floor(10-(second_receiver_peak));
				if(second_receiver_peak>-3.0){
					peak_y = 13;
				}
				sd_ctx.lineTo(240, peak_y);
				sd_ctx.stroke();

				if( second_receiver_peak> -3.0 ){
					sd_ctx.strokeStyle = "#F01012";
					sd_ctx.lineWidth = 5;
					sd_ctx.beginPath();
					sd_ctx.moveTo(240, 13);
					sd_ctx.lineTo(240, Math.floor(10-(receiver_peak)));
					sd_ctx.stroke();			
				}
			}
		}

		if(stats_display_page==2){
			sd_ctx.fillStyle = "#8F8FFF";
			sd_ctx.font = "small-caps 10px sans-serif"; // small-caps
			sd_ctx.fillText("Maximums During Session",1,10);			

			sd_ctx.lineWidth = 0.5;
			sd_ctx.beginPath();
			sd_ctx.moveTo(1,11);
			sd_ctx.lineTo(449,11);
			sd_ctx.closePath();
			sd_ctx.stroke();

			sd_ctx.font = "small-caps 9px sans-serif"; 
			sd_ctx.fillStyle = "#FFFF8F";
			var now = new Date();
			sd_ctx.fillText(dateToReadableStr(now),449-sd_ctx.measureText(dateToReadableStr(now)).width,10);			

/* 	var session_max_distance = [0,"","",0,0,0], session_max_altitude = [0,"","",0,0,0], session_max_gs = [0,"","",0,0,0], session_max_tas = [0,"","",0,0,0];
	var session_max_climb_rate = [0,"","",0,0,0], session_max_descent_rate = [0,"","",0,0,0];
*/
			sd_ctx.font = "normal 10px sans-serif"; // small-caps
			sd_ctx.fillStyle = "#8FFF8F";
			sd_ctx.fillText("Distance: ",20,30);			
			sd_ctx.fillText("Altitude: ",20,40);			
			sd_ctx.fillText("GS: ",20,50);			
			sd_ctx.fillText("TAS: ",20,60);			
			sd_ctx.fillText("Climb: ",20,70);			
			sd_ctx.fillText("Descent: ",20,80);			

			// session maximums [value, flight, timestamp, heading, bearing, distance]
			var col1_x = 80, col2_x = 120, col3_x = 180, col4_x = 310, col5_x = 350, col6_x = 390;
			sd_ctx.font = "small-caps 9px sans-serif"; // small-caps
			sd_ctx.fillText("Value",col1_x,20);			
			sd_ctx.fillText("Flight",col2_x,20);			
			sd_ctx.fillText("When",col3_x,20);			
			sd_ctx.fillText("Heading",col4_x,20);			
			sd_ctx.fillText("Bearing",col5_x,20);			
			sd_ctx.fillText("Distance",col6_x,20);			

			sd_ctx.font = "normal 10px sans-serif"; // small-caps
			sd_ctx.fillStyle = "#FFFFFF";
			sd_ctx.fillText(session_max_distance[0],col1_x,30);			
			sd_ctx.fillText(session_max_distance[1],col2_x,30);			
			sd_ctx.fillText(dateToReadableStr(session_max_distance[2]),col3_x,30);			
			sd_ctx.fillText(session_max_distance[3],col4_x,30);			
			sd_ctx.fillText(session_max_distance[4],col5_x,30);			
			sd_ctx.fillText(session_max_distance[5],col6_x,30);			

			sd_ctx.fillText(session_max_altitude[0],col1_x,40);			
			sd_ctx.fillText(session_max_altitude[1],col2_x,40);			
			sd_ctx.fillText(dateToReadableStr(session_max_altitude[2]),col3_x,40);			
			sd_ctx.fillText(session_max_altitude[3],col4_x,40);			
			sd_ctx.fillText(session_max_altitude[4],col5_x,40);			
			sd_ctx.fillText(session_max_altitude[5],col6_x,40);			

			sd_ctx.fillText(session_max_gs[0],col1_x,50);			
			sd_ctx.fillText(session_max_gs[1],col2_x,50);			
			sd_ctx.fillText(dateToReadableStr(session_max_gs[2]),col3_x,50);			
			sd_ctx.fillText(session_max_gs[3],col4_x,50);			
			sd_ctx.fillText(session_max_gs[4],col5_x,50);			
			sd_ctx.fillText(session_max_gs[5],col6_x,50);			

			sd_ctx.fillText(session_max_tas[0],col1_x,60);			
			sd_ctx.fillText(session_max_tas[1],col2_x,60);			
			sd_ctx.fillText(dateToReadableStr(session_max_tas[2]),col3_x,60);			
			sd_ctx.fillText(session_max_tas[3],col4_x,60);			
			sd_ctx.fillText(session_max_tas[4],col5_x,60);			
			sd_ctx.fillText(session_max_tas[5],col6_x,60);			

			sd_ctx.fillText(session_max_climb_rate[0],col1_x,70);			
			sd_ctx.fillText(session_max_climb_rate[1],col2_x,70);			
			sd_ctx.fillText(dateToReadableStr(session_max_climb_rate[2]),col3_x,70);			
			sd_ctx.fillText(session_max_climb_rate[3],col4_x,70);			
			sd_ctx.fillText(session_max_climb_rate[4],col5_x,70);			
			sd_ctx.fillText(session_max_climb_rate[5],col6_x,70);			

			sd_ctx.fillText(session_max_descent_rate[0],col1_x,80);			
			sd_ctx.fillText(session_max_descent_rate[1],col2_x,80);			
			sd_ctx.fillText(dateToReadableStr(session_max_descent_rate[2]),col3_x,80);			
			sd_ctx.fillText(session_max_descent_rate[3],col4_x,80);			
			sd_ctx.fillText(session_max_descent_rate[4],col5_x,80);			
			sd_ctx.fillText(session_max_descent_rate[5],col6_x,80);			
		}

		if(stats_display_page==3){
			sd_ctx.fillStyle = "#8F8FFF";
			sd_ctx.font = "small-caps 10px sans-serif"; // small-caps
			sd_ctx.fillText("Top 12 Companies",1,10);			

			sd_ctx.lineWidth = 0.5;
			sd_ctx.beginPath();
			sd_ctx.moveTo(1,11);
			sd_ctx.lineTo(449,11);
			sd_ctx.closePath();
			sd_ctx.stroke();

			sd_ctx.font = "small-caps 9px sans-serif"; 
			sd_ctx.fillStyle = "#FFFF8F";
			var now = new Date();
			sd_ctx.fillText(dateToReadableStr(now),449-sd_ctx.measureText(dateToReadableStr(now)).width,10);			

			var company_list_sorted = Array.from(companies);
			company_list_sorted.sort(function (a,b){	// sort a copy of companies array by number of flights
				if(a[2]==b[2])return 0;
				else return (a[2]>b[2])?-1:1; 
			});

			sd_ctx.font = "small-caps 9px sans-serif"; // small-caps
			sd_ctx.fillStyle = "#1FFF1F";
			sd_ctx.fillText("Company",30,20);
			sd_ctx.fillText("Flights",160,20);
			sd_ctx.fillText("Company",220,20);
			sd_ctx.fillText("Flights",350,20);

			var col1_x = 30, col2_x = 190, col3_x = 220, col4_x = 380;
			var y=30;
			var company = "";
			for(i=0; i<company_list_sorted.length; i++){
				if(i==12)break;
				if(i<=5){
					sd_ctx.font = "normal 10px sans-serif"; 
					sd_ctx.fillStyle = "#FFFFFF";
					if( company_list_sorted[i][0].length > 22 )
						company = company_list_sorted[i][0].substring(0,22) + "..";
					else
						company = company_list_sorted[i][0];
					if( company == "" ) company = "* unknown *";						
					sd_ctx.font = "normal 9px sans-serif"; 
					sd_ctx.fillStyle = "#2FFF2F";
					sd_ctx.fillText((i+1),col1_x-2-sd_ctx.measureText((i+1).toFixed(0)).width,y);
					sd_ctx.font = "normal 10px sans-serif"; 
					sd_ctx.fillStyle = "#FFFFFF";
					sd_ctx.fillText(company,col1_x,y);
					sd_ctx.font = "normal 10px sans-serif"; // small-caps
					sd_ctx.fillStyle = "#FFFF1F";
					sd_ctx.fillText(company_list_sorted[i][2],col2_x-sd_ctx.measureText(company_list_sorted[i][2]).width,y);
					y+=10;			
					if(i==5)y=30;
				} else {
					sd_ctx.font = "normal 10px sans-serif"; // small-caps
					sd_ctx.fillStyle = "#FFFFFF";
					if( company_list_sorted[i][0].length > 22 )
						company = company_list_sorted[i][0].substring(0,22) + "..";
					else
						company = company_list_sorted[i][0];
					if( company == "" ) company = "* Unknown *";						
					sd_ctx.font = "normal 9px sans-serif"; 
					sd_ctx.fillStyle = "#2FFF2F";
					sd_ctx.fillText((i+1),col3_x-2-sd_ctx.measureText((i+1).toFixed(0)).width,y);
					sd_ctx.font = "normal 10px sans-serif"; 
					sd_ctx.fillStyle = "#FFFFFF";
					sd_ctx.fillText(company,col3_x,y);
					sd_ctx.font = "normal 10px sans-serif"; // small-caps
					sd_ctx.fillStyle = "#FFFF1F";
					sd_ctx.fillText(company_list_sorted[i][2],col4_x-sd_ctx.measureText(company_list_sorted[i][2]).width,y);
					y+=10;			
				}
			}
		}


	}

	function refreshStatsDisplay(){
		initStatsDisplay();

	}
	var refreshStatsDisplayInterval = setInterval(refreshStatsDisplay, stats_refresh_rate)
	refreshStatsDisplay();

	function onStatsDisplayClick(event){
		var x = event.clientX, y = event.clientY;
		var bounds = sd_canvas.getBoundingClientRect();
		x -= Math.floor(bounds.left); y -= Math.floor(bounds.top);

		//console.log("x: " + x + " y: " + y);

		// handle the scroll buttons
		if( x>=0 && y>=20 && x<=20 && y<=60 ){	// left button
			stats_display_page--;
			if(stats_display_page<1) stats_display_page=max_stats_display_page;
		}
		if( x>=440 && y>=20 && x<=460 && y<=60 ){	// right button
			stats_display_page++;
			if(stats_display_page>max_stats_display_page) stats_display_page=1;
		}
		// handle download button
		if( x>=440 && y>=60 && x<=460 && y<=90 ){	// right button
			var dataUrl = sd_canvas.toDataURL("image/jpeg", 1.0);
			var link = document.createElement("a");
			link.download = "stats-display-nr" + stats_display_page + ".jpg";
			link.href = dataUrl.replace("image/jpeg","image/octet-stream");
			link.click();
			link.remove();			
		}


		refreshStatsDisplay();
	}
	sd_canvas.addEventListener("click", onStatsDisplayClick, false);
