class Screenplay {

    constructor(domId, parser) {

        var t = this;

        t.fountain = domId;
        t.fountainParser = parser;

        // Store character names
        t.characters = [];

        t.typeTimeout = 1000; // Wait ms before assuming user stopped typing

        // React to user typing Fountain
        t.delayTime;
        document.getElementById(t.fountain).addEventListener('keyup', function(e) {
            clearInterval(t.delayTime); // Only parses one time, if the user does not type after the last parse, no new call will be launched
            t.delayTime = setTimeout(function() {
                clearScript();
                t.fountainParser.parseFountain(); // Wait before parsing, start parsing when the user isn't typing
            }, t.typeTimeout);
        });
    }
}