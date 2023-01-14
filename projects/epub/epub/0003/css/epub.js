/**
	Arquivo para controle de interações de cursos EPUB 2.0
	Desenvolvido por Wallace ALexander Araujo - wallace.araujo@webaula.com.br
**/

var state = clicks = clicksRemove = efeito = 0;

var listaInteracoes = [];
var navegacaoObserve, itemAtual;
var arrastando, elementoAtual;
var marcado = [];
var eventoArrastar = ["mousedown"];
var eventoMove = ["mousemove"];
var eventoSoltar = ["mouseup"];

// Inicializa as funções para controle do epub
function initEpub(){
	controlAnimation();
	controleClicks();
	controleNavegacao();
	controleConteudos();
	controleAba();
	botaoAvancoTela();
	removePlayer();
	controleAudio();
	controleDragDrop();
	controleObjetiva();
	controleLinks();
	controleVideoExterno();

}

// Verifica se todas as interações foram concluídas
function validaFimtela(){

	console.log("Interacoes", listaInteracoes.length , document.querySelectorAll(".concluido").length);

	if(listaInteracoes.length <= document.querySelectorAll(".concluido").length){
		console.log("epub.js -> Fim tela");
		window.top.fimTela();
	}
}

// Controla audio telas
function controleAudio(){
	if(document.querySelectorAll("[class*='saibamais'").length > 0){
		var lista = document.querySelectorAll("[data-releaseactions]");

		for(var i=0, ii=lista.length; i < ii; i++){

			if(/reverseAnimation/gi.test(lista[i].dataset.releaseactions))
				lista[i].addEventListener("mousedown", pauseAudio);
			
			if(/saibamais/gi.test(lista[i].getAttribute("class"))){
				var listClass = lista[i].getAttribute("class").split(" ");
				var idAudio = listClass.busca("saibamais");
				if(idAudio){
					idAudio = ~~idAudio.replace(/\D/gi,"");
					lista[i].setAttribute("audioId", idAudio);
					lista[i].addEventListener("mousedown", executaAudioClick);
				}
			}
		}

	}else{
		window.top.escolheAudioPlayer("som");
		// window.top.audioPlayer.play();
	}
}

function executaAudioClick(e){
	var idAudio = ~~e.currentTarget.getAttribute("audioId");
	window.top.escolheAudioPlayer("som"+idAudio);
	// window.top.audioPlayer.play();
}

function pauseAudio(){
	window.top.audioPlayer.pause();
}

// Adiciona e controla as animações dos itens
function controlAnimation(){
	//var list = document.querySelectorAll("._idGenAnimation");
	var list = document.querySelectorAll("[class*='_idGenAnimation']");

	if(list.length == 0)
		return;

	for(var i=0, ii = list.length; i < ii; i++){
		if(!list[i].classList.contains("concluido"))
			listaInteracoes.push(0);
		list[i].addEventListener("animationend", endAnimation);
	}
}

// Chamado assim que uma animação é finalizada
function endAnimation(e){
	e.currentTarget.classList.add("concluido");
	validaFimtela();
}

function controleConteudos(){
	var list = document.querySelectorAll("[data-idGenObjectState*='item']");

	if(list.length == 0)
	 	return;

	 for(var i=1, ii = list.length; i < ii; i++){
	 	if(!list[i].classList.contains("_idGenButton")){
	 		if(!list[i].classList.contains("concluido"))
	 			listaInteracoes.push(0);
	 	}
	}

	marcaConteudoConcluido();
}

function marcaConteudoConcluido(){
	var list = document.querySelectorAll("[class*='_idGenCurrentState']");

	if(list.length == 0)
		return;

	for(var i=0, ii = list.length; i < ii; i++){
		if(list[i].classList.contains("_idGenCurrentState")){
			list[i].classList.add("concluido");
			var id = list[i].getAttribute("data-idGenObjectState");
			var subList = document.querySelectorAll("[data-releaseactions*='"+id+"']");

			if(subList.length == 0)
				continue;

			for(var j =0, jj=subList.length; j < jj; j++){
				subList[j].classList.add("concluido");
				subList[j].classList.add("clicado");
			}
		}
	}

	validaFimtela();
}

