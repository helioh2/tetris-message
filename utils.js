function createArray(rowCount, columnCount) {
    var array = new Array();

    // criar array bidimensional
    for (var i = 0; i < rowCount; i++) {
        array.push(new Array()); //em cada linha, preenche com um array
        for (var j = 0; j < columnCount; j++) {
            array[i].push(0); //preenche linha com zeros
        }
    }
    
    return array;
}

function randint(min, max) {
    return min + Math.floor((max - min) * Math.random());
}

function doisDigitos(n){
    if (n < 10) {
        return "0" + n;
    }
    return "" + n;
}

function Timer() {
    this.paused = false;
    this.initial = new Date().getTime();
    this.totalElapsedTime = 0;
    this.clear();
}

/**
 * Timer. Adaptado do campo minado implementado pelo professor Marco Aurélio Lopes Barbosa
 */
Timer.prototype = { 
    clear: function () {
        this.initial = new Date().getTime();
        this.totalElapsedTime = 0;
    },
    
    resume: function () { //funciona como início também
        this.paused = false;
        this.initial = new Date().getTime();//guarda valor int -> numero de segundos
    },

    stop: function () {
        this.paused = true;
        var end = new Date().getTime();
        var elapsedTime = end-this.initial;
        this.totalElapsedTime += elapsedTime;
    },
    
    getTime: function () {
        if (this.paused){
            return this.totalElapsedTime;
        }else{
            var end = new Date().getTime();
            var elapsedTime = end-this.initial;
            return this.totalElapsedTime + elapsedTime;
        }
    },

    getTimeHMS: function () {
        var t = new Date(this.getTime());
        var h = doisDigitos(t.getUTCHours());
        var m = doisDigitos(t.getUTCMinutes());
        var s = doisDigitos(t.getUTCSeconds());
        return h + ":" + m + ":" + s;
    }
}


function Color(r,g,b){
    this.r=r;
    this.g=g;
    this.b=b;
}
function Colors(){
    
    this.colors = [];

    /*x*/this.error = new Color(0,0,0);         //retornado quando houver erro
    /*0*/this.colors.push(new Color(220,220,230));   //cinza azulado para blocos vazios
    /*0*/this.colors.push(new Color(255,255,255));   //branco
    this.colors.push(new Color(207,181,59)); //cor de limpa linha
    
    //CORES POSSIVEIS PARA AS PECINHAS
    /*1*/this.colors.push(new Color(180,0,0)); 
    /*2*/this.colors.push(new Color(0,180,0));
    /*3*/this.colors.push(new Color(0,0,180)); 
    /*4*/this.colors.push(new Color(180,180,0));
    /*5*/this.colors.push(new Color(180,0,180));
    /*6*/this.colors.push(new Color(139,69,19));
    /*7*/this.colors.push(new Color(255,99,71));
    /*8*/this.colors.push(new Color(0, 139, 139));
    /*1*/this.colors.push(new Color(120,0,0));
    /*2*/this.colors.push(new Color(0,120,0));
    /*3*/this.colors.push(new Color(0,0,120)); 
    /*4*/this.colors.push(new Color(120,120,0));
    /*5*/this.colors.push(new Color(120,0,120));
    /*6*/this.colors.push(new Color(109,35,45));
    /*7*/this.colors.push(new Color(140,55,140));
    /*8*/this.colors.push(new Color(0, 99, 99));
    /*1*/this.colors.push(new Color(220,0,0));
    /*2*/this.colors.push(new Color(0,220,0));
    /*3*/this.colors.push(new Color(0,0,220)); 
    /*4*/this.colors.push(new Color(220,220,0));
    /*5*/this.colors.push(new Color(220,0,220));
    /*6*/this.colors.push(new Color(209,69,69));
    /*7*/this.colors.push(new Color(55,99,71));
    /*8*/this.colors.push(new Color(0, 100, 139));
    /*1*/this.colors.push(new Color(50,0,0));
    /*2*/this.colors.push(new Color(0,50,0));
     /*2*/this.colors.push(new Color(255,0,0));
     /*2*/this.colors.push(new Color(255,0,0));
     /*2*/this.colors.push(new Color(255,0,0));
}
Colors.prototype = {
    random: function(){
        return Math.floor(Math.random()*this.colors.length)+1;
    },
    getColor: function(n){
        if (n<this.colors.length && n!=null){
            return this.colors[n];
        } else {
            return this.error;
        }
    }
}


var colors = new Colors();