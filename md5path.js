function convert(filename) {
        var re = /^(.+?):/;
        var volume = re.exec(filename)[1];
        var path = filename.replace(re, "/Volumes/" + volume);
        outlet(0, "md5 -q '" + path + "' 2>&1");    
}