$('document').ready(function(){
	var container = $('.container');
	function Square(xcoord, ycoord){
		this.xcoord = xcoord;
		this.ycoord = ycoord;
		this.state = "";
		this.mineTouch = 0;
		this.hidden = true;
		this.flagged = false;
	};	

	var init = function(arg1, arg2, arg3){
		$('.container div').remove();
		$('.container button').remove();
		cellRef = "";
		firstClick = true;
		firstSquare = "";
		timeTaken = 0;
		board = [];
		minesPlaced = 0;
		eSquares = [];
		gameOver = false;
		minesT = "";
		size = [[10,10,10],[20,20,40],[30,20,100],[40,20,145]];
		cols = arg1;
		rows = arg2;
		mines = arg3;
		flagsLeft = arg3;
		cellsNum = rows * cols;
		var width = (cols * 40).toString();
		var height = (rows * 40).toString();
		container.css({"width": width+"px", "height": height+"px"});
		render(cols, rows);	
		changeBoard();
		listener();
	};

	//Function to create ID of div from x and y coords
	var squareId = function(arg1, arg2){
		var x = arg1.toString();
		var y = arg2.toString();
		return 'x'+x+'y'+y;
	};

	var render = function(arg1,arg2){
		container.append('<button class="board">Change board</button>');
		for (i=1; i<=arg2; i++) {
			for (j=1; j<=arg1; j++){
				var cell = new Square(j, i);
				board.push(cell);
				cellRef = squareId(j, i);
				container.append('<div class="square" id="'+cellRef+'"></div>');
			};
		};
		container.append('<div class="info flags"><p>Flags left: '+flagsLeft+'</p></div>');
		container.append('<div class="info timer"><p>Time taken: '+timeTaken+'</p></div>');
	};

	var listener = function(){
		for (i=1; i<=cols; i++) {
			for (j=1; j<=rows; j++){
				cellRef = squareId(i, j);
				(function(k, l, m){
					$('#'+ m).click(function(){
						lClickUpdate(k, l);
					});
				})(i, j, cellRef);
				(function(k, l, m){
					$('#'+ m).bind("contextmenu",function(event){
						event.preventDefault();
						rClickUpdate(k, l, m);
					});
				})(i, j, cellRef);
			};
		};
	};
	
	//function to locate square on board and then call function on it
	var checkBoard = function(arg1,arg2,arg3){
		for (var cell=0; cell<cellsNum; cell++) {
			if (board[cell].xcoord === arg1 && board[cell].ycoord === arg2){
				arg3(cell);
			};
		};
	};

	var lClickUpdate = function(arg1, arg2){
		if(firstClick) {
			//start Timer
			updateTimer = setInterval(function(){
				timeTaken += 1;
				$('.timer p').text("Time taken: "+timeTaken);
			},1000);	
			//update squares in and around clicked square as empty
			for (i=arg1-1; i<=arg1+1; i++){
				for (j=arg2-1; j<=arg2+1; j++){
					checkBoard(i, j, function(cell){
						board[cell].state = "e";
					});
				};
			};
			//randomly assign mines to squares
			while (minesPlaced < mines){
				var a = parseInt(Math.random() * cols);
				var b = parseInt(Math.random() * rows);	
				checkBoard(a, b, function(cell){
					if (board[cell].state != "e" && board[cell].state != "m"){
						board[cell].state = "m";	
						minesPlaced += 1;
					};	
				});
			};
			//update squares around mines with numbers
			for (i=0; i<cellsNum; i++){
				if (board[i].state === "m"){
					var c = board[i].xcoord;
					var d = board[i].ycoord;
					for (j=c-1; j<=c+1; j++){
						for (k=d-1; k<=d+1; k++){
							checkBoard(j, k, function(cell){
								if (board[cell].state != "m"){
									board[cell].mineTouch += 1; 
									board[cell].state = "t"; 
								};
							});
						};
					};
				};
			};
			//update all remaining squares as empty
			for (i=0; i<cellsNum; i++){
				if (board[i].state === ""){
					board[i].state = "e";
				};
			};
			firstClick = false;
		};
		//Reveal square(s)
		if (!gameOver){
			checkBoard(arg1, arg2, function(cell){
				if (board[cell].flagged === false){
					switch (board[cell].state) {
				        case "m":
				        	gameOver = true;
				        	clearInterval(updateTimer);
				        	revealMines(arg1, arg2, cell);
				            container.append('<button class="play">Play again</button>');
				            $('.play').click(function(){
								init(cols, rows, mines);
							});
				            break;
				        case "e":
				        	reveal(arg1, arg2, "e", cell);
				            break;
				        case "t":
				        	reveal(arg1, arg2, "t", cell);
				            break;
	    			};
	    		};			
			});
		};
	};

	var rClickUpdate = function(arg1, arg2, arg3){
		if (!gameOver){
			checkBoard(arg1, arg2, function(cell){
				if (board[cell].hidden === true){
					switch (board[cell].flagged){
						case false:
							if (flagsLeft > 0){
								board[cell].flagged = true;
								$('#'+arg3).append('<img src="images/flag.png" class="flagged">');
								flagsLeft -= 1;
								$('.flags p').text("Flags left: "+flagsLeft);
							};
							break;
						case true:
							board[cell].flagged = false;
							$('#'+arg3+' img').remove();
							flagsLeft += 1;
							$('.flags p').text("Flags left: "+flagsLeft);
							break;
					};									
				};
			});
		};
	};

	var reveal = function(arg1, arg2, arg3, arg4){
		if (arg3 === "t" && board[arg4].hidden === true){
			board[arg4].hidden = false;
	    	cellRef = squareId(arg1, arg2);
	    	minesT = board[arg4].mineTouch.toString();
		   	$('#'+cellRef).replaceWith('<div class="square reveal" id="'+cellRef+'"><p class="mines'+minesT+'">'+minesT+'</p></div>');
    	};
    	if (arg3 === "e" && board[arg4].hidden === true){	
			board[arg4].hidden = false;
			cellRef = squareId(arg1, arg2);
			$('#'+ cellRef).replaceWith('<div class="square reveal" id="'+cellRef+'"></div>');	
			cycleSquares(arg1, arg2);
		};
	};

	//Check each surrounding square
	var cycleSquares = function(arg1, arg2){
		for (m=arg1-1; m<=arg1+1; m++){
			for (n=arg2-1; n<=arg2+1; n++){
				checkBoard(m, n, function(cell){					
					if (board[cell].hidden === true && board[cell].flagged === false){
						switch(board[cell].state){
							case "t":
								board[cell].hidden = false;
				    			cellRef = squareId(m, n);
				    			minesT = board[cell].mineTouch.toString();
		   						$('#'+cellRef).replaceWith('<div class="square reveal" id="'+cellRef+'"><p class="mines'+minesT+'">'+minesT+'</p></div>');
								break; 
							case "e":
								board[cell].hidden = false;
				    			cellRef = squareId(m, n);
				    			$('#'+ cellRef).replaceWith('<div class="square reveal" id="'+cellRef+'"></div>');	
				    			eSquares.push([m,n]);
								break; 
						};	
			    	};
				});
			};
		};
		for (q=0; q<eSquares.length; q++){
			var x = eSquares[q][0];
			var y = eSquares[q][1];
			eSquares.shift();
			cycleSquares(x,y);
		};
	};

	var revealMines = function(arg1, arg2, arg3){
		for (i=1; i<=cols; i++) {
			for (j=1; j<=rows; j++){
				checkBoard(i, j, function(cell){					
					if(board[cell].state === "m"){
						cellRef = squareId(i, j);
						$('#'+cellRef).replaceWith('<div class="square reveal" id="'+cellRef+'"><img src="images/skull.png" class="skull"></div>');			
					};		
				});
			};
		};	
		cellRef = squareId(arg1, arg2);
		$('#'+cellRef).replaceWith('<div class="square reveal mineHit" id="'+cellRef+'"><img src="images/skull.png" class="skull"></div>');
	};

	var changeBoard = function(){
		//Init game board----------------------------
		for (i=2; i<=4; i++) {
			var buttonId = i.toString();
			$('#but'+buttonId).attr("checked",false);
		};
		var buttonClicked = 1;
		$('#but'+buttonClicked.toString()).attr("checked","checked");
		$('.board').click(function(){
			$('.changeBoard').css("display","block");
			for (i=1; i<=4; i++){
				var buttonId = i.toString();
				(function(arg1){
					$('#but'+buttonId).click(function(){
						buttonClicked = arg1;
						for (j=1; j<=4; j++){
							var buttonId = j.toString();
							var status = $('#but'+buttonId).attr("checked");
							if (j != arg1 && status === "checked"){
								$('#but'+buttonId).attr("checked",false);
							};
						};
					});
				})(i);		
			};
			$('.play').click(function(){
				$('.changeBoard').css("display","none");
				if(buttonClicked === 4){
					cols = $('#width').attr("value");
					rows = $('#height').attr("value");
					mines = $('#mines').attr("value");
				} else {
					cols = size[buttonClicked-1][0];
					rows = size[buttonClicked-1][1];	
					mines = size[buttonClicked-1][2];
				};
				init(cols, rows, mines);
			});
		});
	};

	init(10,10,10);

});
