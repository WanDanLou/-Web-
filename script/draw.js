//画布
var canvas ;
var context ;
//蒙版
var canvas_bak;
var context_bak;

var canvasWidth = 500;
var canvasHeight = 400;

var canvasTop;
var canvasLeft;

//画笔大小
var size = 1;
var color  = '#000000';

startX = 0;
startY = 0;

//画图形
var draw_graph = function(graphType,obj){

	//把蒙版放于画板上面
	$("#canvas_bak").css("z-index",1);
	//先画在蒙版上 再复制到画布上

	chooseImg(obj);
	var canDraw = false;

	//鼠标按下获取 开始xy开始画图
	var mousedown = function(e){
		context.strokeStyle= color;
		context_bak.strokeStyle= color;
		context_bak.lineWidth = size;
		e=e||window.event;
		startX = e.clientX - canvasLeft;
		startY = e.clientY - canvasTop;
		context_bak.moveTo(startX ,startY );
		canDraw = true;

		if(graphType == 'pencil'){
			context_bak.beginPath();
		}else if(graphType == 'circle'){
			context.beginPath();
			context.moveTo(startX ,startY );
			context.lineTo(startX +2 ,startY+2);
			context.stroke();

		}else if(graphType == 'rubber'){
			context.clearRect(startX - size * 10 ,  startY - size * 10 , size * 20 , size * 20);
		}
	};

	//鼠标离开 把蒙版canvas的图片生成到canvas中
	var mouseup = function(e){
		e=e||window.event;
		canDraw = false;
		var image = new Image();
		if(graphType!='rubber'){

			image.src = canvas_bak.toDataURL();
			image.onload = function(){
				context.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , canvasWidth , canvasHeight);
				clearContext();
				saveImageToAry();
			}
			var x = e.clientX   - canvasLeft;
			var y = e.clientY  - canvasTop;
			context.beginPath();
			context.moveTo(x ,y );
			context.lineTo(x +2 ,y+2);
			context.stroke();
		}
	};

	//选择功能按钮 修改样式
	function chooseImg(obj){
		var imgAry  = $("#drawController img");
		for(var i=0;i<imgAry.length;i++){
			$(imgAry[i]).removeClass('border_choose');
			$(imgAry[i]).addClass('border_nochoose');
		}
		$(obj).removeClass("border_nochoose");
		$(obj).addClass("border_choose");
	}

	// 鼠标移动
	var  mousemove = function(e){
		e=e||window.event;
		var x = e.clientX   - canvasLeft;
		var y = e.clientY  - canvasTop;
		//方块  4条直线搞定
		if(graphType == 'square'){
			if(canDraw){
				context_bak.beginPath();
				clearContext();
				context_bak.moveTo(startX , startY);
				context_bak.lineTo(x  ,startY );
				context_bak.lineTo(x  ,y );
				context_bak.lineTo(startX  ,y );
				context_bak.lineTo(startX  ,startY );
				context_bak.stroke();
			}
		//直线
		}else if(graphType =='line'){
			if(canDraw){
				context_bak.beginPath();
				clearContext();
				context_bak.moveTo(startX , startY);
				context_bak.lineTo(x  ,y );
				context_bak.stroke();
			}
		//画笔
		}else if(graphType == 'pencil'){
			if(canDraw){
				context_bak.lineTo(e.clientX  - canvasLeft ,e.clientY  - canvasTop);
				context_bak.stroke();
			}
		//圆 未画得时候 出现一个小圆
		}else if(graphType == 'circle'){
			clearContext();
			if(canDraw){
				context_bak.beginPath();
				var radii = Math.sqrt((startX - x) *  (startX - x)  + (startY - y) * (startY - y));
				context_bak.arc(startX,startY,radii,0,Math.PI * 2,false);
				context_bak.stroke();
			}else{
				context_bak.beginPath();
				context_bak.arc(x,y,20,0,Math.PI * 2,false);
				context_bak.stroke();
			}
		//涂鸦 未画得时候 出现一个小圆
		}else if(graphType == 'handwriting'){
			if(canDraw){
				context_bak.beginPath();
				context_bak.strokeStyle = color;
				context_bak.fillStyle  = color;
				context_bak.arc(x,y,size*10,0,Math.PI * 2,false);
				context_bak.fill();
				context_bak.stroke();
				context_bak.restore();
			}else{
				clearContext();
				context_bak.beginPath();
				context_bak.fillStyle  = color;
				context_bak.arc(x,y,size*10,0,Math.PI * 2,false);
				context_bak.fill();
				context_bak.stroke();
			}
		//橡皮擦 不管有没有在画都出现小方块 按下鼠标 开始清空区域
		}else if(graphType == 'rubber'){
			context_bak.lineWidth = 1;
			clearContext();
			context_bak.beginPath();
			context_bak.strokeStyle =  '#000000';
			context_bak.moveTo(x - size * 10 ,  y - size * 10 );
			context_bak.lineTo(x + size * 10  , y - size * 10 );
			context_bak.lineTo(x + size * 10  , y + size * 10 );
			context_bak.lineTo(x - size * 10  , y + size * 10 );
			context_bak.lineTo(x - size * 10  , y - size * 10 );
			context_bak.stroke();
			if(canDraw){
				context.clearRect(x - size * 10 ,  y - size * 10 , size * 20 , size * 20);

			}
		}
	};


	//鼠标离开区域以外 除了涂鸦 都清空
	var mouseout = function(){
		if(graphType != 'handwriting'){
			clearContext();
		}
	}

	$(canvas_bak).unbind();
	$(canvas_bak).bind('mousedown',mousedown);
	$(canvas_bak).bind('mousemove',mousemove);
	$(canvas_bak).bind('mouseup',mouseup);
	$(canvas_bak).bind('mouseout',mouseout);
}

