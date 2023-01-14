/*
 * Script de interações de telas
 * @author Matheus Melato <matheus.melato@webaula.com.br> [AS2 2011]
 * @author Hudson Rios <hudson.rios@webaula.com.br> [JS 2015]
 */

EventDispatcher.prototype.apply(Exibicao.prototype);
EventDispatcher.prototype.apply(Clique.prototype);
EventDispatcher.prototype.apply(Navegacao.prototype);
EventDispatcher.prototype.apply(AtividadeMarcar.prototype);
EventDispatcher.prototype.apply(AtividadeArrastar.prototype);

var ALPHA = "alpha";
var BAIXO = "baixo";
var CIMA = "cima";
var CRESCE = "cresce";
var DIREITA = "direita";
var ESQUERDA = "esquerda";
var ESTATICO = "estatico";
var ITEM = "item";

var TEMPO_ANIMACAO = 1;

function getNomesPermitidos() {
	return [ALPHA, BAIXO, CIMA, CRESCE, DIREITA, ESQUERDA, ESTATICO, ITEM];
}

function Exibicao(elemento, exibe) {
	var self = this;
	var nome = elemento.dataset.nome.replace(/\d/gi, "").toLowerCase();

	self.addEventListener(EventoInteracao.INICIA, iniciaExibicao);

	function iniciaExibicao(e) {
		controlaExibicao();
	}

	function controlaExibicao() {
		if (exibe) {
			exibeItem();
		} else {
			ocultaItem();
		}
	}

	function exibeItem() {
		removeClass(elemento, ClasseCSS.OCULTA);
		addClass(elemento, nome);

		if (nome == ESTATICO) {
			finalizaExibicao();
		} else {
			setTimeout(finalizaExibicao, TEMPO_ANIMACAO * 1000);
		}
	}

	function ocultaItem() {
		addClass(elemento, ClasseCSS.OCULTA);

		setTimeout(finalizaExibicao, TEMPO_ANIMACAO * 1000);
	}

	function finalizaExibicao() {
		removeClass(elemento, nome);

		self.dispatchEvent({type:EventoInteracao.FINALIZA});
	}
}

function Clique(elemento, desabilitar, finalizou) {
	var self = this;

	self.addEventListener(EventoInteracao.INICIA, iniciaClique);
	self.addEventListener(EventoInteracao.HABILITA, iniciaClique);
	self.addEventListener(EventoInteracao.DESABILITA, desabilitaClique);

	function iniciaClique(e) {
		controlaClique(true);
	}

	function desabilitaClique(e) {
		controlaClique(false);
	}

	function controlaClique(habilitar) {
		if (habilitar) {
			elemento.addEventListener("click", finalizaClique);

			addClass(elemento, ClasseCSS.CURSOR_CLIQUE);

			if (!finalizou) {
				Mensagem.exibe(elemento);
			}
		} else {
			elemento.removeEventListener("click", finalizaClique);

			removeClass(elemento, ClasseCSS.CURSOR_CLIQUE);

			if (!finalizou) {
				Mensagem.oculta(elemento);
			}
		}
	}

	function finalizaClique(e) {
		if (desabilitar) {
			controlaClique(false);
		}

		finalizou = true;

		self.dispatchEvent({type:EventoInteracao.FINALIZA});
	}
}

