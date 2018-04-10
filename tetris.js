/*
 * CLASSES PRINCIPAIS
 * CORE:
 *  Piece (representa uma peça do tetris)
 *  Area (representa a area do jogo)
 *  Game (classe principal, mantém instâncias e trata eventos do jogo)
 *  Score (pontuação e levels)
 *  
 * EVENTS:
 *  
 *  Keyboard (captura eventos do teclado e chama rotinas do jogo)
 * 
 */

/*
 *  Declaração de uma classe dummy  para que as classes Game, Area e Piece 
 *  possam enxergar screen (interface gráfica). Isto foi necessário pois Game 
 *  depende de Screen e Screen depende de Game.
 */
function screenMigue() {
    this.nada = 0;
}
screenMigue.prototype ={
    update: function(){},
    pause: function() {}
}
var screen = new screenMigue();

/**
 * Classe principal, é onde o jogo é executado e controlado
 */
function Game(x, y, words) {
    
    //INICIO CONSTRUTOR    
    
    //area e peça são únicos; peça apenas muda, não se cria e nem se destrói
    this.area =  null;
    this.piece = null;
    this.nextpiece = null; //proxima peça, é calculada logo que uma nova peça entra
    
    this.formatpiece = -1;
    this.wordspiece = this.createWordPieces(words);
    this.wordCount = 0;
    this.letterCount = -1;
    this.messageOver = false;
    this.almostOver = false;
    
    
    //ESTADO DO JOGO PAUSADO
    this.paused = false;
    this.over = false;//para o fim do jogo
    
    this.score = new Score(this); //classe de pontuação    
    this.timer = new Timer();
      
    // eixo x: largura da área / default: 12 (quantidade de colunas)
    if (typeof x == 'undefined') this.x = 12;
    else this.x = x;
    // eixo y: altura da área / default: 22 (quantidade de linhas)
    if (typeof y == 'undefined') this.y = 22;
    else this.y = y;
   
    //FIM CONSTRUTOR
}

Game.prototype = {
    
    //seta a interface gráfica verdadeira depois que ela for criada
    setScreen: function(newScreen){
        screen = newScreen;
    },
    
    createWordPieces: function(words) {
      
      var wordpieces = [];
      for (var i = 0; i<words.length; i++){
          var word = [];
          for (var j = 0; j<words[i].length; j++){
              word.push(words[i].charCodeAt(j) - 63);
          }
          wordpieces.push(word);
      }
      return wordpieces;
      
    },
    
    nextLetter: function(){
        
        if (this.almostOver) {
            this.completeWord();
            this.messageOver = true;
            this.almostOver = false;
            this.gameOver();

            return false;
        }
        if (this.messageOver){
//            this.score.level=99;
//            this.score.scorePoints(Math.floor(99999999/this.wordspiece.length)); 
            return false;
        }
        if (this.letterCount >= this.wordspiece[this.wordCount].length - 1){
            if (this.wordCount >= this.wordspiece.length-1){
                this.almostOver = true;
                return false;
            }
            this.wordCount++;
            this.letterCount = 0;
        } else {
            if (this.letterCount == 0 && this.wordCount != 0){
                this.completeWord();
            }
            this.letterCount++;
        }
        return true;
    },
    
    completeWord: function(){
        var self = this;
        //screen.printLineClear();
        self.score.level += 1;
        self.score.scorePoints(Math.floor(99999999/self.wordspiece.length));  
        setTimeout(function() {         
            self.area.clean();
        }, 250);
        
    },
    
    /**
     * Inicia jogo, criando a área e a proxima peça.
     */
    startGame: function(){
        this.over = false;
        
        if (this.messageOver){
            this.x = 12;
            this.y = 22;
        }
        
        this.area = new Area(this, this.x, this.y);
        this.piece = new Piece(this,this.area);
        this.nextpiece = new Piece(this,this.area);
        
        this.score = new Score(this);
        this.timer.clear();
        
        this.nextLetter();
        this.nextpiece.change();
        this.placeNewPiece(); //insere a peça na área, se possível
    },
    
    /**
     * Tenta inserir uma nova peça (proxima peça) na área.
     */
    placeNewPiece: function() {
        
        //this.piece.stop();
        //this.piece.y = 0;
        
        if (this.nextpiece.mayPlace()){
            this.piece = this.nextpiece; //faz peça atual apontar para "proxima peça""
            this.piece.place(); //coloca a peça na área
            
            //calcula proxima peça
            this.nextpiece = new Piece(this,this.area);
            this.nextLetter();
            if (this.over) {
                return false;
            }
            this.nextpiece.change();
            
            
            this.piece.speed /= this.score.level;
            //this.piece.boost = 1;
            
            this.piece.run(); //inicia a queda da peça
            return true;
            
        } else { //se peça não consegue entrar no topo da área, o jogo acaba
            this.gameOver();
            return false;
        }
        
    },
    
    gameOver: function() {
        this.over = true;
    },
    
    /**
     * Função chamada quando uma peça é encaixada na área
     */
    pieceFitted: function() {
        this.piece.stop();
        var self = this;
        var removedLines = self.area.removeFullLines(); //elimina linhas cheias
        if (removedLines > 0){
            setTimeout(function() {
                self.score.scoreLines(removedLines); //calcula pontos
                self.placeNewPiece();
                screen.update();
            }, 500);
        } else {
            self.score.scoreLines(removedLines); //calcula pontos
            self.placeNewPiece();
            screen.update();
        }
        
        
    },
    
    
    /**
     * Funções chamadas quando uma tecla é pressionada
     */
    
    //pausar o jogo
    pause: function() {
        
        if (this.paused) {
            this.piece.run();
            this.timer.resume();
            this.paused = false;
            screen.update();
        } else {
            this.piece.stop();
            this.timer.stop();
            this.paused = true;
            screen.pause();
        }
            
    },
    //rotacionar
    rotate: function() {
        if (this.messageOver) this.piece.tryToRotate();
    },
    
    //despencar
    tumble: function(){
        
        this.piece.tumble();
        
    },
    
    //mover para a esquerda
    left: function(){
        
        if (this.piece.mayMoveLeft()){
            this.piece.moveLeft();
        }
        
    },
    
    //mover para a direita
    right: function(){
        
        if (this.piece.mayMoveRight()){
            this.piece.moveRight();
        }
        
    },
    
    //mover para baixo (forçar queda)
    holdDown: function(){ 
        
        this.piece.setSpeedBoost(20);
        this.piece.boosted = true;
        //this.piece.forceDown();
        
    },
    
    //soltar botão que força a queda
    releaseDown: function() {
        
        this.piece.boosted = false;
        this.piece.setSpeedBoost(1);
        
    }
     
}

