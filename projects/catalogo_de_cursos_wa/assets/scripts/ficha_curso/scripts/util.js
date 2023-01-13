var ClasseCSS = {
	REMOVE: "remove",
	OCULTA: "oculta",
	CURSOR_CLIQUE: "cursor-clique",
	ANIMACAO: "animacao",
	SCROLL: "flexcroll"
}

function hasClass(elemento, classe) {
	return !!elemento.className.match(new RegExp('(\\s|^)'+classe+'(\\s|$)'));
}

function addClass(elemento, classe) {
	if (elemento && !hasClass(elemento, classe)){
		elemento.className += " "+classe;
		return true;
	}
}

function removeClass(elemento, classe) {
	if (elemento && hasClass(elemento, classe)) {
		var expressao = new RegExp('(\\s|^)'+classe+'(\\s|$)');
		elemento.className = elemento.className.replace(expressao, ' ').trim();
		return true;
	}
}