var bkgpattern = [
 6, 5, 4, 3, 6, 5, 4, 3, 5, 4, 3, 2, 5, 4, 3, 2,
 4, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 1, 3, 2, 1, 1,
];

var bkg = [];
for (i=0; i<8; i++) {
	bkg = bkg.concat(bkgpattern);
}

var map = [
 1, 2, 3, 4, 5, 6, 7, 8,65,66,67,68,69,70,71,72,
 9,10,11,12,13,14,15,16,73,74,75,76,77,78,79,80,
17,18,19,20,21,22,23,24,81,82,83,84,85,86,87,88,
25,26,27,28,29,30,31,32,89,90,91,92,93,94,95,96,
33,34,35,36,37,38,39,40,97,98,99,100,101,102,103,104,
41,42,43,44,45,46,47,48,105,106,107,108,109,110,111,112,
49,50,51,52,53,54,55,56,113,114,115,116,117,118,119,120,
57,58,59,60,61,62,63,64,121,122,123,124,125,126,127,128,
];

for (i=128; i<384; i++) {
	map[i]=map[i-128]+128;
}

var empty = [];
for (i=0; i<256; i++) {
	empty[i] = 0;
}

var play_indicator = 0;
var offset_rows = 0;

function msg_int(r) {
	var v = r >= 0 ? map[r]-1 : r;
	if (play_indicator != v) {
    	play_indicator = v;
		bang();
	}
}

function stop() {
	play_indicator = -1;
	bang();
}

function clear() {
	outlet(0, empty);
}

function offset(v) {
	var r = v/16;
	if (offset_rows != r) {
		offset_rows = r;
		bang();
	}
}

function bang() {
	grid = bkg.slice(0);
	if (play_indicator >= 0) {
        grid[play_indicator] = 15;
    }
	outlet(0, grid);
}