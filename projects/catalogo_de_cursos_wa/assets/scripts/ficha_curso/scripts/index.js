EventDispatcher.prototype.apply(Popup.prototype);

function Popup(elemento) {
	
	var self = this;
	var tagBotoes = elemento.querySelectorAll(".saiba-mais-botao");
	var tagPopup = elemento.querySelector(".saiba-mais-popup");
	var tagConteudos = tagPopup.querySelectorAll(".conteudo");

	self.addEventListener(EventoInteracao.INICIA, preparaInteracao);

	function preparaInteracao() {
		addClass(tagPopup, ClasseCSS.REMOVE);

		for(var i = 0; i < tagBotoes.length; i ++){
			addClass(tagConteudos[i], ClasseCSS.REMOVE);
			addClass(tagBotoes[i], ClasseCSS.CURSOR_CLIQUE);

			tagBotoes[i].id = "botao" + (i + 1);
			tagBotoes[i].addEventListener(EventoInteracao.CLIQUE, abrePopup);
		}
	}

	function abrePopup(e){
		var idAtual = ~~e.target.id.replace(/[^\d]+/g,'');
		var tagFechar = tagConteudos[idAtual - 1].querySelector(".fechar");

		removeClass(tagPopup, ClasseCSS.REMOVE);
		addClass(tagPopup, ClasseCSS.ANIMACAO);
		removeClass(tagConteudos[idAtual - 1], ClasseCSS.REMOVE);

		addClass(tagFechar, ClasseCSS.CURSOR_CLIQUE);		
		tagFechar.addEventListener(EventoInteracao.CLIQUE, fecharPopup);

	}

	function fecharPopup(e){
		addClass(tagPopup, ClasseCSS.REMOVE);

		for(var i = 0; i < tagBotoes.length; i ++){
			addClass(tagConteudos[i], ClasseCSS.REMOVE);
		}
			
	}
}	