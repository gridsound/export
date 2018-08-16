class DragAndDrop {
	constructor( elDropBox ) {
		this.elDropBox = elDropBox;
		this.elBtnQuit = document.querySelector( ".quit" );
		this.elBtnQuit.onclick = this._quit.bind( this );
		document.body.ondrop = this._dropHandler.bind( this );
		document.body.ondragenter = this._dragEnterHandler.bind( this );
		document.body.ondragover = this._dragOverHandler.bind( this );
		document.body.ondragleave = this._dragLeaveHandler.bind( this );
	}

	beatToTime( b, bpm ) {
		let s = b / bpm * 60;

		return ( s - ( s %= 60 ) ) / 60 + ( 9 < s ? ':' : ':0' ) + ~~s;
	}

	// private
	_quit( e ) {
		this.elDropBox.classList.remove( "error" );
		this.elDropBox.classList.remove( "render" );
	}
	_fillData( e, name ) {
		try {
			const d = JSON.parse( e.target.result ),
				elTitle = document.getElementById( "title" ),
				elDur = document.getElementById( "duration" );

			elTitle.innerHTML = d.name || "<i>Untitled</i>";
			elDur.textContent = this.beatToTime(d.duration, d.bpm);
			this.elDropBox.classList.add( "render" );
		} catch ( err ) {
			const elError = document.getElementById( "error" );

			elError.textContent = `${name} is not a GridSound file`;
			this.elDropBox.classList.add( "error" );
		}
	}
	_readFile( blob ) {
		const f = new FileReader();

		f.onload = e => this._fillData.call( this, e, blob.name );
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
