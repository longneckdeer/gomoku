/*

變數名詞解釋
Gom: 一顆棋
Gomset: 一組活二死二活三死三等等

*/
function Gomoku(board,grid){
    this.black=[];//黑棋
    this.white=[];//白棋
    this.board=board;
    this.grid=grid;
    this.currentBlack=true;
    this.blackComputer=false;
    this.whiteComputer=true;
    this.finished=false;
    this.gomsets=[];//死活二三四五
    this.nextMove=1;

    this.candidates=[];

    this.drawGrid();
};
Gomoku.prototype.drawGrid=function(){
    for(var y=0;y<14;y++){
        var row=this.grid.insertRow();
        for(var x=0;x<14;x++){
            var cell=row.insertCell();
        }
    }
    this.w=cell.offsetWidth;
    this.h=cell.offsetHeight;
    this.grid.go=this;
    this.grid.w=this.w;
    this.grid.h=this.h;
    this.grid.onclick=function(e){
        var x=Math.ceil((e.layerX+this.w/2)/this.w);
        var y=Math.ceil((e.layerY+this.h/2)/this.h);
        if(this.go.hasGomAt(x,y)) return;
        if(this.go.finished) return;

        if(this.go.currentBlack) this.go.shaBlack(x,y);
        else this.go.shaWhite(x,y);
    }
};
Gomoku.prototype.hasGomAt=function(x,y){
  for(var i=0;i<this.black.length;i++){
      var g=this.black[i];
      if(g.x===x && g.y===y) return true;
  }
    for(var i=0;i<this.white.length;i++){
        var g=this.white[i];
        if(g.x===x && g.y===y) return true;
    }
    return false;
};
Gomoku.prototype.drawBoard=function(){
    this.board.innerHTML='';
    for(var i=0;i<this.black.length;i++){
        var circle=this.black[i].gomo(true,this);
        this.board.appendChild(circle);
    }
    for(var i=0;i<this.white.length;i++){
        var circle=this.white[i].gomo(false,this);
        this.board.appendChild(circle);
    }
};
Gomoku.prototype.gomo=function(){//執行一步棋
    this.drawBoard();
    this.analyzeGomsets();
    this.showResult();
    this.computerPlay();
};
Gomoku.prototype.computerPlay=function(){
    if(this.nextMove<3) return;//not started yet

    if(this.currentBlack && this.blackComputer){
        //this.findMovesBlack();
        return;
    }
    if(!this.currentBlack && this.whiteComputer){
        this.findMovesWhite();
        return;
    }
};
Gomoku.prototype.shaBlack=function(x,y){//下黑
    var g=new Gom(x,y);
    g.moveNum=this.nextMove++;
    this.black.push(g);
    this.currentBlack=false;
    this.gomo();
};
Gomoku.prototype.shaWhite=function(x,y){//下白
    var g=new Gom(x,y);
    g.moveNum=this.nextMove++;
    this.white.push(g);
    this.currentBlack=true;
    this.gomo();
};

function Gom(x,y){
    this.x=x;
    this.y=y;
    this.mustOneOf=false;
    this.score=0;
    this.moveNum=-1;
};
Gom.prototype.gomo=function(black,gomoku){
    var circle=document.createElement('div');
    circle.style.border='1px solid #000';
    circle.style.borderRadius=(gomoku.h)+'px';
    circle.style.position='absolute';
    circle.style.fontSize='20px';
    circle.style.fontSize='sans serif';
    if(this.moveNum>99) circle.innerHTML='<div style="margin:5px 1px;">'+this.moveNum+'</div>';
    else if(this.moveNum>9) circle.innerHTML='<div style="margin:5px 5px;">'+this.moveNum+'</div>';
    else circle.innerHTML='<div style="margin:5px 10px;">'+this.moveNum+'</div>';
    if(black) {
        circle.style.background='#000';
        circle.style.color='#fff';
        circle.style.height=(gomoku.h-4)+'px';
        circle.style.width=(gomoku.w-7)+'px';
        circle.style.top=((this.y-1)*gomoku.h-gomoku.h/2)+'px';
        circle.style.left=((this.x-1)*gomoku.w-gomoku.w/2+2)+'px';
    }
    else {
        circle.style.background='#fff';
        circle.style.color='#000';
        circle.style.height=(gomoku.h-5)+'px';
        circle.style.width=(gomoku.w-8)+'px';
        circle.style.top=((this.y-1)*gomoku.h-gomoku.h/2)+'px';
        circle.style.left=((this.x-1)*gomoku.w-gomoku.w/2+2)+'px';
    }
    return circle;
};

