function render( cmp, el ) {
	const synths = {},
		btn = el,
		btnD = el.dataset,
		sch = new gswaScheduler(),
		dur = Math.ceil( cmp.duration * 60 / cmp.bpm ) || 1,
		ctx = new OfflineAudioContext( 2, ~~( dur * 44100 ), 44100 ),
		onstartKey = ( synthId, startedId, blc, when, off, dur ) => {
			synths[ synthId ].startKey( blc.key, when, off, dur, blc.gain, blc.pan )
		},
		onstartBlock = ( startedId, blc, when, off, dur ) => {
			if ( cmp.tracks[ blc.track ].toggle ) {
				const pat = cmp.patterns[ blc.pattern ],
					sch = new gswaScheduler(),
					dur = Math.ceil( cmp.duration * 60 / cmp.bpm ) || 1;

				sch.pattern = pat;
				sch.currentTime = () => ctx.currentTime;
				sch.ondatastart = onstartKey.bind( null, pat.synth );
				sch.setBPM( cmp.bpm );
				Object.assign( sch.data, cmp.keys[ pat.keys ] );
				sch.enableStreaming( false );
				sch.start( when, off, dur );
			}
		},
		exportCurrentCompositionToWAV = () => {
			if ( this._blobDL ) {
				URL.revokeObjectURL( this._blobDL );
			}
			return ctx.startRendering().then( buffer => {
				return this._blobDL = URL.createObjectURL( new Blob( [
					gswaEncodeWAV.encode( buffer, { float32: true } ) ] ) );
			} ).catch( console.error.bind( console ) );
		}

	handleOldComposition( cmp );
	Object.entries( cmp.synths ).forEach( ( [ id, obj ] ) => {
		const syn = new gswaSynth();

		syn.setContext( ctx );
		syn.setBPM( cmp.bpm );
		syn.connect( ctx.destination );
		Object.entries( obj.oscillators ).forEach( ( [ id, osc ] ) => {
			syn.data.oscillators[ id ] = osc;
		} );
		synths[ id ] = syn;
	} );

	sch.setBPM( cmp.bpm );
	sch.enableStreaming( false );
	sch.ondatastart = onstartBlock;
	sch.currentTime = () => ctx.currentTime;
	Object.entries( cmp.blocks ).forEach( ( [ id, obj ] ) => {
		sch.data[ id ] = obj;
	} );
	sch.start( 0 );

	exportCurrentCompositionToWAV().then( url => {
		btnD.status = "2";
		btn.href = url;
		btn.textContent = "Download";
		btn.download = ( cmp.name || "untitled" ) + ".wav";
	} );
	return false;
}	
