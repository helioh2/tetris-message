//area, score e nextpeace são canvas
function Screen(area, score, nextpiece, timer, level, game){
    this.game = game;
    this.area = new ScreenArea(area,game);
    this.score = new ScreenScore(score,game);
    this.nextpiece = new ScreenNextPiece(nextpiece,game);
    
    this.startImage = "./images/start.png";
    this.pauseImage = "./images/pause.png";
    this.gameOverImage = "./images/gameover.png";
    this.needClearArea = false;
    
    //Timer
    document.getElementById("timer").innerHTML = "0:0:0";
    document.getElementById("level").innerHTML = "Level 0";
}
Screen.prototype = {
    update: function(){
        if(this.game.over) this.gameOver();
        else{
            
            //retirar X de cima da tecla de rotacionar quando tiver acabado mensagem
            if (this.game.messageOver){
                 document.getElementById("instrucoes").innerHTML = 
                     "INSTRU&Ccedil;&Otilde;ES<br /><img src= \"images/instrucoes.png\">";
            }
            
            this.printArea();
            this.printPiece();
            this.printNextPiece();
            this.printScore();
            this.printTimer();
            this.printLevel();
        }
    },
    printClean: function(){
        this.printAreaClean();
        this.printNextPieceClean();
        this.printScoreClean();
        this.printTimer();
        this.printLevel();
    },
    pause: function(){
        this.pauseArea();
        this.pauseNextPiece();
        this.printTimer();
        this.printLevel();
        this.printPauseImage();
    },
    gameOver: function(){
        this.printScore();
        //this.printArea();
        this.pauseArea();
        this.pauseNextPiece();
        this.printTimer();
        this.printLevel();
        this.printGameOverImage();
    },
    printArea: function(){
        
        if(this.needClearArea) this.clearArea();
        
        var numColor = 0;
        var color = null;
        for(var i=0; i<this.game.x; i++){
            for(var j=0; j<this.game.y; j++){
                numColor = this.game.area.getBlock(i, j);
                color = colors.getColor(numColor);
                this.area.setColor(color);
                this.area.printBlock(i,j);
            }
        }
    },
    
    printAreaClean: function(){
        
        if(this.needClearArea) this.clearArea();
        
        this.area.setColor(colors.getColor(0));
        for(var i=0; i<this.game.x; i++){
            for(var j=0; j<this.game.y; j++){
                this.area.printBlock(i,j);
            }
        }  
    },
    pauseArea: function(){
        this.area.setAlpha();
        for(var i=0; i<this.game.x; i++){
            for(var j=0; j<this.game.y; j++){
                this.area.printBlock(i,j);
            }
        }
    },
    clearArea: function(){
        var width = this.area.screen.canvas.width;
        var height = this.area.screen.canvas.height;
        this.area.screen.clearRect(0,0,width, height);
    },
    printPiece: function(){
        //especificando a cor no canvas
        var numColor = this.game.piece.color;
        var color = colors.getColor(numColor);
        this.area.setColor(color);
        
        //para simplificar o código local
        var x = this.game.piece.x;
        var y = this.game.piece.y;
        var piece = this.game.piece.piece;
        
        //iterações
        for (var i = 0; i < piece.length; i++){
            for (var j= 0; j< piece[0].length; j++) {
                if (piece[j][i]){
                    this.area.printBlock(x+i, y+j);
                }
                
            }
        }
    },
    printNextPiece: function(){
        
        //Limpar
        
        var width = this.nextpiece.screen.canvas.width;
        var height = this.nextpiece.screen.canvas.height;
        this.nextpiece.screen.clearRect(0,0,width, height);
        //
        //imprime a peça corrente na tela de espera
        //para simplificar
        var numColor = this.game.nextpiece.color;
        var color = colors.getColor(numColor);
        var blank = colors.getColor(0);
        var piece = this.game.nextpiece.piece;
        this.nextpiece.setSize();
        
        //iterações
        for (var i = 0; i < piece[0].length; i++){
            for (var j= 0; j < piece.length; j++) {
                if (piece[j][i]) 
                    this.nextpiece.setColor(color);
                else
                    this.nextpiece.setColor(blank);
                this.nextpiece.printBlock(i, j);
            }
        }
    },
    printNextPieceClean: function(){
        this.nextpiece.setColor(colors.getColor(0));
        //iterações
        for (var i = 0; i < 4; i++){
            for (var j= 0; j< 4; j++) {
                this.nextpiece.printBlock(i, j);
            }
        }
    },
    pauseNextPiece: function(){
        this.nextpiece.setAlpha();
        //iterações
        for (var i = 0; i < 4; i++){
            for (var j= 0; j< 4; j++) {
                this.nextpiece.printBlock(i, j);
            }
        }
    },
    printScore: function(){
        var value = this.game.score.score; //pontos guardados na classe score
        var size = this.score.size; //quantidade de digitos a serem exibidos
        var symbols = this.score.symbols;
        
        if(value!=this.score.oldValue){
            var newColor = colors.getColor(colors.random());
            while(newColor==this.score.color) newColor = colors.getColor(colors.random());
            this.score.color = newColor;
            this.score.oldValue = value;
        } 
        
        var symbol = symbols[0];
        for(var p=0; p<size; p++){//para cada simbolo decimal da direita para a esquerda
            symbol = symbols[value%10];
            value = Math.floor(value/10);
            this.score.printSymbol(symbol, p);
        }
        
    },
    printScoreClean: function(){
        var size = this.score.size; //quantidade de digitos a serem exibidos
        var symbol = this.score.symbols[10];
        for(var p=0; p<size; p++){//para cada simbolo decimal da direita para a esquerda
            this.score.printSymbol(symbol, p);
        }
    },
    printTimer: function(){
        var newText = this.game.timer.getTimeHMS();
        document.getElementById("timer").innerHTML = newText;
    },
    printLevel: function(){
        document.getElementById("level").innerHTML = "Level: "+this.game.score.level;
    },
    
    drawImageInCenterArea: function(imgSrc) {
        var img = new Image();
        img.src = imgSrc;
        img.screen = this.area.screen;
        img.onload = function(){
            var x = Math.floor((this.screen.canvas.width - img.width)/2);
            var y = Math.floor((this.screen.canvas.height - img.height)/2);
            this.screen.drawImage(img,x,y);
        }
        this.needClearArea = true;
    },
    printStartImage: function(){
        this.drawImageInCenterArea(this.startImage);
    },
    printPauseImage: function(){
        this.drawImageInCenterArea(this.pauseImage);
    },
    printGameOverImage: function(){
        this.drawImageInCenterArea(this.gameOverImage);
    },
    
    printLineClear: function() {
        this.area.setColor(colors.getColor(1));
        for(var i=0; i<this.game.x; i++){
            for(var j=0; j<this.game.y; j++){
                if (this.game.area.getBlock(i, j))
                    this.area.printBlock(i,j);
                }
        }  
    }
}


