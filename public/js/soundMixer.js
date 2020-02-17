

function SoundMixer() {

	var domMusic = document.getElementById('music');

	var currentMusic;
	var lastMusicSet;
	var musicVolume = 0 ;

	const SFXURL = 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/sfx/' ;

	const MUSIC_URL = "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/" ;

	const TRACKS_URLS = {
		AK_Pulses: MUSIC_URL + "AK+-+Pulses.ogg",
		AndrewOdd_Elysium: MUSIC_URL + "Andrew+Odd+-+Elysium.ogg",
		KylePreston_BrknPhoto: MUSIC_URL + "Kyle+Preston+-+Broken+Photosynthesis.ogg",
		SimonBainton_Hurtstone: MUSIC_URL + "Simon+Bainton+-+Hurtstone.ogg",
		SimonBainton_Porlock: MUSIC_URL + "Simon+Bainton+-+Porlock.ogg",
		SimonBainton_Tankah: MUSIC_URL + "Simon+Bainton+-+Tankah.ogg",
		StromNoir_Hollow: MUSIC_URL + "Strom+Noir+-+Hollow.ogg",
		StromNoir_WinterDay: MUSIC_URL + "Strom+Noir+-+Such+a+Beautiful+Winter+Day.ogg",
		StromNoir_Spring: MUSIC_URL + "Strom+Noir+-+The+beginning+of+spring.ogg",
		TobiasHellkvist_HearYou: MUSIC_URL + "Tobias+Hellkvist+-+Where+No+One+Can+Hear+You.ogg"
	};

	const TRACKS_ORDER = [
		TRACKS_URLS.StromNoir_WinterDay,
		TRACKS_URLS.SimonBainton_Tankah,
		TRACKS_URLS.TobiasHellkvist_HearYou,
		TRACKS_URLS.AndrewOdd_Elysium,
		TRACKS_URLS.KylePreston_BrknPhoto,
		TRACKS_URLS.SimonBainton_Hurtstone
	];

	const SFX_PARAMS = {
		faint_waves: {
			volume: 0.8,
			distance: 1,
			maxDistance: 12
		},
		cricket: {
			volume: 0.5,
			distance: 1,
			maxDistance: 15,
			playSpeedVarying: 0.1
		},
		cricket2: {
			volume: 0.55,
			distance: 1.1,
			maxDistance: 15,
			playSpeedVarying: 0.05
		},
		fly: {
			volume: 1,
			distance: 1,
			maxDistance: 4,
			playSpeedVarying: 0.1
		},
		swallow: {
			volume: 0.45,
			distance: 1,
			maxDistance: 14
		},
		robin: {
			volume: 0.7,
			distance: 1.3,
			maxDistance: 16
		},
		nutcracker: {
			volume: 0.6,
			distance: 1.3,
			maxDistance: 16,
			playSpeedVarying: 0.1
		},
		stream: {
			volume: 1,
			distance: 0.5,
			maxDistance: 13,
			playSpeedVarying: 0.1
		},
		waterfall: {
			volume: 1.4,
			distance: 0.4,
			maxDistance: 25
		},
		small_waterfall: {
			volume: 1.3,
			distance: 0.5,
			maxDistance: 15
		},
		gust: {
			volume: 0.9,
			distance: 1,
			maxDistance: 20
		}
	}

	var sfxs = [];
	var sfxCanPlay = true ;

	var listener;
	var audioLoader = new THREE.AudioLoader();






    
    function setMusic( musicName ) {

		if ( musicName != 'track-' + currentMusic ) {

			let musicID = musicName.slice( -1 );

			domMusic.src = TRACKS_ORDER[ musicID ] ;
	    	domMusic.load();
	    	domMusic.play();

	    	currentMusic = musicID ;

		} else {

			lastMusicSet = Date.now();

		};

	};



    function start() {

    	// setMusic( 'track-0' );

    	listener = new THREE.AudioListener();
		camera.add( listener );

    	//

    	var cubesGraph = atlas.getSceneGraph().cubesGraph;

    	for ( let i of Object.keys( cubesGraph ) ) {

			if ( cubesGraph[i] ) {

				cubesGraph[i].forEach( (logicCube)=> {

					if ( logicCube.type == 'cube-anchor' ) {
						
						createSFX( logicCube.tag, logicCube.position );

					};

				});

			};

		};

    };



    function createSFX( sfxName, position ) {

    	// create the PositionalAudio object (passing in the listener)
		var sound = new THREE.PositionalAudio( listener );

		// load a sound and set it as the PositionalAudio object's buffer
		audioLoader.load( SFXURL + sfxName + '.ogg' , function( buffer ) {

			sound.setBuffer( buffer );

			sound.setRefDistance( SFX_PARAMS[ sfxName ].distance );
			sound.setVolume( SFX_PARAMS[ sfxName ].volume );
			sound.maxDistance = SFX_PARAMS[ sfxName ].maxDistance
			sound.setLoop( true );
			sound.sfxName = sfxName ;

			if ( SFX_PARAMS[ sfxName ].playSpeedVarying ) {
				sound.setPlaybackRate(
					( 1 - SFX_PARAMS[ sfxName ].playSpeedVarying ) -
					( Math.random() * SFX_PARAMS[ sfxName ].playSpeedVarying )
				);
			};

			sound.autoplay = true;

			sound.position.copy( position );

			scene.add( sound );

			sfxs.push( sound );

		});

		

    };



	function switchGraph( graphName ) {

		if ( graphName == 'mountain' ) {

			sfxCanPlay = true ;

		} else {

			sfxCanPlay = false ;

			setMusic( 'track-5' );

			for ( let sound of sfxs ) {

				if ( sound.isPlaying ) sound.stop();

			};

		};

	};


	function update( mustCheck, delta ) {

		let speedRatio = delta / ( 1 / 60 ) ;

		// fade out
		if ( lastMusicSet + 80 < Date.now() && !sfxCanPlay ) {

			musicVolume = Math.max( 0, musicVolume - ( 0.008 * speedRatio ) );

		// fade in
		} else {

			musicVolume = Math.min( 1, musicVolume + ( 0.008 * speedRatio ) );

		};

		domMusic.volume = musicVolume ;

		if ( mustCheck && sfxCanPlay ) {

			for ( let sound of sfxs ) {

				// Check that the sound emitter is in the range to be heard

				if ( sound.position.distanceTo( camera.position ) > sound.maxDistance ) {

					if ( sound.isPlaying ) sound.stop();

				} else {

					if ( !sound.isPlaying ) {

						sound.play();

					};

				};

			};

		};

	};


	return {
		start,
		setMusic,
		update,
		switchGraph
	};

};