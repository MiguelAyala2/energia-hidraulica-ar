# Despliegue.md — Publicar el sitio AR

Requisito no negociable: el sitio **debe** servirse por **HTTPS**. Sin HTTPS, los navegadores bloquean el acceso a la cámara y `<model-viewer>` no puede activar Scene Viewer ni Quick Look. Vercel da HTTPS automático, por eso es la opción recomendada.

---

## Opción recomendada: Vercel (gratis)

### 1. Preparar el repositorio
```bash
git init
git add .
git commit -m "Sitio AR energía hidráulica - versión inicial"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/energia-hidraulica-ar.git
git push -u origin main
```

### 2. Conectar con Vercel
1. Entrar a [vercel.com](https://vercel.com) e iniciar sesión con la cuenta de GitHub.
2. "Add New Project" → seleccionar el repo `energia-hidraulica-ar`.
3. Framework preset: **Vite** (Vercel lo detecta solo).
4. Build command: `npm run build` — Output directory: `dist`.
5. Click en "Deploy".

### 3. Verificar los archivos 3D
- Los modelos `.glb`/`.usdz` dentro de `/models` deben quedar en la carpeta `public/` de Vite (o configurados como assets estáticos) para que Vercel los sirva tal cual, sin procesarlos.
- Confirmar que después del deploy se puede abrir directamente, por ejemplo:
  `https://<tu-proyecto>.vercel.app/models/turbina.glb` y que descarga/muestra el archivo (no un error 404).

### 4. Dominio
- Vercel asigna automáticamente algo como `energia-hidraulica-ar.vercel.app`.
- Opcional: en "Settings → Domains" se puede poner un nombre más corto y fácil de decir en la feria, ej. `hidraulica-ar.vercel.app` (si está disponible) o un dominio propio si el colegio tiene uno.
- **Importante:** esta URL final es la que se usa para generar los QR (Fase 4 de [Proyecto.md](./Proyecto.md)) — generar los QR **recién después** de confirmar el dominio definitivo, para no tener que reimprimirlos.

### 5. Deploys automáticos
- Cada `git push` a `main` dispara un nuevo deploy automáticamente.
- Para cambios de prueba sin tocar la versión pública, usar una rama distinta (`git checkout -b pruebas`) — Vercel genera una URL de "preview" separada para cada rama/PR.

---

## Alternativa: GitHub Pages (también gratis)

Si por algún motivo no se quiere usar Vercel:

1. Build local: `npm run build` (genera `/dist`).
2. Publicar el contenido de `/dist` en la rama `gh-pages`:
```bash
npm install -D gh-pages
npx gh-pages -d dist
```
3. En GitHub → Settings → Pages, confirmar que la fuente sea la rama `gh-pages`.
4. GitHub Pages también sirve HTTPS automáticamente por defecto.

Diferencia principal con Vercel: el deploy no es automático en cada push salvo que se configure un GitHub Action.

---

## Checklist de verificación post-deploy

- [ ] Las dos páginas (`/motor-hidraulico.html`, `/itaipu.html`) cargan correctamente desde la URL pública.
- [ ] El candado de HTTPS aparece en el navegador (sin advertencias de certificado).
- [ ] Desde un Android real: tocar "Ver en Realidad Aumentada" abre Scene Viewer y el modelo aparece en la cámara.
- [ ] Desde un iPhone real: tocar el botón abre Quick Look (requiere Safari; en Chrome iOS puede fallar por limitaciones de Apple, probar siempre con Safari).
- [ ] Los modelos cargan en menos de ~5 segundos con datos móviles 4G.
- [ ] Generar y probar los QR finales apuntando a la URL ya desplegada (ver Fase 4 de Proyecto.md).

---

## Día de la feria — plan de contingencia

- Llevar los QR impresos en papel y también mostrados en una laptop/tablet por si el wifi del lugar falla (los celulares del jurado pueden usar sus propios datos).
- Tener el link corto escrito a mano como respaldo si el QR no escanea bien (mala luz, papel arrugado).
- Tener el video de respaldo de cada AR funcionando (grabado en la Fase 5) para mostrar en caso de que el celular de algún jurado no sea compatible con WebXR/Scene Viewer/Quick Look.
