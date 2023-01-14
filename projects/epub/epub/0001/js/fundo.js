/*
 * Script controlador do fundo e seus assets
 * @author Marcelo Silva <marcelo@webaula.com.br> [AS2]
 * @author Matheus Melato <matheus.melato@webaula.com.br> [AS2 UPDATE 2011]
 * @author Hudson Rios <hudson.rios@webaula.com.br> [JS 2015]
 */

window.onload = init;
window.onbeforeunload = window.onpagehide = window.onunload = fechouJanela;
window.onresize = window.onorientationchange = controleEscala;

// Contador para mensagens de log
var contTrace = 0;

// Armazena a API se houver
var api = findAPI(window);

// Assets e Fundo
var fundo;
var menu;

function init(event) {
	if (api != null) {
		loadPage();

		verificaScorm();
	} else {
		carregaCurso();
	}
}

function verificaScorm() {
	if (LMSIsInitialized()) {
		carregaCurso();
	} else {
		setTimeout(verificaScorm, 200);
	}
}

function carregaCurso() {
	fundo = new Fundo(document, api != null);
	menu = new Menu(document);
	controleEscala();
}

function fechouJanela(event) {
	window.onbeforeunload = null;
	window.onpagehide = null;
	window.onunload = null;

	if (api != null) {
		unloadPage();								
	}
}

function controleEscala(){
	var mW = 1024;
	var aW = window.innerWidth;
	var sW = mW < aW ? 1 :(aW / mW);
	var mH = 600;
	var aH = window.innerHeight;
	var sH = mH < aH ? 1 :(aH / mH);

	var escala =  Math.min(sW, sH);

	var style = "-webkit-transform: translate(-50%, -50%) scale("+escala+");-ms-transform: translate(-50%, -50%) scale("+escala+");-o-transform: translate(-50%, -50%) scale("+escala+");transform: translate(-50%, -50%) scale("+escala+");"
	document.querySelector("#wa-fundo").setAttribute("style", style);
}

