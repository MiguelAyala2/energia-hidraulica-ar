/* Botones para compartir: "Compartir" abre el menú nativo del teléfono (si el navegador lo
   permite) y "Copiar enlace" copia la dirección de la página. WhatsApp, Facebook, X y
   Telegram son enlaces comunes y funcionan sin este script. */
(function () {
  var caja = document.querySelector('.compartir');
  if (!caja) return;
  var url = caja.getAttribute('data-url'), texto = caja.getAttribute('data-texto');
  var aviso = caja.querySelector('.compartir-aviso'), espera;

  function avisar(t) {
    if (!aviso) return;
    aviso.textContent = t;
    clearTimeout(espera);
    espera = setTimeout(function () { aviso.textContent = ''; }, 2500);
  }

  var nativo = caja.querySelector('[data-compartir]');
  if (nativo && navigator.share) {
    nativo.hidden = false;
    nativo.addEventListener('click', function () {
      navigator.share({ title: document.title, text: texto, url: url }).catch(function () {});
    });
  }

  var copiar = caja.querySelector('[data-copiar]');
  if (!copiar) return;
  function copiarViejo() {
    var t = document.createElement('textarea');
    t.value = url; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); avisar('¡Enlace copiado!'); } catch (e) { avisar(url); }
    document.body.removeChild(t);
  }
  copiar.addEventListener('click', function () {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { avisar('¡Enlace copiado!'); }, copiarViejo);
    } else {
      copiarViejo();
    }
  });
})();
