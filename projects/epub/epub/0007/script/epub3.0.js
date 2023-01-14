/**
 Arquivo para controle de interações de cursos EPUB 3.0
 Desenvolvido por Wallace Alexander Araujo - wallace.araujo@webaula.com.br
 
 @Bug
 - Contagem total de interações
 
 @Interações
 - Animação
 - Navegação
 - Alternado
 - Vídeo (Criar Skin* - Otimizar codigo - Bloquear refesh Viemo e Youtube)
 - Link
 - Botão Avanço de Tela
 - Exercício Marcar (refazer)
 - Exercício V OU F (refazer)
 + Exercício Arrastar (refazer)
 + Exercício Digitar (refazer)
 + Exercicio Carta
 - Alt conteúdo
 - Click
 + Aba ( Solicitar o Design reestruturação)
 + Âncora (Novo)
 + Pontuação
 + Exibição feedback nota
 + Áudio (Personagem e conteúdo)(Com player)
 + Números Corridos (Novo)
 + Comparar Conteúdos (Novo)
 + Rolagem (Flexcroll)(Novo)
 + AngularJS - Dados fundo (Novo)
 + Atividade de arrastar por opcao (http://downloadcdc.webaula.com.br/webaula/Maiquei/tela/OEBPS/exerc_cio-1.xhtml)
 + Leitor PDF
 * Feedback (Problemas com botão fechar)
 * Debug
 
 // Fundo Arquivo config
    + Adicionar Páginas a Favoritos
 **/

EPUB = {
    versao: "3.0",
    fornecedor:"webAula",
    DEBUG: {
        ERRO: {
            Conferir: "Ausência do Botão Conferir.\nO exercício é de multipla escolha ou seja possui duas respostas corretas."
        },
        Alerta: (function (_mensagem) {
            console.error("%c@Error:\n%s", "color:#F00", _mensagem);
        })

    },
    Nomeclatura: {
        conclusao: "concluido",
        navegacao: "item",
        abaTopo: "aba_topo",
        abaDireita: "aba_direita",
        abaBaixo: "aba_baixo",
        abaEsquerda: "aba_esquerda"
    },
    Utils:{
        testeContato:(function(i, e){
            if(!i || !e)
		return false;

            var x2 = parseInt(e.offsetLeft.toString().replace(/\D/gi,""));
            var y2 = parseInt(e.offsetTop.toString().replace(/\D/gi,""));
            var l2 = parseInt(e.offsetWidth.toString().replace(/\D/gi,""));
            var a2 = parseInt(e.offsetHeight.toString().replace(/\D/gi,""));

            var x1 = parseInt(i.offsetLeft.toString().replace(/\D/gi,""));
            var y1 = parseInt(i.offsetTop.toString().replace(/\D/gi,""));

            return (x1 > x2 - l2 && x1 < x2 + l2) && (y1 > y2 - a2 && y1 < y2 + a2);
        }),
        adicionaPrefix:(function(elemento, propriedade, valor){
            var prefix = ["ms","o","webkit","moz"];
            for(var i=0, ii= prefix.length; i < ii; i++){
                var temp = propriedade.split("");
                var cap = temp.splice(0, 1);
                elemento.style[prefix[i]+(cap.toString().toUpperCase()+temp.join(""))] = valor;
            }
            elemento.style[propriedade] = valor;
        })
    }
};

