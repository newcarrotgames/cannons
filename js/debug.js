var debug = {
    div : null,
	enabled : false,
    init : function() {
        this.div = document.getElementById('debug');
    },
	log : function(msg) {
		if (this.enabled)
			console.log(msg);
	},
	enable : function() { this.enabled = true; },
	disable : function() { this.enabled = false; },
	toggle : function() { this.enabled = !this.enabled; },
    msg : function(val) { this.div.innerHTML = val; }
};