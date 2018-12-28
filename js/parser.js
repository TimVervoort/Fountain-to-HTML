var characters = []; // Store character names

// React to user typing Fountain
var delayTime;
document.getElementById('fountain').addEventListener('keyup', function(e) {
    clearInterval(delayTime); // Only parses one time, if the user does not type after the last parse, no new call will be launched
    delayTime = setTimeout(function() {
        parseFountain(); // Wait before parsing, start parsing when the user isn't typing
    }, 1000);
});

// Parse Fountain input
function parseFountain() {

    var lines = document.getElementById('fountain').value.split(/\r?\n\r?\n/); // Get content

    if (lines.length <= 1) {
        console.log('Tip: place an empty line between every block.');
    }

    for (var i = 0; i < lines.length; i++) {
    
        var line = clearStr(lines[i]); // Clear string from unnecessary spaces and tabs
        if (line.length == 0) { continue; } // Skip empty lines
        line = emphasis(line); // Apply formatting
    
        if (isHeading(line)) {
            if (line[0] == '.') { line = line.slice(1); } // Remove leading .
            addBlock('heading', line);
            /// TODO FORCED SCENE NUMBER
        }
    
        else if (isTitlePage(line)) {

            var obj = [];
            var lastKey = '';
            var parts = line.split('\n');
            for (var i = 0; i < parts.length; i++) {

                if (parts[i].length <= 1) { continue; }

                if (parts[i].indexOf(':') !== -1) {

                    var key = parts[i].split(':')[0].trim().toLowerCase().replace(' ', '_');
                    lastKey = key; // Store new key
                    if (!obj[lastKey]) {
                        obj[lastKey] = ''; // Create key
                    }
                    
                    // Value on next line
                    if (parts[i].split(':').length > 1) {
                        var val = parts[i].split(':')[1].trim();
                        if (val.length <= 1) { continue; }
                        if (obj[lastKey].length > 0) {
                            obj[lastKey] += '<br />';
                        }
                        obj[lastKey] += val;
                    }   

                }

                else {
                    if (parts[i].trim().length <= 1) { continue; }
                    if (obj[lastKey].length > 0) {
                        obj[lastKey] += '<br />';
                    }
                    obj[lastKey] += parts[i].trim();
                }

            }

            createTitlePage(obj['title'], obj['credit'], obj['author'], obj['draft_date'], obj['contact']);
        }

        else if (isDualDialog(line)) {
            console.log('Note: Dual dialog not yet implemented.');
            var parts = line.split('\n');
            if (parts[0][0] == '@') { parts[0] = parts[0].slice(1); } // Remove leading @
            addBlock('character-cue', parts[0].replace('^', '').trim());
            addBlock('dialog', parts.slice(1).join('<br />').trim());
        }
    
        else if (isDialog(line)) {
            var parts = line.split('\n');
            if (parts[0][0] == '@') { parts[0] = parts[0].slice(1); } // Remove leading @
            addBlock('character-cue', parts[0]);
            addBlock('dialog', parts.slice(1).join('<br />').trim());
        }

        else if (isTransition(line)) {
            if (line[0] == '>') { line = line.slice(1).trim(); }
            addBlock('transition', line);
        }

        else if (isNote(line)) {
            // Don't display
        }
    
        else {
            if (line[0] == '!') { line = line.slice(1); } // Remove leading !
            /// Force new lines (and in dialogs)
            addBlock('action', line);
        }
    
    }

    console.log('Parsing done.');

}

function isCharacter(str) {
    if (str[0] == '!')  { return false; }
    return str === str.toUpperCase();
}

function isHeading(str) {
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

function isDialog(str) {
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

function isDualDialog(str) {
    var parts = str.toString().split(/\r?\n/);
    return isDialog(str) && parts.length >= 2 && parts[0].slice(-1) == '^'; // Last character on the Character element is a carret
}

function isTransition(str) {
    return str[0] == '>' || (str.toUpperCase() == str && str.slice(-3) == 'TO:'); // In uppercase and ending with 'TO:' or beginning with '>'
}

function isLyric(str) {
    return str[0] == '~';
}

function emphasis(str) {
    str = str.replace(/\[\[[a-zA-Z0-9\s\r\n,.\-_=<>'"!@#$%^&\*()/\\]*\]\]/g, function(s) { // Notes
        console.log('Found user note: ' + s.slice(2, -2));
        return '';
    });
    str = str.replace(/>[a-zA-Z0-9\s\r\n,.\-_='"!@#$%^&\*()/\\]*</g, function(s) { // Center
        return '<span class="center">' + s.slice(1, -1).trim() + '</span>';
    });
    str = str.replace(/\*\*\*[a-zA-Z0-9\s\r\n,.\-_=<>'"!@#$%^&()/\\]*\*\*\*/g, function(s) { // Bold & italics
        return '<span class="bold italic">' + s.slice(3, -3).trim() + '</span>';
    });
    str = str.replace(/\*\*[a-zA-Z0-9\s\r\n,.\-_=<>'"!@#$%^&()/\\]*\*\*/g, function(s) { // Bold
        return '<span class="bold">' + s.slice(2, -2).trim() + '</span>';
    });
    str = str.replace(/\*[a-zA-Z0-9\s\r\n,.\-_=<>'"!@#$%^&()/\\]*\*/g, function(s) { // Italic
        return '<span class="italic">' + s.slice(1, -1).trim() + '</span>';
    });
    str = str.replace(/_[a-zA-Z0-9\s\r\n,.\-=<>'"!@#$%^&\*()/\\]*_/g, function(s) { // Underline
        return '<span class="underline">' + s.slice(1, -1).trim() + '</span>';
    });
    return str;
}

function clearStr(str) {
    /// TODO: retain double spaces
    str = str.toString().replace('/\r/g', ''); // Remove newlines
    str = str.toString().replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // Convert tabs to 4 spaces
    str = str.toString().replace(/ +(?= )/g,''); // Remove double spaces
    str = str.toString().trim(); // Remove leading and trailing spaces
    return str;
}

function isTitlePage(str) {
    if (str.slice(0, 6) == 'Title:') { return true; }
    return false;
}

function isPageBreak(str) {
    return str == '===';
}

function isNote(str) {
    return str.slice(0, 3) == '[[' && str.slice(-2) == ']]'; // Enclosed in double brackets
}