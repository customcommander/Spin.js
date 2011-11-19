var MainController;

(function() {
	$(function(){
		$(document.body).delegate('img.resizable','click',function(){
			if(this.src.indexOf('default_avatar_large.png')>=0){
				return;
			}
			var $body = $('<div class="body panel-image-view"/>');
			$body.append('<img src="' + this.src.replace(/large\.(\w{3})/,'crop.$1') + '" />');
			$.spin.removeAfter($(this).closest('.panel'));
			console.log($body);
			var $panel = $.spin($body, 'img');
		});
	});

	var client_id = 'u9MitXmAQmMLJPiKtFHiQ',
		client_secret = 'zBC6Xii6C8isUG0nKH6MxUA7yv7XHuameNrQdHTk',
		code,
		$player,
		this_application_url = 'http://www.officity.com/apps-dev/jonathan/soundcloud/';
		connect_url = 'https://soundcloud.com/connect?client_id=' + client_id + '&response_type=token&redirect_uri='+this_application_url;

	MainController = function($elt){
		var panelType = $elt.data('panelType');
		var title = $elt.data('title') || $elt.text() || $elt.attr('title');
		var $body;
		
		if(!$player){
			$body = Home();
			title = 'Home';
		}else if(panelType == 'songwriterDetails'){
			$body = songwriterDetails($elt.data('user'));
		}else if(panelType == 'songwriterSearch'){
			$body = songwriterSearch();
		}else if(panelType == 'followings'){
			$body = songwriterFollowings($elt.data('user'));
		}else{
			$.error('no panel specified');
		}
		$panel = $.spin($body, title);
	};

	var Home = function(){
		var self = this;

		if(!code){
			var match = /access_token=(\w*)/g.exec(window.location.href);
			if(match && match[1]){
				code = match[1];
			}
		}
		var $body = $('<div class="body"/>');

		var $block = $('<div class="quick-nav"/>');
		$body.prepend($block);
		$('<div class="nav spin-item see-more"></div>').appendTo($block)
				.data({
					panelType: 'songwriterSearch'
				});
		if(!code){
			$block.append('<a href="' + connect_url + '">connect</a>');
		}else{
			var url = 'https://api.soundcloud.com/me/followings.json?client_id=' + client_id + '&limit=8&oauth_token=' + code + '&callback=?';
			// var url = 'https://api.soundcloud.com/oauth2/token?callback=?';
			$.ajax({
				url			: url,
				type		: 'GET',
				dataType	: 'json',
				success		: function(data){
					console.log('followings',data);
					$.each(data, function(ind,author){
						$('<img class="nav" title="' + author.username + '" src="' + author.avatar_url.replace(/large\.(\w{3})/,'badge.$1') + '"/>')
								.data({
									panelType: 'songwriterDetails',
									user: author
								})
								.prependTo($block);
					});
				}
			});	
		}


		// perform our cross-domain AJAX request to the public API and
		var url = 'http://api.soundcloud.com/tracks.json?client_id=' + client_id + '&limit=10&order=hotness&callback=?';
		$.ajax({
			url			: url,
			type		: 'GET',
			dataType	: 'json',
			success		: function(data){
		
				$player = $('<div/>').soundSpinPlayer({
					tracks:data,
					client_id: client_id
				}).appendTo($body);
			}
		});
		
		return $body;
	};

	var songwriterDetails = function(user){
		var $body  = $('<div class="body"/>'),
	 		$blockNav = $('<ol class="spin-items" style="float:right; width:30%;"/>').appendTo($body),
		 	$block = $('<div class="block-content loading"/>').appendTo($body),
			$songs = $('<div class="loading songs"/>').appendTo($body);

		var url = 'http://api.soundcloud.com/users/' + user.id + '/playlists.json?client_id=' + client_id + '&callback=?';
		$.ajax({
			url			: url,
			type		: 'GET',
			dataType	: 'json',
			success		: function(data){
				console.log('playlists',data);
				$songs.removeClass('loading');
				$.each(data, function(ind,playlist){
					var $album = $('<div class="album"/>').appendTo($songs);
					if(playlist.artwork_url){
						$('<img class="resizable artwork" src="' + playlist.artwork_url + '" />').appendTo($album);
					}
					$('<h2>' + playlist.title + ' (' + playlist.type + ')</h2>').appendTo($album);
		 			$set = $('<ol class="spin-items trackset"/>').appendTo($album);
					$.each(playlist.tracks, function(ind,track){
						var $track = Items.clickable({title:track.title})
								.data('track',track)
								.click(function(){
									if(!$track.hasClass('disabled')){
										$player.soundSpinPlayer('addTrack',$track.data('track'),user);
										$track.addClass('disabled');
									}
								}).appendTo($set);
						if($player.soundSpinPlayer('hasTrack',track)){
							$track.addClass('disabled');
						}else{
							
						}
					});
				});
			}
		});


		var url = 'http://api.soundcloud.com/users/' + user.id + '.json?client_id=' + client_id + '&callback=?';

		$.ajax({
			url			: url,
			type		: 'GET',
			dataType	: 'json',
			success		: function(data){
				console.log('user' , data);
				$block.removeClass('loading');
				$block.append('<a href="' + user.permalink_url + '" target="_blank">Voir sur Soundcloud</a>');
				$block.append('<h1>' + (data.full_name || data.username) + '</h1>');
				$block.append('<img class="resizable songwriter-avatar" src="' + user.avatar_url + '" />');
				if(data.description){
					$block.append('<p>' + data.description + '</p>');
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
				if(code){
					$follow = $('<button>...</button>').appendTo($info).attr('disabled',true);

					$follow.click(function(){
							$follow.attr('disabled',true);
							var url = 'https://api.soundcloud.com/me/followings/' + user.id + '.json?oauth_token=' + code;
							$.ajax({
								url			: url,
								type		: $follow.data('follow') ? 'DELETE':'PUT',
								dataType	: 'text',
								success		: function(data){
									$follow.removeAttr('disabled');
									$follow.text($follow.data('follow') ? 'Follow' : 'Unfollow');
									$follow.data('follow',!$follow.data('follow'));
									console.log(data);
								}
							});
						});

					url = 'https://api.soundcloud.com/me/followings/' + user.id + '.json?oauth_token=' + code;
					$.ajax({
						url			: url,
						type		: 'GET',
						dataType	: 'text',
						success		: function(data,textStatus){
							// console.log(textStatus);
							// return;
							$follow.data('follow',true);
							$follow.removeAttr('disabled');
							$follow.text('Unfollow');
						},
						error		: function(jqXHR,textStatus,error){
							// console.log(textStatus,error,jqXHR);
							if(jqXHR.status==404){
								$follow.data('follow',false);
								$follow.removeAttr('disabled');
								$follow.text('Follow');
							}else{
								$follow.data('follow',true);
								$follow.removeAttr('disabled');
								$follow.text('Unfollow');
							}
						}
					});
					
				}
			}
		});

		return $body;
	};


	var songwriterSearch = function(){
		var url = 'https://api.soundcloud.com/users.json?client_id=' + client_id + '&limit=50&order=hotness&callback=?';

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$search = $('<form class="search"><input/></form>').submit(function(evt){
				evt.preventDefault();
				var q=$(this).find('input').val();
				songwriterSearchUpdateResults($block,'https://api.soundcloud.com/users.json?limit=50&q=' + q + '&oauth_token=' + code + '&callback=?')
			}).appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);

		$('<button class="toggle-button">Followings only</button>')
			.click(function(){
				$self = $(this);
				$self.toggleClass('pressed');
				if($self.hasClass('pressed')){
					songwriterSearchUpdateResults($block,'https://api.soundcloud.com/me/followings.json?limit=50&oauth_token=' + code + '&callback=?')
				}else{
					songwriterSearchUpdateResults($block,'https://api.soundcloud.com/users.json?limit=50&oauth_token=' + code + '&callback=?')
				}
			}).appendTo($filter);
		$filter.append('<button class="toggle-button">Tag,</button>');
		$filter.append('<button class="toggle-button">Tag,</button>');
		$filter.append('<button class="toggle-button">Tag...</button>');
		
		songwriterSearchUpdateResults($block,url);
		return $body;
	};
	

	var songwriterFollowings = function(user){
		var url = 'https://api.soundcloud.com/users/' + user.id + '/followings.json?client_id=' + client_id + '&limit=50&oauth_token=' + code + '&callback=?';

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);
		
		songwriterSearchUpdateResults($block,url);
		return $body;
	};

	var songwriterSearchUpdateResults = function($block,url){
		$block.empty();
		$block.addClass('loading');
		if(this.xhr){
			this.xhr.abort();
		}
		this.xhr = $.ajax({
			url			: url,
			type		: 'GET',
			dataType	: 'json',
			success		: function(data){
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
			}
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