// Controla se todos os clicks foram concluídos
function controleClicks(e){
	var list = document.querySelectorAll("[data-releaseactions]");

	if(list.length == 0)
	 	return;

	 for(var i=0, ii = list.length; i < ii; i++){

	 	if(/_voltar|_avancar/gi.test(list[i].getAttribute("class"))){
			list[i].addEventListener("mousedown", executeRelease);
		}

	 	if(/goToPreviousState/gi.test(list[i].dataset.releaseactions) || /_voltar/gi.test(list[i].getAttribute("class"))){
	 		list[i].addEventListener("mousedown", stopVideosExternos);
	 		continue;
	 	}

	 	if(!list[i].classList.contains("concluido"))
	 		listaInteracoes.push(0);

		list[i].addEventListener("mousedown", executeRelease);

	}
}

function marcaGrupoClicks(){
	
	var list = document.querySelectorAll(".clicado.concluido");
	if(list.length == 0)
		return;

	for(var i =0, ii=list.length; i < ii; i++){
		var id = list[i].getAttribute("data-releaseactions").toString().match(/item[0-9]*/gi);
		var subList = document.querySelectorAll("[data-releaseactions*='"+id+"']");

		if(subList.length == 0)
			continue;

		for(var j =0, jj=subList.length; j < jj; j++){
			subList[j].classList.add("concluido");
			subList[j].classList.add("clicado");
		}

	}

	
}

function executeRelease(e){
	
	if(e.currentTarget.classList.contains("concluido") && !e.currentTarget.classList.contains("clicado")){
		listaInteracoes.splice(0,1);
	}

	e.currentTarget.classList.add("concluido");
	e.currentTarget.classList.add("clicado");
	marcaConteudoConcluido();

	marcaGrupoClicks();

	validaFimtela();

	controleNavegacao();
}

// Remove todo os player de vídeo que estiver com autoplay ativado
function removePlayer(){
	var videos = document.querySelectorAll("video");

	if(videos.length == 0)
		return;

	for(var i=0, ii = videos.length; i < ii; i++){
		if(videos[i].getAttribute("autoplay"))
			videos[i].removeAttribute("controls");
			videos[i].setAttribute("loop","loop");
	}
}

// Controle do recurso de navegação
function controleNavegacao(){

	var listStates = document.querySelectorAll("[data-idGenObjectState^='item']");
	var voltar = document.querySelector("[class*='_voltar']");
	var avancar = document.querySelector("[class*='_avancar']");
        

	if(listStates.length == 0 || !voltar && !avancar)
		return;


	 if(!navegacaoObserve){
	 	navegacaoObserve = setInterval(controleNavegacao, 50);
	 }

	var atual = ~~(document.querySelector("._idGenCurrentState").getAttribute("data-idGenObjectState").replace(/\D/gi,""));

	if(atual == 1){
		 document.querySelector("[class*='_voltar']").style.pointerEvents = "none";
	}else{
		document.querySelector("[class*='_voltar']").style.pointerEvents = "auto";
	}

	if(atual == listStates.length){
		document.querySelector("[class*='_avancar']").style.pointerEvents = "none";
	}else{
		document.querySelector("[class*='_avancar']").style.pointerEvents = "auto";
	}

}

//  Controle de abas
function controleAba(){
	
	var listGeral = document.querySelectorAll("[class*='aba_bt']");
	var list =[]
	for(var i=0; i < listGeral.length; i++){
		 if(!/_aba/gi.test(listGeral[i].parentNode.getAttribute("class"))){
		 	if(!existeItemAba(list, listGeral[i].parentNode))
		 		list.push(listGeral[i].parentNode);
		 }
	}

	if(list.length ==0)
		return;

	var strClass ="transition:all 0.5s linear;-webkit-transition:all 0.5s linear;-o-transition:all 0.5s linear;-ms-transition:all 0.5s linear;-moz-transition:all 0.5s linear;";

	for(var i=0, ii=list.length; i < ii; i++){
		var direcao = obterDirecao(list[i].querySelector("[class*='_aba_bt']"));
		list[i].setAttribute("iniX", ~~list[i].offsetLeft);
		list[i].setAttribute("iniY", ~~list[i].offsetTop);
		list[i].setAttribute("fimPos", obterFim(list[i], direcao));
		list[i].setAttribute("somID", i+1);
		list[i].setAttribute("style",strClass);
		list[i].setAttribute("direcao", direcao);
		list[i].addEventListener("click", abreAba);
		listaInteracoes.push(0);
	}
}

function existeItemAba(list, elemento){
	for(var i=0, ii=list.length; i < ii; i++){
		if(list[i] === elemento)
			return true;
	}

	return false;
}

function obterFim(item, direcao){
	var coords = item.getBoundingClientRect();
	var tam = (/top|bottom/gi).test(direcao) ? ((/top/gi).test(direcao) ? -1 : 1) * coords.height : ((/left/gi).test(direcao) ? -1 : 1) * coords.width;
	return tam;
}

