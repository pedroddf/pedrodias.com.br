var tagMenu, tagBotaoMenu, tagAlpha;
var statuMenu;

function initMenu (){
	statuMenu = false;
	tagMenu = document.getElementById("main-item");
	tagAlpha = document.querySelector(".alpha");
	tagBotaoMenu = document.getElementById("bt-main");
	addClass(tagMenu, "initial");

	tagBotaoMenu.addEventListener("click", cliqueMenu);
}

function cliqueMenu (e){
	if(!statuMenu){
		addClass(tagMenu, "active");
		removeClass(tagMenu, "inactive");
		addClass(tagAlpha, "active");
	}else{
		addClass(tagMenu, "inactive");
		removeClass(tagMenu, "active");
		removeClass(tagAlpha, "active");
	}

	statuMenu =! statuMenu;
	console.log(statuMenu)
}