function Navegacao(elemento, finalizou) {
	var self = this;

	var avancar = elemento.querySelector("[data-nome='avancar']");
	var voltar = elemento.querySelector("[data-nome='voltar']");
	var conteudos = elemento.querySelectorAll("[data-nome^='conteudo'");

	var cliqueAvancar;
	var cliqueVoltar;
	var conteudoAtual;

	var idInicial = 0;
	var idAtual = idInicial;
	var idFinal = conteudos.length - 1;

	var idMaximo = idInicial;

	removeObjetos();
	preparaNavegacao();
	preparaConteudo();

	self.addEventListener(EventoInteracao.INICIA, iniciaNavegacao);

	function iniciaNavegacao() {
		controlaConteudo();
	}

	function preparaConteudo() {
		conteudoAtual = new Conteudo(conteudos[idAtual], idMaximo > idAtual || finalizou);
	}

	function preparaNavegacao() {
		addClass(avancar, ClasseCSS.DESABILITA);
		addClass(voltar, ClasseCSS.DESABILITA);

		cliqueAvancar = new Clique(avancar, true, finalizou);
		cliqueVoltar = new Clique(voltar, true, true);
	}

	function controlaConteudo() {
		if (!conteudoAtual) {
			preparaConteudo();
		}

		conteudoAtual.addEventListener(EventoInteracao.FINALIZA, finalizaConteudo);
		conteudoAtual.dispatchEvent({type:EventoInteracao.INICIA});
	}

	function finalizaConteudo() {
		idMaximo = Math.max(idMaximo, idAtual + 1);

		if (idAtual == idFinal) {
			finalizaNavegacao();
		}

		controlaNavegacao();
	}

	function controlaNavegacao() {
		if (!cliqueAvancar || !cliqueVoltar) {
			preparaNavegacao();
		}

		if (idAtual !== idInicial) {
			removeClass(voltar, ClasseCSS.DESABILITA);

			cliqueVoltar.addEventListener(EventoInteracao.FINALIZA, voltaConteudo);
			cliqueVoltar.dispatchEvent({type:EventoInteracao.INICIA});
		}

		if (idAtual !== idFinal) {
			removeClass(avancar, ClasseCSS.DESABILITA);

			cliqueAvancar.addEventListener(EventoInteracao.FINALIZA, avancaConteudo);
			cliqueAvancar.dispatchEvent({type:EventoInteracao.INICIA});
		}
	}

	function voltaConteudo(e) {
		idAtual--;

		removeObjetos();
		preparaNavegacao();
		controlaConteudo();
	}

	function avancaConteudo(e) {
		idAtual++;

		removeObjetos();
		preparaNavegacao();
		controlaConteudo();
	}

	function removeObjetos() {
		if (cliqueAvancar || cliqueVoltar) {
			cliqueAvancar.dispatchEvent({type:EventoInteracao.DESABILITA});
			cliqueVoltar.dispatchEvent({type:EventoInteracao.DESABILITA});
		}

		for (var i = 0; i < conteudos.length; i++) {
			if (i != idAtual) {
				addClass(conteudos[i], ClasseCSS.REMOVE);
			} else {
				removeClass(conteudos[i], ClasseCSS.REMOVE);
			}
		}

		delete cliqueAvancar;
		cliqueAvancar = null;

		delete cliqueVoltar;
		cliqueVoltar = null;

		delete conteudoAtual;
		conteudoAtual = null;
	}

	function finalizaNavegacao() {
		finalizou = true;

		self.dispatchEvent({type:EventoInteracao.FINALIZA});
	}

}

