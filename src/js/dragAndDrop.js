class DragAndDrop {
	constructor( elDropBox ) {
		this.root = elDropBox;
		this.elInfo = this.root.querySelector( "#info" );
		this.btnQ = this.root.querySelector( ".quit" );
		this.btnQ.onclick = this._onclickQuit.bind( this );

		document.body.ondrop = this._evtDropHandler.bind( this );
		document.body.ondragenter = this._evtDragEnterHandler.bind( this );
		document.body.ondragover = this._evtDragOverHandler.bind( this );
		document.body.ondragleave = this._evtDragLeaveHandler.bind( this );
		
		this._fillInfo();
	}

	beatToTime( b, bpm ) {
		let s = b / bpm * 60;

		return ( s - ( s %= 60 ) ) / 60 + ( 9 < s ? ':' : ':0' ) + ~~s;
	}

	// private
	_createBtn( cmp ) {
		this.btnR = document.createElement( "a" );
		this.btnR.id = "render-btn";
		this.btnR.textContent = "Render";
		this.btnR.dataset.status = "1";
		this.elInfo.append( this.btnR );
	}
	_fillInfoFile( cmp ) {
		const elTitle = document.createElement( "div" ),
			elDur = document.createElement( "div" );

		elTitle.innerHTML = "title: <b>" + cmp.name || "<i>Untitled</i>" + "</b>";
		elDur.textContent = "duration: " + this.beatToTime( cmp.duration, cmp.bpm );
		this.elInfo.append( elTitle, elDur );
	}
	_fillInfo( data ) {
		this.elInfo.innerHTML = "";
		if ( typeof data === "object" ) {
			this._fillInfoFile( data );
			this._createBtn( data );
		} else {
			this.elInfo.textContent = typeof data === "string" ?
				`${data} is not a GridSound file` :
				"Drop GridSound file (.gs) here"
		}
	}
	_readFile( blob ) {
		const f = new FileReader();

		f.onload = e => {
			try {
				const cmp = JSON.parse( e.target.result );
				
				this._fillInfo( cmp );
			} catch ( err ) {
				this._fillInfo( blob.name );
				console.error( err );
			}
		};
		f.readAsText( blob );
	}
		this._fillInfo();
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
		this._fillInfo();
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