/**
 * classe para manipular pontuação.
 */
function Score(game) {
    
    this.game = game;
    var self = this;
    this.score = 0;
    this.combo = 0; //faz ganhar mais ponto quando elimina linhas sequencialmente
    this.level = 1;
    
    this.scorePoints = function(points){
        this.score += points;
    }
    
    /*
     * Função que incrementa pontuação de acordo com as linhas eliminadas
     */
    this.scoreLines =  function(linesCount) {
        
        if (linesCount) { //se for maior que zero
        
            this.score +=  100 * Math.pow(2, linesCount - 1); 
            /*
             *Ex: 1 linha: 100 pontos; 2 linhas: 200 pontos; 3 linhas: 400 pontos; 4 linhas: 800 pontos
             */
            if (this.combo){
                this.score += 100 * Math.pow(2, self.combo - 1); //bonus por fazer várias seguidas
            }
            
            this.updateCombo(true);
            this.updateLevel();
            return;
        
        }
        
        this.updateCombo(false);
        
    }
    
    /**
     * Atualiza variável que controla o valor do combo
     */
    this.updateCombo = function(comboed) {
        
        comboed? this.combo++ : this.combo = 0;
        
    }
    
    /**
     * Verifica se alcançou determinada pontuação para incrementar o nivel de dificuldade
     */
    this.updateLevel = function() {
        
        if (this.score >=  500 * (Math.pow(2, self.level- 1))){
            this.level++;
        }
      
    }
    
}





/**
 * Classe que representa a área do jogo. Basicamente, é um array de zeros e numeros maiores ou iguais,
 * onde os pontos marcados como diferentes de 0 são as peças já encaixadas. Os principais métodos
 * são referentes a eliminar linhas cheias.
 *
 * OBS1: OS BLOCOS AFIXADOS PODEM SER MAIORES QUE 1 DEVIDO ÀS DIFERENTES CORES QUE UM BLOCO PODE TER
 *          
 */