function obterDirecao(botao){
	var baseW = window.parent.document.querySelector("iframe").offsetWidth;
	var baseH = window.parent.document.querySelector("iframe").offsetHeight;

	var coords = botao.getBoundingClientRect();

	var dir = "";

	if(coords.top < 0)
		dir = "bottom";
	else if(coords.bottom > baseH)
		dir = "top";
	else if(coords.left < 0){
		dir = "rigth";
	}else{
		dir = "left";
	}

	return dir;

}

function abreAba(e){
	e.currentTarget.classList.toggle("abre");

	if(!e.currentTarget.classList.contains("concluido")){
		e.currentTarget.classList.add("concluido")
	}

	var direcao = e.currentTarget.getAttribute("direcao");


	var botao = e.currentTarget.querySelector("[class*='aba_bt']");
	var tamBotao = botao.offsetHeight;
	var tamConteudo = ~~e.currentTarget.getAttribute("fimPos");

	var dirAux = (/top|bottom/gi).test(direcao) ? "top" : "left";

	if(e.currentTarget.classList.contains("abre")){
		var movimento = (~~(e.currentTarget.style[dirAux]) + (tamConteudo));
		e.currentTarget.style[dirAux] = movimento+"px";
	}else{
		e.currentTarget.style[dirAux] = e.currentTarget.getAttribute("iniX")+"px";
	}

	validaFimtela();
}

// Controle de botão de avanço de tela
function botaoAvancoTela(){
	var bt_avanco = document.querySelector("[class*='avanca_tela'");

	if(!bt_avanco)
		return;

	listaInteracoes.push(0);

	bt_avanco.addEventListener("mousedown", avancaTela);
}

function avancaTela(){

	listaInteracoes.splice(0,1);

	validaFimtela();

	window.top.avancaFundo();
}

// Drag Drop
function controleDragDrop(){

	var list = document.querySelectorAll("[class*='drag'");

	if(list.length == 0)
		return;

	controleBotoesDD(true);
	regularizaDrop();

}

function normalizaPosicoes(){

	var botoes = document.querySelectorAll("[class*='drag'");
	for(var j=0, jj = botoes.length; j < jj; j++){
		botoes.item(j).style.position = "absolute";
		botoes.item(j).style.top = botoes.item(j).getAttribute("posy")+"px";
		botoes.item(j).style.left = botoes.item(j).getAttribute("posx")+"px";
	}
}

function getPositionAbsolute(obj){
	var st = window.getComputedStyle(obj, null);

	var tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("-moz-transform") || st.getPropertyValue("-ms-transform") || st.getPropertyValue("-o-transform") || st.getPropertyValue("transform");

	var values = tr.split("(")[1].split(")")[0].split(",");

	var coords = {x:values[4], y:values[5]};	

	values[4] = 0;
	values[5] = 0;

	var str = "matrix("+values.join(",")+")";

	obj.setAttribute("posInit", str);

	obj.style.transform = str;
	obj.style.webkitTransform = str;
	obj.style.mozTransform = str;
	obj.style.msTransform = str;
	obj.style.oTransform = str;

	return coords;
}

function regularizaDrop(){

	var botoes = document.querySelectorAll("[class*='drop'");

	for(var j=0, jj = botoes.length; j < jj; j++){
		var coords = getPositionAbsolute(botoes.item(j));
		botoes.item(j).style.left = coords.x+"px";
		botoes.item(j).style.top = coords.y+"px";
		botoes.item(j).setAttribute("data-id", ~~botoes.item(j).getAttribute("class").replace(/\D/gi,""));
	}

	
}

function controleBotoesDD(bl){

	var botoes = document.querySelectorAll("[class*='drag'");


	for(var j=0, jj = botoes.length; j < jj; j++){

		if(bl){

			var coords = getPositionAbsolute(botoes.item(j));

			botoes.item(j).setAttribute("posx", coords.x);
			botoes.item(j).setAttribute("posy", coords.y);
			botoes.item(j).setAttribute("posz", botoes.item(j).style.zIndex);
			botoes.item(j).setAttribute("data-id", ~~botoes.item(j).getAttribute("class").replace(/\D/gi,""));

			listaInteracoes.push(0);

			try{
				document.createEvent("TouchEvent");
				eventoArrastar.push("touchstart");
				eventoSoltar.push("touchend");
				eventoMove.push("touchmove");
			}catch(e){}

			for(var i=0, it=eventoArrastar.length; i < it; i++){
				botoes.item(j).addEventListener(eventoArrastar[i], executa);
			}

			for(var i=0, it=eventoMove.length; i < it; i++){
				document.addEventListener(eventoMove[i], executaMover);
			}

			for(var i=0, it=eventoSoltar.length; i < it; i++){
				document.addEventListener(eventoSoltar[i], soltar);
			}
		}else{
			for(var i=0, it=eventoArrastar.length; i < it; i++){
				botoes.item(j).removeEventListener(eventoArrastar[i], executa);
			}

			for(var i=0, it=eventoMove.length; i < it; i++){
				document.removeEventListener(eventoMove[i], executaMover);
			}

			for(var i=0, it=eventoSoltar.length; i < it; i++){
				document.removeEventListener(eventoSoltar[i], soltar);
			}
		}
	}

	if(bl)
		normalizaPosicoes();
}

