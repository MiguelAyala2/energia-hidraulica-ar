# Proyecto.md — Construcción del sitio por fases

Proyecto: Feria de Ciencias — Energía Hidráulica con Realidad Aumentada
Stack: ver [stack.md](./stack.md)

---

## Fase 0 — Preparación (1 día)

- [ ] Instalar Node.js (LTS) y Git.
- [ ] Instalar Blender (para modelado 3D).
- [ ] Crear repositorio en GitHub (`energia-hidraulica-ar`).
- [ ] Crear cuenta en Vercel y vincularla al repositorio.
- [ ] Definir estructura de carpetas:

```
/energia-hidraulica-ar
├── index.html              → portada del proyecto (menú con los 2 QR)
├── motor-hidraulico.html   → página AR del motor/turbina
├── itaipu.html             → página AR de Itaipú
├── /models
│   ├── turbina.glb
│   ├── turbina.usdz
│   ├── itaipu.glb
│   └── itaipu.usdz
├── /assets
│   ├── /img
│   └── /css
├── /scripts
│   └── generar-qr.js
└── vite.config.js
```

---

## Fase 1 — Esqueleto del sitio (2–3 días)

- [ ] Inicializar proyecto con Vite (`npm create vite@latest`).
- [ ] Crear `index.html` con:
  - Título del proyecto, nombres de los autores, logo del colegio.
  - Dos tarjetas: "Motor Hidráulico" y "Represa de Itaipú", cada una con su QR y un link directo (por si alguien ya está en el celular).
- [ ] Crear `motor-hidraulico.html` e `itaipu.html` como páginas separadas, cada una con:
  - Título y breve texto explicativo (reutilizar contenido del marco teórico ya escrito: proceso de 4 etapas, tipos de turbina, componentes).
  - Un botón "Ver en Realidad Aumentada".
- [ ] Estilo visual simple y responsive (una sola hoja de CSS compartida), pensado para celular en primer lugar.

**Entregable de la fase:** sitio navegable localmente (`npm run dev`), sin AR todavía, con textos y maquetado listos.

---

## Fase 2 — Modelado 3D (5–7 días, en paralelo con Fase 1)

### Modelo 1: Motor/turbina hidráulica
- [ ] Modelar en Blender las piezas clave explicadas en el marco teórico: presa/tubería forzada, rodete de turbina (elegir Francis, es la más visual), eje, generador.
- [ ] Animar: flujo de agua entrando, giro del rodete, giro del eje, giro del generador (loop simple).
- [ ] Simplificar geometría (low-poly) para que el archivo pese poco.
- [ ] Exportar a `.glb` (glTF binario) con animación incluida.
- [ ] Exportar también a `.usdz` para iOS (Blender + plugin, o convertir con `usdzconvert`/Reality Converter en Mac).

### Modelo 2: Represa de Itaipú
- [ ] Modelar versión simplificada: cuerpo de la presa, vertedero, casa de máquinas, embalse (plano de agua), río aguas abajo.
- [ ] Opcional: animar apertura de compuertas o flujo de agua en el vertedero.
- [ ] Exportar a `.glb` y `.usdz` igual que el modelo anterior.

- [ ] Optimizar ambos modelos con `gltf-transform` (compresión Draco/Meshopt) para bajar el peso final.

**Entregable de la fase:** `turbina.glb`, `turbina.usdz`, `itaipu.glb`, `itaipu.usdz` dentro de `/models`, cada uno < 15 MB.

---

## Fase 3 — Integración de AR (2 días)

- [ ] Agregar la librería `<model-viewer>` vía CDN o npm en `motor-hidraulico.html` e `itaipu.html`.
- [ ] Insertar el componente apuntando a los modelos correspondientes:

```html
<model-viewer
  src="/models/turbina.glb"
  ios-src="/models/turbina.usdz"
  alt="Modelo 3D animado de una turbina hidráulica"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  auto-rotate
  poster="/assets/img/turbina-poster.jpg">
  <button slot="ar-button">Ver en Realidad Aumentada</button>
</model-viewer>
```

- [ ] Repetir para Itaipú con su propio modelo.
- [ ] Probar en al menos un Android real y un iPhone real (el AR no funciona en el emulador de escritorio, solo muestra el modelo en 3D "de mesa").
- [ ] Ajustar escala inicial del modelo para que se vea bien al colocarlo en el piso/mesa.

**Entregable de la fase:** las dos páginas muestran el modelo 3D interactivo y el botón de AR funciona en celular real.

---

## Fase 4 — Generación de QR (0.5 día, se hace al final, **después** de tener la URL final de Vercel)

- [ ] Una vez desplegado el sitio (ver [despliegue.md](./despliegue.md)), tomar las URLs finales:
  - `https://<tu-dominio>.vercel.app/motor-hidraulico.html`
  - `https://<tu-dominio>.vercel.app/itaipu.html`
- [ ] Generar los QR con un script (`scripts/generar-qr.js` usando el paquete `qrcode`) o con una herramienta online, apuntando exactamente a esas URLs.
- [ ] Exportar los QR en alta resolución (PNG o SVG) para imprimir en el afiche/trifolio de la feria.
- [ ] Probar cada QR impreso escaneándolo con la cámara nativa del celular (no con una app de QR de terceros) para confirmar que abre directo.

**Entregable de la fase:** dos imágenes de QR listas para imprimir, verificadas en papel.

---

## Fase 5 — Pruebas finales y contenido de respaldo (1–2 días)

- [ ] Probar el flujo completo en varios celulares del grupo (distintas marcas/SO).
- [ ] Probar con datos móviles (no solo WiFi del colegio) por si en el lugar de la feria hay mala señal.
- [ ] Tener un plan B: capturar un video corto de cada AR funcionando, por si algún celular del jurado no soporta WebXR/Scene Viewer/Quick Look (celulares muy viejos).
- [ ] Revisar que los textos explicativos de cada página coincidan con el marco teórico del proyecto escrito (turbinas Pelton/Francis/Kaplan, componentes, tipos de centrales, Itaipú).
- [ ] Checklist de accesibilidad básica: texto legible en celular, botones grandes, carga rápida.

**Entregable de la fase:** proyecto listo para presentar el día de la feria.

---

## Resumen de tiempos (orientativo)

| Fase | Duración | Puede paralelizarse con |
|---|---|---|
| 0. Preparación | 1 día | — |
| 1. Esqueleto del sitio | 2–3 días | Fase 2 |
| 2. Modelado 3D | 5–7 días | Fase 1 |
| 3. Integración AR | 2 días | — |
| 4. Generación de QR | 0.5 día | — (requiere deploy previo) |
| 5. Pruebas finales | 1–2 días | — |

**Total estimado: ~2 semanas** trabajando en equipo (repartir modelado 3D y maquetado web entre distintos integrantes del grupo).