function Area(game, x, y) {
    
    //INICIO CONSTRUTOR
    
    this.game = game; //referência ao jogo
    
    this.x = x; //tamanho da área (x = colunas, y = linhas)
    this.y = y;
    this.board = null;
    this.clean();
    
    //FIM CONSTRUTOR   
}

Area.prototype = {
    
    /**
     * Pega o valor do bloco naquela posição.
     */
    getBlock: function(x, y) {

        if (y < this.y && x < this.x && y >= 0 && x >= 0) {
            return this.board[y][x];
        } else {
            //throw new Error("Area.getBlock("+x+", "+y+") nao existe");
            alert("Area.getBlock("+x+", "+y+") nao existe");
        }
    },
    
    setBlock: function(x, y, value) {
        
        if (y < this.y && x < this.x && y >= 0 && x >= 0) {
            this.board[y][x] = value;
        } else {
            //throw new Error("Area.setBlock("+x+", "+y+") nao existe");
            alert("Area.setBlock("+x+", "+y+") nao existe");
        }
        
    },
       
    /**
     * Método que remove linhas cheias, caso existam
     */
    removeFullLines:  function() {
        
        //nessa implementação, a cada linha removida ele desce todo o array.
        var removedLines = 0;
        var i = this.y-1;
        while (i>=0) {
            //buscar linhas de baixo para cima
            if (this.isLineEmpty(i)){ 
                //se achar uma linha que nao tem nada, então certamente acima dela
                //também não terá nada
                break;
            }
            if (this.isLineFull(i)){ 
                this.removeLine(i); 
                removedLines++;
                continue;
            }
            i--; //somente pega linha de cima se não removeu, 
                      //pois se removeu, as linhas de cima devem vir àbaixo
        }
        
        return removedLines;
    },
    
    /**
     * Verifica se a linha passada por parametro está vazia (só zeros)
     */
    isLineEmpty: function(i) {
        for (var j = 0; j<this.x; j++){
            if (this.board[i][j]){ //se elemento for maior que zero
                return false;
            }
        }
        return true;
    },
    
    /**
     * Verifica se a linha passada por parametro está cheia (não há zeros)
     */
    isLineFull: function(i) {
        
        for (var j = 0; j<this.x; j++){
            if (!this.board[i][j]){ //se elemento for zero
                return false;
            }
        }
        return true;
        
    },
    
    /**
     * Efetiva remoção de uma linha.
     */
    removeLine: function(i) {
        
        //passar todos as linhas de cima para baixo
        for (var l = i-1; l>=0; l--){
            for (var c = 0; c<this.x; c++) {
                this.board[l+1][c] = this.board[l][c];
            }
        }
        for (var j = 0; j < this.x; j++) {
            this.board[0][j] = 0; //preenche primeira linha com zeros
        }
        
    },
    
    /**
     * Limpa área
     */
    clean: function() {
        
        this.board = createArray(this.y,this.x); //está no utils.js
        
    }
    
    
}

/**
 * Classe que representa uma peça do jogo; Cada peça consiste numa matriz quadrática
 * onde o formato da peça é definido pelas posições diferentes de zero. O formato da peça é 
 * definido por uma enumeração, e seu valor é modificado a cada peça nova.  Os principais métodos
 * são referentes a: girar, encaixar, mover e definir posições. Todos os métodos são aplicáveis
 * a qualquer peça, possibilitando a inclusão de novos modelos de peça 
 * (além dos tetraminós, pode-se fazer poliminós quaisquer, desde que não fiquem maior que a área do jogo)
 *  sem afetar a estrutura do jogo.
 */