function executa(e){
	elementoAtual = e.currentTarget;
	elementoAtual.style.zIndex = 1000;
	arrastando = true;

}

function executaMover(e){
			
	var _x = e.type == "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).clientX : e.clientX;
	var _y = e.type == "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).clientY : e.clientY;
	

	if(arrastando){

		elementoAtual.style.left = _x+"px";
		elementoAtual.style.top = _y+"px";
		
		var st = window.getComputedStyle(elementoAtual, null);
		var tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("-moz-transform") || st.getPropertyValue("-ms-transform") || st.getPropertyValue("-o-transform") || st.getPropertyValue("transform");
		
		var str = "translate(-50%, -50%)";

		elementoAtual.style.transform = str;
		elementoAtual.style.webkitTransform = str;
		elementoAtual.style.mozTransform = str;
		elementoAtual.style.msTransform = str;
		elementoAtual.style.oTransform = str;

	}
}

function soltar(e){

	var listaDrop = document.querySelectorAll("[class*='drop'");

	var dropAtual;
	
	for(var i=0, ii=listaDrop.length; i < ii; i++){


		if(hitTest(elementoAtual, listaDrop.item(i)) && !elementoAtual.getAttribute("marcado")){
			
			elementoAtual.style.left = (parseInt(listaDrop.item(i).offsetLeft) + 1)+"px";
			elementoAtual.style.top = (parseInt(listaDrop.item(i).offsetTop) + 1)+"px";
			//elementoAtual.style.zIndex = elementoAtual.getAttribute("posz");
			elementoAtual.style.zIndex = 1000;
			
			var str = "translate(0, 0)";

			elementoAtual.style.transform = str;
			elementoAtual.style.webkitTransform = str;
			elementoAtual.style.mozTransform = str;
			elementoAtual.style.msTransform = str;
			elementoAtual.style.oTransform = str;

			elementoAtual.setAttribute("marcado", listaDrop.item(i).getAttribute("data-id"));

			marcado[i] = elementoAtual.getAttribute("data-id");

			for(var i=0, it=eventoArrastar.length; i < it; i++){
				elementoAtual.removeEventListener(eventoArrastar[i], executa);
			}

			for(var i=0, it=eventoMove.length; i < it; i++){
				elementoAtual.removeEventListener(eventoMove[i], executaMover);
			}

			for(var i=0, it=eventoSoltar.length; i < it; i++){
				elementoAtual.removeEventListener(eventoSoltar[i], soltar);
			}


			arrastando = false;

			dropAtual = listaDrop.item(i);
			dropAtual.classList.add("marcado");
			
			/*elementoAtual.style.top = (())+"px";
			elementoAtual.style.left = ((~~dropAtual.offsetWidth - (~~elementoAtual.offsetWidth)) * 0.5))+"px";*/
			
			
			var str = "translate("+((~~dropAtual.offsetHeight - (~~elementoAtual.offsetHeight))*0.5)+"px, "+((~~dropAtual.offsetWidth - (~~elementoAtual.offsetWidth))*0.5)+"px)";

			elementoAtual.style.transform = str;
			elementoAtual.style.webkitTransform = str;
			elementoAtual.style.mozTransform = str;
			elementoAtual.style.msTransform = str;
			elementoAtual.style.oTransform = str;


			respostaMarcada(elementoAtual, dropAtual);

			elementoAtual = null;
			break;
		}
	}

	if(elementoAtual){


		/*elementoAtual.style.left = elementoAtual.getAttribute("posx")+"px";
		elementoAtual.style.top = elementoAtual.getAttribute("posy")+"px";
		elementoAtual.style.display = "block";
		elementoAtual.style.zIndex = 1;*/

		/*var str = "translate(0, 0)";

		elementoAtual.style.transform = str;
		elementoAtual.style.webkitTransform = str;
		elementoAtual.style.mozTransform = str;
		elementoAtual.style.msTransform = str;
		elementoAtual.style.oTransform = str;*/

		var str = elementoAtual.getAttribute("posInit");

		

		elementoAtual.style.transform = str;
		elementoAtual.style.webkitTransform = str;
		elementoAtual.style.mozTransform = str;
		elementoAtual.style.msTransform = str;
		elementoAtual.style.oTransform = str;
	}


	elementoAtual = null;
	arrastando = false;

}

