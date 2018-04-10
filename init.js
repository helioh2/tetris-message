            function init(msg){
                
		var game = new Game(30,34, msg.split(" "));

                var screen = new Screen(
                    document.getElementById("area"),
                    document.getElementById("score"),
                    document.getElementById("nextpiece"),
                    document.getElementById("timer"),
                    document.getElementById("level"),
                    game
                    );
                game.setScreen(screen);

                //INICIO setar comandos de teclado
                var keyboard = new Keyboard(game);
                
                document.onkeydown = function(e){
                    //e = e || window.event;
                
                    var keyCode = e.keyCode;
                    if (keyCode >= 37 && keyCode <= 40) {
                        keyboard.downkeys(e);
                        return false;
                    } else {
                        keyboard.downkeys(e);
                        return true;}}
                document.onkeyup = function(e){
                    //e = e || window.event;
                
                    var keyCode = e.keyCode;
                    if (keyCode >= 37 && keyCode <= 40) {
                        keyboard.upkeys(e);
                        return false;
                    } else {
                    keyboard.upkeys(e);
                    return true;}}
                //FIM comandos teclado
                
                document.body.style.overflow='hidden';//bloqueia barra de rolagem
                //window.document.body.scroll = 'no'; 
                
                screen.printClean();
                screen.printStartImage();

                var inited_once = false;
                document.getElementById("area").onclick = function(){
                    if(!inited_once || game.over){
                        game.startGame();
                        inited_once = true;
                    }
                    
                };
            }