function ScreenArea(canvas, game){
    //utilizaremos this.screen.fillRect para imprimir um retangulo na tela
    this.screen = canvas.getContext('2d');
    
    //quantidade de pixels na tela
    var width = canvas.width;
    var height = canvas.height;
    //quantidade de blocos na tela
    var x = game.x;
    var y = game.y;
    
    //calculando o tamanho do lado de um bloco 
    this.blocksize = Math.floor(width/x);
    if (y*this.blocksize>height) this.blocksize = Math.floor(height/y);
    
    //calculando posição "zero" relativa no canvas
    width = this.blocksize*x;
    this.xzero = Math.floor((canvas.width-width)/2);
    height= this.blocksize*y;
    this.yzero = Math.floor((canvas.height-height)/2);
}
ScreenArea.prototype = {
    setColor: function(color){
        this.screen.fillStyle = "rgb("+color.r+","+color.g+","+color.b+")";
    },
    setAlpha: function(){
        this.screen.fillStyle = "rgba(255,255,255,0.5)";
    },
    printBlock: function(i,j){
        var size = this.blocksize-1; //para dar o efeito de grade
        this.screen.fillRect(
            this.xzero + i*this.blocksize,
            this.yzero + j*this.blocksize,
            size,
            size);
    }
}

function ScreenScore(canvas, game){
    this.game = game;
    //utilizaremos this.screen.fillRect para imprimir um retangulo na tela
    this.screen = canvas.getContext('2d');
    this.size = 8;      //quantidade de digitos exibidos
    
    this.color = colors.getColor(colors.random());
    this.oldValue = 0;
    
    //simbolos decimais
    this.symbols = [
    [
    [1,1,1],//0
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,1,1]
    ],
    [
    [0,1,0],//1
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0]
    ],
    [
    [1,1,1],//2
    [0,0,1],
    [1,1,1],
    [1,0,0],
    [1,1,1]
    ],
    [
    [1,1,1],//3
    [0,0,1],
    [0,1,1],
    [0,0,1],
    [1,1,1]
    ],
    [
    [1,0,1],//4
    [1,0,1],
    [1,1,1],
    [0,0,1],
    [0,0,1]
    ],
    [
    [1,1,1],//5
    [1,0,0],
    [1,1,1],
    [0,0,1],
    [1,1,1]
    ],
    [
    [1,1,1],//6
    [1,0,0],
    [1,1,1],
    [1,0,1],
    [1,1,1]
    ],
    [
    [1,1,1],//7
    [0,0,1],
    [0,1,0],
    [0,1,0],
    [0,1,0]
    ],
    [
    [1,1,1],//8
    [1,0,1],
    [1,1,1],
    [1,0,1],
    [1,1,1]
    ],
    [
    [1,1,1],//9
    [1,0,1],
    [1,1,1],
    [0,0,1],
    [0,0,1]
    ],
    [
    [0,0,0],//clean
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0]
    ]
    ];
    
    //quantidade de blocos na tela
    this.x_symbol = this.symbols[0][0].length+1;  //quantidade de blocos na horizontal de 1 simbolo decimal
    var x = this.x_symbol * this.size;          //quantidade de blocos na horizontal da tela
    var y = this.symbols[0].length;             //quantidade de blocos na vertical da tela
    
    //calculando o tamanho do lado de um bloco
    var height = canvas.height;
    var width = canvas.width;
    this.blocksize = Math.floor(width/x);
    if(this.blocksize*y > height) this.blocksize = Math.floor(height/y);
    
    //calculando posição "zero" relativa no canvas
    width = this.blocksize*x;
    this.xzero = Math.floor((canvas.width-width)/2);
    height= this.blocksize*y;
    this.yzero = Math.floor((canvas.height-height)/2);
    
    //calculando largura do simbolo
    this.symbolSize = this.x_symbol*this.blocksize;
}
ScreenScore.prototype = {
    setColor: function(color){
        this.screen.fillStyle = "rgb("+color.r+","+color.g+","+color.b+")";
    },
    setAlpha: function(){
        this.screen.fillStyle = "rgba(255,255,255,0.5)";
    },
    printSymbol: function(symbol, p){
        var color = this.color;
        var blank = colors.getColor(0);
        var xzero = this.xzero+(this.size-p-1)*this.symbolSize;
        var yzero = this.yzero;
        
        for(var i=0; i<this.x_symbol; i++){
            for(var j=0; j<symbol.length; j++){
                if(symbol[j][i]) this.setColor(color);
                else this.setColor(blank);
                this.printBlock(xzero, yzero, i, j);
            }
        }
    },
    printBlock: function(xzero, yzero, i, j){
        var size = this.blocksize-1; //para dar o efeito de grade
        this.screen.fillRect(
            xzero + i*this.blocksize,
            yzero + j*this.blocksize,
            size,
            size);
    }
}