function AtividadeMarcar(elemento, finalizou) {
	var self = this;
	var gabarito = ~~elemento.dataset.gabarito;

	if(!window.top.questaoConcluida())
		self.addEventListener(EventoInteracao.INICIA, iniciaAtividade);
	else
		self.addEventListener(EventoInteracao.INICIA, atividadeFinalizada);

	function iniciaAtividade(e) {
		controleOpcoes(true);
	}

	function atividadeFinalizada(e){
		var marcado = parseInt(window.top.obterMarcado().toString());
		var opcoes = elemento.querySelectorAll(".opcao");
		addClass(opcoes[marcado - 1], "erro");
		
		if(window.top.tentativasConcluidas() || window.top.calculaPocentagemNota() > 70){
			removeClass(opcoes[gabarito - 1], "erro");
			addClass(opcoes[gabarito - 1], "correto");
		}

		if(window.top.ultimaQuestao()){
			criaBotaoFinalizar();
		}else{
			finalizaAtividade();
		}
	}

	function controleOpcoes(bl){
		var opcoes = elemento.querySelectorAll(".opcao");
		for(var i=0, ii = opcoes.length; i < ii; i++){
				var item = opcoes[i];
			if(bl){
				item.dataset.ref = i+1;
				item.addEventListener("click", marcarOpcao);
				addClass(item, "ativo");
			}else{
				item.removeEventListener("click", marcarOpcao);
				removeClass(item, "ativo");
			}
		}
	}

	function marcarOpcao(e){
		controleOpcoes(false);
		var id = ~~e.currentTarget.dataset.ref;
		var opcoes = elemento.querySelectorAll(".opcao");
		addClass(opcoes[id - 1], id == gabarito ? "correto" : "erro");

		if(window.top.tentativasConcluidas() || window.top.calculaPocentagemNota() > 70){
			removeClass(opcoes[gabarito - 1], "erro");
			addClass(opcoes[gabarito - 1], "correto");
		}

		window.top.gravaNota(id.toString() == gabarito.toString(), id);

		if(window.top.ultimaQuestao()){
			criaBotaoFinalizar();
		}else{
			finalizaAtividade();
		}
	}

	function criaBotaoFinalizar(){
		console.log("#$",window.top.calculaPocentagemNota() , window.top.tentativasConcluidas())
		if(window.top.calculaPocentagemNota() < 70 || !window.top.tentativasConcluidas()){
			var bt_finalizar = document.createElement("div");
			bt_finalizar.setAttribute("id","bt-finalizar");
			// bt_finalizar.innerHTML = "Finalizar";
			bt_finalizar.addEventListener("click", abreFeedback);
			document.body.appendChild(bt_finalizar);
		}else{
			finalizaAtividade();
		}
	}

	function abreFeedback(e){
		var bloqueador = document.createElement("div");
		bloqueador.setAttribute("id","bloqueador-atividade");
		var caixafeed = document.createElement("div");
		caixafeed.setAttribute("id","feedback-atividade");
		caixafeed.setAttribute("class", window.top.calculaPocentagemNota() >= 70 ? "correto" : !window.top.tentativasConcluidas() ? "incorreto-tentativa1" : "incorreto-tentativa2");

		var caixatitulo = document.createElement("div");
		caixatitulo.setAttribute("id","feedback-titulo");
		caixatitulo.innerHTML = "Feedback";

		var caixatexto = document.createElement("div");
		caixatexto.setAttribute("id","feedback-texto");

		var str_feedback;

		if(caixafeed.getAttribute("class") == "correto"){
			str_feedback = "<p class='titulo'>Parabéns!</p>";
			str_feedback +="<div class='texto'>Você acertou "+window.top.calculaPocentagemNota()+"% das questões.<br>Está preparado para aplicar os conhecimentos no seu dia a dia.</div>";
		}else if(/tentativa1/gi.test(caixafeed.getAttribute("class"))){
			str_feedback = "<p class='titulo'>Resta uma tentativa</p>";
			str_feedback +="<div class='texto'>Ainda não foi o suficiente!<br>Você acertou "+window.top.calculaPocentagemNota()+"% das questões! Você tem mais uma chance. Revise o conteúdo e responda com atenção.</div>";
		}else{
			str_feedback = "<p class='titulo'>Você Falhou!</p>";
			str_feedback +="<div class='texto'>Que pena! Você acertou apenas "+window.top.calculaPocentagemNota()+"% das questões!<br>Releia o conteúdo em que estiver com dúvidas e tente novamente.</div>";
		}

		caixatexto.innerHTML = str_feedback;

		caixafeed.appendChild(caixatitulo);
		caixafeed.appendChild(caixatexto);

		if(window.top.calculaPocentagemNota() < 70 && !window.top.tentativasConcluidas()){
			var bt_refazer = document.createElement("div");
			// bt_refazer.innerHTML = "Refazer";
			bt_refazer.setAttribute("id","refazer-atividade");
			bt_refazer.addEventListener("click", refazerAvalicao);
			caixafeed.appendChild(bt_refazer);
		}else{
			finalizaAtividade();
		}

		bloqueador.appendChild(caixafeed);
		document.body.appendChild(bloqueador);
	}

	function refazerAvalicao(){
		window.top.refazerAvaliacao();
	}

	function finalizaAtividade(e) {

		finalizou = true;

		self.dispatchEvent({type:EventoInteracao.FINALIZA});
	}
}

