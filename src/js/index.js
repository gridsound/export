function dropHandler( e ) {
	const files = e.dataTransfer.items || e.dataTransfer.files;

	e.preventDefault();

	for ( let i = 0; i < files.length; i++ ) {
		if ( files[ i ].kind === "file" ) {
			const file = files[ i ].getAsFile();

			console.log( ` .. file[${i}].name = ${file.name}` );
		}
	}

	this.classList.remove( "dragover" );

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