function initdraw(){
	//撤销的array
		var cancelList = new Array();
		//撤销的次数
		var cancelIndex = 0;

		$(function(){
			initCanvas();
			$("img")[0].click();
			$("#color input").click(chooseColor);
		});
}

		//初始化
		initCanvas = function(){
			canvas =  document.getElementById("canvas");
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			context = canvas.getContext('2d');
			canvasTop = 100
			canvasLeft = 240

			canvas_bak =  document.getElementById("canvas_bak");
			canvas_bak.width = canvasWidth;
			canvas_bak.height = canvasHeight;
			context_bak = canvas_bak.getContext('2d');
		}

		//下载图片
		downloadImage = function(){
			$("#downloadImage_a")[0].href=canvas.toDataURL();
			$("#downloadImage_a").click();
		}

		//展开颜色选择器
		showColor = function(obj){
			var top = $(obj).offset().top;
			var left = $(obj).offset().left;
			$("#color")[0].style.left = left + "px";;
			$("#color")[0].style.top = top + "px";
			$("#color").show();

		}
		//展开线条大小选择器
		showLineSize = function(obj){

			if($("#line_size").is(":hidden")){
				var top = $(obj).offset().top;
				var left = $(obj).offset().left;
				$("#line_size")[0].style.left = left + $(obj).width() + 5; +  "px";
				$("#line_size")[0].style.top = top   + "px";
				$("#line_size").show();
			}else{
				$("#line_size").hide();
			}
		}

		//选择颜色
		chooseColor = function(obj){
			var objClass = $(this).attr("class");
			$("#chooseColor").attr("class" , "");
			$("#chooseColor").addClass (objClass).addClass('border_nochoose');
			color  = $(this).css('background-color');
			$("#color").hide();

		}

		//选择大小
		chooseLineSize =  function(_size){
			$("#chooseSize").attr("src" , "images/line_size_"+_size+".png");
			size = _size;
			$("#line_size").hide();
		}



		//撤销上一个操作
		cancel = function(){
			cancelIndex++;
			context.clearRect(0,0,canvasWidth,canvasHeight);
			var  image = new Image();
			var index = cancelList.length-1 - cancelIndex  ;
			var url = cancelList[index];
			image.src = url;
			image.onload = function(){
				context.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , canvasWidth , canvasHeight);
			}
		}

		//重做上一个操作
		next = function(){
			cancelIndex--;
			context.clearRect(0,0,canvasWidth,canvasHeight);
			var  image = new Image();
			var index = cancelList.length-1 - cancelIndex  ;
			var url = cancelList[index];
			image.src = url;
			image.onload = function(){
				context.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , canvasWidth , canvasHeight);
			}
		}

		//保存历史 用于撤销
		saveImageToAry = function (){
			cancelIndex = 0;
			var dataUrl =  canvas.toDataURL();
			cancelList.push(dataUrl);
		}







//清空层
var clearContext = function(type){
	if(!type){
		context_bak.clearRect(0,0,canvasWidth,canvasHeight);
	}else{
		context.clearRect(0,0,canvasWidth,canvasHeight);
		context_bak.clearRect(0,0,canvasWidth,canvasHeight);
	}
}