function Gomset(black,headSpace,type,headBlock){
    this.black=black;
    this.goms=[];
    this.headSpace=headSpace;
    this.midSpace=0;
    this.tailSpace=0;
    this.type=type;
    this.blocks=[];
    this.midBlocks=[];
    if(headBlock && headSpace>0) this.blocks.push(headBlock);
};
Gomoku.prototype.findMovesWhite=function(){
    //100%
    //find white 4d / 4h
    var w4d=this.find4dBlocks(false);
    if(w4d && w4d.length>0) {
        this.shaWhite(w4d[0].x,w4d[0].y);
        return;
    }
    //find black 4d
    var b4d=this.find4dBlocks(true);
    if(b4d && b4d.length>0) {
        this.shaWhite(b4d[0].x,b4d[0].y);
        return;
    }

    //find white 3h
    var w3h=this.find3hBlocks(false,true);
    if(w3h && w3h.length>0) {
        this.shaWhite(w3h[0].x,w3h[0].y);
        return;
    }

    //<100% moves
    this.candidates=[];

    //find black 3d
    var b3h=this.find3hBlocks(true,false);
    if(b3h && b3h.length>0) {
        for(var i=0;i<b3h.length;i++){
            var g=b3h[i];
            this.addCandidate(g,true,100);
        }
    }

    //find black ammo
    var bammo=this.findAmmoBlocks(true);
    if(bammo && bammo.length>0) {
        for(var i=0;i<bammo.length;i++){
            var g=bammo[i];
            this.addCandidate(g,false,10);
        }
    }


    //find white ammo
    bammo=this.findAmmoBlocks(false);
    if(bammo && bammo.length>0) {
        for(var i=0;i<bammo.length;i++){
            var g=bammo[i];
            this.addCandidate(g,false,10);
        }
    }


    //console.clear();
    //console.log(candidates);
    //decide move from candidates
    //check must one of
    var maxScore=0;
    var currentBest=null;
    for(var i=0;i<this.candidates.length;i++){
        var g=this.candidates[i];
        if(g.mustOneOf && g.score>=maxScore){
            currentBest=g;
            maxScore=g.score;
        }
    }
    if(currentBest){
        this.shaWhite(currentBest.x,currentBest.y);
        return;
    }
    else{
        maxScore=0;
        for(var i=0;i<this.candidates.length;i++){
            var g=this.candidates[i];
            if(g.score>=maxScore){
                currentBest=g;
                maxScore=g.score;
            }
        }
    }
    if(currentBest){
        this.shaWhite(currentBest.x,currentBest.y);
        return;
    }


    //find white 4d4d / 4dtrap
    //find white 4h3h
    //find white 3h3h

};
Gomoku.prototype.addCandidate=function(gom,mustOneOf,score){
    for(var i=0;i<this.candidates.length;i++){
        var candidate=this.candidates[i];
        if(candidate.x===gom.x && candidate.y===gom.y){
            console.log('here');
            if(mustOneOf) candidate.mustOneOf=true;
            candidate.score+=score;
        }
    }
    var newCandidate=new Gom(gom.x,gom.y);
    newCandidate.mustOneOf=mustOneOf;
    newCandidate.score=score;
    this.candidates.push(newCandidate);
};
Gomoku.prototype.find4dBlocks=function(black){
    for(var i=0;i<this.gomsets.length;i++){
        var gs=this.gomsets[i];
        if(black && gs.black && gs.goms.length===4){
            if(gs.midBlocks && gs.midBlocks.length>0) return gs.midBlocks;
            else return gs.blocks;
        }
        else if(!black && !gs.black && gs.goms.length===4){
            if(gs.midBlocks && gs.midBlocks.length>0) return gs.midBlocks;
            else return gs.blocks;
        }
    }
};
Gomoku.prototype.find3hBlocks=function(black,ifMy){
    //var blocks=[];
    for(var i=0;i<this.gomsets.length;i++){
        var gs=this.gomsets[i];
        if(black && gs.black && gs.goms.length===3 && gs.ifHo()){
            return ifMy?gs.midBlocks:gs.blocks;
        }
        else if(!black && !gs.black && gs.goms.length===3 && gs.ifHo()){
            return ifMy?gs.midBlocks:gs.blocks;
        }
    }
};
Gomoku.prototype.findAmmoBlocks=function(black){
    var candidates=[];
    for(var j=0;j<this.gomsets.length;j++){
        var gs=this.gomsets[j];
        if(black && gs.black && gs.goms.length===3 && !gs.ifHo() ||
            !black && !gs.black && gs.goms.length===3 && !gs.ifHo() ||
            black && gs.black && gs.goms.length===2 && gs.ifHo() ||
            !black && !gs.black && gs.goms.length===2 && gs.ifHo()
        ){
            for(var i=0;i<gs.blocks.length;i++){
                var g=gs.blocks[i];
                this.addCandidate(g,false,10);
            }
        }
    }
    return candidates;
};
Gomset.prototype.ifHo=function(){
    if(this.headSpace===0 || this.tailSpace===0) return false;
    else{
        if(this.goms.length===4 && this.midSpace>0) return false;
        else if(this.goms.length===3 && this.midSpace>1) return false;
        else if(this.goms.length===2 && this.midSpace>2) return false;
        return true;
    }
};
Gomset.prototype.analyzeResult=function(){
    var result=(this.black?'黑':'白')+
        (this.ifHo()?'活':'死')+
        this.goms.length+
        this.type;
    return result;
};
Gomset.prototype.getScore=function(){
};

