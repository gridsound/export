function beatToTime( b, bpm ) {
	let s = b / bpm * 60;

	return ( s - ( s %= 60 ) ) / 60 + ( 9 < s ? ':' : ':0' ) + ~~s;
}

function displayFile( e ) {
	const fileContent = JSON.parse( e.target.result ),
		elTxt = document.querySelector( "span" );

	elTxt.innerHTML = `<b>${fileContent.name}</b> - 
		<b>${beatToTime(fileContent.duration, fileContent.bpm)}</b>`;
}

function getFile( blob ) {
	const f = new FileReader();

	f.onload = displayFile.bind();
	f.readAsText( blob );
}

function dropHandler( e ) {
	const files = e.dataTransfer.items || e.dataTransfer.files,
		file = files[ 0 ];

	e.preventDefault();
	if ( file.kind === "file" ) {
		const blob = file.getAsFile();

		if ( blob.name.substr( -3 ) === ".gs" ) {
			getFile( blob );
		} else {
			this.classList.remove( "dragover" );
		}
	}

	return false;
}

function dragOverHandler( e ) {
	this.classList.add( "dragover" );
	e.preventDefault();
	return false;
}

function dragLeaveHandler( e ) {
	this.classList.remove( "dragover" );
}

const elDropBox = document.getElementById( "dropbox" );

document.body.ondrop = dropHandler.bind( elDropBox );
document.body.ondragover = dragOverHandler.bind( elDropBox );
document.body.ondragleave = dragLeaveHandler.bind( elDropBox );
