class DragAndDrop {
	constructor( elDropBox ) {
		this.root = elDropBox;

		this._elMessage = this.root.querySelector( "#message" );
		this._elTitle = this.root.querySelector( "#title" );
		this._elDuration = this.root.querySelector( "#duration" );
		this.btnQ = this.root.querySelector( ".quit" );
		this.btnQ.onclick = this._onclickQuit.bind( this );

		document.body.ondrop = this._evtDropHandler.bind( this );
		document.body.ondragenter = this._evtDragEnterHandler.bind( this );
		document.body.ondragover = this._evtDragOverHandler.bind( this );
		document.body.ondragleave = this._evtDragLeaveHandler.bind( this );
		
		this._elMessage.textContent = "Drop GridSound file (.gs) here";
	}

	beatToTime( b, bpm ) {
		let s = b / bpm * 60;

		return ( s - ( s %= 60 ) ) / 60 + ( 9 < s ? ':' : ':0' ) + ~~s;
	}

	// private
	_emptyFile() {
		this._elTitle.innerHTML = "";
		this._elDuration.textContent = "";
	}
	_fillFile( cmp ) {
		const t = cmp.name || "<i>Untitled</i>",
			d = this.beatToTime( cmp.duration, cmp.bpm );
			
		this._elTitle.innerHTML = `title: <b>${t}</b>`;
		this._elDuration.textContent = `duration: ${d}`;
	}
	_fillMessage( data ) {
		const t = typeof data;

		this._elMessage.innerHTML = "";
		if ( t === "object" ) {
			this._fillFile( data );
		} else if ( t === "string" ) {
			this._elMessage.textContent = `${data} is not a GridSound file`;
		} else {
			this._elMessage.textContent = "Drop GridSound file (.gs) here";
		}
	}
	_readFile( blob ) {
		const f = new FileReader();

		f.onload = e => {
			try {
				var cmp = JSON.parse( e.target.result );
			} catch ( err ) {
				this._fillMessage( blob.name );
				console.error( err );
				return;
			}
			this._fillMessage( cmp );
			render.setCmp( cmp );
			this.root.classList.add( "render" );
		};
		f.readAsText( blob );
	}
	_onclickQuit() {
		render.sch.stop();
		this._fillMessage();
		this._emptyFile();
		render.resetRenderElement();
		this.root.classList.remove( "dragover" );
		this.root.classList.remove( "render" );
	}
	_evtDropHandler( e ) {
		const files = e.dataTransfer.items || e.dataTransfer.files,
			file = files[ 0 ];

		e.preventDefault();
		if ( file.kind === "file" ) {
			this._readFile( file.getAsFile() );
		}
		return false;
	}
	_evtDragEnterHandler( e ) {
		this.root.classList.add( "dragover" );
		this.root.classList.remove( "render" );
		this._fillMessage();
		return false;
	}
	_evtDragOverHandler( e ) {
		e.preventDefault();
		return false;
	}
	_evtDragLeaveHandler( e ) {
		this.root.classList.remove( "dragover" );
	}
}