function Fundo(escopo, rodaLMS) {
	EventDispatcher.prototype.apply(Fundo.prototype);

	var self = this;

	// Determina o bloqueio de avanço de tela quando a mesma não foi finalizada
	var navBloqueada = true;

	// Variáveis para controle do conteúdo
	var moduloAtual = 1;
	var topicoAtual = 1;
	var telaAtual = 1;
	var porcentagemConcluida = 0;

	var tentativas = 1;
	var maxTentativas = 3;
	var listaAvaliacao;
	var notas = [];

	var totalTelas;
	var telasVistas;

	var urlAtual;

	// Armazena elementos do index
	var tagAbertura = escopo.querySelector("#wa-abertura");
	var tagIniciar = escopo.querySelector(".abertura-iniciar");
	
	var tagFundo = escopo.querySelector("#wa-fundo");
	var tagPreloader = escopo.querySelector("#preloader-tela");
	var tagTela = escopo.querySelector("#frame-tela");
	var tagTitulo = escopo.querySelector(".fundo-titulo");
	var tagSubtitulo = escopo.querySelector(".fundo-subtitulo");
	var tagTelas = escopo.querySelector(".fundo-telas");
	var tagMenu = escopo.querySelector(".fundo-menu");
	var tagAjuda = escopo.querySelector(".fundo-ajuda");
	var tagAvancar = escopo.querySelector(".fundo-avancar");
	var tagVoltar = escopo.querySelector(".fundo-voltar");
	var tagUsuario = escopo.querySelector(".fundo-usuario");
	var tagPorcentagem = escopo.querySelector(".fundo-porcentagem");

	var tagAssets = escopo.querySelector("#wa-assets");
	var assetAjuda = escopo.querySelector("#asset-ajuda");
	var assetMenu = escopo.querySelector("#asset-menu");

	// Armazena os dados gravados no LMS
	var lessonLocation = getLMSValue("cmi.core.lesson_location");
	var lessonStatus = getLMSValue("cmi.core.lesson_status");
	var studentName = getLMSValue("cmi.core.student_name") || "RIOGaleao" ;
	var suspendData = getLMSValue("cmi.suspend_data");

	// Adiciona eventos relativos ao fundo
	self.addEventListener(EventoFundo.MUDOU_TELA, mudouTela);
	self.addEventListener(EventoFundo.MUDOU_TOPICO, mudouTopico);

	if (tagAbertura) {
		trace("Abertura encontrada. Exibindo...");

		if (tagIniciar) {
			tagIniciar.disabled = false;

			tagIniciar.addEventListener("click", finalizaAbertura)
		} else {
			setTimeout(finalizaAbertura, 3000);
		}
	} else {
		trace("Abertura não encontrada.");
		
		finalizaAbertura();
	}

	function getLMSValue(campo) {
		if (rodaLMS) {
			return doLMSGetValue(campo);
		}

		return "";
	}

	function setLMSValue(campo, valor, commit) {
		var resultado = "";

		if (rodaLMS) {
			resultado = doLMSSetValue(campo, valor);

			if (commit && resultado == "true") {
				doLMSCommit();
			}
		}

		return resultado;
	}

	function finalizaAbertura(event) {
		if (event) {
			event.target.removeEventListener(event.type, arguments.callee);

			tagIniciar.disabled = true;
		}

		if (tagAbertura) {
			addClass(tagAbertura, ClasseCSS.REMOVE);
		}

		removeClass(tagFundo, ClasseCSS.OCULTA);

		defineDadosCurso();
	}

	function defineDadosCurso() {
		trace("Definindo dados do curso...");

		moduloAtual = getQueryStringValue("modulo") || 1;
		topicoAtual = getQueryStringValue("topico") || 1;
		telaAtual = getQueryStringValue("tela") || 1;

		totalTelas = curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas.length;

		trace("Dados do curso definidos. Verificando dados do LMS...");

		geraListaAvaliacao();
		atualizaChamadasGlobais();
		separaDadosLMS();
	}

	function atualizaChamadasGlobais() {
		window.top.curso = curso;
		window.top.moduloAtual = moduloAtual;
		window.top.topicoAtual = topicoAtual;
		window.top.telaAtual = telaAtual;
		window.top.telasVistas = telasVistas;

		window.top.fimTela = fimTela;
		window.top.avancaFundo = avancaFundo;
		window.top.converteTelaAtual = converteTelaAtual;
		window.top.converteTotalTelas = converteTotalTelas;

		window.top.gravaNota = gravaNota;
		window.top.ultimaQuestao = ultimaQuestao;
		window.top.calculaPocentagemNota = calculaPocentagemNota;
		window.top.questaoConcluida = questaoConcluida;
		window.top.refazerAvaliacao = refazerAvaliacao;
		window.top.obterMarcado = obterMarcado;
		window.top.tentativasConcluidas = tentativasConcluidas;
	}

	function separaDadosLMS() {
		if (isEmpty(lessonLocation)) {
			trace("Dados do LMS não encontrados. Separando novos dados...");

			telasVistas = [];

			for (var i = 0; i < parseInt(converteTotalTelas()); i++) {
				telasVistas.push("0");
			}
		} else {
			trace("Dados do LMS encontrados. Separando...");

			if (lessonStatus !== "completed") {
				telaAtual = ~~lessonLocation.split(";")[0];

				if (telaAtual > totalTelas) {
					telaAtual = totalTelas;
				}
			}

			telasVistas = lessonLocation.split(";")[1].split("").slice(0, totalTelas);
			tentativas = parseInt(lessonLocation.split(";")[2]);
			notas = isEmpty(lessonLocation.split(";")[3]) ? lessonLocation.split(";")[3].split("") : [];
		}

		atribuiEventos();
		calculaPorcentagem();

		trace("Dados separados. Iniciando conteúdo.");

		setTimeout(controlaTelas, 100);
		// setInterval(verificaTelas, 100);
	}


	function atribuiEventos() {
		tagAvancar.addEventListener("click", avancaTela);
		
		tagVoltar.addEventListener("click", voltaTela);

		tagMenu.addEventListener("click", exibeMenu);

		tagAjuda.addEventListener("click", exibeAjuda);
	}

	function geraListaAvaliacao(){
		listaAvaliacao = [];
		var refID = 0;
		var telaGlobal = 1;
		for (var i = 1; i <= curso.modulos[moduloAtual - 1].topicos.length; i++) {
			for (var j = 1; j <= curso.modulos[moduloAtual - 1].topicos[i - 1].telas.length; j++) {
				if(curso.modulos[moduloAtual - 1].topicos[i - 1].telas[j - 1].html){
					listaAvaliacao.push({id:refID, telaConvertida:telaGlobal, topico:i, tela:j});
					refID++;
				}
				telaGlobal++;
			}
		}

	}

	function obterReferencia(){
		for(var i=0, ii=listaAvaliacao.length; i < ii; i++){
			if(telaAtual == listaAvaliacao[i].tela){
				return listaAvaliacao[i];
			}
		}

		return null;
	}

	function ultimaQuestao(){
		return listaAvaliacao[listaAvaliacao.length - 1].tela == telaAtual && listaAvaliacao[listaAvaliacao.length - 1].topico == topicoAtual;
	}

	function questaoConcluida(){
		var referenciaQuestao = obterReferencia();
		return notas[referenciaQuestao.id];
	}

	function obterMarcado(){
		var referenciaQuestao = obterReferencia();
		return notas[referenciaQuestao.id].split(":")[1].toString();
	}

	function calculaPocentagemNota(){
		var acertos = 0;
		for(var i=0, ii=notas.length; i < ii; i++){
			if(notas[i].split(":")[0].toString() == "1")
				acertos++;
		}

		return (acertos / listaAvaliacao.length) * 100;
	}

	function tentativasConcluidas(){
		return tentativas == 3;
	}

	function refazerAvaliacao(){
		for(var i=0, ii=listaAvaliacao.length; i < ii; i++){
			telasVistas[listaAvaliacao[i].telaConvertida - 1] = "0";
		}
		window.top.topicoAtual = listaAvaliacao[0].topico;
		window.top.telaAtual = 1;
		notas = [];
		tentativas++;
		mudouTela();
	}

	function gravaNota(feed, marcado){
		var referenciaQuestao = obterReferencia();
		notas[referenciaQuestao.id] = (feed ? 1 : 0)+":"+marcado;
		console.log(notas);
	}

	function controlaTelas() {
		controlaMensagem(false, false, "");

		iniciaCarregamentoTela();
		controlaBotoesNavegacao();
		atualizaDados();

		self.dispatchEvent({type:EventoFundo.INICIA_TELA});

		console.log(!navBloqueada , telaAtual , totalTelas);

		if (telasVistas[telaAtual - 1] !== "1") {
			gravaDados();
			
			controlaAvancar(!navBloqueada && parseInt(converteTelaAtual()) < parseInt(converteTotalTelas()), false);
		} else {
			fimTela();

			if (parseInt(converteTelaAtual()) != parseInt(converteTotalTelas())) {
				controlaAvancar(true, false);
			}
		}
	}

	function iniciaCarregamentoTela() {

		trace("Carregando a tela " + telaAtual + "...");

		removeClass(tagPreloader, ClasseCSS.REMOVE);
		addClass(tagTela, ClasseCSS.OCULTA);

		tagTela.onload = carregouTela;




		if(curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas[telaAtual - 1].html){
			controleBotoesNavegacao(true);
			tagTela.src = "telas/capitulo" + topicoAtual + "-" + telaAtual + ".html";
		}else{
			controleBotoesNavegacao(false);
			tagTela.src = "telas/capitulo" + topicoAtual + "-" + telaAtual + ".xhtml";
		}

		urlAtual = true;

	}

	function controleBotoesNavegacao(bl){
		removeClass(tagVoltar, "exercicio");
		removeClass(tagAvancar, "exercicio");

		if(bl && tagAvancar.getAttribute("class").indexOf("exercicio") == -1){
			addClass(tagVoltar, "exercicio");
			addClass(tagAvancar, "exercicio");
		}
	}

	function verificaTelas(){
		console.log(urlAtual);
		if(!urlAtual)
			return;

		if(tagTela.contentDocument.baseURI){
			console.log(tagTela.contentDocument);
			var url = tagTela.contentDocument.baseURI.toString().split("/");
			url = url[url.length - 1];
			
			var c = parseInt(url.split("-")[0].replace(/\D/gi,""));
			var t = parseInt(url.split("-")[1].replace(/\D/gi,""));
			
			//topicoAtual = c;
			if(t != telaAtual){
				telaAtual = t;
				atualizaDados();
			}
		}
	}

	function carregouTela() {
		trace("Carregou tela " + telaAtual + ". Iniciando tela...");
		if(!curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas[telaAtual - 1].html)
			fimTela();

		addClass(tagPreloader, ClasseCSS.REMOVE);
		removeClass(tagTela, ClasseCSS.OCULTA);
	}

	function controlaBotoesNavegacao() {
		controlaAvancar(parseInt(converteTelaAtual()) != parseInt(converteTotalTelas()), false);
		controlaVoltar(converteTelaAtual() != 1);
	}

	function controlaAvancar(ativa, detaca) {
		
		tagAvancar.disabled = !ativa;

		if (ativa) {
			addClass(tagAvancar, "ativaAvancar");

			if (detaca) {
				addClass(tagAvancar, "destaqueAvancar");
			}
		} else {
			removeClass(tagAvancar, "ativaAvancar");
			removeClass(tagAvancar, "destaqueAvancar");
		}
	}

	function controlaVoltar(ativa) {
		tagVoltar.disabled = !ativa;

		if (ativa) {
			addClass(tagVoltar, "ativaVoltar");
		} else {
			removeClass(tagVoltar, "ativaVoltar");
		}
	}

	function avancaFundo(){
		avancaTela(null);
	}

	function avancaTela(event) {
		if(event)
			event.preventDefault();

		telaAtual++;

		if(telaAtual > totalTelas){
			telaAtual = 1;
			topicoAtual++;
			totalTelas = curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas.length;
		}

		controlaTelas();
	}

	function voltaTela(event) {
		event.preventDefault();

		telaAtual--;

		if(telaAtual < 1){
			topicoAtual--;
			telaAtual = curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas.length;
			totalTelas = curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas.length;
		}

		controlaTelas();
	}

	function mudouTopico(event) {
		urlAtual = false;
		topicoAtual = window.top.topicoAtual;
		telaAtual = window.top.telaAtual;
		totalTelas = curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas.length;
		atualizaChamadasGlobais();
		
		controlaAssets(assetMenu.id, false);

		controlaTelas();
		menu = new Menu(document);
	}

	function mudouTela(event) {
		topicoAtual = window.top.topicoAtual;
		telaAtual = window.top.telaAtual;

		controlaAssets(assetMenu.id, false);
		controlaTelas();
	}

	function fimTela() {
		telasVistas[parseInt(converteTelaAtual()) - 1] = "1";

		calculaPorcentagem();

		self.dispatchEvent({type:EventoFundo.FIM_TELA});

		if (parseInt(converteTelaAtual()) < parseInt(converteTotalTelas())) {
			controlaAvancar(true, true);

			controlaMensagem(true, true, curso.mensagens.fimTela);

			trace(curso.mensagens.fimTela);
		} else {
			controlaMensagem(true, true, curso.mensagens.fimTopico);
			trace(curso.mensagens.fimTopico);
		}

		gravaDados();
	}

	function controlaMensagem(exibe, anima, mensagem) {
		
	}

	function gravaDados() {
		if (rodaLMS) {
			setLMSValue("cmi.core.lesson_location", converteTelaAtual() + ";" + telasVistas.join("")+ ";" +tentativas.toString()+ ";" +notas.join(""));

			if (telasVistas.indexOf("0") == -1 && lessonStatus !== "completed") {
				lessonStatus = "completed";

				setLMSValue("cmi.core.lesson_status", lessonStatus, true);
			}
		}
	}

	function calculaPorcentagem() {
		var telasVistasAux = telasVistas.concat([]);

		if (telasVistasAux.indexOf("1") == -1) {
			porcentagemConcluida = 0;
		} else {
			telasVistasAux.sort();

			porcentagemConcluida = Math.floor((parseInt(converteTotalTelas()) - telasVistasAux.indexOf("1")) / (parseInt(converteTotalTelas())) * 100);
		}

		atualizaDados();
	}

	function converteTelaAtual(){
		var telasAdicionais = 0;

		if(topicoAtual != 1){
			for(var i=0, ii= topicoAtual-1; i < ii; i++){
				telasAdicionais+= curso.modulos[moduloAtual - 1].topicos[i].telas.length;
			}
		}

		var total = telasAdicionais + telaAtual;

		console.log("#", topicoAtual, telaAtual, totalTelas, telasAdicionais, total);

		return total < 10 ? "0"+total : total;
	}

	function converteTotalTelas(){
		var total = 0;
		for(var i=0, ii= curso.modulos[moduloAtual - 1].topicos.length; i < ii; i++){
			total+= curso.modulos[moduloAtual - 1].topicos[i].telas.length;
		}

		return total < 10 ? "0"+total : total;
	}

	function atualizaDados() {
		tagTitulo.innerHTML = curso.nome;

		//tagSubtitulo.innerHTML = curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas[telaAtual - 1].nome;

		tagTelas.querySelector(".tela-atual").innerHTML = converteTelaAtual();
		tagTelas.querySelector(".tela-total").innerHTML = converteTotalTelas();

		tagPorcentagem.innerHTML = porcentagemConcluida+"%";
		tagUsuario.innerHTML = studentName;

		atualizaChamadasGlobais();
	}

	function exibeMenu(event) {
		var fechar = assetMenu.querySelector(".asset-fechar");

		fechar.addEventListener("click", ocultaMenu);

		controlaAssets(assetMenu.id, true);
	}

	function ocultaMenu(event) {
		event.target.removeEventListener(event.type, arguments.callee);

		controlaAssets(assetMenu.id, false);
	}

	function exibeAjuda(event) {
		var fechar = assetAjuda.querySelector(".asset-fechar");

		fechar.addEventListener("click", ocultaAjuda);

		controlaAssets(assetAjuda.id, true);
	}

	function ocultaAjuda(event) {
		event.target.removeEventListener(event.type, arguments.callee);

		controlaAssets(assetAjuda.id, false);
	}

	function controlaAssets(idAsset, exibe) {
		var asset = escopo.getElementById(idAsset);

		if (exibe && asset) {
			removeClass(tagAssets, ClasseCSS.REMOVE);
			removeClass(asset, ClasseCSS.REMOVE);
		} else {
			addClass(tagAssets, ClasseCSS.REMOVE);

			if (asset) {
				addClass(asset, ClasseCSS.REMOVE);
			}
		}
	}
}

