class DragAndDrop {
	constructor( elDropBox ) {
		this.elDropBox = elDropBox;
		this.elBtnQuit = document.querySelector( ".quit" );
		this.elBtnQuit.onclick = this._quit.bind( this );
		document.body.ondrop = this._dropHandler.bind( this );
		document.body.ondragenter = this._dragEnterHandler.bind( this );
		document.body.ondragover = this._dragOverHandler.bind( this );
		document.body.ondragleave = this._dragLeaveHandler.bind( this );
		this._fillInfo();
	}

	beatToTime( b, bpm ) {
		let s = b / bpm * 60;

		return ( s - ( s %= 60 ) ) / 60 + ( 9 < s ? ':' : ':0' ) + ~~s;
	}

	// private
	_quit( e ) {
		this.elDropBox.classList.remove( "error" );
		this.elDropBox.classList.remove( "render" );
		this._fillInfo();
	}
	_fillInfoFile( el, d ) {
		const elTitle = document.createElement( "div" ),
			elDur = document.createElement( "div" );

		elTitle.innerHTML = "title: <b>" + d.name || "<i>Untitled</i>" + "</b>";
		elDur.textContent = "duration: " + this.beatToTime( d.duration, d.bpm );
		el.append( elTitle, elDur );
		this.elDropBox.classList.add( "render" );
	}
	_fillInfo( type = "default", d = null ) {
		const elInfo = document.getElementById( "info" );

		elInfo.innerHTML = "";
		if ( type === "error" ) {
			elInfo.textContent = `${d} is not a GridSound file`;
		} else if ( type === "file" ) {
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
			} catch ( err ) {
				this._fillInfo.call( this, "error", blob.name );
			}
			this._fillInfo.call( this, "file", d );
		};
		f.readAsText( blob );
	}
	_dropHandler( e ) {
		const files = e.dataTransfer.items || e.dataTransfer.files,
			file = files[ 0 ];

		e.preventDefault();
		this.elDropBox.classList.remove( "dragover" );
		if ( file.kind === "file" ) {
			this._readFile.call( this, file.getAsFile() );
		}
		return false;
	}
	_dragEnterHandler( e ) {
		this.elDropBox.classList.add( "dragover" );
		this._quit.call( this );
		return false;
	}
	_dragOverHandler( e ) {
		e.preventDefault();
		return false;
	}
	_dragLeaveHandler( e ) {
		this.elDropBox.classList.remove( "dragover" );
	}
}
