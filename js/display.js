class DisplayScript {

    constructor() {
        this.percent = document.getElementById('percent');
        this.progressBar = document.getElementById('progress');
    }
    
    /**
     * Returns true if a page is full or false otherwise.
     * @param {integer} pageNr : The page number to be checked.
     */
    isPageFull(pageNr) {
        if (!pageNr) { return false; } // No page number provided
        var page = document.getElementById(pageNr);
        var height = page.scrollHeight;
        var maxHeight = page.clientHeight;
        if (height > maxHeight) { return true; }
        return false;
    }

    /**
     * Remove all blocks from the script and place the placeholders.
     */
    clearScript() {
        document.getElementById('scenario').innerHTML = '';
        this.createTitlePage('Title page', 'Written by', 'You', '', ''); // There must be an empty page
    }

    /**
     * Append a new block to the scenario.
     * @param {string} type : The type of the block.
     * @param {string} content : The plain text content of the block.
     */
    addBlock(type, content = '', focused = false) {           

        if (type == 'fade-in') { content = 'FADE IN'; }
        if (type == 'fade-out') { content = 'FADE OUT'; }
        if (type == 'end') { content = 'THE END'; }
        if (type == 'begin-montage') { content = 'BEGIN MONTAGE.'; }
        if (type == 'end-montage') { content = 'END MONTAGE.'; }   

        if (type == 'heading') {
            var sceneCount = document.getElementsByClassName('heading').length;
            content = 'SC' + parseInt(parseInt(sceneCount) + 1) + '. - ' + content;
        }

        // Add block to latest page
        var pages = document.getElementById('scenario').children;
        if (pages.length < 1) {
            this.createTitlePage('Untitled Screenplay', 'Written by', 'You', '', ''); // There must be an empty page
        }

        var lastPage = pages[pages.length - 1];         

        if (focused) {
            lastPage.innerHTML += '<span class="'+type+'">'+content+'</span>';
        }
        else {
            lastPage.innerHTML += '<span class="'+type+'">'+content+'</span>';
        }           

        // Check if newly added block makes the page to long, if it does, split the page
        if (this.isPageFull(lastPage.getAttribute('id'))) {          

            // Remove from the old page           
            lastPage.removeChild(lastPage.lastChild);
            this.newPage();            

            // If the is a dialog text, than take the corresponding character cue with it
            if (type == 'dialogue' || type == 'dialog') {
                lastPage = document.getElementById('scenario').children[document.getElementById('scenario').children.length - 2];
                var cue = lastPage.lastChild.textContent;
                lastPage.removeChild(lastPage.lastChild);
                lastPage = document.getElementById('scenario').lastChild; // The newly generated page 
                lastPage.innerHTML += '<span class="character-cue">'+cue+'</span>';
            }         

            // Add to the new page
            lastPage = document.getElementById('scenario').lastChild; // The newly generated page        
            if (focused) {
                lastPage.innerHTML += '<span class="'+type+'">'+content+'</span>';
            }
            else {
                lastPage.innerHTML += '<span class="'+type+'">'+content+'</span>';
            }

        }  

    }

    /**
     * Append a new blank paper to the script.
     */
    newPage() {
        var pageNr = document.getElementById('scenario').childElementCount + 1;
        var newPageElem = '<li class="paper a4-portrait" id="'+pageNr+'"><span class="page-nr">'+pageNr+'.</span><span class="lines-7"></span></li>';
        document.getElementById('scenario').innerHTML += newPageElem;
    }

    createTitlePage(title, credit, author, date, contact) {
        title = (title === undefined) ? 'The title of your script' : title;
        credit = (credit === undefined) ? 'Written by' : credit;
        author = (author === undefined) ? 'Written by' : author;
        date = (date === undefined) ? 'today' : date;
        contact = (contact === undefined) ? '' : contact;
        updateTitle(title);
        var titlePage = '<li class="fly-page paper a4-portrait" id="1">';
        titlePage += '<span class="lines-25"></span>';
        titlePage += '<span class="script-title" title="The title of this script.">'+title+'</span>';
        titlePage += '<span class="lines-2"></span>';
        titlePage += '<span class="credit">'+credit+'</span>';
        titlePage += '<span class="author" title="The full name of the writer of this script.">'+author+'</span>';
        if (contact) { contact = contact.replace('/\r?\n/', '<br />'); }
        titlePage += '<span class="contact" title="The contact details of the writer of this script.">'+contact+'</span>';
        titlePage += '</li>';
        document.getElementById('scenario').innerHTML = titlePage;
        this.newPage();
    }

}