function Piece(game, area) {
    
    //INICIO CONSTRUTOR
    
    var self = this;
    
    this.game = game; //referência ao jogo onde está ocorrendo
    
//    this.color_range = 5; //para criar peças com cores diferentes, 
//    //estou supondo que existam 5 cores diferentes
// 
    
    //area onde o jogo está ocorrendo
    this.area = area;
    
    this.speed = 1000; //tempo de queda inicial: 1 segundo para descer um nível
    this.boost = 1; //multiplicador de velocidade da queda (quando aperta pra 
                    //baixo valor se torna 20, quando solta restaura para 1)
    this.boosted = false;
    this.running = false; //bool
    
    
    //posição na área (de acordo com posição (0,0) da peça)
    this.x = null;
    this.y = null;
    
    //parecido com um enum:
    this.piece = [];
    this.format = null; //0 .. possiblePieces-1
    this.color = null;
    this.possiblePieces = [  
        
        [
          [1,1,1,0,0,0],
          [0,0,1,0,0,0],
          [0,1,1,0,0,0],
          [0,1,0,0,0,0],  //?
          [0,0,0,0,0,0],
          [0,1,0,0,0,0],
        ],
        [
        [1,1],
        [1,1]
        ],
        [       
        [1,1,1,0],
        [1,0,1,0],
        [1,1,1,0],  //A
        [1,0,1,0]
        ],
        [
        [1,0,0,0],
        [1,1,1,0],
        [1,0,1,0], //B
        [1,1,1,0]
        ],
        
        [
        [1,1,0],
        [1,0,0],  //C
        [1,1,0]
        ],
        
        [
        [0,0,1,0],
        [1,1,1,0],  //D
        [1,0,1,0],
        [1,1,1,0]
        ],
        
        [
        [1,1,0,0,0],
        [1,0,0,0,0],
        [1,1,0,0,0],  //E
        [1,0,0,0,0],
        [1,1,0,0,0]
        ],
        
        [
        [1,1,0,0,0],
        [1,0,0,0,0],
        [1,1,0,0,0], //F
        [1,0,0,0,0],
        [1,0,0,0,0]
        ],
        
        [
        [1,1,1,1],
        [1,0,0,0],
        [1,0,1,1],   //G
        [1,1,1,1]
        ],
        
        [
        [1,0,1],
        [1,1,1],   //H
        [1,0,1]
        ],
        
        [
        [0,1,0],
        [0,1,0], //I
        [0,1,0]
        ],
        
        [
        [0,0,1],
        [1,0,1], //J
        [1,1,1]
        ],
        
        [
        [1,0,1],
        [1,1,0], //K
        [1,0,1]
        ],
        
        [
        [1,0,0],
        [1,0,0], //L
        [1,1,0]
        ],
        
        [
        [1,1,1,1,1],
        [1,0,1,0,1],
        [1,0,0,0,1],  //M
        [0,0,0,0,0],
        [0,0,0,0,0]
        ],
        
        [
        [1,1,1],
        [1,0,1],   //N
        [1,0,1]
        ],
        
        [
        [1,1,1],
        [1,0,1],   //O
        [1,1,1]
         ],
        
        [
        [1,1,1,0],
        [1,0,1,0],
        [1,1,1,0],   //P
        [1,0,0,0]
        ],
        
        [
        [1,1,1,0],
        [1,0,1,0],  //Q
        [1,1,1,0],
        [0,0,1,0]
        ],
        
        [
        [1,1,1],
        [1,0,1],  //R
        [1,0,0]
        ],
        
        [
        [1,1,0,0,0],
        [1,0,0,0,0],
        [1,1,0,0,0],
        [0,1,0,0,0],   //S
        [1,1,0,0,0]
        ],
        
        [
        [1,1,1],
        [0,1,0],   //T
        [0,1,0]
        ],
        
        [
        [1,0,1],
        [1,0,1],   //O
        [1,1,1]
        ],
        
        [
        [1,0,1],
        [1,0,1],
        [0,1,0]
        ],
        
        [
        [1,0,1,0,1],
        [1,0,1,0,1],
        [0,1,0,1,0],
        [0,0,0,0,0],
        [0,0,0,0,0]
        ],
        
        [
        [1,0,1],
        [0,1,0],
        [1,0,1]
        ],
        
        [
        [1,0,1],
        [0,1,0],
        [0,1,0]
        ],
        [
        [1,1,1,1],
        [0,0,1,0],
        [0,1,0,0],
        [1,1,1,1]
        ],
        [
        [0,1,1,0,1,1,0],
        [1,1,1,1,1,1,1],
        [0,1,1,1,1,1,0],
        [0,0,1,1,1,0,0],
        [0,0,0,1,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],

        ]

    ];
    
    
    this.fallDownID = null; 
    //ex:  this.fallDownID = setInterval(this.fallDown, this.speed);
    //controlado pela flag running
    //links: http://rogeriolino.wordpress.com/2006/12/19/javascript-settimeout-e-setinterval/
    //      http://www.w3schools.com/js/js_timing.asp e 

    
    //FIM CONSTRUTOR
    
     /**
     * Fazer a peça começar a cair.
     * OBS: foi colocado aqui dentro para poder enxergar "self", que aponta para este
     * objeto e é usado em setInterval para lidar com o problema de closure dessa função.
     */
    this.run = function() {
        //setar o tick
        this.running = true;
        this.fallDownID = setInterval(function() {self.fallDown()}, this.speed / this.boost);
        
    }  
}