function Menu(escopo) {
	EventDispatcher.prototype.apply(Menu.prototype);

	var assetMenu = escopo.querySelector("#asset-menu");
	var itens = [];
	
	var curso;
	var moduloAtual;
	var topicoAtual;
	var telaAtual;
	var telasVistas;
	var totalTelas;

	if (assetMenu) {
		fundo.addEventListener(EventoFundo.INICIA_TELA, init);
	}

	function init(event) {
		event.target.removeEventListener(event.type, arguments.callee);

		trace("Construindo menu...");

		atualizaVariaveis();
		controiTopicos();
		constroiMenu();

		fundo.addEventListener(EventoFundo.INICIA_TELA, atualizaItens);
		fundo.addEventListener(EventoFundo.FIM_TELA, atualizaItens);
	}

	function controiTopicos(){
		var itemAtual;
		var escopoItem = document.querySelector(".lista-topicos");

		escopoItem.innerHTML = "";

		var totalTopicos = curso.modulos[moduloAtual - 1].topicos.length;

		for (var i = 0; i < totalTopicos; i++) {
			if(/false/gi.test(curso.modulos[moduloAtual - 1].topicos[i].oculta))
				continue;

			nomeAtual = curso.modulos[moduloAtual - 1].topicos[i].nome;
			itemAtual = document.createElement("div");
			
			itemAtual.dataset.nome = "topico" + (i + 1);
			escopoItem.appendChild(itemAtual);
			itemAtual.innerHTML = "<span class='menu-capitulo'>Capítulo</span><span class='capitulo-numero'>"+((i + 1) < 10 ? "0"+(i + 1) : (i + 1))+"</span>";
			itemAtual.addEventListener("click", mudaTopico);
		}
	}

	function constroiMenu() {
		var itemAtual;
		var escopoItem = document.querySelector(".lista-telas");
		var nomeAtual = "";
		var nomeAnterior = "";

		escopoItem.innerHTML = "";

		for (var i = 1; i <= curso.modulos[moduloAtual - 1].topicos.length; i++) {

			if(/false/gi.test(curso.modulos[moduloAtual - 1].topicos[i - 1].oculta))
				continue;

			for (var j = 1; j <= curso.modulos[moduloAtual - 1].topicos[i - 1].telas.length; j++) {
				nomeAtual = curso.modulos[moduloAtual - 1].topicos[i - 1].telas[j - 1].nome;

				itemAtual = document.createElement("div");
				itemAtual.dataset.nome = "item "+i+"_"+j;
				itemAtual.dataset.capitulo = i;
				itemAtual.dataset.tela = j;

				escopoItem.appendChild(itemAtual);

				itemAtual.innerHTML = "Capítulo "+i+" - Tela "+j;

				itens.push(itemAtual);
			}
		}


		trace("Menu construído.");
	}

	function atualizaVariaveis() {
		curso = window.top.curso;
		moduloAtual = window.top.moduloAtual;
		topicoAtual = window.top.topicoAtual;
		telaAtual = window.top.telaAtual;
		telasVistas = window.top.telasVistas;
		totalTelas = curso.modulos[moduloAtual - 1].topicos[topicoAtual - 1].telas.length;
	}

	function atualizaItens(event) {
		atualizaVariaveis();

		var indiceTela;
		for (var i = itens.length - 1; i >= 0; i--) {
			indiceTela = ~~itens[i].dataset.nome.replace(/\D/gi, "") - 1;
			addClass(itens[i], "ativaItemMenu");
			controlaClique(i, true);
		}

		controleStatus();
	}

	function controleStatus(){
		var lista = document.querySelector(".lista-telas").querySelectorAll("[data-nome*='item']");
		for(var i=0; i < telasVistas.length; i ++){
			removeClass(lista[i],"completo");
			removeClass(lista[i],"pendente");
			removeClass(lista[i],"atual");

			if(telasVistas[i].toString() == "1" && i != parseInt(window.top.converteTelaAtual()) - 1){
				addClass(lista[i],"completo");
			}else if(i != parseInt(window.top.converteTelaAtual()) - 1){
				addClass(lista[i],"pendente");
			}else{
				addClass(lista[i],"atual");
			}
		}
	}

	function controlaClique(indiceItem, habilita) {
		var item = itens[indiceItem];

		if (habilita) {
			addClass(item, ClasseCSS.CURSOR_CLIQUE);

			item.addEventListener("click", mudaTela);
		} else {
			removeClass(item, ClasseCSS.CURSOR_CLIQUE);

			item.removeEventListener("click", mudaTela);
		}
	}

	function mudaTopico(event){
		window.top.telaAtual = 1;
		window.top.topicoAtual = ~~event.target.dataset.nome.replace(/\D/gi, "");
		//atualizaVariaveis();
		fundo.dispatchEvent({type:EventoFundo.MUDOU_TOPICO});
		atualizaItens();
	}

	function mudaTela(event) {
		window.top.topicoAtual = ~~event.target.dataset.capitulo.replace(/\D/gi, "");
		window.top.telaAtual = ~~event.target.dataset.tela.replace(/\D/gi, "");

		fundo.dispatchEvent({type:EventoFundo.MUDOU_TELA});

		atualizaItens();
	}
}

function trace(mensagem) {
	console.log((++contTrace) + ". " + mensagem);
}