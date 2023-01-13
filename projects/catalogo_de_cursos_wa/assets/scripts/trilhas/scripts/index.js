EventDispatcher.prototype.apply(Controle.prototype);
EventDispatcher.prototype.apply(Trilha.prototype);

function Controle(elemento) {
	var self = this;
	var trilhas = [];
	var tagTilhla = elemento.querySelectorAll(".trilha");

	self.addEventListener(EventoInteracao.INICIA, iniciaControle);

	function iniciaControle(e){
		for(var i = 0; i < tagTilhla.length; i++){
			trilhas[i] = new Trilha(tagTilhla[i]);
			trilhas[i].addEventListener(EventoInteracao.ATIVO, desativaItens);
			trilhas[i].dispatchEvent({type: EventoInteracao.INICIA});
		}
	}

	function desativaItens(e){
		for(var i = 0; i < tagTilhla.length; i++){
			if(trilhas[i] != e.target){
				trilhas[i].dispatchEvent({type:EventoInteracao.DESATIVA});
			}
		}
	}
}

function Trilha(elemento) {
	
	var self = this;
	var ativo;
	var navegacaoCriada;
	var exibirDetalhes;
	var tagDetalhes = elemento.querySelector(".detalhes");
	var botaoDestalhes = elemento.querySelector(".botao-detalhes");

	self.addEventListener(EventoInteracao.INICIA, preparaTrilha);

	function preparaTrilha() {
		ativo = false;
		navegacaoCriada = false;
		exibirDetalhes = true;
		
		botaoDestalhes.addEventListener(EventoInteracao.CLIQUE, abreDetalhes);

		self.addEventListener(EventoInteracao.DESATIVA, fechaDetalhes);		
	}

	function abreDetalhes(e){

		$(tagDetalhes).slideToggle("fast");

		if(!navegacaoCriada){
			navegacaoCriada = true;
			criaNavegacao();
		}
		
		ativo = !ativo;
		
		if(ativo){
			self.dispatchEvent({type:EventoInteracao.ATIVO});
		}		
	}

	function fechaDetalhes(e){

		$(tagDetalhes).slideUp("fast");
		ativo = false;		
	}

	function criaNavegacao() {
		$(elemento).find(".slider").flexisel({
			clone:false,
	        visibleItems: 4,           
	        enableResponsiveBreakpoints: true,
	        responsiveBreakpoints: { 
	            portrait: { 
	                changePoint:480,
	                visibleItems: 1
	            }, 
	            landscape: { 
	                changePoint:640,
	                visibleItems: 2
	            },
	            tablet: { 
	                changePoint:768,
	                visibleItems: 3
	            }
	        }
	    });
	}
}	