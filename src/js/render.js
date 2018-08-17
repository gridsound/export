class Render {
	constructor() {
		this._synths = {};
		this.sch = new gswaScheduler();
		this._btn = document.querySelector( "#render-btn" );
		this._btn.onclick = this._onclickBtn.bind( this );
		this._progressbar = document.querySelector( "#render-progress" );
		this.resetRenderElement();
	}
	setCmp( cmp ) {
		this._cmp = cmp;
	}
	resetRenderElement() {
		this._btn.href = "#";
		this._btn.dataset.status = "0";
		this._btn.textContent = "Render";
		this._btn.removeAttribute( "download" );
		this._progressbar.value = 0;
	}

	// private
	_exportCurrentCompositionToWAV() {
		this._btn.textContent = "Rendering ...";
		if ( this._blobDL ) {
			URL.revokeObjectURL( this._blobDL );
		}
		return this._ctx.startRendering().then( buffer => {
			return this._blobDL = URL.createObjectURL( new Blob( [
				gswaEncodeWAV.encode( buffer, { float32: true } ) ] ) );
		} ).catch( console.error.bind( console ) );
	}
	_onstartKey( synthId, startedId, blc, when, off, dur ) {
		this._synths[ synthId ].startKey( blc.key, when, off, dur, blc.gain, blc.pan )
	}
	_onstartBlock( startedId, blc, when, off, dur ) {
		if ( this._cmp.tracks[ blc.track ].toggle ) {
			const pat = this._cmp.patterns[ blc.pattern ],
				sch = new gswaScheduler(),
				dur = Math.ceil( this._cmp.duration * 60 / this._cmp.bpm ) || 1;

			sch.pattern = pat;
			sch.currentTime = () => this._ctx.currentTime;
			sch.ondatastart = this._onstartKey.bind( this, pat.synth );
			sch.setBPM( this._cmp.bpm );
			Object.assign( sch.data, this._cmp.keys[ pat.keys ] );
			sch.enableStreaming( false );
			sch.start( when, off, dur );
		}
	}
	_onclickBtn() {
		const bD = this._btn.dataset;

		if ( bD.status === "2" ) {
			return;
		} else if ( bD.status === "0" ) {
			this._render.call( this );
		}
	}
	_render() {
		const b = this._btn,
			bD = b.dataset,
			cmp = this._cmp,
			pB = this._progressbar,
			dur = Math.ceil( cmp.duration * 60 / cmp.bpm ) || 1;

		handleOldComposition( cmp );
		this._ctx = new OfflineAudioContext( 2, ~~( dur * 44100 ), 44100 );
		this._renderStartTime = this._ctx.currentTime;

		Object.entries( cmp.synths ).forEach( ( [ id, obj ] ) => {
			const syn = new gswaSynth();

			syn.setContext( this._ctx );
			syn.setBPM( cmp.bpm );
			syn.connect( this._ctx.destination );
			Object.entries( obj.oscillators ).forEach( ( [ id, osc ] ) => {
				syn.data.oscillators[ id ] = osc;
			} );
			this._synths[ id ] = syn;
		} );

		this.sch.setBPM( cmp.bpm );
		this.sch.enableStreaming( false );
		this.sch.ondatastart = this._onstartBlock.bind( this );
		this.sch.currentTime = () => this._ctx.currentTime;
		Object.entries( cmp.blocks ).forEach( ( [ id, obj ] ) => {
			this.sch.data[ id ] = obj;
		} );
		this.sch.start( 0 );

		bD.status = "1";
		this._intervalId = setInterval( () => {
			pB.value = ( this._ctx.currentTime - this._renderStartTime ) / dur;
		}, 40 );
		this._exportCurrentCompositionToWAV().then( url => {
			clearInterval( this._intervalId );
			pB.value = 1;
			bD.status = "2";
			b.href = url;
			b.textContent = "Download";
			b.download = ( cmp.name || "untitled" ) + ".wav";
		} );
		return false;
	}
}
