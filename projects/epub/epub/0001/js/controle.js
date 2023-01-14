/*
 * Script controlador de interações de telas
 * @author Matheus Melato <matheus.melato@webaula.com.br> [AS2 2011]
 * @author Hudson Rios <hudson.rios@webaula.com.br> [JS 2015]
 */

EventDispatcher.prototype.apply(Conteudo.prototype);
EventDispatcher.prototype.apply(Item.prototype);

function Conteudo(elemento, finalizou) {
	var self = this;
	var indiceItem = 0;
	var itens = [];

	self.addEventListener(EventoInteracao.INICIA, carregaItens);
	
	ocultaItens();

	function ocultaItens() {
		var elementos = elemento.children;
		var nome;

		for (var i = 0; i < elementos.length; i++) {
			if (!elementos[i].dataset.nome) {
				continue;
			}
			
			nome = elementos[i].dataset.nome.replace(/\d/gi, "");

			if (getNomesPermitidos().toString().search(nome) != -1) {
				if (nome != ESTATICO) {
					addClass(elementos[i], ClasseCSS.OCULTA);
				}

				itens.push(elementos[i]);
			}
		}

		itens.sort(ordenaItens);
	}

	function ordenaItens(e1, e2) {
		return ~~e1.dataset.nome.replace(/\D/gi, "") - ~~e2.dataset.nome.replace(/\D/gi, "");
	}

	function carregaItens(e) {
		for (var i = 0; i < itens.length; i++) {
			itens[i] = new Item(i + 1, itens[i], false);
		}

		executaItem();
	}

	function executaItem() {
		var item = itens[indiceItem];

		if (item) {
			item.addEventListener(EventoInteracao.FINALIZA, fimItem);

			item.dispatchEvent({type:EventoInteracao.INICIA});
		} else {
			finalizaConteudo();
		}
	}

	function fimItem(e) {
		e.target.removeEventListener(e.type, arguments.callee);

		indiceItem++;
		executaItem();
	}

	function finalizaConteudo() {
		finalizou = true;

		self.dispatchEvent({type:EventoInteracao.FINALIZA});
	}
}

function Item(id, elemento, finalizou) {
	var self = this;
	var interacoes = [];
	var indiceInteracao = 0;

	self.addEventListener(EventoInteracao.INICIA, executaInteracao);

	function verificaAcoes() {
		interacoes.push(new Exibicao(elemento, true));

		if (elemento.dataset.acao == "clique") {
			interacoes.push(new Clique(elemento, true, finalizou));
		}

		if (elemento.dataset.acao == "atividadeMarcar") {
			interacoes.push(new AtividadeMarcar(elemento, finalizou));
		}

		if (elemento.dataset.acao == "atividadeArrastar") {
			interacoes.push(new AtividadeArrastar(elemento, finalizou));
		}

		if (elemento.dataset.acao == "navegacao") {
			interacoes.push(new Navegacao(elemento, finalizou));
		} else {
			interacoes.push(new Conteudo(elemento, finalizou));
		}
	}

	function executaInteracao(e) {
		var interacao = interacoes[indiceInteracao];

		if (interacao) {
			interacao.addEventListener(EventoInteracao.FINALIZA, fimInteracao);
			
			interacao.dispatchEvent({type:EventoInteracao.INICIA});
		} else {
			fimItem();
		}
	}

	function fimInteracao(e) {
		e.target.removeEventListener(e.type, arguments.callee);
		
		indiceInteracao++;
		executaInteracao();
	}

	function fimItem() {
		finalizou = true;
		
		self.dispatchEvent({type:EventoInteracao.FINALIZA});
	}

	verificaAcoes();
}

var Mensagem = {
	alvo: null,

	exibe: function (elemento) {
		if (Mensagem.alvo) {
			Mensagem.oculta(Mensagem.alvo);
		}

		Mensagem.alvo = elemento;

		addClass(elemento, ClasseCSS.DESTAQUE);

		console.log("Hint: " + elemento.dataset.nome);
	},

	oculta: function (elemento) {
		if (elemento == Mensagem.alvo) {
			removeClass(elemento, ClasseCSS.DESTAQUE);

			Mensagem.alvo = null;

			console.log("Hint: Apagou " + elemento.dataset.nome);
		}
	}
};