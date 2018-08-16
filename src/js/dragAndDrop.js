class DragAndDrop {
	constructor( elDropBox ) {
		this.elDropBox = elDropBox;
		this.elBtnQuit = document.querySelector( ".quit" );
		this.elBtnQuit.onclick = this._evtQuit.bind( this );
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
	_fillInfoFile( el, d ) {
		const elTitle = document.createElement( "div" ),
			elDur = document.createElement( "div" ),
			elBtn = document.createElement( "a" );

		elTitle.innerHTML = "title: <b>" + d.name || "<i>Untitled</i>" + "</b>";
		elDur.textContent = "duration: " + this.beatToTime( d.duration, d.bpm );
		elBtn.textContent = "Render";
		elBtn.classList.add( "btn-render" );
		el.append( elTitle, elDur, elBtn );
		this.elDropBox.classList.add( "render" );
	}
	_fillInfo( d ) {
		const elInfo = document.getElementById( "info" );

		elInfo.innerHTML = "";
		if ( typeof d === "string" ) {
			elInfo.textContent = `${d} is not a GridSound file`;
		} else if ( typeof d === "object" ) {
			this._fillInfoFile.call( this, elInfo, d );
		} else {
			elInfo.textContent = "Drop GridSound file (.gs) here";
		}
	}
	_readFile( blob ) {
		const f = new FileReader();

		f.onload = e => {
			try {
				var d = JSON.parse( e.target.result );
				
				this._fillInfo.call( this, d );
			} catch ( err ) {
				this._fillInfo.call( this, blob.name );
				console.error( err );
			}
		};
		f.readAsText( blob );
	}
	_evtQuit( e ) {
		this.elDropBox.classList.remove( "render" );
		this._fillInfo();
	}
	_evtDropHandler( e ) {
		const files = e.dataTransfer.items || e.dataTransfer.files,
			file = files[ 0 ];

		e.preventDefault();
		this.elDropBox.classList.remove( "dragover" );
		if ( file.kind === "file" ) {
			this._readFile.call( this, file.getAsFile() );
		}
		return false;
	}
	_evtDragEnterHandler( e ) {
		this.elDropBox.classList.add( "dragover" );
		this._evtQuit.call( this );
		return false;
	}
	_evtDragOverHandler( e ) {
		e.preventDefault();
		return false;
	}
	_evtDragLeaveHandler( e ) {
		this.elDropBox.classList.remove( "dragover" );
	}
}