(function (window, document) {

    var _epubFinalizado,
        _listaInteracoes,
        _listaRecursos;

    var _animacao,
        _click,
        _navegacao,
        _alternado,
        _video,
        _link,
        _aba,
        _avancoTela,
        _exercicioMarcar,
        _exercicioVF,
        _exercicioArrastar,
        _altConteudo;

    function init() {
        console.warn("%cInicializando EPUB %s Tela %s", "color: #0F0", EPUB.versao, window.top.telaAtual);
        
        _listaInteracoes = [];
        _listaRecursos = [];

        _animacao = new Animacao();
        adicionaRecursos(_animacao);
        
        _click = new Click();
        adicionaRecursos(_click);

        _navegacao = new Navegacao();
        adicionaRecursos(_navegacao);

        _alternado = new Alternado();
        adicionaRecursos(_alternado);

        _video = new Video();
        adicionaRecursos(_video);

        _link = new Link();
        adicionaRecursos(_link);

        _aba = new Aba();
        adicionaRecursos(_aba);

        _avancoTela = new AvancoTela();
        adicionaRecursos(_avancoTela);

        _exercicioMarcar = new ExercicioMarcar();
        adicionaRecursos(_exercicioMarcar);

        _exercicioVF = new ExercicioVF();
        adicionaRecursos(_exercicioVF);
        
        _exercicioArrastar = new ExercicioArrastar();
        adicionaRecursos(_exercicioArrastar);

        _altConteudo = new AltConteudo();
        adicionaRecursos(_altConteudo);
        
        inicializaRecursos();
        
    }

    //Adiciona Recursos na Tela
    function adicionaRecursos(_recurso) {
        if (_recurso.ativo())
            _listaRecursos.push(_recurso);
    }

    // Inicializa todos os recursos
    function inicializaRecursos() {
        for (var i = 0, ii = _listaRecursos.length; i < ii; i++) {
            _listaRecursos[i].iniciarInteracao();
        }
        
        if(_listaInteracoes.length == 0)
            validaFimTela();
    }

    // function marca o root da interacao
    function validaRoot(_elemento, _nome) {
        return _elemento.parentNode.querySelector(_nome);
    }

    // function busca root
    function buscaRoot(_elemento) {
        if (_elemento.classList.contains("root") || _elemento.parentNode.tagName === "body")
            return _elemento;
        else
            return buscaRoot(_elemento.parentNode);
    }

    // Verifica se todos os itens foram finalizados
    function validaFimTela() {
        if (!_epubFinalizado)
            console.log("%cInteracoes: Concluidas (%s) Total (%s)", "color:#FF0", document.querySelectorAll("." + EPUB.Nomeclatura.conclusao).length, Math.max(_listaInteracoes.length, document.querySelectorAll(".interacao").length));

        if (_listaInteracoes.length <= document.querySelectorAll("." + EPUB.Nomeclatura.conclusao).length && document.querySelectorAll(".interacao").length <= document.querySelectorAll(".interacao" + "." + EPUB.Nomeclatura.conclusao).length && !_epubFinalizado) {
            console.warn("%cepub.js%c -> Fim tela", "color: #0F0");
            _epubFinalizado = true;
            window.top.fimTela();
        }
    }

    /* 
     * Recursos
     */

    //Animação
    function Animacao() {

        var _ativo;
        var _lista;

        function Animacao() {
            _lista = document.querySelectorAll("[class*='_idGenAnimation']");
            _ativo = _lista.length !== 0;
        }

        this.ativo = function () {
            return _ativo;
        };

        this.iniciarInteracao = function () {
            for (var i = 0, ii = _lista.length; i < ii; i++) {
                if (validaRoot(_lista[i], "[class*='_idGenAnimation']")) {
                    _lista[i].classList.add("root");
                    _listaInteracoes.push(_lista[i]);
                }
                _lista[i].addEventListener("webkitAnimationEnd", finalizaInteracao);
                _lista[i].addEventListener("animationend", finalizaInteracao);
            }

        };

        function finalizaInteracao(e) {
            if (!e.currentTarget.classList.contains("interacao"))
                e.currentTarget.classList.add(EPUB.Nomeclatura.conclusao);

            validaFimTela();
        }

        Animacao();
    }
    
    // Click
    function Click(){
        
        var _ativo;
        var _botoes;
        
        function Click(){
            _ativo = document.querySelectorAll("[data-releaseactions*='nextState']").length > 0 || document.querySelectorAll("[data-releaseactions*='prevState']").length > 0;
        }
        
         this.ativo = function () {
            return _ativo;
        };
        
         this.iniciarInteracao = function () {
             
             var next = document.querySelectorAll("[data-releaseactions*='nextState']");
             var prev = document.querySelectorAll("[data-releaseactions*='prevState']");
             _botoes = next.concat(prev);
             
             for(var i=0, ii = _botoes.length; i < ii; i++){
                _botoes[i].addEventListener("mousedown", executaClick);
                
                 if (window.top.bjs.isTouch())
                    _botoes[i].addEventListener("touchstart", executaClick);
                
                _listaInteracoes.push(_botoes[i]);
            }
        };
        
        function executaClick(e){
            e.currentTarget.classList.add(EPUB.Nomeclatura.conclusao);
        }
        
        Click();
    }

    // Navegacao
    function Navegacao() {

        var _ativo;
        var _states;
        var _voltar;
        var _avancar;
        var _rootInteracao;
        var _validaNavegacao;

        function Navegacao() {
            _states = document.querySelectorAll("[data-idGenObjectState*='"+EPUB.Nomeclatura.navegacao+"']");
            _voltar = document.querySelector("[class*='_voltar']");
            _avancar = document.querySelector("[class*='_avancar']");

            _ativo = _states.length !== 0 && _voltar && _avancar;

            if (_ativo) {
                _rootInteracao = buscaRoot(_states[0]);
                _rootInteracao.classList.add("interacao");
            }
        }

        this.ativo = function () {
            return _ativo;
        };

        this.iniciarInteracao = function () {
            _validaNavegacao = setInterval(controleNavegacao, 50);
        };

        function controleNavegacao() {
            var id = ~~(_rootInteracao.querySelector("._idGenCurrentState").getAttribute("data-idGenObjectState").replace(/\D/gi, ""));

            controleBotoes(_voltar, id !== 1);
            controleBotoes(_avancar, id !== _states.length);

            if (id === _states.length) {
                finalizaInteracao();
            }
        }

        function controleBotoes(_botao, _ativado) {
            _botao.style.pointerEvents = _ativado ? "auto" : "none";
        }

        function concluiRoots() {
            var lista = document.querySelectorAll(".root");
            for (var i = 0, ii = lista.length; i < ii; i++) {
                if (!lista[i].classList.contains(EPUB.Nomeclatura.conclusao) && !lista[i].classList.contains("interacao"))
                    lista[i].classList.add(EPUB.Nomeclatura.conclusao);

            }
        }

        function finalizaInteracao() {
            _rootInteracao.classList.add(EPUB.Nomeclatura.conclusao);
            concluiRoots();
            validaFimTela();
        }

        Navegacao();
    }

    // Alternado
    function Alternado() {

        var _ativo;
        var _states;
        var _botoes;

        function Alternado() {
            _states = document.querySelectorAll("[data-idGenObjectState*='item']");
            _botoes = document.querySelectorAll("[data-releaseactions*='goToState']");

            _ativo = _states.length !== 0 && _botoes.length !== 0;
        }

        this.ativo = function () {
            return _ativo;
        };

        this.iniciarInteracao = function () {
            for (var i = 0, ii = _botoes.length; i < ii; i++) {
                _botoes[i].classList.add("interacao");
                _botoes[i].addEventListener("mousedown", controleAlternado);
                if (window.top.bjs.isTouch())
                    _botoes[i].addEventListener("touchstart", controleAlternado);
            }

            for (var i = 0, ii = _states.length; i < ii; i++) {
                _states[i].classList.add("conteudo_alternado");

                if (_states[i].classList.contains("_idGenCurrentState"))
                    _states[i].classList.add("visto");
            }

        };

        function controleAlternado(e) {
            var id = /item[0-9]*/gi.exec(e.currentTarget.getAttribute("data-releaseactions"))[0];

            if (!e.currentTarget.classList.contains(EPUB.Nomeclatura.conclusao))
                e.currentTarget.classList.add(EPUB.Nomeclatura.conclusao);

            if (!document.querySelector("[data-idGenObjectState='" + id + "']").classList.contains("visto"))
                document.querySelector("[data-idGenObjectState='" + id + "']").classList.add("visto");

            if (document.querySelectorAll(".conteudo_alternado.visto").length === _states.length)
                finalizaInteracao();
        }

        function finalizaInteracao() {
            validaFimTela();
        }

        Alternado();
    }

    // Vídeo
    function Video() {

        var _ativo;
        var _playersVideo;
        var _playersYoutube;
        var _playersVimeo;
        var _playersLink;
        var _videoAPI;
        var _playerOrigin = '*';

        function Video() {
            _playersVideo = document.querySelectorAll("video");
            _playersYoutube = document.querySelectorAll("iframe[src*='youtube']");
            _playersVimeo = document.querySelectorAll("iframe[src*='vimeo']");
            _playersLink = document.querySelectorAll("[class*='Video_link_video']");

            _ativo = _playersVideo.length !== 0 || _playersYoutube.length !== 0 || _playersVimeo.length !== 0 || _playersLink.length !== 0;
        }

        this.ativo = function () {
            return _ativo;
        };

        this.iniciarInteracao = function () {

            _videoAPI = [];


            if (_playersVideo.length !== 0)
                configuraPlayerVideo();

            if (_playersYoutube.length !== 0) {
                window.onYouTubeIframeAPIReady = function () {
                    configuraPlayerYoutube();
                };
            }

            if (_playersLink.length !== 0)
                configuraPlayerLink();

            if (_playersVimeo.length !== 0) {
                window.addEventListener('message', onMessageReceived, false);
                configuraPlayerVimeo();
            }
        };


        function configuraPlayerVideo() {
            for (var i = 0, ii = _playersVideo.length; i < ii; i++) {
                if (_playersVideo[i].getAttribute("autoplay")) {
                    _playersVideo[i].removeAttribute("controls");
                    _playersVideo[i].setAttribute("loop", "loop");
                }
                _playersVideo[i].addEventListener("ended", finalizaInteracao);
                _listaInteracoes.push(_playersVideo[i]);
            }
        }

        function configuraPlayerYoutube() {
            for (var i = 0, ii = _playersYoutube.length; i < ii; i++) {
                _playersYoutube[i].setAttribute("src", _playersYoutube[i].getAttribute("src") + "?enablejsapi=1");
                _playersYoutube[i].setAttribute("id", "video" + _videoAPI.length);
                _playersYoutube[i].setAttribute("videoID", _videoAPI.length);

                var _api = new YT.Player(_playersYoutube[i].getAttribute("id"), {events: {'onEnded': finalizaInteracao, 'onStateChange': controlStateYoutube}});
                _videoAPI.push({player: _playersYoutube[i], API: _api});
                _listaInteracoes.push(_playersYoutube[i]);
            }
        }

        function controlStateYoutube(e) {
            if (e.data == YT.PlayerState.ENDED)
                finalizaInteracao(e.target.a);
        }

        function configuraPlayerVimeo() {

            for (var i = 0, ii = _playersVimeo.length; i < ii; i++) {
                _playersVimeo[i].setAttribute("src", _playersVimeo[i].getAttribute("src") + "?api=1&player_id=" + "video" + _videoAPI.length);
                _playersVimeo[i].setAttribute("id", "video" + _videoAPI.length);
                _playersVimeo[i].setAttribute("videoID", _videoAPI.length);
                _videoAPI.push({player: _playersVimeo[i]});
                _listaInteracoes.push(_playersVimeo[i]);
                post("ready", {player_id: _playersVimeo[i].getAttribute("id")}, _playersVimeo[i]);
            }

        }

        function onReady(player) {
            post('addEventListener', 'finish', player);
        }

        function onMessageReceived(event) {

            if (!(/^https?:\/\/player.vimeo.com/).test(event.origin)) {
                return false;
            }
            if (_playerOrigin === '*') {
                _playerOrigin = event.origin;
            }
            var data = JSON.parse(event.data);

            switch (data.event) {
                case 'ready':
                    onReady(document.querySelector("#" + data.player_id));
                    break;
                case 'finish':
                    finalizaInteracao(document.querySelector("#" + data.player_id));
                    break;
            }
        }

        function post(action, value, player) {
            var data = {method: action};

            if (value) {
                data.value = value;
            }

            var message = JSON.stringify(data);

            if (player)
                player.contentWindow.postMessage(message, _playerOrigin);
        }


        function configuraPlayerLink() {
            for (var i = 0, ii = _playersLink.length; i < ii; i++) {
                var urlData = _playersLink[i].getAttribute("data-releaseactions");
                if (!urlData)
                    continue;
                var url = urlData.replace(/goToDestination\(\'/gi, "").replace(/\'\)\;/gi, "");
                var player = document.createElement("video");
                player.setAttribute("controls", "controls");
                player.setAttribute("autoplay", "autoplay");
                player.setAttribute("src", "../assets/video/" + url);
                player.classList.add("videoPlayerLink", "root", "interacao");
                player.addEventListener("ended", finalizaInteracao);
                player.addEventListener("click", controlaPlayerLink);
                _playersLink[i].parentNode.appendChild(player);
                _playersLink[i].parentNode.removeChild(_playersLink[i]);
                _listaInteracoes.push(_playersLink[i]);
            }
        }

        function controlaPlayerLink(e) {
            e.currentTarget.paused = !e.currentTarget.paused;
        }

        this.pararVideos = function () {

            if (_playersVideo.length !== 0) {
                for (var i = 0, ii = _playersVideo.length; i < ii; i++) {
                    _playersVideo[i].stop();
                }
            }

            if (_playersLink.length !== 0) {
                for (var i = 0, ii = _playersLink.length; i < ii; i++) {
                    _playersLink[i].stop();
                }
            }

            if (_playersYoutube.length !== 0) {
                for (var i = 0, ii = _playersYoutube.length; i < ii; i++) {
                    var menssage = JSON.stringify({event: "command", func: "stopVideo", args: ""});
                    _playersYoutube[i].contentWindow.postMessage(menssage, '*');
                }
            }
        };

        function finalizaInteracao(e) {
            (e.currentTarget || e).classList.add(EPUB.Nomeclatura.conclusao);
            validaFimTela();
        }

        Video();
    }

    // Link
    function Link() {

        var _ativo;
        var _linkURL;
        var _linkTag;

        function Link() {
            _linkURL = document.querySelectorAll("[class*='Clique_links']");
            _linkTag = document.querySelectorAll("a");

            _ativo = _linkURL.length !== 0 || _linkTag.length !== 0;

        }

        this.ativo = function () {
            return _ativo;
        };

        this.iniciarInteracao = function () {

            if (_linkURL.length !== 0)
                configuraLinkUrl();

            if (_linkTag.length !== 0)
                configuraLinkTag();
        };

        function configuraLinkUrl() {
            for (var i = 0, ii = _linkURL.length; i < ii; i++) {
                var tipo = /http/gi.test(_linkURL[i].getAttribute("data-releaseactions")) ? "SITE" : "ARQUIVO";
                var url;
                switch (tipo) {
                    case "SITE":
                        url = _linkURL[i].getAttribute("data-releaseactions").match(/http[^\']*/gi);
                        break;

                    case "ARQUIVO":
                        url = _linkURL[i].parentNode.getAttribute("data-releaseactions") || _linkURL[i].getAttribute("data-releaseactions");
                        if (url)
                            url = "../assets/arquivo/" + url.replace(/goToDestination\(\'/gi, "").replace(/\'\)\;/gi, "");
                        break;
                }

                _linkURL[i].removeAttribute("data-releaseactions");

                if (url) {
                    _listaInteracoes.push(_linkURL[i]);
                    _linkURL[i].classList.add("root", "interacao");
                    _linkURL[i].setAttribute("url", url);
                    _linkURL[i].addEventListener("click", abreLinkURL);
                }
            }
        }

        function abreLinkURL(e) {
            e.currentTarget.classList.add(EPUB.Nomeclatura.conclusao);
            window.open(e.currentTarget.getAttribute("url"), "Link", "");
            finalizaInteracao();
        }

        function configuraLinkTag() {
            for (var i = 0, ii = _linkTag.length; i < ii; i++) {
                _linkTag[i].setAttribute("target", "_blank");
            }
        }


        function finalizaInteracao(e) {
            validaFimTela();
        }

        Link();

    }

    // Aba
    function Aba() {

        var _ativo;
        var _abas;

        function Aba() {
            _abas = document.querySelectorAll("[class*='aba_agrupador']");
            _ativo = _abas.length !== 0;
        }

        this.ativo = function () {
            return _ativo;
        };

        this.iniciarInteracao = function () {
            for (var i = 0, ii = _abas.length; i < ii; i++) {
                if (!/aba_agrupador/gi.test(_abas[i].parentNode.getAttribute("class"))) {
                    _abas[i].classList.add("root", "interacao");
                    _abas[i].setAttribute("direcao", obterDirecao(_abas[i]));
                    _abas[i].querySelector("[class*='_aba_bt']").addEventListener("click", abreAba);
                    _listaInteracoes.push(_abas[i]);
                }
            }
        };

        function obterDirecao(_aba) {
            var direcao = null;
            
            if(_aba.querySelector("[class*='_aba_conteudo']").getBoundingClientRect().left < 0){
                return EPUB.Nomeclatura.abaEsquerda;
            }else if(_aba.querySelector("[class*='_aba_conteudo']").getBoundingClientRect().left > window.innerWidth){
                return EPUB.Nomeclatura.abaDireita;
            }else if(_aba.querySelector("[class*='_aba_conteudo']").getBoundingClientRect().top < 0){
                return EPUB.Nomeclatura.abaTopo;
            }else if(_aba.querySelector("[class*='_aba_conteudo']").getBoundingClientRect().top > window.innerHeight){
                return EPUB.Nomeclatura.abaBaixo;
            }          

            return direcao;
        }
        
        function obterRoot(elemento){
            if(/root/gi.test(elemento.parentNode.getAttribute("class"))){
                return elemento.parentNode;
            }else{
                return obterRoot(elemento.parentNode);
            }
        }
        
        function abreAba(e){
            var root = obterRoot(e.currentTarget);
            var str;
            
            if(root.classList.contains("aberto")){
                str = "translate(0, 0)";
                root.classList.remove("aberto");
            }else{
                switch(root.getAttribute("direcao")){
                    case EPUB.Nomeclatura.abaTopo:
                        str = "translate(0, "+(root.querySelector("[class*='_aba_conteudo']").offsetHeigth)+"px)";
                    break;
                    case EPUB.Nomeclatura.abaDireita:
                         str = "translate("+(-root.querySelector("[class*='_aba_conteudo']").offsetWidth)+"px, 0)";
                    break;
                    case EPUB.Nomeclatura.abaBaixo:
                        str = "translate(0, "+(-root.querySelector("[class*='_aba_conteudo']").offsetHeigth)+"px)";
                    break;
                    case EPUB.Nomeclatura.abaDireita:
                        str = "translate("+(root.querySelector("[class*='_aba_conteudo']").offsetWidth)+"px, 0)";
                    break;
                        
                }
                
                root.classList.add("aberto");
            }
            
            EPUB.Utils.adicionaPrefix(root, "transform", str);
            
            setTimeout(finalizaInteracao, 1000, root);
        }
        

        function finalizaInteracao(aba) {
            if(!aba.classList.contains(EPUB.Nomeclatura.conclusao))
                aba.classList.add(EPUB.Nomeclatura.conclusao);
            
            validaFimTela();
        }

        Aba();

    }

    // Avanço de Tela
    function AvancoTela() {

        var _ativo;
        var _botao;

        function AvancoTela() {
            _ativo = document.querySelectorAll("[class*='avanca_tela']").length !== 0;
        }

        this.ativo = function () {
            return _ativo;
        };

        this.iniciarInteracao = function () {
            _botao = document.querySelector("[class*='avanca_tela']");
            _botao.addEventListener("mousedown", avancaTela);
            _botao.classList.add("interacao");
        };

        function avancaTela(e) {
            e.currentTarget.classList.add(EPUB.Nomeclatura.conclusao);
            finalizaInteracao();
        }

        function finalizaInteracao() {
            validaFimTela();
            window.top.avancaFundo();
        }

        AvancoTela();

    }

    // Exercicio Marcar
    function ExercicioMarcar() {

        var _ativo;
        var _opcoes;
        var _multiplaescolha;
        var _resultado;
        var _feedback;

        function ExercicioMarcar() {
            _ativo = document.querySelectorAll("[class*='Objetiva_marcar']").length !== 0;
            _opcoes = [];
        }

        this.ativo = function () {
            return _ativo;
        };

        this.iniciarInteracao = function () {
            var lista = document.querySelectorAll("[class*='Objetiva_marcar']");
            for (var i = 0, ii = lista.length; i < ii; i++) {
                if (/errado|correta/gi.test(lista[i].getAttribute("class")) && !/Objetiva_marcar/gi.test(lista[i].parentNode.getAttribute("class"))) {
                    _opcoes.push(lista[i]);
                    lista[i].classList.add("opcao");
                    lista[i].addEventListener("mousedown", marcaOpcao);
                }
            }

            _multiplaescolha = document.querySelectorAll(".opcao[class*='Objetiva_marcar_correta']").length > 1;


        };

        function desabilitaBotoes() {
            var lista = document.querySelectorAll("[class*='Objetiva_marcar']");
            for (var i = 0, ii = lista.length; i < ii; i++) {
                if (/errado|correta/gi.test(lista[i].getAttribute("class")) && !/Objetiva_marcar/gi.test(lista[i].parentNode.getAttribute("class"))) {
                    lista[i].removeEventListener("mousedown", marcaOpcao);
                    lista[i].style.pointerEvents = "none";
                }
            }
        }

        function marcaOpcao(e) {

            if (!_multiplaescolha)
                resetaMarcacoes();
            else if (e.currentTarget.classList.contains("opcaoMarcada"))
                e.currentTarget.classList.remove("opcaoMarcada");
            else
                e.currentTarget.classList.add("opcaoMarcada");


            if (document.querySelectorAll(".opcaoMarcada").length !== 0)
                habilitaConferir();
            else
                confereResposta();
        }

        function resetaMarcacoes() {
            var lista = document.querySelectorAll(".opcaoMarcada");
            for (var i = 0, ii = lista.length; i < ii; i++) {
                lista[i].classList.remove("opcaoMarcada");
            }
        }

        function habilitaConferir() {
            var conferir = document.querySelectorAll("[class*='_conferir']");

            if (conferir.length !== 0) {

                for (var i = 0, ii = conferir.length; i < ii; i++) {
                    if (!/_conferir/gi.test(conferir[i].parentNode.getAttribute("class"))) {
                        conferir[i].addEventListener("mousedown", confereResposta);
                    }
                    conferir[i].style.display = "block";
                }


            } else {
                confereResposta(null);
                if (_multiplaescolha)
                    EPUB.DEBUG.Alerta(EPUB.DEBUG.ERRO.Conferir);
            }
        }

        function confereResposta(e) {

            if (e)
                e.currentTarget.style.display = "none";


            var acertos = document.querySelectorAll(".opcaoMarcada[class*='Objetiva_marcar_correta']");
            var erros = document.querySelectorAll(".opcaoMarcada[class*='Objetiva_marcar_errado']");
            var gabarito = document.querySelectorAll(".opcao[class*='Objetiva_marcar_correta']");

            _resultado = acertos.length === gabarito.length && erros.length === 0;

            if (document.querySelectorAll("[class*='Feedback_']").length !== 0)
                exibeFeedback();
            else
                finalizaInteracao();
        }

        function exibeFeedback() {
            _feedback = new Feedback(_resultado, fecharFeedback);
            desabilitaBotoes();
        }

        function fecharFeedback() {
            if (!_resultado && document.querySelectorAll("[class*='fechar']").length !== 0) {
                document.querySelector("[class*='fechar']").style.display = "block";
                document.querySelector("[class*='fechar']").addEventListener("click", refazerExercicio);
            } else {
                finalizaInteracao();
            }
        }

        function refazerExercicio() {
            finalizaInteracao();
        }

        function finalizaInteracao() {
            validaFimTela();
        }

        ExercicioMarcar();

    }

    // Exercício de V ou F
    function ExercicioVF() {

        var _ativo;
        var _opcoes;
        var _resultado;
        var _feedback;

        function ExercicioVF() {
            _ativo = document.querySelectorAll("[class*='VouF']").length !== 0;
        }

        this.iniciarInteracao = function () {
            var lista = document.querySelectorAll("[class*='VouF_grupo']");
            _opcoes = [];

            for (var i = 0, ii = lista.length; i < ii; i++) {
                if (!/VouF_grupo/gi.test(lista[i].parentNode.getAttribute("class")) && /errada|correta/gi.test(lista[i].getAttribute("class"))) {
                    lista[i].classList.add("root", "opcao");
                    lista[i].addEventListener("click", marcaOpcao);
                    _opcoes.push(lista[i]);
                }
            }

        };

        this.ativo = function () {
            return _ativo;
        };

        function marcaOpcao(e) {
            var grupoID = /VouF_grupo[0-9]_(correta|errada)/gi.exec(e.currentTarget.getAttribute("class"))[0].replace(/\D/gi, "");
            var opcoes = document.querySelectorAll("[class*='VouF_grupo" + grupoID + "']");
            for (var i = 0, ii = opcoes.length; i < ii; i++) {
                opcoes[i].classList.remove("opcaoMarcada");
            }

            e.currentTarget.classList.add("opcaoMarcada");

            if (document.querySelectorAll(".opcaoMarcada").length === _opcoes.length * 0.5)
                habilitaConferir();
        }

        function habilitaConferir() {
            var conferir = document.querySelectorAll("[class*='_conferir']");

            if (conferir.length !== 0) {

                for (var i = 0, ii = conferir.length; i < ii; i++) {
                    if (!/_conferir/gi.test(conferir[i].parentNode.getAttribute("class"))) {
                        conferir[i].addEventListener("mousedown", confereResposta);
                    }
                    conferir[i].style.display = "block";
                }
            } else {
                confereResposta(null);
            }
        }

        function confereResposta(e) {
            if (e)
                e.currentTarget.style.display = "none";

            var acertos = document.querySelectorAll(".opcaoMarcada[class*='_correta']");
            var erros = document.querySelectorAll(".opcaoMarcada[class*='_errado']");
            var gabarito = document.querySelectorAll(".opcao[class*='_correta']");

            _resultado = acertos.length === gabarito.length && erros.length === 0;

            if (document.querySelectorAll("[class*='Feedback_']").length !== 0)
                exibeFeedback();
            else
                finalizaInteracao();
        }

        function exibeFeedback() {
            _feedback = new Feedback(_resultado, fecharFeedback);
            desabilitaBotoes();
        }

        function fecharFeedback() {
            if (!_resultado && document.querySelectorAll("[class*='fechar']").length !== 0) {
                document.querySelector("[class*='fechar']").style.display = "block";
                document.querySelector("[class*='fechar']").addEventListener("click", refazerExercicio);
            } else {
                finalizaInteracao();
            }
        }

        function refazerExercicio() {
            finalizaInteracao();
        }

        function desabilitaBotoes() {
            for (var i = 0, ii = _opcoes.length; i < ii; i++) {
                _opcoes[i].removeEventListener("click", marcaOpcao);
            }
        }

        function finalizaInteracao() {
            validaFimTela();
        }

        ExercicioVF();
    }
    
     // Exercício de Arrastar
    function ExercicioArrastar() {

        var _ativo;
        var _opcoes;
        var _resultado;
        var _feedback;
        var _eventosArrastar;
        var _eventosSoltar;
        var _eventosMover;
        var _elementoAtual;
        var _arrastarAtivo;
        var _gabarito;
        var _arrastados;
        

        function ExercicioArrastar() {
            _ativo = document.querySelectorAll("[class*='drag']").length !== 0;
        }

        this.iniciarInteracao = function () {
            
            _eventosArrastar = ["mousedown"];
            _eventosSoltar = ["mouseup"];
            _eventosMover = ["mousemove"];
            
            if(window.top.bjs.isTouch()){
                _eventosArrastar.push("touchstart");
                _eventosSoltar.push("touchend");
                _eventosMover.push("touchmove");
            }
            
            guardaDados("drag");
            guardaDados("drop");
            gerarGabarito();
            controleInteracao(true);
        };

        this.ativo = function () {
            return _ativo;
        };
        
        function gerarGabarito(){
            _gabarito = [];
            _arrastados = [];
            var botoes = document.querySelectorAll("[class*='drag']");
            for(var i=0, ii=botoes.length; i < ii; i++){
                if(document.querySelectorAll("[class*='drop"+(i+1)+"']").length > 0){
                    _gabarito.push(i + 1);
                    _arrastados.push(0);
                }
            }
        }
        
        function obterPosicaoAbsoluta(obj){
            var st = window.getComputedStyle(obj, null);
            var tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("-moz-transform") || st.getPropertyValue("-ms-transform") || st.getPropertyValue("-o-transform") || st.getPropertyValue("transform");
            var coords = {};
            var matrix;
            
            if(!/none/gi.test(tr.toString())){
                matrix = tr.split("(")[1].split(")")[0].split(",");
                coords = {x:matrix[4], y:matrix[5]};	

                matrix[4] = 0;
                matrix[5] = 0;
            }else{
                matrix = [1, 0, 0, 1, 0, 0];
                coords = {x:obj.offsetLeft, y:obj.offsetTop};
            }

            var str = "matrix("+matrix.join(",")+")";

            obj.setAttribute("posInit", str);

            EPUB.Utils.adicionaPrefix(obj, "transform", str);

            return coords;
    }
        
        function guardaDados(item){
           var botoes = document.querySelectorAll("[class*='"+item+"']");
           for(var j=0, jj = botoes.length; j < jj; j++){
                var coords = obterPosicaoAbsoluta(botoes[j]);
                botoes[j].style.left = coords.x+"px";
                botoes[j].style.top = coords.y+"px";
                botoes[j].setAttribute("posx", coords.x);
                botoes[j].setAttribute("posy", coords.y);
                botoes[j].setAttribute("posz", j+1);
                if(eval("/"+item+"/gi").test(botoes[j].getAttribute("class")))
                    botoes[j].setAttribute("data-id", botoes[j].getAttribute("class").match(eval("/"+item+"[0-9]*/gi")).toString().replace(/\D/gi,""));
                
            }
        }
        
        function controleInteracao(bl){
             var botoes = document.querySelectorAll("[class*='drag']");
             
             for(var b=0, bb = botoes.length; b < bb; b++){
                
                if(!botoes[b].classList.contains("root"))
                    continue;
                
                if(bl){
                    _listaInteracoes.push(botoes[b]);
                }
                 
                for(var i=0, it=_eventosArrastar.length; i < it; i++){
                    if(bl)
                        botoes[b].addEventListener(_eventosArrastar[i], iniciaArrastar);
                    else
                        botoes[b].removeEventListener(_eventosArrastar[i], iniciaArrastar);
                }
                
                
                for(var i=0, it=_eventosSoltar.length; i < it; i++){
                    if(bl)
                        botoes[b].addEventListener(_eventosSoltar[i], pararArrastar);
                    else
                        botoes[b].removeEventListener(_eventosSoltar[i], pararArrastar);
                }
                
                
                for(var i=0, it=_eventosMover.length; i < it; i++){
                    if(bl)
                        botoes[b].parentNode.addEventListener(_eventosMover[i], controleMovimento);
                    else
                        botoes[b].parentNode.removeEventListener(_eventosMover[i], controleMovimento);
                }
                 
             }
             
        }
        
        function iniciaArrastar(e){
            _elementoAtual = e.currentTarget;
            _elementoAtual.style.zIndex = 1000;
            _elementoAtual.classList.add("mover");
            _arrastarAtivo = true;
        }
        
        function pararArrastar(e){
            var listaDrop = document.querySelectorAll("[class*='drop'");
            var dropAtual;
            
            _elementoAtual.classList.remove("mover");
            _arrastarAtivo = false;
            _elementoAtual.style.zIndex =  _elementoAtual.getAttribute("posz");
            

            
            
            for(var i=0, ii=listaDrop.length; i < ii; i++){
                
                if(EPUB.Utils.testeContato(_elementoAtual, listaDrop[i])){
                    dropAtual = listaDrop[i];
                    
                    if(_arrastados[~~dropAtual.getAttribute("data-id") - 1] != 0){
                        var elemento = document.querySelector("[class*='drag"+_arrastados[~~dropAtual.getAttribute("data-id") - 1]+"'");
                        var st = window.getComputedStyle(elemento, null);
                        var tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("-moz-transform") || st.getPropertyValue("-ms-transform") || st.getPropertyValue("-o-transform") || st.getPropertyValue("transform");
                        var str = "translate(0, 0)";
                        EPUB.Utils.adicionaPrefix(elemento, "transform", str);

                       elemento.style.left =  elemento.getAttribute("posx")+"px"; 
                       elemento.style.top =  elemento.getAttribute("posy")+"px";
                       elemento.style.zIndex =  elemento.getAttribute("posz");
                       
                       if(_elementoAtual.getAttribute("atual-drop") != null){
                           _arrastados[~~_elementoAtual.getAttribute("atual-drop") - 1] = 0;
                           _elementoAtual.setAttribute("atual-drop", null);
                       }
                    }
                        
                    _arrastados[~~dropAtual.getAttribute("data-id") - 1] = ~~_elementoAtual.getAttribute("data-id");
                    _elementoAtual.setAttribute("atual-drop", ~~dropAtual.getAttribute("data-id"));
                    
                    var x = dropAtual.offsetLeft + (dropAtual.offsetWidth * 0.5);
                    var y = dropAtual.offsetTop + (dropAtual.offsetHeight * 0.5);

                    _elementoAtual.style.left = x+"px";
                    _elementoAtual.style.top = y+"px";
                }
                
            }
            
            if(!dropAtual){
               var st = window.getComputedStyle(_elementoAtual, null);
               var tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("-moz-transform") || st.getPropertyValue("-ms-transform") || st.getPropertyValue("-o-transform") || st.getPropertyValue("transform");
               var str = "translate(0, 0)";
               EPUB.Utils.adicionaPrefix(_elementoAtual, "transform", str);
               
              _elementoAtual.style.left =  _elementoAtual.getAttribute("posx")+"px"; 
              _elementoAtual.style.top =  _elementoAtual.getAttribute("posy")+"px";
              _elementoAtual.setAttribute("atual-drop", null);
            }
            
            console.log(_arrastados, _gabarito);
            _elementoAtual = null;
        }
        
        function controleMovimento(e){
            var x = e.type === "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).clientX : e.clientX;
            var y = e.type === "touchmove" ? (e.targetTouches[0] || e.originalEvent.changedTouches[0]).clientY : e.clientY;
            
            if(_arrastarAtivo){
                _elementoAtual.style.left = x+"px";
		_elementoAtual.style.top = y+"px";
		
		var st = window.getComputedStyle(_elementoAtual, null);
		var tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("-moz-transform") || st.getPropertyValue("-ms-transform") || st.getPropertyValue("-o-transform") || st.getPropertyValue("transform");
		
		var str = "translate(-50%, -50%)";
                
                EPUB.Utils.adicionaPrefix(_elementoAtual, "transform", str);
            }
            
        }

        function finalizaInteracao() {
            validaFimTela();
        }

        ExercicioArrastar();
    }

    // Feedback
    function Feedback(resultado, callback) {

        var _resultado;
        var _callback;

        function Feedback(resultado, callback) {

            _resultado = resultado;
            _callback = callback;
            var finalizado = false;

            var feed = document.querySelectorAll(_resultado ? ".Feedback_positivo" : ".Feedback_negativo");
            //State
            // var feed = document.querySelectorAll(_resultado ? 1 : 2);

            for (var i = 0, ii = feed.length; i < ii; i++) {
                feed[i].style.display = "block";
            }

            if (document.querySelectorAll("[class*='fechar']").length !== 0) {

                var fechar = document.querySelectorAll("[class*='fechar']");

                for (var i = 0, ii = fechar.length; i < ii; i++) {
                    if (!/_fechar/gi.test(fechar[i].parentNode.getAttribute("class"))) {
                        fechar[i].addEventListener("click", fecharFeedback);
                    }
                    fechar[i].style.display = "block";
                }

            } else {
                finalizado = true;
            }

            if (finalizado)
                _callback();
        }

        function fecharFeedback(e) {
            e.currentTarget.style.display = "none";
            _callback();
        }


        Feedback(resultado, callback);
    }

    function AltConteudo() {

        var _ativo;

        function AltConteudo() {
            var lista = document.querySelectorAll("[alt]");
            _ativo = lista.length > 0;
        }

        this.iniciarInteracao = function () {
            var lista = document.querySelectorAll("[alt]");
            for(var i=0, ii=lista.length; i < ii; i++){
               if(lista[i].getAttribute("alt").length === 0)
                   continue;
               lista[i].setAttribute("idConteudo", i);
               lista[i].classList.add("botao-altConteudo");
               lista[i].addEventListener("mouseover", controleConteudo);
               lista[i].addEventListener("mouseout", controleConteudo);
               _listaInteracoes.push(lista[i]);
               if (window.top.bjs.isTouch()){
                   lista[i].addEventListener("touchstart", controleConteudo); 
                   lista[i].addEventListener("touchend", controleConteudo); 
               }    
            }
        };

        this.ativo = function () {
            return _ativo;
        };
        
        function criaCaixa(id, elemento){
           var caixa = document.querySelectorAll("#caixa"+id);
           
            if(caixa.length > 0)
                return;
            
            caixa =  document.createElement("div");
            caixa.setAttribute("id", "caixa"+id);
            caixa.classList.add("altConteudo");
            caixa.innerHTML = elemento.getAttribute("alt");
            elemento.parentNode.appendChild(caixa);
            if(!elemento.classList.contains(EPUB.Nomeclatura.conclusao))
                elemento.classList.add(EPUB.Nomeclatura.conclusao);
        }
        
        function removeCaixa(id, elemento){
             elemento.parentNode.removeChild(elemento.parentNode.querySelector("#caixa"+id));
        }
        
        function controleConteudo(e){
            var elemento = document.createElement("div");
            if(/over|start/gi.test(e.type)){
               criaCaixa(elemento.getAttribute("idConteudo"), e.currentTarget);  
            }else{
               removeCaixa(elemento.getAttribute("idConteudo"), e.currentTarget);
            }
        }

        function finalizaInteracao() {
            validaFimTela();
        }

        AltConteudo();
    }


    init();
})(window, document);

