// 
//  soundcloud.player.js
//  Officity
//  
//  Created by Jonathan on 2011-05-26.
// 

 (function($) {
	var baseProgressBarAngle = 135,
	progressBarInterval = 300;
	
	window.SoundSpinPlayer = function($elem,options){
		this.element = $elem;
		this.options = options;
		var self = this;
		

		this.element.addClass('soundspin-player');

		this.controls      = $('<div class="soundspin-controls"/>').appendTo(this.element);
		this.avatar        = $('<div class="indicator"><div class="control play"></div><div id="avatar"><img/></div></div>').appendTo(this.controls);
		this.animContainer = $('<div class="progress-bar-container"></div>').appendTo(this.avatar);


		this.info 		= $('<div id="info" class="spin-item nav no-arrow"/>').appendTo(this.controls)
								.data('panelType', 'songwriterDetails');
		this.author 	= $('<p id="author"/>').appendTo(this.info);
		this.title 		= $('<p id="title"/>').appendTo(this.info);
		this.duration 	= $('<p id="duration"/>').appendTo(this.info);

		this.next  = $('<div class="control next"></div>').appendTo(this.info);
		this.clear = $('<div class="clear control">C</div>').appendTo(this.info)
			.click(function(evt){
				evt.preventDefault();
				evt.stopPropagation();
				self.playlist.empty();
			});

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
			evt.stopPropagation();
			self._next();
		});
		
		SC.whenStreamingReady(function(){
			self._loadTrack(trackToPlay,trackToPlay.user);
		});
	};

	SoundSpinPlayer.prototype.addTrack=function(track, user){
		this.playlist.append(Items.navigable({
			title: 	'<strong>' + user.username + '</strong> ' + track.title
		}).data({
			panelType: 'songwriterDetails',
			user: user,
			track: track,
			title: user.username
		}).attr('id',track.id));
	},

	SoundSpinPlayer.prototype.hasTrack=function(track){
		return this.playlist.find('#'+track.id).size() > 0;
	},

	SoundSpinPlayer.prototype._next=function(){
		// this._stop();
		var item = this.playlist.children().first();
		if(!item.size()){
			return;
		}

		this.player.stop();
		this._stopProgressBar();
		this._resetProgressBar();

		// trigger a scPlayerReady event, no need to start explicitely
        this._loadTrack(item.data('track'), item.data('user'));
 		item.remove();
	},
	SoundSpinPlayer.prototype._play=function(track){
		this.player.play();
		this.playing = true;
		this.avatar.addClass('playing');

		var self = this;
		self._updateProgressBar();
		// this._beginProgressBar();// this.player.getDuration());
	},
	SoundSpinPlayer.prototype._pause=function(track){
		this.player.pause();
		this.playing = false;
		this.avatar.removeClass('playing');
		this._stopProgressBar();
	},
	SoundSpinPlayer.prototype._stop=function(track){
		this.player.stop();
		this.playing = false;
		this.avatar.removeClass('playing');
		this._stopProgressBar();
		this._resetProgressBar();
	},
	SoundSpinPlayer.prototype._loadTrack=function(track){
		console.log('load track',track);
  		var self = this;
		this.player = SC.stream(track.id,{
			onfinish:function(evt){
				self._next();
			}
		});
		
		this._resetProgressBar();

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
	SoundSpinPlayer.prototype._updateProgressBar=function(){
		var self = this;
		this.timer = setTimeout(function(){self._updateProgressBar()},progressBarInterval);

		if(!this.player.position || !this.player.duration){
			return;
		}
		var newAngle = 360 * this.player.position / this.player.durationEstimate + baseProgressBarAngle;

		for (;this.animateAngle < newAngle; this.animateAngle++) {
			$('<div class="bar"> </div>').appendTo(this.animContainer)
				.css({
					'-webkit-transform': 'rotate(' + this.animateAngle + 'deg)'
				})
		};
	},
	SoundSpinPlayer.prototype._stopProgressBar=function(duration){
		clearTimeout(this.timer);
	},
	SoundSpinPlayer.prototype._resetProgressBar=function(duration){
		this.animContainer.empty();
		this.animateAngle = baseProgressBarAngle;
	},

	SoundSpinPlayer.prototype._zeroFill=function(num,count)
	{
		count = count || 2;
    	var numZeropad = num + '';
    	while(numZeropad.length < count) {
			numZeropad = "0" + numZeropad;
		}
		return numZeropad;
	}

})(jQuery);
