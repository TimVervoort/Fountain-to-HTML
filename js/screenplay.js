class Screenplay {

    constructor(domId, parser, display) {

        var t = this;

        t.domId = domId;
        t.parser = parser;
        t.view = display;

        // Store character names
        t.characters = [];

        t.typeTimeout = 1000; // Wait ms before assuming user stopped typing

        // React to user typing Fountain
        t.delayTime;
        document.getElementById(t.domId).addEventListener('keyup', () => startParsing(), false);    

        async function startParsing() {
            clearInterval(t.delayTime); // Only parses one time, if the user does not type after the last parse, no new call will be launched
            t.delayTime = setTimeout(function() {
                t.view.clearScript();
                t.parser.parseFountain(); // Wait before parsing, start parsing when the user isn't typing              
            }, t.typeTimeout);
        }

    }
}