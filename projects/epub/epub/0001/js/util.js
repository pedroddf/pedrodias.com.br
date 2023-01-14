var ClasseCSS = {
	CURSOR_CLIQUE: "cursorClique",
	DESABILITA: "desabilitaElemento",
	DESTAQUE: "destaqueElemento",
	OCULTA: "ocultaElemento",
	REMOVE: "removeElemento"
}

function addClass(elemento, classe) {
	try {
		elemento.classList.add(classe);
	} catch(e) {
		console.log(e.message);
	}
}

function removeClass(elemento, classe) {
	try {
		elemento.classList.remove(classe);
	} catch(e) {
		console.log(e.message);
	}
}

function validaString(str) {
	return str != undefined && str != "undefined" && str;
}

function isEmpty(str) {
	return !validaString(str) || str.length == 0;
}

function getQueryStringValue(str) {
	return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(str).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}