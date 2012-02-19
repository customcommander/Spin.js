

(function() {
	var client_id = 'u9MitXmAQmMLJPiKtFHiQ',
		$player,
		player,
		this_application_url = 'http://j-san.github.com/SoundSpin/';

	SC.initialize({
      client_id: client_id,
      redirect_uri: this_application_url + 'callback.html',
    });


	$(function(){
		$(document.body).delegate('img.resizable','click',function(){
			if(this.src.indexOf('default_avatar_large.png')>=0){
				return;
			}
			var $body = $('<div class="body panel-image-view"/>');
			$body.append('<img src="' + this.src.replace(/large\.(\w{3})/,'crop.$1') + '" />');
			$.spin.removeAfter($(this).closest('.panel'));
			var $panel = $.spin($body, 'img');
		});
	});


	window.MainController = function($elt){
		var panelType = $elt.data('panelType');
		var title = $elt.data('title') || $elt.text() || $elt.attr('title');
		var $body;
		console.log(panelType);
		_gaq.push(['_trackEvent', 'loadpanel', panelType, title]);
		if(!$player){
			$body = Home();
			title = 'Home';
		}else if(panelType == 'songwriterDetails'){
			$body = songwriterDetails($elt.data('user'));
		}else if(panelType == 'songwriterSearch'){
			$body = songwriterSearch();
		}else if(panelType == 'followings'){
			$body = songwriterFollowings($elt.data('user'));
		}else if(panelType == 'favorites'){
			$body = favorites($elt.data('user'));
		}else if(panelType == 'allTracks'){
			$body = allTracks($elt.data('user'));
		}else if(panelType == 'albumDetails'){
			$body = albumDetails($elt.data('album'), $elt.data('user'));
			
		}else{
			$.error('no panel specified');
		}
		$panel = $.spin($body, title);
	};

	var Home = function(){
		var self = this;

		var $body = $('<div class="body"/>');

		var $block = $('<div class="quick-nav"/>');
		$body.prepend($block);
		$('<div class="nav spin-item see-more" title="Search artists"></div>').appendTo($block)
				.data({panelType: 'songwriterSearch'});
		
		var $connect;
		function loadFollowings(){
			SC.get('/me/followings',{},function(data){
				console.log('followings',data);
				if($connect){
					$connect.remove();
				}
				$.each(data, function(ind,author){
					$('<img class="nav" title="' + author.username + '" src="' + author.avatar_url.replace(/large\.(\w{3})/,'badge.$1') + '"/>')
							.data({
								panelType: 'songwriterDetails',
								user: author
							})
							.prependTo($block);
				});
			});
		}
		
		if(!SC.isConnected()){
			$connect = $('<button>connect</button>').click(function(){
				SC.connect(function(){
					loadFollowings();
				});
			});
			$block.append($connect);

			// get some sample random tracks
			SC.get('/tracks',{limit:10},function(data){
				$player = $('<div/>');
				player = new SoundSpinPlayer($player,{tracks:data});
				$player.appendTo($body);
			});
		}else{
			loadFollowings();
			var showed = [];
			SC.get('/me/activities',{},function(data) {
				console.log(data.collection);
				$player = $('<div/>');
				player = new SoundSpinPlayer($player);
				for(var i in data.collection){
					var activity = data.collection[i];
					if(activity.origin.track && showed.indexOf(activity.origin.track.id) < 0){
						var track = activity.origin.track;
						if(!track.user) {
							track.user = activity.origin.user;
						}
						player.addTrack(track, track.user);
						showed.push(activity.origin.track.id);
					}
				}
				$player.appendTo($body);
			});
		}


		
		return $body;
	};

	var songwriterDetails = function(user){
		var $body  = $('<div class="body"/>'),
	 		$blockNav = $('<ol class="spin-items" style="float:right; width:30%;"/>').appendTo($body),
		 	$block = $('<div class="block-content loading"/>').appendTo($body),
			$songs = $('<div class="loading songs"/>').appendTo($body);

		SC.get('/users/' + user.id, {}, function(user){
			console.log('user' , user);
			$block.removeClass('loading');
			$block.append('<a href="' + user.permalink_url + '" target="_blank">Voir sur Soundcloud</a>');
			$block.append('<h1>' + (user.full_name || user.username) + '</h1>');
			$block.append('<img class="resizable extended-artwork" src="' + user.avatar_url.replace('large','t300x300') + '" />');
			if(user.description){
				$block.append('<p class="description">' + user.description + '</p>');
			}
			$('<li class="spin-item nav">' + user.public_favorites_count + ' Favorites</li>')
					.data({
						panelType: 'favorites',
						user: user
					}).appendTo($blockNav);
			$('<li class="spin-item nav">' + user.followings_count + ' Followings</li>')
					.data({
						panelType: 'followings',
						user: user
					})
					.appendTo($blockNav);

			var $info = $('<div class="songwriter-info"/>').appendTo($block);
			
			function info(label, name){
				if(user[name]){
					$info.append('<p>' + label + ' <strong>' + user[name] + '</strong></p>');
				}
			}
			info('Dicogs', 'discogs_name');
			info('Myspace', 'myspace_name');
			info('Country', 'country');
			info('City', 'city');

			if(user.website){
				$info.append('<p><a href="' + user.website + '">' + (user.website_title || user.website) + '</a></p>');
			}

			if(SC.isConnected()){
				$follow = $('<button>Follow</button>')
						.data('follow',false)
						.attr('disabled',true)
						.appendTo($info);

				$follow.click(function(){
					$follow.attr('disabled',true);
					if($follow.data('follow')){
						SC.delete('/me/followings/' + user.id, function(data){
							$follow.removeAttr('disabled');
							$follow.text('Follow');
							$follow.data('follow',false);
						});
					} else {
						SC.put('/me/followings/' + user.id, function(data){
							$follow.removeAttr('disabled');
							$follow.text('Unfollow');
							$follow.data('follow',true);
						});
					}
				});

				SC.get('/me/followings/' + user.id, function(error){
					$follow.removeAttr('disabled');
					if(!error) {
						$follow.data('follow',true);
						$follow.text('Unfollow');
					}
				});
			}
		});

		SC.get('/users/' + user.id + '/playlists', {}, function(albums){
			console.log('playlists',albums);
			$songs.removeClass('loading');
			$.each(albums, function(ind,album){
				var $album = $('<div class="nav album"/>')
						.data('panelType',"albumDetails")
						.data('album',album)
						.data('user',user)
						.appendTo($songs);
				var $artwork = $('<img class="artwork" />').appendTo($album);
				if(album.artwork_url){
					 $artwork.prop('src',album.artwork_url);
				}else{
					$artwork.prop('src','img/default_album.png');
				}
				$('<p>' + album.title + '</p>').appendTo($album);
			});
			var $album = $('<div class="nav album"/>').data('panelType',"allTracks").data('user',user).appendTo($songs);
			$('<img class="artwork" src="img/default_album.png" />').appendTo($album);
			$('<p>All</p>').appendTo($album);
		});

		return $body;
	};

	var albumDetails = function(album,user){
		var $body  = $('<div class="body"/>'),
	 		$block = $('<div class="block-content"/>').appendTo($body),
			$songs = $('<div class="album-tracks"/>').appendTo($body);

		$block.append('<h1>' + (album.title) + '</h1>');
		console.log('album', album);
		if(album.artwork_url) {
			$block.append('<img class="resizable extended-artwork" src="' + album.artwork_url.replace('large','t300x300') + '" />');
		}
		if(album.description){
			$block.append('<p class="description">' + album.description + '</p>');
		}
		$block.append('<button>Play all</button>').click(function(){	
			player.addTracks(album.tracks);
			$set.find('.spin-item').addClass('disabled');
		});
		$set = $('<ol class="spin-items trackset"/>').appendTo($songs);
		$.each(album.tracks, function(ind,track){
			var $track = Items.clickable({title:track.title})
					.data('track',track)
					.addClass('no-arrow')
					.click(function(){
						if(!$track.hasClass('disabled')){
							player.addTrack($track.data('track'),user);
							$track.addClass('disabled');
						}
					}).appendTo($set);
			if(player.hasTrack(track)){
				$track.addClass('disabled');
			}
		});
		return $body;
	}

	var allTracks = function(user){
		var $body  = $('<div class="body"/>'),
			$songs = $('<div class="loading user-tracks"/>').appendTo($body);

		SC.get('/users/' + user.id + '/tracks', {}, function(tracks){
			$songs.removeClass('loading');
			$set = $('<ol class="spin-items trackset"/>').appendTo($songs);
			$.each(tracks, function(ind,track){
				var $track = Items.clickable({title:track.title})
						.data('track',track)
						.click(function(){
							if(!$track.hasClass('disabled')){
								player.addTrack($track.data('track'),user);
								$track.addClass('disabled');
							}
						}).appendTo($set);
				if(player.hasTrack(track)){
					$track.addClass('disabled');
				}
			});
		});

		return $body;
	};

	var songwriterSearch = function(){
		var url = '/users';
		var filter = {};

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$search = $('<form class="search"><input/></form>').submit(function(evt){
				evt.preventDefault();
				var q=$(this).find('input').val();
				songwriterSearchUpdateResults($block,'/users',{q:q})
			}).appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);

		$('<button class="toggle-button">Followings</button>')
			.click(function(){
				$self = $(this);
				$self.toggleClass('pressed');
				if($self.hasClass('pressed')){
					url = '/me/followings';
				}else{
					url = '/users';
				}
				songwriterSearchUpdateResults($block,url,filter);
			}).appendTo($filter);
		/*
		$filter.append('<button class="toggle-button tag">Pop</button>');
		$filter.append('<button class="toggle-button tag">Rock</button>');
		$filter.append('<button class="toggle-button tag">Metal</button>');
		$filter.append('<button class="toggle-button tag">Indu</button>');
		$filter.append('<button class="toggle-button tag">Punk</button>');
		$filter.append('<button class="toggle-button tag">Ciber</button>');
		$filter.append('<button class="toggle-button tag">Electro</button>');
		$filter.delegate('.tag','click',function(){
			$self = $(this);
			$self.toggleClass('pressed');
			if($self.hasClass('pressed')){
				filter.tag
			}else{
			}
			songwriterSearchUpdateResults($block,url,filter);
		});
		*/
		
		songwriterSearchUpdateResults($block,url);
		return $body;
	};
	

	var songwriterFollowings = function(user){
		var url = '/users/' + user.id + '/followings';

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);
		
		songwriterSearchUpdateResults($block,url);
		return $body;
	};

	var songwriterSearchUpdateResults = function($block, url, filter){
		$block.empty();
		$block.addClass('loading');
		if(this.xhr){
			this.xhr.abort();
		}
		this.xhr = SC.get(url, filter, function(results){
			$block.removeClass('loading');
			console.log('results',results);
			$.each(results, function(ind,author){
				$('<img class="nav" title="' + author.username + '" src="' + author.avatar_url + '"/>')
						.data({
							panelType: 'songwriterDetails',
							user: author
						})
						.appendTo($block);
			});
		});	
	}
	
	var songsSearch = function(){
		var url = '/users';
		var filter = {};

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$search = $('<form class="search"><input/></form>').submit(function(evt){
				evt.preventDefault();
				var q=$(this).find('input').val();
				songsSearchUpdateResults($block,'/tracks',{q:q})
			}).appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);

		$('<button class="toggle-button">Favorites</button>')
			.click(function(){
				$self = $(this);
				$self.toggleClass('pressed');
				if($self.hasClass('pressed')){
					url = '/me/favorites';
				}else{
					url = '/tracks';
				}
				songsSearchUpdateResults($block,url,filter);
			}).appendTo($filter);
		
		$filter.append('<button class="toggle-button tag">Pop</button>');
		$filter.append('<button class="toggle-button tag">Rock</button>');
		$filter.append('<button class="toggle-button tag">Metal</button>');
		$filter.append('<button class="toggle-button tag">Indu</button>');
		$filter.append('<button class="toggle-button tag">Punk</button>');
		$filter.append('<button class="toggle-button tag">Ciber</button>');
		$filter.append('<button class="toggle-button tag">Electro</button>');
		
		$filter.delegate('.tag','click',function(){
			$self = $(this);
			$self.toggleClass('pressed');
			if($self.hasClass('pressed')){
			}else{
			}
			songwriterSearchUpdateResults($block,url,filter);
		});
		
		songwriterSearchUpdateResults($block,url);
		return $body;
	};
	

	var favorites = function(user){
		var url = '/users/' + user.id + '/favorites';

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);
		
		songsSearchUpdateResults($block,url);
		return $body;
	};

	var songsSearchUpdateResults = function($block, url, filter){
		$block.empty();
		$block.addClass('loading');
		if(this.xhr){
			this.xhr.abort();
		}
		this.xhr = SC.get(url, filter, function(results){
			$block.removeClass('loading');
			console.log('results',results);
			$.each(results, function(ind,track){
				var $track = Items.clickable({title:track.title})
						.data('track',track)
						.click(function(){
							if(!$track.hasClass('disabled')){
								player.addTrack($track.data('track'),user);
								$track.addClass('disabled');
							}
						}).appendTo($block);
			});
		});	
	}


	window.Items = {
		navigable:function(options){
			return $(
			'<li class="spin-item nav" title="' + (options.title || '') + '">\
				' + (options.icon? '<img class="spin-icon" src="' + options.icon + '" />': '') + '\
				<span class="spin-right">' + (options.info || '') + '</span>\
				' + (options.title || '') + '\
			</li>');
		},
		clickable:function(options){
			return $(
			'<li class="spin-item" title="' + (options.title || '') + '">\
				<span class="spin-left spin-title">' + (options.title || '') + '</span>\
				<span class="spin-right">' + (options.info || '') + '</span>\
			</li>');
		}
	};
}());
