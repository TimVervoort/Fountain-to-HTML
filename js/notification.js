class NotificationHandler {

    constructor() {
        this.tipTimeout = 3000;
    }

    addTip(txt) {
        var uId = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
        document.getElementById('notifications').innerHTML += '<li id="'+uId+'" class="tip">'+txt+'</li>';
        setTimeout(function() {
            document.getElementById('notifications').removeChild(document.getElementById(uId));
        }, this.tipTimeout);
    }

}