var beatpattern = [8, 7, 6, 5];
var grid = [];
for (i=0; i<32; i++) {
	grid = grid.concat(beatpattern);
}

function bang() {
	outlet(0,arr);
}