function ScreenNextPiece(canvas, game){
    //utilizaremos this.screen.fillRect para imprimir um retangulo na tela
    this.screen = canvas.getContext('2d');
    this.canvas = canvas;
    this.game = game;
    this.setSize();
    
}
ScreenNextPiece.prototype = {
    setSize: function(){
        //quantidade de pixels na tela
        var width = this.canvas.width;
        var height = this.canvas.height;
        //quantidade de blocos na tela
        var x = null;
        var y = null;
        if (this.game.nextpiece != null){
            x = this.game.nextpiece.piece[0].length;
            y = this.game.nextpiece.piece.length;
        } else {
            x = 4;
            y = 4;
        }
        
    
        //calculando o tamanho do lado de um bloco 
        this.blocksize = Math.floor(width/x);
        if (y*this.blocksize>height) this.blocksize = Math.floor(height/y);
    
        //calculando posição "zero" relativa no canvas
        width = this.blocksize*x;
        this.xzero = Math.floor((this.canvas.width-width)/2);
        height= this.blocksize*y;
        this.yzero = Math.floor((this.canvas.height-height)/2);
    },
    
    setColor: function(color){
        this.screen.fillStyle = "rgb("+color.r+","+color.g+","+color.b+")";
    },
    setAlpha: function(){
        this.screen.fillStyle = "rgba(255,255,255,0.5)";
    },
    printBlock: function(i,j){
        var size = this.blocksize-1; //para dar o efeito de grade
        this.screen.fillRect(
            this.xzero + i*this.blocksize,
            this.yzero + j*this.blocksize,
            size,
            size);
    }
}