function respostaMarcada(drag, drop){
	var marcadoItem = drag.getAttribute("data-id") == drag.getAttribute("marcado");

	
	drag.classList.add(marcadoItem ? "certo" : "errado");
	drag.classList.add("concluido");
	
	var bt_drag = document.querySelectorAll("[class*='drag'");
	var bt_drag_concluido = document.querySelectorAll("[class*='concluido'");
	var bt_drop = document.querySelectorAll("[class*='drop'");
	
	if(bt_drag_concluido.length == bt_drop.length){
		for(var i=0, ii=bt_drag.length; i < ii; i++){
			bt_drag[i].classList.add("concluido");
		}
	}

	validaFimtela();
}


function hitTest(i, e){

	if(!i || !e)
		return false;

	var x2 = parseInt(e.offsetLeft.toString().replace(/\D/gi,""));
	var y2 = parseInt(e.offsetTop.toString().replace(/\D/gi,""));
	var l2 = parseInt(e.offsetWidth.toString().replace(/\D/gi,""));
	var a2 = parseInt(e.offsetHeight.toString().replace(/\D/gi,""));

	var x1 = parseInt(i.offsetLeft.toString().replace(/\D/gi,""));
	var y1 = parseInt(i.offsetTop.toString().replace(/\D/gi,""));

	return (x1 > x2 - l2 && x1 < x2 + l2) && (y1 > y2 - a2 && y1 < y2 + a2);

}


// Questões Objetivas
function controleObjetiva(){	
	var list = document.querySelectorAll("[class*='Objetiva_marcar'");

	if(list.length == 0)
		return;

	listaInteracoes.push(0);

	controleCliqueMarcar(true);

}

function controleCliqueMarcar(bl){
	var list = document.querySelectorAll("[class*='Objetiva_marcar'");

	for(var i=0, ii=list.length; i < ii; i++){
		if(bl)
			list[i].addEventListener("click", marcaOpcao);
		else
			list[i].removeEventListener("click", marcaOpcao);
	}
}

function marcaOpcao(e){
	controleCliqueMarcar(false);
	var bool = (/correta/gi).test(e.currentTarget.getAttribute("class"));
	e.currentTarget.classList.add("concluido");

	e.currentTarget.classList.add(bool ? "certo" : "errado");

	validaFimtela();
}

// Links
function controleLinks(){
	linksObjetos();
	linksTexto();
}

function linksObjetos(){
	var list = document.querySelectorAll("[class*='Clique_links']");
	for(var i=0, ii = list.length; i < ii; i++){
		var dataURL = list[i].getAttribute("data-releaseactions");

		if(!dataURL)
			continue;

		list[i].removeAttribute("data-releaseactions");

		var url = dataURL.match(/http[^\']*/gi);

		list[i].setAttribute("url", url);

		list[i].addEventListener("click", abreLink);
	}
}

function abreLink(e){
	var url = e.currentTarget.getAttribute("url");
	window.open(url);
}

function linksTexto(){
	var list = document.querySelectorAll("a");
	for(var i=0, ii = list.length; i < ii; i++){
		list[i].setAttribute("target", "_blank");
	}
}

// Controle Youtube
function controleVideoExterno(){
	var list = document.querySelectorAll("iframe[src*='youtube']");

	if(list.length == 0)
		return;

	for(var i=0, ii=list.length; i < ii; i++){
		list.item(i).setAttribute("src",list.item(i).getAttribute("src")+"?enablejsapi=1");
	}


	window.top.stopVideosExternos = stopVideosExternos;
}

function stopVideosExternos(){
	var list = document.querySelectorAll("iframe[src*='youtube']");

	for(var i=0, ii=list.length; i < ii; i++){
		list.item(i).contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*')
	}
}

// Funções Array 
Array.prototype.busca = function(termo){
	var regEx = new RegExp(termo,"g");
	for(var i=0, ii=this.length; i < ii; i++){
		if(regEx.test(this[i])){
			return this[i];
		}
	}

	return null;
}

initEpub();