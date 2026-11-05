/* Contador de visitas: suma una visita por sesión del navegador (aunque se recorran varias
   páginas) y muestra el total en el pie. Usa el servicio gratuito Abacus; si no responde,
   el contador queda oculto y el sitio funciona igual. Solo el sitio publicado suma en el
   contador real: las pruebas locales usan otro. */
(function () {
  var caja = document.getElementById('visitas'), numero = document.getElementById('visitas-n');
  if (!caja || !numero || !window.fetch) return;

  var clave = location.hostname === 'energia-hidraulica-ar.vercel.app' ? 'visitas' : 'visitas-pruebas';
  var contada = false;
  try { contada = sessionStorage.getItem('visita-contada') === '1'; } catch (e) {}

  var url = 'https://abacus.jasoncameron.dev/' + (contada ? 'get' : 'hit') + '/energia-hidraulica-ar/' + clave;
  var corte = window.AbortController ? new AbortController() : null;
  if (corte) setTimeout(function () { corte.abort(); }, 6000);

  fetch(url, { cache: 'no-store', signal: corte ? corte.signal : undefined })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (datos) {
      if (typeof datos.value !== 'number') return;
      if (!contada) { try { sessionStorage.setItem('visita-contada', '1'); } catch (e) {} }
      numero.textContent = datos.value.toLocaleString('es');
      caja.lastChild.textContent = datos.value === 1 ? ' visita al sitio' : ' visitas al sitio';
      caja.hidden = false;
    })
    .catch(function () {});
})();
