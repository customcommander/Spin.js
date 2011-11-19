// 
//  soundcloud.player.js
//  Officity
//  
//  Created by Jonathan on 2011-05-26.
// 

 (function($) {
	function SoundSpinPlayer($elem){
		this.element = $elem;
		var self = this;

		this.element.addClass('soundspin-player');

		this.controls      = $('<div class="soundspin-controls"/>').appendTo(this.element);
		this.avatar        = $('<div class="avatar"><div class="control play">&gt;</div><img/></div>').appendTo(this.controls);
		this.animContainer = $('<div class="progress-bar-container"></div>').appendTo(this.avatar);

		this.next  = $('<div class="control next">&gt;&gt;</div>').appendTo(this.controls);
		this.clear = $('<div class="clear control">Clear</div>').appendTo(this.controls).
			click(function(){
				self.playlist.empty();
			});

		this.info 		= $('<div id="info" class="nav"/>').appendTo(this.controls)
								.data('panelType', 'songwriterDetails');
		this.author 	= $('<p id="author"/>').appendTo(this.info);
		this.title 		= $('<p id="title"/>').appendTo(this.info);
		this.duration 	= $('<p id="duration"/>').appendTo(this.info);

		var trackToPlay = this.options.tracks.shift();

		this.playlist = $('<ol class="play-list spin-items"/>').appendTo(this.element),
		$.each(self.options.tracks,function(ind,track){
			self.playlist.append(
				Items.navigable({
					title: 	'<strong>' + track.user.username + '</strong> ' + track.title
				}).data({
					panelType: 'songwriterDetails',
					track: track,
					user: track.user
				}).attr('id',track.id)
			);
		});
		
		this.avatar.click(function(evt){
			evt.preventDefault();
			if(self.playing){
				self._pause();
			}else{
				self._play();
			}
		});
		this.next.click(function(evt){
			evt.preventDefault();
			self._next();
		});

		this._loadTrack(trackToPlay,trackToPlay.user);

		this.player.bind($.jPlayer.event.ended,function(evt){
			console.log('ended');
			self._next();
		});

		this.player.bind($.jPlayer.event.timeupdate,function(evt){
			// console.log('progress');
			self._updateProgressBar(evt.jPlayer.status.currentTime , evt.jPlayer.status.duration);
		});

		this.player.bind($.jPlayer.event.error,function(evt){
			console.log('error',evt.jPlayer.error);
			self._next();
		});
	};

	$.merge(SoundSpinPlayer,
		addTrack:function(track, user){
			this.playlist.append(Items.navigable({
				title: 	'<strong>' + user.username + '</strong> ' + track.title
			}).data({
				panelType: 'songwriterDetails',
				user: user,
				track: track,
				title: user.username
			}).attr('id',track.id));
		},
		
		hasTrack:function(track){
			return this.playlist.find('#'+track.id).size() > 0;
		},

		_next:function(){
			// this._stop();
			var item = this.playlist.children().first();
			if(!item.size()){
				return;
			}

			this.player.jPlayer('stop');
			this._stopProgressBar();
			this._resetProgressBar();

            this._loadTrack(item.data('track'), item.data('user')); // trigger a scPlayerReady event
			item.remove();
		},
		_play:function(track){
			this.player.jPlayer('play');
			this.playing = true;
			this.avatar.find('.play').text('||');
			this.avatar.addClass('playing');
			// this._beginProgressBar();// this.player.getDuration());
		},
		_pause:function(track){
			this.player.jPlayer('pause');
			this.playing = false;
			this.avatar.find('.play').text('>');
			this.avatar.removeClass('playing');
			this._stopProgressBar();
		},
		_stop:function(track){
			this.player.jPlayer('stop');
			this.playing = false;
			this.avatar.find('.play').text('>');
			this.avatar.removeClass('playing');
			this._stopProgressBar();
			this._resetProgressBar();
		},
		
		_loadTrack:function(track){
			console.log('load track',track);
            this.player.jPlayer("setMedia", {"mp3" : track.stream_url + '?client_id=' + this.options.client_id} ); // load(track, this.options.client_id)
			this._resetProgressBar();
			// this.player.jPlayer("load");
			this._play();
            this.avatar.find('img').attr('src', track.user.avatar_url);

			this.info.data('user', track.user);
			this.title.text(track.title);
			this.author.text(track.user.username);
			this.info.removeClass('loaded');

			var sec = Math.floor(track.duration / 1000);
			this.duration.text(this._zeroFill(Math.floor(sec / 60)) + ':' + this._zeroFill(sec % 60));
		},
		
		/* progress bar functions */
		_updateProgressBar:function(current, duration){
			var newAngle = 360 * current / duration - 45;
			for (;this.animateAngle < newAngle; this.animateAngle++) {
				
				$('<div class="bar"><div class="bar-visible"/></div>').appendTo(this.animContainer).rotate(this.animateAngle);
			};
		},
		_stopProgressBar:function(duration){
			clearTimeout(this.animTimer);
		},
		_resetProgressBar:function(duration){
			this.animContainer.empty();
			this.animateAngle = -45;
		},




		_zeroFill:function(num,count)
		{
			count = count || 2;
	    	var numZeropad = num + '';
	    	while(numZeropad.length < count) {
				numZeropad = "0" + numZeropad;
			}
			return numZeropad;
		}
	});
	
	
	
	
	


	
	$.widget("ui.soundSpinPlayer", {
		getter: [],
    	options: {
			tracks:null,
			client_id:null
		},
		_init : function() {
			var self = this;
			
			this.player = $('<div/>').height(0).width(0).jPlayer({
				"swfPath":"jPlayer",
				"preload": "auto"
			}).appendTo($('body')); // avoid flash kill on panel hidden

			
			this.element.addClass('soundspin-player');

			this.controls 		= $('<div class="soundspin-controls"/>').appendTo(this.element);
			this.avatar 		= $('<div class="avatar"><div class="control play">&gt;</div><img/></div>').appendTo(this.controls);
			this.animContainer 	= $('<div class="progress-bar-container"></div>').appendTo(this.avatar);

			this.next 		= $('<div class="control next">&gt;&gt;</div>').appendTo(this.controls);
			this.clear 		= $('<div class="clear control">Clear</div>').appendTo(this.controls).
									click(function(){
										self.playlist.empty();
									});

			this.info 		= $('<div id="info" class="nav"/>').appendTo(this.controls)
									.data('panelType', 'songwriterDetails');
			this.author 	= $('<p id="author"/>').appendTo(this.info);
			this.title 		= $('<p id="title"/>').appendTo(this.info);
			this.duration 	= $('<p id="duration"/>').appendTo(this.info);

			var trackToPlay = this.options.tracks.shift();

			this.playlist = $('<ol class="play-list spin-items"/>').appendTo(this.element),
			$.each(self.options.tracks,function(ind,track){
				self.playlist.append(
					Items.navigable({
						title: 	'<strong>' + track.user.username + '</strong> ' + track.title
					}).data({
						panelType: 'songwriterDetails',
						track: track,
						user: track.user
					}).attr('id',track.id)
				);
			});
			
			this.avatar.click(function(evt){
				evt.preventDefault();
				if(self.playing){
					self._pause();
				}else{
					self._play();
				}
			});
			this.next.click(function(evt){
				evt.preventDefault();
				self._next();
			});

			this._loadTrack(trackToPlay,trackToPlay.user);

			this.player.bind($.jPlayer.event.ended,function(evt){
				console.log('ended');
				self._next();
			});

			this.player.bind($.jPlayer.event.timeupdate,function(evt){
				// console.log('progress');
				self._updateProgressBar(evt.jPlayer.status.currentTime , evt.jPlayer.status.duration);
			});

			this.player.bind($.jPlayer.event.error,function(evt){
				console.log('error',evt.jPlayer.error);
				self._next();
			});
		},
		
	
		addTrack:function(track, user){
			this.playlist.append(Items.navigable({
				title: 	'<strong>' + user.username + '</strong> ' + track.title
			}).data({
				panelType: 'songwriterDetails',
				user: user,
				track: track,
				title: user.username
			}).attr('id',track.id));
		},
		hasTrack:function(track){
			return this.playlist.find('#'+track.id).size() > 0;
		},


		_next:function(){
			// this._stop();
			var item = this.playlist.children().first();
			if(!item.size()){
				return;
			}

			this.player.jPlayer('stop');
			this._stopProgressBar();
			this._resetProgressBar();

            this._loadTrack(item.data('track'), item.data('user')); // trigger a scPlayerReady event
			item.remove();
		},
		_play:function(track){
			this.player.jPlayer('play');
			this.playing = true;
			this.avatar.find('.play').text('||');
			this.avatar.addClass('playing');
			// this._beginProgressBar();// this.player.getDuration());
		},
		_pause:function(track){
			this.player.jPlayer('pause');
			this.playing = false;
			this.avatar.find('.play').text('>');
			this.avatar.removeClass('playing');
			this._stopProgressBar();
		},
		_stop:function(track){
			this.player.jPlayer('stop');
			this.playing = false;
			this.avatar.find('.play').text('>');
			this.avatar.removeClass('playing');
			this._stopProgressBar();
			this._resetProgressBar();
		},
		
		_loadTrack:function(track){
			console.log('load track',track);
            this.player.jPlayer("setMedia", {"mp3" : track.stream_url + '?client_id=' + this.options.client_id} ); // load(track, this.options.client_id)
			this._resetProgressBar();
			// this.player.jPlayer("load");
			this._play();
            this.avatar.find('img').attr('src', track.user.avatar_url);

			this.info.data('user', track.user);
			this.title.text(track.title);
			this.author.text(track.user.username);
			this.info.removeClass('loaded');

			var sec = Math.floor(track.duration / 1000);
			this.duration.text(this._zeroFill(Math.floor(sec / 60)) + ':' + this._zeroFill(sec % 60));
		},
		
		/* progress bar functions */
		_updateProgressBar:function(current, duration){
			var newAngle = 360 * current / duration - 45;
			for (;this.animateAngle < newAngle; this.animateAngle++) {
				
				$('<div class="bar"><div class="bar-visible"/></div>').appendTo(this.animContainer).rotate(this.animateAngle);
			};
		},
			// if(!duration){
			// 	return;
			// }
			// if(!this.animateAngle){
			// 	this.animateAngle = -45;
			// }
			// var self = this;//,
			//  	// interval = duration / 360;
			// this.player.bind('$.jPlayer.event.progress',function(evt){
			// 	console.log('progress');
			// 	var newAngle = 360 * evt.jPlayer.status.currentTime / evt.jPlayer.status.duration;
			// 	for (;self.animateAngle < newAngle; self.animateAngle++) {
			// 		
			// 		$('<div class="bar"><div class="bar-visible"/></div>').appendTo(self.animContainer).rotate(self.animateAngle);
			// 	};
			// });
			// 
			// var step = function(){
			// 	$('<div class="bar"><div class="bar-visible"/></div>').appendTo(self.animContainer).rotate(self.animateAngle);
			// 
			// 	self.animateAngle += 1;
			// 	if(self.animateAngle < 315){
			// 		self.animTimer = setTimeout(step,interval);
			// 	}
			// };
			// step();
		// },
		_stopProgressBar:function(duration){
			clearTimeout(this.animTimer);
		},
		_resetProgressBar:function(duration){
			this.animContainer.empty();
			this.animateAngle = -45;
		},




		_zeroFill:function(num,count)
		{
			count = count || 2;
	    	var numZeropad = num + '';
	    	while(numZeropad.length < count) {
				numZeropad = "0" + numZeropad;
			}
			return numZeropad;
		}
	});

/*


	// Audio engine selection, by default use HTML5 audio player
	var getAudioEngine = function(options) {
	    var html5AudioAvailable = function() {
	        try{
	          var a = new Audio();
	          return a.canPlayType && (/maybe|probably/).test(a.canPlayType('audio/mpeg'));
	          // let's enable the html5 audio on selected mobile devices first, unlikely to support Flash
	          // the desktop browsers are still better with Flash, e.g. see the Safari 10.6 bug
	          // comment the following line out, if you want to force the html5 mode
	          // state = state && (/iPad|iphone|mobile|pre\//i).test(navigator.userAgent);
	        }catch(e){
	          // there's no audio support here sadly
	        }
	        return false;
	    }();

	    var html5Driver = function(callbacks) {
	      	var player = new Audio(),
				loaded = false,
				onTimeUpdate = function(event){
					var obj = event.target,
					buffer = ((obj.buffered.length && obj.buffered.end(0)) / obj.duration) * 100;
					// ipad has no progress events implemented yet
					callbacks.onBuffer(buffer);
					// anounce if it's finished for the clients without 'ended' events implementation
					if(loaded == false){
						loaded = true;
						callbacks.onReady();
					}
					// if (obj.currentTime === obj.duration) {
					// 	callbacks.onEnd();
					// }
				},
				onProgress = function(event) {
					var obj = event.target,
					buffer = ((obj.buffered.length && obj.buffered.end(0)) / obj.duration) * 100;
					callbacks.onBuffer(buffer);
				};

			$('<div class="sc-player-engine-container"></div>').appendTo(document.body).append(player);

			// prepare the listeners
			player.addEventListener('play', callbacks.onPlay, false);
			player.addEventListener('pause', callbacks.onPause, false);
			player.addEventListener('ended', callbacks.onEnd, false);
			player.addEventListener('timeupdate', onTimeUpdate, false);
			player.addEventListener('progress', onProgress, false);


			return {
				load: function(track, apiKey) {
					loaded = false;
					player.pause();
					player.src = track.stream_url + '?client_id=' + apiKey;
					player.load();
					// player.play();
				},
				play: function() {
					player.play();
				},
				pause: function() {
					player.pause();
				},
				stop: function(){
					player.pause();
					if(loaded == true){
						player.currentTime = 0;
					}
				},
				seek: function(relative){
					player.currentTime = player.duration * relative;
					player.play();
				},
				getDuration: function() {
					// console.log(player.duration * 1000);
					return player.duration * 1000;
				},
				getPosition: function() {
					return player.currentTime;
				},
				setVolume: function(val) {
					if(a){
						a.volume = val / 100;
					}
				}
			};
		};



		var flashDriver = function(callbacks) {
		    var engineId = 'scPlayerEngine',
		    player,
		    flashHtml = function(url) {
		        var swf = 'http://player.soundcloud.com/player.swf?url=' + url + '&amp;enable_api=true&amp;player_type=engine&amp;object_id=' + engineId;
		        if ($.browser.msie) {
		            return '<object height="100%" width="100%" id="' + engineId + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" data="' + swf + '">' +
		            '<param name="movie" value="' + swf + '" />' +
		            '<param name="allowscriptaccess" value="always" />' +
		            '</object>';
		        } else {
		            return '<object height="0" width="0" id="' + engineId + '">' +
		            '<embed allowscriptaccess="always" height="0" width="0" src="' + swf + '" type="application/x-shockwave-flash" name="' + engineId + '" />' +
		            '</object>';
		        }
		    };



		    // listen to audio engine events
		    // when the loaded track is ready to play
		    soundcloud.addEventListener('onPlayerReady',
		    	function(flashId, data) {
		        	player = soundcloud.getPlayer(engineId);
		        	callbacks.onReady();
		    	});

		    // when the loaded track finished playing
		    soundcloud.addEventListener('onMediaEnd', callbacks.onEnd);

		    // when the loaded track is still buffering
		    soundcloud.addEventListener('onMediaBuffering',
		    function(flashId, data) {
		        callbacks.onBuffer(data.percent);
		    });

		    // when the loaded track started to play
		    soundcloud.addEventListener('onMediaPlay', callbacks.onPlay);

		    // when the loaded track is was paused
		    soundcloud.addEventListener('onMediaPause', callbacks.onPause);

		    return {
		        load: function(track) {
		            var url = track.permalink_url;
		            if (player) {
		                player.api_load(url);
		            } else {
		                // create a container for the flash engine (IE needs this to operate properly)
		                $('<div class="sc-player-engine-container"></div>').appendTo(document.body).html(flashHtml(url));
		            }
		        },
		        play: function() {
		            player && player.api_play();
		        },
		        pause: function() {
		            player && player.api_pause();
		        },
		        stop: function() {
		            player && player.api_stop();
		        },
		        seek: function(relative) {
		            player && player.api_seekTo((player.api_getTrackDuration() * relative));
		        },
		        getDuration: function() {
		            return player && player.api_getTrackDuration && player.api_getTrackDuration() * 1000;
		        },
		        getPosition: function() {
		            return player && player.api_getTrackPosition && player.api_getTrackPosition() * 1000;
		        },
		        setVolume: function(val) {
		            if (player && player.api_setVolume) {
		                player.api_setVolume(val);
		            }
		        }

		    };
		};
		var callbacks = {};
	    callbacks.onReady = options.onReady ||  function() {
			$doc.trigger('scPlayer:onAudioReady');
		};
	    callbacks.onPlay = options.onPlay ||  function() {
			$doc.trigger('scPlayer:onMediaPlay');
		};
	    callbacks.onPause = options.onPause ||  function() {
			$doc.trigger('scPlayer:onMediaPause');
		};
	    callbacks.onEnd = options.onEnd ||  function() {
			$doc.trigger('scPlayer:onMediaEnd');
		};
	    callbacks.onBuffer = options.onBuffer ||  function() {
			$doc.trigger({type: 'scPlayer:onMediaBuffering', percent: percent});
		};

		return html5AudioAvailable ? html5Driver(callbacks) : flashDriver(callbacks);
	};
	*/
})(jQuery);
