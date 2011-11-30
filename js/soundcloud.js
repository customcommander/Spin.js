

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
		if(!$player){
			$body = Home();
			title = 'Home';
		}else if(panelType == 'songwriterDetails'){
			$body = songwriterDetails($elt.data('user'));
		}else if(panelType == 'songwriterSearch'){
			$body = songwriterSearch();
		}else if(panelType == 'followings'){
			$body = songwriterFollowings($elt.data('user'));
		}else if(panelType == 'allTracks'){
			$body = allTracks($elt.data('user'));
		}else if(panelType == 'albumDetails'){
			$body = albumDetails($elt.data('album'));
			
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
		}else{
			loadFollowings();
		}


		// get some sample tracks
		SC.get('/tracks',{limit:10},function(data){
			$player = $('<div/>');
			player = new SoundSpinPlayer($player,{tracks:data});
			$player.appendTo($body)
		});
		
		return $body;
	};

	var songwriterDetails = function(user){
		var $body  = $('<div class="body"/>'),
	 		$blockNav = $('<ol class="spin-items" style="float:right; width:30%;"/>').appendTo($body),
		 	$block = $('<div class="block-content loading"/>').appendTo($body),
			$songs = $('<div class="loading songs"/>').appendTo($body);

		SC.get('/users/' + user.id, {}, function(data){
			console.log('user' , data);
			$block.removeClass('loading');
			$block.append('<a href="' + user.permalink_url + '" target="_blank">Voir sur Soundcloud</a>');
			$block.append('<h1>' + (data.full_name || data.username) + '</h1>');
			$block.append('<img class="resizable songwriter-avatar" src="' + user.avatar_url.replace('large','t300x300') + '" />');
			if(data.description){
				$block.append('<p class="songwriter-description">' + data.description + '</p>');
			}
			$('<li class="spin-item nav">' + data.public_favorites_count + ' Favorites</li>').appendTo($blockNav);
			$('<li class="spin-item nav">' + data.followings_count + ' Followings</li>')
					.data({
						panelType: 'followings',
						user: user
					})
					.appendTo($blockNav);

			var $info = $('<div class="songwriter-info"/>').appendTo($block);

			if(data.discogs_name){
				$info.append('<p>Dicogs <strong>' + data.discogs_name + '</strong></p>');
			}
			if(data.myspace_name){
				$info.append('<p>Myspace <strong>' + data.myspace_name + '</strong></p>');
			}
			if(data.website){
				$info.append('<p><a href="' + data.website + '">' + (data.website_title || data.website) + '</a></p>');
			}
			if(data.country){
				$info.append('<p>Country <strong>' + data.country + '</strong></p>');
			}
			if(data.city){
				$info.append('<p>City <strong>' + data.city + '</strong></p>');
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

		SC.get('/users/' + user.id + '/playlists', {}, function(data){
			console.log('playlists',data);
			$songs.removeClass('loading');
			$.each(data, function(ind,playlist){
				var $album = $('<div class="nav album"/>')
						.data('panelType',"albumDetails")
						.data('album',playlist)
						.appendTo($songs);
				var $artwork = $('<img class="artwork" />').appendTo($album);
				$artwork.data('album',playlist);
				if(playlist.artwork_url){
					 $artwork.prop('src',playlist.artwork_url);
				}else{
					$artwork.prop('src','img/default_album.png');
				}
				$('<p>' + playlist.title + '</p>').appendTo($album);
			});
			var $album = $('<div class="nav album"/>').data('panelType',"allTracks").data('user',user).appendTo($songs);
			$('<img class="artwork" src="img/default_album.png" />').appendTo($album);
			$('<p>All</p>').appendTo($album);
		});

		return $body;
	};

	var albumDetails = function(album){
		var $body  = $('<div class="body"/>'),
	 		$block = $('<div class="block-content"/>').appendTo($body),
			$songs = $('<div class="album-tracks"/>').appendTo($body);

		if(album.artwork_url) {
			$block.append('<img class="resizable album-artwork" src="' + album.artwork_url.replace('large','t300x300') + '" />');
		}
		if(album.description){
			$block.append('<p class="album-description">' + album.description + '</p>');
		}
		$set = $('<ol class="spin-items trackset"/>').appendTo($songs);
		$.each(album.tracks, function(ind,track){
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
		return $body;
	}

	var allTracks = function(user){
		var $body  = $('<div class="body"/>'),
			$songs = $('<div class="loading user-tracks"/>').appendTo($body);

		SC.get('/users/' + user.id + '/tracks', {}, function(data){
			$songs.removeClass('loading');
			$set = $('<ol class="spin-items trackset"/>').appendTo($songs);
			$.each(data, function(ind,track){
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

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$search = $('<form class="search"><input/></form>').submit(function(evt){
				evt.preventDefault();
				var q=$(this).find('input').val();
				songwriterSearchUpdateResults($block,'/users',{q:q})
			}).appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);

		$('<button class="toggle-button">Followings only</button>')
			.click(function(){
				$self = $(this);
				$self.toggleClass('pressed');
				if($self.hasClass('pressed')){
					songwriterSearchUpdateResults($block,'/me/followings')
				}else{
					songwriterSearchUpdateResults($block,'/users')
				}
			}).appendTo($filter);
		$filter.append('<button class="toggle-button">Tag,</button>');
		$filter.append('<button class="toggle-button">Tag,</button>');
		$filter.append('<button class="toggle-button">Tag...</button>');
		
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

	var songwriterSearchUpdateResults = function($block,url,query){
		$block.empty();
		$block.addClass('loading');
		if(this.xhr){
			this.xhr.abort();
		}
		this.xhr = SC.get(url, query, function(data){
			$block.removeClass('loading');
			console.log('results',data);
			$.each(data, function(ind,author){
				$('<img class="nav" title="' + author.username + '" src="' + author.avatar_url + '"/>')
						.data({
							panelType: 'songwriterDetails',
							user: author
						})
						.appendTo($block);
			});
		});	
	}
	


	window.Items = {
		navigable:function(options){
			return $(
			'<li class="spin-item nav" title="' + (options.title || '') + '">\
				<span class="spin-left spin-title">' + (options.title || '') + '</span>\
				<span class="spin-right">' + (options.info || '') + '</span>\
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
