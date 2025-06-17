import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as math from 'mathjs';

interface Equation {
  expression: string;
  color: string;
  error?: string;
  visible: boolean;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit, AfterViewInit {
  @ViewChild('graphCanvas') graphCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;

  equations: Equation[] = [];
  showEquationsMenu: boolean = false;
  errorMessage: string = '';
  private scale: number = 50; // Píxeles por unidad
  private offsetX: number = 0;
  private offsetY: number = 0;
  private isCanvasReady: boolean = false;
  private resizeObserver: ResizeObserver | null = null;
  private readonly ZOOM_FACTOR = 1.2;
  private readonly MIN_SCALE = 10;
  private readonly MAX_SCALE = 200;
  showTooltip: boolean = false;
  tooltipX: number = 0;
  tooltipY: number = 0;
  tooltipCoordinates = { x: 0, y: 0 };
  private readonly POINT_RADIUS = 5; // Radio para detectar si el mouse está cerca de un punto
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  private readonly defaultColors = [
    '#00ff00', // Verde
    '#ff0000', // Rojo
    '#0000ff', // Azul
    '#ffff00', // Amarillo
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
  ];

  constructor(private ngZone: NgZone) { }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.initializeCanvas();
      });
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.ngZone.runOutsideAngular(() => {
        this.initializeCanvas();
        this.setupResizeObserver();
      });
    }, 100);
  }

  toggleEquationsMenu() {
    this.showEquationsMenu = !this.showEquationsMenu;
  }

  addEquation() {
    const newColor = this.defaultColors[this.equations.length % this.defaultColors.length];
    this.equations.push({
      expression: '',
      color: newColor,
      visible: true
    });
    this.showEquationsMenu = true;
  }

  deleteEquation(index: number) {
    this.equations.splice(index, 1);
    this.plotAllFunctions();
  }

  updateEquation(index: number) {
    const equation = this.equations[index];
    if (!equation.expression) {
      equation.error = 'Por favor, ingresa una función';
      return;
    }

    try {
      const scope = { x: 1 };
      math.evaluate(equation.expression, scope);
      equation.error = undefined;
      this.plotAllFunctions();
    } catch (error) {
      equation.error = 'La función ingresada no es válida';
    }
  }

  toggleEquationVisibility(index: number) {
    this.equations[index].visible = !this.equations[index].visible;
    this.plotAllFunctions();
  }

  private plotAllFunctions() {
    if (!this.isCanvasReady || !this.ctx) {
      this.errorMessage = 'El canvas no está listo. Por favor, recarga la página.';
      return;
    }

    try {
      const canvas = this.graphCanvas.nativeElement;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Limpiar el canvas
      this.ctx.clearRect(-width / 2, -height / 2, width, height);
      this.drawGrid();

      // Graficar cada función
      this.equations.forEach(equation => {
        if (!equation.expression || equation.error || !equation.visible) return;

        this.ctx!.strokeStyle = equation.color;
        this.ctx!.lineWidth = 2;

        this.ctx!.beginPath();
        let firstPoint = true;

        for (let x = -width / 2; x <= width / 2; x += 1) {
          const xValue = (x - this.offsetX) / this.scale;
          try {
            const scope = { x: xValue };
            const yValue = math.evaluate(equation.expression, scope);
            const y = -yValue * this.scale + this.offsetY;

            if (firstPoint) {
              this.ctx!.moveTo(x, y);
              firstPoint = false;
            } else {
              this.ctx!.lineTo(x, y);
            }
          } catch (error) {
            console.error('Error al evaluar la función:', error);
          }
        }

        this.ctx!.stroke();
      });
    } catch (error) {
      this.errorMessage = 'Error al graficar las funciones';
      console.error('Error al graficar:', error);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isCanvasReady) {
      this.ngZone.runOutsideAngular(() => {
        this.setupCanvas();
        this.drawGrid();
        this.plotAllFunctions();
      });
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  zoomIn() {
    if (this.scale < this.MAX_SCALE) {
      this.scale *= this.ZOOM_FACTOR;
      this.ngZone.runOutsideAngular(() => {
        this.drawGrid();
        this.plotAllFunctions();
      });
    }
  }

  zoomOut() {
    if (this.scale > this.MIN_SCALE) {
      this.scale /= this.ZOOM_FACTOR;
      this.ngZone.runOutsideAngular(() => {
        this.drawGrid();
        this.plotAllFunctions();
      });
    }
  }

  private setupResizeObserver() {
    if (!this.graphCanvas?.nativeElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      if (this.isCanvasReady) {
        this.ngZone.runOutsideAngular(() => {
          this.setupCanvas();
          this.drawGrid();
          this.plotAllFunctions();
        });
      }
    });

    this.resizeObserver.observe(this.graphCanvas.nativeElement);
    this.resizeObserver.observe(document.body);
  }

  private initializeCanvas() {
    if (!this.graphCanvas?.nativeElement) {
      console.error('Canvas element not found');
      return;
    }

    try {
      const canvas = this.graphCanvas.nativeElement;
      const context = canvas.getContext('2d', { alpha: false });

      if (!context) {
        console.error('No se pudo obtener el contexto 2D del canvas');
        return;
      }

      this.ctx = context;
      this.setupCanvas();
      this.drawGrid();
      this.isCanvasReady = true;

      this.ngZone.run(() => {
        requestAnimationFrame(() => {
          this.drawGrid();
        });
      });
    } catch (error) {
      console.error('Error al inicializar el canvas:', error);
      this.errorMessage = 'Error al inicializar el canvas';
    }
  }

  private setupCanvas() {
    if (!this.ctx || !this.graphCanvas?.nativeElement) return;

    const canvas = this.graphCanvas.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Ajustar el tamaño del canvas al contenedor
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Restablecer la transformación
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.ctx.translate(rect.width / 2, rect.height / 2);
  }

  private drawGrid() {
    if (!this.ctx || !this.graphCanvas?.nativeElement) return;

    const canvas = this.graphCanvas.nativeElement;
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    // Limpiar el canvas
    this.ctx.clearRect(-width / 2, -height / 2, width, height);

    // Configurar el estilo de la cuadrícula
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    // Determinar el espaciado de las marcas según el zoom
    const spacing = this.getGridSpacing();
    const startX = Math.ceil(-width / (2 * this.scale) / spacing) * spacing;
    const endX = Math.floor(width / (2 * this.scale) / spacing) * spacing;
    const startY = Math.ceil(-height / (2 * this.scale) / spacing) * spacing;
    const endY = Math.floor(height / (2 * this.scale) / spacing) * spacing;

    // Líneas verticales y marcas en eje X
    for (let x = startX; x <= endX; x += spacing) {
      const canvasX = x * this.scale + this.offsetX;

      // Línea de cuadrícula
      this.ctx.beginPath();
      this.ctx.moveTo(canvasX, -height / 2);
      this.ctx.lineTo(canvasX, height / 2);
      this.ctx.stroke();

      // Marca en eje X
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(x.toString(), canvasX, 5);
    }

    // Líneas horizontales y marcas en eje Y
    for (let y = startY; y <= endY; y += spacing) {
      const canvasY = -y * this.scale + this.offsetY;

      // Línea de cuadrícula
      this.ctx.beginPath();
      this.ctx.moveTo(-width / 2, canvasY);
      this.ctx.lineTo(width / 2, canvasY);
      this.ctx.stroke();

      // Marca en eje Y
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(y.toString(), -5, canvasY);
    }

    // Ejes
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;

    // Eje X
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2, 0);
    this.ctx.lineTo(width / 2, 0);
    this.ctx.stroke();

    // Eje Y
    this.ctx.beginPath();
    this.ctx.moveTo(0, -height / 2);
    this.ctx.lineTo(0, height / 2);
    this.ctx.stroke();
  }

  private getGridSpacing(): number {
    // Ajustar el espaciado según el nivel de zoom
    if (this.scale > 100) {
      return 0.5; // Espaciado más pequeño para zoom alto
    } else if (this.scale > 50) {
      return 1;
    } else if (this.scale > 25) {
      return 2;
    } else if (this.scale > 10) {
      return 5;
    } else {
      return 10; // Espaciado más grande para zoom bajo
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button === 0) { // Solo botón izquierdo
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      this.graphCanvas.nativeElement.style.cursor = 'grabbing';
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isCanvasReady || !this.ctx) return;

    const canvas = this.graphCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    if (this.isDragging) {
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;

      this.offsetX += deltaX;
      this.offsetY += deltaY;

      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;

      this.ngZone.runOutsideAngular(() => {
        this.drawGrid();
        this.plotAllFunctions();
      });
      return;
    }

    // Convertir coordenadas del canvas a coordenadas matemáticas
    const mathX = (x - this.offsetX) / this.scale;
    const mathY = -(y - this.offsetY) / this.scale;

    // Verificar si el mouse está cerca de alguna línea
    let isNearLine = false;
    let closestY = 0;

    for (const equation of this.equations) {
      if (!equation.expression || equation.error || !equation.visible) continue;

      try {
        const scope = { x: mathX };
        const yValue = math.evaluate(equation.expression, scope);
        const canvasY = -yValue * this.scale + this.offsetY;

        // Si el mouse está cerca de la línea
        if (Math.abs(y - canvasY) < this.POINT_RADIUS) {
          isNearLine = true;
          closestY = yValue;
          break;
        }
      } catch (error) {
        console.error('Error al evaluar la función:', error);
      }
    }

    if (isNearLine) {
      this.showTooltip = true;
      this.tooltipX = event.clientX;
      this.tooltipY = event.clientY;
      this.tooltipCoordinates = {
        x: mathX,
        y: closestY
      };
      canvas.style.cursor = 'crosshair';
    } else {
      this.showTooltip = false;
      canvas.style.cursor = this.isDragging ? 'grabbing' : 'grab';
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (event.button === 0) { // Solo botón izquierdo
      this.isDragging = false;
      this.graphCanvas.nativeElement.style.cursor = 'grab';
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.showTooltip = false;
    this.isDragging = false;
    this.graphCanvas.nativeElement.style.cursor = 'grab';
  }
}