function AtividadeArrastar(elemento, finalizou){
		var self = this;
		var gabarito = elemento.getAttribute("gabarito").split(",");
		var marcado = [];
		var eventoMove;
		var eventoArrastar;
		var eventoSoltar;
		var elementoAtual;
		var arrastando;
		
		self.addEventListener(EventoInteracao.INICIA, iniciaAtividade);

		
		function iniciaAtividade(){
			eventoArrastar = ["mousedown"];
			eventoMove = ["mousemove"];
			eventoSoltar = ["mouseup"];

			geraID();
			controleBotoes(true);
			
		}
		
		function finalizaAtividade(){
			finalizou = true;
			self.dispatchEvent({type:EventoInteracao.FINALIZA});
		}
		
		function geraID(){
			var listaDrag = elemento.querySelectorAll(".drag");

			for(var i=0, ii=listaDrag.length; i < ii; i++){
				listaDrag.item(i).setAttribute("data-id", i);
			}
		}

		function controleBotoes(bl){
			var botoes = elemento.querySelectorAll(".drag");

			for(var j=0, jj = botoes.length; j < jj; j++){

				if(bl){

					botoes.item(j).setAttribute("posx", botoes.item(j).offsetLeft);
					botoes.item(j).setAttribute("posy", botoes.item(j).offsetTop);
					botoes.item(j).setAttribute("posz", botoes.item(j).zIndex);

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

		function normalizaPosicoes(){

			var botoes = elemento.querySelectorAll(".drag");
			for(var j=0, jj = botoes.length; j < jj; j++){
				botoes.item(j).style.position = "absolute";
				botoes.item(j).style.top = botoes.item(j).getAttribute("posy")+"px";
				botoes.item(j).style.left = botoes.item(j).getAttribute("posx")+"px";
			}
		}

		function executa(e){
	
			elementoAtual = e.currentTarget;
			elementoAtual.style.zIndex = 1000;
			arrastando = true;

		}

		function soltar(e){

			var listaDrop = elemento.querySelectorAll(".drop");

			var dropAtual;
			
			for(var i=0, ii=listaDrop.length; i < ii; i++){

				if(hitTest(elementoAtual, listaDrop.item(i)) && !listaDrop.item(i).getAttribute("marcado")){
					
					elementoAtual.style.left = (parseInt(listaDrop.item(i).offsetLeft) + 1)+"px";
					elementoAtual.style.top = (parseInt(listaDrop.item(i).offsetTop) + 1)+"px";
					elementoAtual.style.zIndex = elementoAtual.getAttribute("posz");

					elementoAtual.setAttribute("marcado", i);
					listaDrop.item(i).setAttribute("marcado", elementoAtual.getAttribute("data-id"));

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


					elementoAtual.style.display = "none";
					dropAtual = listaDrop.item(i);
					addClass(dropAtual, "marcado")

					respostaMarcada(elementoAtual, dropAtual);

					// elementoAtual.getAttribute("data-id") == gabarito[obterDropId(listaDrop)]

					elementoAtual = null;
					break;
				}
			}

			if(elementoAtual){
				elementoAtual.style.left = elementoAtual.getAttribute("posx")+"px";
				elementoAtual.style.top = elementoAtual.getAttribute("posy")+"px";
				elementoAtual.style.display = "block";
				elementoAtual.style.zIndex = 1;
			}

			elementoAtual = null;
			arrastando = false;

			if(elemento.querySelector(".areaDrop").getAttribute("class").indexOf("ativo") != -1)
				removeClass(elemento.querySelector(".areaDrop"), "ativo");


			confirmaResposta();

		}

		function obterDropId(listaDrop){
			var ref = -1;
			for(var i=0, ii=listaDrop.length; i < ii; i++){
				if(hitTest(elementoAtual, listaDrop.item(i)))
					ref = i;
			}
			return ref;
		}


		function executaMover(e){
			
			var _x = e.type == "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).clientX : e.clientX;
			var _y = e.type == "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).clientY : e.clientY;
			

			if(arrastando){
				
				if(elemento.querySelector(".areaDrop").getAttribute("class").indexOf("ativo") == -1){
					addClass(elemento.querySelector(".areaDrop"), "ativo");
				}

				console.log(_x, _y);

				 // elementoAtual.style.left = (_x - (elementoAtual.offsetWidth * 0.5) )+"px";
				 // elementoAtual.style.top = (_y - (elementoAtual.offsetHeight * 0.5) )+"px";

				 elementoAtual.style.left = (e.type == "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).pageX : e.pageX - e.type == "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).screenX : e.screenX)+"px";
				 elementoAtual.style.top = (e.type == "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).pageY : e.pageY - e.type == "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).screenY : e.screenY )+"px";

			}
		}

		function respostaMarcada(drag, drop){
			var marcadoItem = drag.getAttribute("data-id") == drag.getAttribute("marcado");
			
			drop.classList.add(marcadoItem ? "correto" : "erro");
		}



		function confirmaResposta() {

			if(marcado.toString().replace(/\D/gi,"").length == gabarito.length){
				addClass(elemento.querySelector(".areaDrop"), "ativo");
				finalizaAtividade();
			}
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

		
	}