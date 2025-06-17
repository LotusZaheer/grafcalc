# GrafCalc

GrafCalc es una calculadora gráfica interactiva moderna construida con Angular que permite visualizar funciones matemáticas en tiempo real.

## Características

- 🎨 Interfaz moderna y minimalista con tema oscuro
- 📊 Visualización de múltiples funciones simultáneamente
- 🎯 Control interactivo del zoom y desplazamiento
- 🖱️ Coordenadas en tiempo real al pasar el mouse
- 🎨 Personalización de colores para cada función
- 📱 Diseño responsivo
- 🔍 Zoom con rueda del mouse (Ctrl + Scroll)
- 🖼️ Cuadrícula adaptativa según el nivel de zoom

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)
- Angular CLI (`npm install -g @angular/cli`)

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/lotuszaheer/grafcalc.git
cd grafcalc
```

2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
ng serve
```

4. Abre tu navegador en `http://localhost:4200`

## Uso

1. Haz clic en el botón "Ecuaciones" para abrir el menú de funciones
2. Ingresa una función matemática usando la sintaxis de JavaScript (ej: `x^2`, `sin(x)`, `2*x + 1`)
3. Personaliza el color de cada función usando el selector de color
4. Usa el botón de visibilidad para mostrar/ocultar funciones
5. Controla el zoom con:
   - Botones de zoom en la esquina inferior derecha
   - Ctrl + Rueda del mouse
6. Arrastra el gráfico para desplazarte
7. Pasa el mouse sobre las funciones para ver las coordenadas exactas

## Tecnologías Utilizadas

- Angular
- TypeScript
- SCSS
- Canvas API
- Math.js

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)


ng deploy --base-href=/grafcalc/ --no-silent