Piece.prototype = {
   
    mayMoveDown: function() {
        
        //verifica se, para cada "pé" da peça, há um bloco logo abaixo. Se houver, a peça não pode se mover
        // para baixo e, portanto, deve ser encaixada ali.
        var positions = this.getBottoms();
        for (var i = 0; i < positions.length; i++){ //pos = [coluna, linha]
            var pos = positions[i];
            if (pos[1] + 1  >= this.area.y || this.area.getBlock(pos[0], pos[1]+1)){ 
                //ver se tem bloco na posição (x, y+1) ou se y+1 é a ultima linha (chão)
                return false;
            }
        }
        return true;
        
        
    },
    
    fallDown: function() {
        
        if (!this.mayMoveDown()){
            this.fit(); //encaixar peça
            this.game.pieceFitted(); //notificação de encaixe
        } else {
            this.moveDown();
        }
        
       //alert(this.y+","+this.x);
        
    },
    
    fit: function() {
        
        //só "carimba" os blocos da peça na área
        for (var l = 0; l < this.piece.length; l++){
            for (var c = 0; c < this.piece[0].length; c++) {
                if (this.piece[l][c]){
                    this.area.setBlock(this.x+c, this.y+l, this.color);
                }
                
            }
        }  
    },
       
    /**
     * Pausar a peça
     */
    stop: function() {
        
        this.running = false;
        clearInterval(this.fallDownID);
        
    },
    
    /**
     * Faz a peça despencar de uma vez.
     */
    tumble: function() {
        
        this.stop();
        while (this.mayMoveDown()){
            this.moveDown();
        }
        this.fit();
        this.game.pieceFitted(); //notificar encaixe
        
    },
    
    /*
     * Muda multiplicador de velocidade
     */
    setSpeedBoost: function(x) {
        
        if (!this.boosted && this.running){
            this.stop();
            this.boost = x;
            this.run();
        }
    },   
   
    /**
     * Muda formato e cor da peça.
     */
    change: function(){
        //mudar formato da peça aleatoriamente
//        this.format = (this.game.formatpiece + 1)%26;
//        this.game.formatpiece = this.format;
//        
        if (!this.game.messageOver){
            this.format = this.game.wordspiece[this.game.wordCount][this.game.letterCount];
            this.color = this.format+3; //cor recebe format + 1, pois as cores variam de 1 a possiblePieces (ver utils.Colors)
        } else {
            this.format = randint(0,this.possiblePieces.length);
            this.color = 100;
        }
//        
        //this.color = randint(1,this.color_range); //muda cor (aleatório, DEPRECATED)
        
        this.piece = this.possiblePieces[this.format];
    },
    
    
    /**
     * Inserir peça no topo da área.
     */
    place: function() {
        //modificar x e y de modo que entre no topo da área
        this.x = Math.floor(this.area.x/3); 
        this.y = 0;
        screen.update();
        
    },
    
    /**
     * Verifica se a peça pode entrar na area, isto é, se nao ha nenhuma peça obstruindo sua entrada.
     */
    mayPlace: function() {
        
        this.place(); //coloca na área para testar; 
                        //isto sempre é aplicado à peça nextpiece, 
                        //entao nao afetará a visualização do jogo
        
        //ver cada coluna da peça de baixo pra cima e verificar se estão encima de um bloco existente;
        for (var c = 0; c < this.piece[0].length; c++){
            for (var l = this.piece.length - 1; l >= 0; l--){
                if (this.piece[l][c]){ //se tiver um bloco ali
                    if (this.area.getBlock(this.x+c, this.y+l)) { //se tiver um bloco na area naquele lugar
                        return false;
                    }
//                    else {
//                        break; //coluna OK, ir pra proxima //retirado pois, em um caso raro, pode dar erro
//                    }
                }
            }
        }   
        
        return true;
        
    },
    
    moveDown: function() {
        this.y++;
        screen.update();
    },

    /**
     * Pegar os "pés" da peça, isto é, os blocos mais inferiores, que podem ser encaixados na área;
     * USO EM: operação de verificar se pode ser colocado na area no proximo tick, mayMoveDown()
     */
    getBottoms: function() {
               
        var ret = []; //retorno: array de tuplas (pontos na área)
        
        //ver cada coluna da peça de baixo pra cima e retornar os pontos de onde estão na área
        for (var c = 0; c < this.piece[0].length; c++){
            for (var l = this.piece.length - 1; l >= 0; l--){
                if (this.piece[l][c]){ //diferente de 0; achou um dos "pés" da peça
                    ret.push([this.x+c, this.y+l]); //verificar se isso faz o que deveria, ou seja, adicionar uma "tupla" ao retorno
                    break; //vai pra proxima coluna
                }
            }
        }
        
        return ret;
        
        
    },
    
    /**
     * Verifica se é possível mover a peça para a esquerda
     */
    mayMoveLeft: function() {
        
        //procura coluna mais à esquerda que contém blocos
        var c = 0; //coluna
                
        outerloop: for (; c < this.piece[0].length; c++) {
            for (var l = 0; l < this.piece.length; l++) {
                if (this.piece[l][c]){
                    break outerloop; //quando encontra bloco, a coluna mais a esquerda é encontrada
                }
                
            }
        }
        
        //verificar se a coluna mais a esquerda da peça é adjacente à parede
        if (this.x + c <= 0) return false;
//               
        //verificar se há blocos na área adjacente à esquerda da coluna encontrada anteriormente
        var blocks = this.getRightSide();
        for (var i = 0; i < blocks.length; i++) {
            l = blocks[i][0];
            c = blocks[i][1];
            if (this.y + l >= this.area.y) continue; //linha abaixo do chão
            if (this.piece[l][c] && this.area.getBlock(this.x + c - 1, this.y + l)) { //tem bloco em (x-1,y) ?
                return false; //se achou um bloco do lado esquerdo, não dá pra mover
            }
        }
        
        //else
        return true;
        
    },
    
    /**
     * move para a esquerda
     */
    moveLeft: function() {
        
        this.x--;
        screen.update();
        
    },
    
    getLeftSide: function() {
        
        var ret = []; //retorno: array de tuplas (pontos na área)
        
        //ver cada coluna da peça de baixo pra cima e retornar os pontos de onde estão na área
        for (var l = 0; l < this.piece.length; l++){
            for (var c = 0; c < this.piece[0].length; c++){
                if (this.piece[l][c]){ //diferente de 0; achou um dos lados da peça
                    ret.push([l,c]);
                    break; //vai pra proxima linha
                }
            }
        }
        
        return ret;
        
    },
    
    getRightSide: function() {
        
        var ret = []; //retorno: array de tuplas (pontos na área)
        
        //ver cada coluna da peça de baixo pra cima e retornar os pontos de onde estão na área
        for (var l = this.piece.length-1; l >= 0; l--){
            for (var c = 0; c < this.piece[0].length; c++){
                if (this.piece[l][c]){ //diferente de 0; achou um dos lados da peça
                    ret.push([l,c]);
                    break; //vai pra proxima coluna
                }
            }
        }
        
        return ret;
        
    },
    
    mayMoveRight: function() {
        
        //procura coluna mais à direita que contém blocos
        var c = this.piece[0].length - 1; //coluna
        
        outerloop: for (; c >= 0; c--) {
            for (var l = 0; l < this.piece.length; l++) {
                if (this.piece[l][c]){
                    break outerloop; //quando encontra bloco, a coluna mais à direita é encontrada
                }
                
            }
        }
        
        //verificar se a coluna mais à direita da peça é adjacente à parede
        if (this.x + c >= this.area.x - 1) return false;
               
        //verificar se há blocos na área adjacente à direita à coluna encontrada anteriormente
        var blocks = this.getRightSide();
        for (var i = 0; i < blocks.length; i++) {
            l = blocks[i][0];
            c = blocks[i][1];
            if (this.y + l >= this.area.y) continue;
            if (this.piece[l][c] && this.area.getBlock(this.x + c + 1, this.y + l)) { //tem bloco em (x+1,y) ?
                return false; //se achou um bloco do lado direito, não dá pra mover
            }
        }
        
//        for (var l = 0; l < this.piece.length; l++) {
//            if (this.y + l >= this.area.y) continue; //linha abaixo do chão
//            if (this.piece[l][c] && this.area.getBlock(this.x + c + 1, this.y + l)) { //tem bloco em (x+1,y) ?
//                return false; //se achou um bloco do lado direito, não dá pra mover
//            }
//        }
        
        //else
        return true;
        
    },
    
    /**
     * move para direita
     */
    moveRight: function() {
                
        this.x++;
        screen.update();        
        
    },
    
    /**
     * Gira a peça em sentido anti-horário;
     */
    rotatePiece: function() {

        var aux_array = createArray(this.piece[0].length, this.piece.length);
        
        for (var l = 0; l < this.piece.length; l++) {
            for (var c = this.piece[0].length - 1; c >= 0; c--) {
                
                if (this.piece[l][c] && this.area.getBlock(this.x + l, this.y + this.piece.length - 1 - c)){
                    // se o bloco nao é zero e o local onde vai ser colocada também não é zero, 
                    // a rotação não é possível
                    return false;
                }
                
                aux_array[this.piece.length - c -1][l] = this.piece[l][c]; //faz a rotação (sentido anti-horário)
                //ex: a[0,0] = p[0,2]  l = 0, c = 2
                //    a[1,0] = p[0,1]  l = 0, c = 1
                //    a[2,0] = p[0,0]  l = 0, c = 0            
            }
        }

        this.piece = aux_array;
        return true;
        
    },
    
    /**
     * Somente usado para o caso em que a peça estiver quase encostando no chão e for requerido girá-la
     * ver tryToRotate
     */
    mayMoveUp: function() {
        
        //procura linha mais acima que contém blocos
        var l = 0; //linha
        
        outerloop: for (; l < this.piece.length; l++) {
            for (var c = 0; c < this.piece[0].length; c++) {
                if (this.piece[l][c]){
                    break outerloop; //quando encontra bloco, a coluna mais a esquerda é encontrada
                }
                
            }
        }
         
        //verificar se há blocos na área adjacente acima da linha  encontrada anteriormente
        for (c = 0; c < this.piece[0].length; c++) {
            //if (this.x + c >= this.area.x || this.x + c < 0) continue; //coluna morta (fora da área)
            if (this.area.getBlock(this.x + c, this.y + l - 1)) { //tem bloco em (x,y-1) ?
                return false; //se achou um bloco encima, não dá pra mover
            }
        }
        
        //else
        return true;
        
    },
    
    /**
     * Tenta girar a peça. Primeiro, verifica-se se um pedaço vazio dela está fora dos limites da área
     * (por exemplo, quando a peça vertical está encostada na parede). Se estiver, tenta-se movê-la até
     * que o bloco esteja inteiro para dentro, o que permite girá-lo adequadamente. Após isso, tenta-se
     * girá-lo.
     */
    tryToRotate: function() {
        
        //verificar se a peça está com um pedaço vazio fora da área, e se tiver, movê-la inteira para dentro
        //se não der para mover para dentro, a peça não pode ser girada.
        
        if (this.format == 0) return true; //se for a peça quadrada, não tem como girar
        
        var aux_piece = this.copy(); //pegar uma cópia desta peça para realizar os testes abaixo
        
        while (aux_piece.x + aux_piece.piece[0].length > aux_piece.area.x) { 
            //um pedaço do bloco está para fora da parede direita
            
            if (aux_piece.mayMoveLeft()){ //se dá pra mover para a esquerda, faça-o
                aux_piece.moveLeft();
            } else {
                return false;
            }
        }
        
        while (aux_piece.x < 0) { //um pedaço do bloco está para fora da pared esquerda 
            if (aux_piece.mayMoveRight()){ //se dá pra mover para a esquerda, faça-o
                aux_piece.moveRight();
            } else {
                return false;
            }
        }
        
        while (aux_piece.y + aux_piece.piece.length > aux_piece.area.y){
                    //Se a linha onde bloco for colocado está abaixo do "chão" da área, subir piece.y em uma linha
            if (aux_piece.mayMoveUp()){ //se dá pra mover para cima, faça-o
                aux_piece.y--;
            } else {
                return false;
            }    
            
        }
        
        if (!aux_piece.rotatePiece()) return false; //se rotação não foi possível
        
        //se a rotação deu certo, copia os valores
        this.x = aux_piece.x;
        this.y = aux_piece.y;
        this.piece = aux_piece.piece;
        
        screen.update();
        return true;
        
        
    },
    
    /**
     * Retorna uma cópia básica deste objeto, para ser usado no teste de rotação
     */
    copy: function() {
        
        var clone = new Piece(this.game,this.area);
        clone.piece = this.piece;
        clone.x = this.x;
        clone.y = this.y;
        return clone;
    }    
}
////
//var game = new Game(7,10);
//game.startGame();
