// Carga cada sección de partials/*.html y la inserta en su lugar.
// Esto es lo que hace posible tener el HTML dividido en archivos
// pequeños (uno por sección) en vez de un solo index.html gigante.
//
// Cómo funciona: cualquier elemento con data-include="ruta.html" es
// reemplazado por el contenido de ese archivo. Si un archivo falla al
// cargar (por ejemplo, se borró o tiene un error), SOLO esa sección
// queda vacía — el resto de la página sigue funcionando normal.

export async function loadPartials() {
  const placeholders = Array.from(document.querySelectorAll('[data-include]'));

  await Promise.all(placeholders.map(async (node) => {
    const url = node.getAttribute('data-include');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const html = await res.text();
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const frag = document.createDocumentFragment();
      while (temp.firstChild) frag.appendChild(temp.firstChild);
      node.replaceWith(frag);
    } catch (err) {
      console.error(`[NOVA] No se pudo cargar la sección "${url}":`, err);
      node.replaceWith(document.createComment(` No se pudo cargar ${url} `));
    }
  }));
}
