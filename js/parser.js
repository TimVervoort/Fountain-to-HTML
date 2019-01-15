class FountainParser {

    constructor(domId, display) {
        this.view = display;
        this.contents = document.getElementById(domId);
    }

    parseTitlePage(line) {

        var obj = [];
        var lastKey = '';
        var parts = line.split(/\r?\n/);

        for (var i = 0; i < parts.length; i++) {

            if (parts[i].length <= 1) { continue; } // No key value paris here

            if (parts[i].indexOf(':') !== -1) {

                // Get key
                var key = parts[i].split(':')[0].trim().toLowerCase().replace(' ', '_');
                lastKey = key; // Store new key
                if (!obj[lastKey]) { obj[lastKey] = ''; } // Create key
                
                // Value on next line
                if (parts[i].split(':').length > 1) {
                    var val = parts[i].split(':')[1].trim();
                    if (val.length <= 1) { continue; }
                    if (obj[lastKey].length > 0) { obj[lastKey] += '<br />'; }
                    obj[lastKey] += val;
                }   

            }

            // Only the value on this line
            else {
                if (parts[i].trim().length <= 1) { continue; }
                if (obj[lastKey].length > 0) { obj[lastKey] += '<br />'; }
                obj[lastKey] += parts[i].trim();
            }

        }

        return obj;

    }

    parseFountain() {

        var lines = this.contents.value.split(/\r?\n\r?\n/); // Get content
        if (lines.length <= 1) { return; }

        for (var i = 0; i < lines.length; i++) {
            
            var line = this.clearStr(lines[i]); // Clear string from unnecessary spaces and tabs
            if (line.length == 0) { continue; } // Skip empty lines
        
            if (this.isHeading(line)) {
                if (line[0] == '.') { line = line.slice(1); } // Remove leading dot
                this.view.addBlock('heading', line);
            }
        
            else if (this.isTitlePage(line)) {
                var o = this.parseTitlePage(line);
                this.view.createTitlePage(o['title'], o['credit'], o['author'], o['draft_date'], o['contact']);
            }

            else if (this.isCentered(line)) {
                this.view.addBlock('center', this.emphasis(this.centerText(line)));
            }

            else if (this.isDualDialog(line)) {
                var parts = line.split('\n');
                if (parts[0][0] == '@') { parts[0] = parts[0].slice(1); } // Remove leading @
                this.view.addBlock('character-cue', parts[0].replace('^', '').trim());
                this.view.addBlock('dialog', this.emphasis(parts.slice(1).join('<br />').trim()));
            }
        
            else if (this.isDialog(line)) {
                var parts = line.split('\n');
                if (parts[0][0] == '@') { parts[0] = parts[0].slice(1); } // Remove leading @
                this.view.addBlock('character-cue', parts[0]);
                this.view.addBlock('dialog', this.emphasis(parts.slice(1).join('<br />').trim()));
            }

            else if (this.isTransition(line)) {
                if (line[0] == '>') { line = line.slice(1).trim(); }
                this.view.addBlock('transition', line);
            }
        
            else {
                if (line[0] == '!') { line = line.slice(1); } // Remove leading !
                this.view.addBlock('action', this.emphasis(line));
            }
        
        }

        updateStats();

    }

    isCharacter(str) {
        if (str[0] == '!')  { return false; }
        return str == str.toUpperCase();
    }

    isHeading(str) {
        if (str[0] == '!')  { return false; }
        if (str.length >= 2 && str[0] == '.' && str[1] != '.') { return true; } // Starting with a period followd by another character
        return  str.slice(0, 4).toUpperCase() == 'INT.' ||
                str.slice(0, 4).toUpperCase() == 'INT ' ||
                str.slice(0, 7).toUpperCase() == 'INT/EXT' ||
                str.slice(0, 8).toUpperCase() == 'INT./EXT' ||
                str.slice(0, 4).toUpperCase() == 'EXT.' ||
                str.slice(0, 4).toUpperCase() == 'EXT ' ||
                str.slice(0, 4).toUpperCase() == 'EST.' ||
                str.slice(0, 4).toUpperCase() == 'EST ' ||
                str.slice(0, 3).toUpperCase() == 'I/E'; // Case insensitive chack
    }

    isDialog(str) {
        var parts = str.toString().split(/\r?\n/);
        if (
            (parts.length >= 2)
            &&
            (parts[0][0] == '@' || parts[0].toUpperCase() == parts[0]) // Character name forced with @ or in upper case
            &&
            (/[a-zA-Z]/.test(parts[0])) // Character name must include at least one letter
            &&
            (parts[1].length > 0)
         ) { return true; }
        return false;
    }

    isDualDialog(str) {
        var parts = str.toString().split(/\r?\n/);
        return this.isDialog(str) && parts.length >= 2 && parts[0].slice(-1) == '^'; // Last character on the Character element is a carret
    }

    isTransition(str) {
        return (str[0] == '>' && str.slice(-1) != '<') || (str.toUpperCase() == str && str.slice(-3) == 'TO:'); // In uppercase and ending with 'TO:' or beginning with '>'
    }

    isLyric(str) {
        return str[0] == '~';
    }

    isCentered(str) {
        str = str.trim();
        return str[0] == '>' && str.slice(-1) == '<';
    }

    centerText(str) {
        str = str.replace(/>[a-zA-Z0-9\s,.\-_='"!@#$%^&\*()/\\]*</g, function(s) { // Center
            return '<span>' + s.slice(1, -1).trim() + '</span>';
        });
        return str;
    }

    emphasis(str) {
        str = str.replace(/\[\[[a-zA-Z0-9\s,.\-_=<>'"!@#$%^&\*()/\\]*\]\]/g, function(s) { // Notes
            console.log('Found user note: ' + s.slice(2, -2));
            return '';
        });     
        str = str.replace(/\*\*\*[a-zA-Z0-9\s,.\-_=<>'"!@#$%^&()/\\]*\*\*\*/g, function(s) { // Bold & italics
            return '<span class="bold italic">' + s.slice(3, -3).trim() + '</span>';
        });
        str = str.replace(/\*\*[a-zA-Z0-9\s,.\-_=<>'"!@#$%^&()/\\]*\*\*/g, function(s) { // Bold
            return '<span class="bold">' + s.slice(2, -2).trim() + '</span>';
        });
        str = str.replace(/\*[a-zA-Z0-9\s,.\-_=<>'"!@#$%^&()/\\]*\*/g, function(s) { // Italic
            return '<span class="italic">' + s.slice(1, -1).trim() + '</span>';
        });
        str = str.replace(/_[a-zA-Z0-9\s,.\-=<>'"!@#$%^&\*()/\\]*_/g, function(s) { // Underline
            return '<span class="underline">' + s.slice(1, -1).trim() + '</span>';
        });
        return str;
    }

    clearStr(str) {
        str = str.toString().replace('/\r/g', ''); // Remove newlines
        str = str.toString().replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // Convert tabs to 4 spaces
        str = str.toString().replace(/ +(?= )/g,''); // Remove double spaces
        str = str.toString().trim(); // Remove leading and trailing spaces
        return str;
    }

    isTitlePage(str) {
        if (str.slice(0, 6) == 'Title:') { return true; }
        return false;
    }

};