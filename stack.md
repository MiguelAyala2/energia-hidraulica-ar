# Stack recomendado — Proyecto AR: Energía Hidráulica

## Qué se necesita realmente

El pedido es: escanear un QR → la cámara del celular muestra un modelo 3D flotando en el mundo real (realidad aumentada), sin instalar ninguna app. Dos experiencias:

1. **QR 1** → modelo 3D del funcionamiento de una turbina/motor hidráulico (con sus partes: rodete, eje, agua, generador).
2. **QR 2** → modelo 3D de la represa de Itaipú y cómo funciona.

Esto descarta de entrada cualquier opción que requiera instalar una app nativa (Android/iOS) o un SDK pesado tipo Unity+Vuforia — para un proyecto de feria de ciencias de 9.º grado, con jurados escaneando con sus propios celulares, la app nativa es inviable (nadie va a instalar una app para ver un proyecto de 5 minutos).

## Stack elegido

| Capa | Tecnología | Por qué |
|---|---|---|
| Sitio web | **HTML + CSS + JS, con Vite** | Liviano, sin backend, fácil de entender y mantener para estudiantes. Vite da recarga en vivo y build optimizado con un comando. |
| Realidad aumentada | **`<model-viewer>` (Google/web.dev)** | Web component oficial de Google. Con un atributo `ar` activa automáticamente **Scene Viewer** en Android y **Quick Look** en iOS — el usuario toca "Ver en tu espacio" y la cámara se abre sola, sin apps ni markers impresos. Funciona con solo abrir una URL en el navegador. |
| Formato 3D | **glTF/GLB** (modelo principal) + **USDZ** (copia para iPhone) | GLB es el estándar web (liviano, con animaciones y PBR). USDZ es obligatorio para que funcione Quick Look en iOS — `model-viewer` sirve el archivo correcto según el dispositivo automáticamente. |
| Creación/edición de modelos 3D | **Blender** (gratis) | Para modelar la turbina (rodete, carcasa, eje, chorro de agua animado) y una versión simplificada de Itaipú (presa, vertedero, casa de máquinas). Exporta nativamente a .glb. |
| Optimización de modelos | **gltf-transform** o **gltfpack** (CLI, gratis) | Los modelos deben pesar poco (idealmente <10–15 MB) para que carguen rápido en el QR desde datos móviles del jurado. |
| Generación de QR | **Script con el paquete `qrcode` (Node.js)** o **qr-code-generator.com** para uso puntual | Cada QR apunta a una URL fija del sitio ya desplegado (ej. `tusitio.com/motor-hidraulico`). |
| Hosting / Deploy | **Vercel** (plan gratuito) | HTTPS automático (obligatorio: sin HTTPS el navegador bloquea el acceso a la cámara), deploy con un `git push`, dominio gratis tipo `proyecto-hidraulica.vercel.app`. |
| Control de versiones | **Git + GitHub** | Para que el grupo de 10 alumnos pueda trabajar en paralelo y Vercel despliegue automáticamente cada cambio. |

## Por qué NO otras opciones

- **AR.js / A-Frame con marcadores**: requiere imprimir un marcador específico (patrón cuadriculado) y que la cámara lo enfoque todo el tiempo; es más inestable y menos "mágico" que apuntar y que aparezca el modelo directo. Se descarta.
- **8th Wall / Zappar (WebAR comercial)**: AR sin marcador muy pulida, pero son plataformas pagas (o con marca de agua en el plan gratis) — no vale la pena para un proyecto escolar.
- **App nativa (Unity + ARCore/ARKit)**: la mejor calidad de AR posible, pero nadie en la feria se va a instalar una app para probarlo. Totalmente desproporcionado para el caso de uso.
- **React/Next.js**: no aporta nada aquí — no hay estado complejo, ni rutas dinámicas, ni interactividad pesada. Dos páginas estáticas con un `<model-viewer>` cada una no necesitan un framework de UI.

## Resumen de la arquitectura

```
Celular del jurado
   escanea QR #1 ──► https://tusitio.vercel.app/motor-hidraulico
   escanea QR #2 ──► https://tusitio.vercel.app/itaipu
                              │
                              ▼
                 Página HTML con <model-viewer ar>
                              │
                              ▼
            Android: Scene Viewer   /   iOS: Quick Look
                              │
                              ▼
            Cámara se abre y el modelo 3D aparece
            flotando en el mundo real, se puede
            caminar alrededor, agrandar, rotar.
```

No se necesita backend, base de datos ni servidor propio — todo el sitio es estático.