Gomset.prototype.addGom=function(gom){
    this.midSpace+=this.tailSpace;
    this.tailSpace=0;
    this.goms.push(gom);
};
Gomset.prototype.addEmpty=function(gom){
    if(this.tailSpace===0) {
        this.blocks.push(gom);
        this.midBlocks.push(gom);
    }
    this.tailSpace++;
};
Gomoku.prototype.finishCurrentGomset=function(){
    this.gomsets.push(this.currentGomset);
    this.space=0;
};


Gomoku.prototype.analyzeReset=function(){
    this.gomsets=[];
    this.currentGomset=null;
    this.space=0;
    this.lastEmptyGom=null;
};
Gomoku.prototype.resetLine=function(){
    if(this.currentGomset){
        this.finishCurrentGomset();
        this.currentGomset=null;
    }
    this.space=0;
};
//line checking
Gomoku.prototype.scan=function(x,y,type){
    //check black
    for(var i=0;i<this.black.length;i++){
        var g=this.black[i];
        if(g.x===x && g.y===y) {//found black
            if(this.currentGomset){
                if(this.currentGomset.black){
                    this.currentGomset.addGom(g);
                }
                else{
                    this.finishCurrentGomset();
                    this.currentGomset=new Gomset(true,this.space,type,this.lastEmptyGom);
                    this.currentGomset.addGom(g);
                }
            }
            else {
                this.currentGomset=new Gomset(true,this.space,type,this.lastEmptyGom);
                this.currentGomset.addGom(g);
            }
            return;
        }
    }
    //check white
    for(var i=0;i<this.white.length;i++){
        var g=this.white[i];
        if(g.x===x && g.y===y) {//found white
            if(this.currentGomset){
                if(!this.currentGomset.black){
                    this.currentGomset.addGom(g);
                }
                else{
                    this.finishCurrentGomset();
                    this.currentGomset=new Gomset(false,this.space,type,this.lastEmptyGom);
                    this.currentGomset.addGom(g);
                }
            }
            else {
                this.currentGomset=new Gomset(false,this.space,type,this.lastEmptyGom);
                this.currentGomset.addGom(g);
            }
            return;
        }
    }
    //empty
    if(this.currentGomset){
        this.currentGomset.addEmpty(new Gom(x,y));
    }
    else{
        this.lastEmptyGom=new Gom(x,y);
        this.space++;
    }
};
Gomoku.prototype.showResult=function(){
    for(var i=0;i<this.gomsets.length;i++){
        var gs=this.gomsets[i];
        if(gs.goms.length>4){
            this.finished=true;
        }
    }
};
Gomoku.prototype.analyzeGomsets=function(){
    this.analyzeReset();
    //check vertical
    for(var x=1;x<=15;x++){
        for(var y=1;y<=15;y++){
            this.scan(x,y,'直');
        }
        this.resetLine();
    }
    //check horizontal
    for(var y=1;y<=15;y++){
        for(var x=1;x<=15;x++){
            this.scan(x,y,'橫');
        }
        this.resetLine();
    }
    //check diagonal
    //x-, y+
    for(var x=5;x<=15;x++){
        var checkX=x;
        for(var y=1;y<=15 && checkX>0;y++){
            this.scan(checkX,y,'斜');
            checkX--;
        }
        this.resetLine();
    }
    //x-, y+
    for(var y=2;y<=11;y++){
        var checkY=y;
        for(var x=15;x>0 && checkY<=15;x--){
            this.scan(x,checkY,'斜');
            checkY++;
        }
        this.resetLine();
    }


    //x+, y+
    for(var x=11;x>=1;x--){
        var checkX=x;
        for(var y=1;y<=15 && checkX<=15;y++){
            this.scan(checkX,y,'斜');
            checkX++;
        }
        this.resetLine();
    }
    //x+, y+
    for(var y=2;y<=11;y++){
        var checkY=y;
        for(var x=1;x<=15 && checkY<=15;x++){
            this.scan(x,checkY,'斜');
            checkY++;
        }
        this.resetLine();
    }
};

