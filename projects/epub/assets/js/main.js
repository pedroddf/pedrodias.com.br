(function(window, document){

	var actions, filters, banner;

	window.addEventListener("load", init);

	function init(){
		actions	= new EnableClickContent();
		filters = new FilterContent();
		banner = new Banner();
	}

	// Enable click content EPUB
	function EnableClickContent(){

		var _buttons;

		function init(){
			_buttons = document.querySelector("#interaction").querySelectorAll("li");

			if(_buttons.length == 0)
				return; 

			for(var i=0, ii=_buttons.length; i < ii; i++){
				_buttons[i].addEventListener("click", controlContent);
			}

			window.top.reviewPage = reviewPage;

		}

		function controlContent(e){

			e.preventDefault();

			var isOpen = e.currentTarget.classList.contains("expanded");

			if(!isOpen){
				closeAllContent();
				e.currentTarget.classList.add("expanded");
				e.currentTarget.querySelector("a").classList.add("active");
				openPage(e.currentTarget);
			}else{
				e.currentTarget.classList.remove("expanded");
				e.currentTarget.querySelector("a").classList.remove("active");
			}
		}

		function closeAllContent(){
			for(var i=0, ii=_buttons.length; i < ii; i++){
				_buttons[i].classList.remove("expanded");
				_buttons[i].querySelector("a").classList.remove("active");
				_buttons[i].querySelector("iframe").setAttribute("src", "");
			}
		}

		function openPage(button){
			var url = button.getAttribute("url") || "404.html";
			button.querySelector("iframe").setAttribute("src", "epub/"+url);
		}

		function reviewPage(){
			var button = document.querySelector(".expanded");
			openPage(button);
		}

		this.closeAll = function(){
			closeAllContent();
		}


		init();

	}

	// Control filter content
	function FilterContent(){

		var _buttons = [".bt-silver", ".bt-gold", ".bt-all"];
		var list;

		function init(){

			list = document.querySelector("#interaction").querySelectorAll("li");

			for(var i=0, ii = _buttons.length; i < ii; i++){
				document.querySelector(_buttons[i]).addEventListener("click", filterContent);
				document.querySelector(_buttons[i]).setAttribute("type", _buttons[i].replace(/.bt-/gi,""));
			}
		}

		function filterContent(e){
			e.preventDefault();

			for(var i=0, ii = _buttons.length; i < ii; i++){
				document.querySelector(_buttons[i]).classList.remove("active");
			}

			var type = e.currentTarget.getAttribute("type");
			e.currentTarget.classList.add("active");

			executeFilter(type);
			actions.closeAll();
		}


		function executeFilter(type){
			switch(type){
				case "silver":
				case "gold":
					resetFilter();
					showType(type);
				break;

				default:
					resetFilter();
				break;
			}
		}

		function resetFilter(){
			for(var i=0, ii = list.length; i < ii; i++){
				list[i].classList.remove("filter-hidden");
			}
		}

		function showType(type){
			for(var i=0, ii = list.length; i < ii; i++){
				if(!list[i].querySelector("[class*='"+type+"']"))
					list[i].classList.add("filter-hidden");
			}
		}

		init();

	}

	// Banner
	function Banner(){

		var _images = ["slider_1.jpg", "slider_2.jpg", "slider_3.jpg", "slider_4.jpg"];
		var _dir = "assets/img/";
		var pointer = 0;
		var timer = 10;
		var updateTime;
		var widthSize = 1600;
		var htmlBackground = "";
		var htmlPosition = "";

		function init(){
			for(var i=0, ii = _images.length; i < ii; i++){
				htmlBackground += "url("+_dir+""+_images[i]+")"+(i < ii - 1 ? "," : "");
				htmlPosition += (i * widthSize)+"px top"+(i < ii - 1 ? "," : "");
			}

			var effect = "all 1s linear";

			document.querySelector("#header").style.webkitTransition = effect;
			document.querySelector("#header").style.mozTransition = effect;
			document.querySelector("#header").style.oTransition = effect;
			document.querySelector("#header").style.msTransition = effect;
			document.querySelector("#header").style.transition = effect;

			document.querySelector("#header").style.backgroundImage = htmlBackground;
			document.querySelector("#header").style.backgroundPosition = htmlPosition;

			render();
		}

		function update(){
			pointer++;
			if(pointer >= _images.length)
				pointer = 0;

			var htmlPosition = "";

			for(var i=0, ii = _images.length; i < ii; i++){
				htmlPosition += ((i == pointer ? 0 : i - pointer) * ( widthSize))+"px top"+(i < ii - 1 ? "," : "");
			}

			document.querySelector("#header").style.backgroundPosition = htmlPosition;

			render();
		}

		function render(){

			updateTime = setTimeout(update, timer * 1000);	
		}

		init();
	}

})(window, document);