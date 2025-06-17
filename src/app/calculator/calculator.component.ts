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
      visible: false
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

  private validateFunction(expression: string): boolean {
    try {
      const scope = { x: 1 };
      math.evaluate(expression, scope);
      return true;
    } catch (error) {
      return false;
    }
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

    // Líneas verticales
    for (let x = -width / 2; x <= width / 2; x += this.scale) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, -height / 2);
      this.ctx.lineTo(x, height / 2);
      this.ctx.stroke();
    }

    // Líneas horizontales
    for (let y = -height / 2; y <= height / 2; y += this.scale) {
      this.ctx.beginPath();
      this.ctx.moveTo(-width / 2, y);
      this.ctx.lineTo(width / 2, y);
      this.ctx.stroke();
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
}
