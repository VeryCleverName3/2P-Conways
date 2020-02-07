var canvasScale = 2;

var c = document.createElement("canvas");
document.body.append(c);

var ctx = c.getContext("2d");

c.style.height = c.style.width = window.innerHeight + "px";

var s = c.width = c.height = window.innerHeight * canvasScale;

var stage = 0;
var realMap;
var p1Map;
var p2Map;

onmousedown = (e) => {
    if(activeWorld != undefined){
        var mx = (e.clientX * canvasScale);/* - ((window.innerWidth - window.innerHeight) / 2);*/
        var my = e.clientY * canvasScale;
        mx /= s;
        my /= s;
        activeWorld.createCell(mx, my);
        activeWorld.draw();
    }
}

onkeydown = (e) => {
    if(e.which == 32){
        nextStage();
    }
}

//Creates a world
function World(x, y, color){
    this.color = color;
    this.map = [];
    for(let i = 0; i < x; i++){
        this.map[i] = [];
        for(let j = 0; j < y; j++){
            this.map[i][j] = [0, "white"];
        }
    }

    this.drawClear = () => {
        for(let i = 0; i < this.map.length; i++){
            for(let j = 0; j < this.map[i].length; j++){
                if(this.map[i][j][0] == 1){
                    ctx.fillStyle = this.map[i][j][1];
                    ctx.fillRect(i / this.map.length * s, j / this.map[i].length * s, 1 / this.map.length * s, 1 / this.map[i].length * s);
                }
            }
        }
    }

    this.draw = () => {
        ctx.clearRect(0, 0, s, s);

        this.drawClear();
    }

    this.getNewValue = (x, y) => {
        sum = 0;
        var colors = {"blue": 0, "red": 0, "purple": 0};

        for(let i = -1; i <= 1; i++){
            if(this.map[i + x] != undefined){
                for(let j = -1; j <= 1; j++){
                    if(this.map[i + x][j + y] != undefined){
                        if(!(i == 0 && j == 0)){
                            if(colors[this.map[i + x][j + y][1]] == undefined){
                                colors[this.map[i + x][j + y][1]] = 0;
                            }
                            sum += (this.map[i + x][j + y][0] != 0)?1:0;
                            if(this.map[i + x][j + y][1] != "white")
                                colors[this.map[i + x][j + y][1]]++;
                        }
                    }
                }
            }
        }

        var theColor = "";

        if(colors["blue"] == colors["red"]){
            theColor = "purple";
        } else if(colors["blue"] > colors["red"]){
            theColor = "blue";
        } else {
            theColor = "red";
        }

        if((sum == 2 || sum == 3) && this.map[x][y][0] == 1){
            return [1, theColor];
        }

        if(this.map[x][y][0] == 0 && sum == 3){
            return [1, theColor];
        }

        return [0, "white"];
    }

    this.update = () => {
        var tempMap = copy(this.map);
        
        for(let i = 0; i < tempMap.length; i++){
            for(let j = 0; j < tempMap[i].length; j++){
                tempMap[i][j] = this.getNewValue(i, j);
            }
        }

        this.map = tempMap;

        return this.map;
    }

    this.createCell = (mx, my) => {
        this.map[Math.floor(mx * this.map.length)][Math.floor(my * this.map[0].length)][0] = 1 - this.map[Math.floor(mx * this.map.length)][Math.floor(my * this.map[0].length)][0];
        if(this.map[Math.floor(mx * this.map.length)][Math.floor(my * this.map[0].length)][1] == "white"){
            this.map[Math.floor(mx * this.map.length)][Math.floor(my * this.map[0].length)][1] = this.color;
        } else {
            this.map[Math.floor(mx * this.map.length)][Math.floor(my * this.map[0].length)][1] = "white";
        }
    }

    this.clear = () => {
        for(var i = 0; i < this.map.length; i++){
            for(var j = 0; j < this.map[i].length; j++){
                this.map[i][j][0] = 0;
            }
        }
    }
}

//copies a 2d array
function copy(array){
    var temp = [];
    for(let i = 0; i < array.length; i++){
        temp[i] = [];
        for(let j = 0; j < array[i].length; j++){
            temp[i][j] = array[i][j];
        }
    }

    return temp;
}

//inserts a 2d array into a second one, top left at x, y
function insertIntoMap(a1, a2, x, y){
    for(var i = 0; i < a1.length; i++){
        for(var j = 0; j < a1[i].length; j++){
            a2[i + x][j + y] = a1[i][j];
        }
    }

    return a2;
}

function update(){
    realMap.draw();
    realMap.update();
}

function blankMap(x, y){
    var a = [];
    for(var i = 0; i < x; i++){
        a[i] = [];
        for(var j = 0; j < y; j++){
            a[i][j] = [0, "white"];
        }
    }
    return a;
}

//I know I don't need the {}, but it makes VS Code do better indentation
function nextStage(){
    stage++;
    switch(stage){
        case 1:
            {
                p1Map = new World(15, 15, "blue");

                activeWorld = p1Map;
            };
            break;
        case 2:
            {
                p2Map = new World(15, 15, "red");
                activeWorld = p2Map;
                p2Map.draw();
            }
            break;
        case 3:
            {

                realMap = new World(75, 75, "white");
                realMap.map = insertIntoMap(p1Map.map, realMap.map, realMap.map.length - p1Map.map.length, realMap.map[0].length - p1Map.map[0].length);
                realMap.map = insertIntoMap(p2Map.map, realMap.map, 0, 0);
                activeWorld = undefined;
                setInterval(update, 50);
            }
            break;
    }
}

nextStage();

