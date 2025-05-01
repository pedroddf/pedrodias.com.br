function openModal(conteudoId) {
    var conteudo = document.getElementById(conteudoId).innerHTML;
    document.getElementById("modalBody").innerHTML = conteudo;
    var modal = document.getElementById("myModal");
    modal.classList.add("show");
  }
  
  function closeModal() {
    var modal = document.getElementById("myModal");
    modal.classList.remove("show");
    // Aguarda a transição antes de esconder
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }
  
  // Fecha ao clicar fora
  window.onclick = function(event) {
    var modal = document.getElementById("myModal");
    if (event.target === modal) {
      closeModal();
    }
  }
  
  // Garante que ao adicionar .show já mostre com display block
  const observer = new MutationObserver(() => {
    var modal = document.getElementById("myModal");
    if (modal.classList.contains("show")) {
      modal.style.display = "flex";
    }
  });
  observer.observe(document.getElementById("myModal"), { attributes: true });