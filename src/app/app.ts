import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import {Drehomat, Point, Rectangle} from './drehomat';
import {DrehomatPlotter} from './drehomat-plotter';
import {interval} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {InputNumber} from 'primeng/inputnumber';
import {UIChart} from 'primeng/chart';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [FormsModule, InputNumber, UIChart],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('animationsCanvas');

  canvasWidth = computed(() => this.canvas()?.nativeElement.width ?? 0);
  canvasHeight = computed(() => this.canvas()?.nativeElement.height ?? 0);

  gamma = signal(0);
  gammaSpeed = signal(0.01);
  rectWidth = signal(20);
  rectHeight = signal(200);
  rectPivotX = signal(100);
  rectPivotY = signal(100);

  rect = computed(() =>
    ({
      width: this.rectWidth(),
      height: this.rectHeight(),
      pivotX: this.rectPivotX(),
      pivotY: this.rectPivotY(),
    } as Rectangle));

  pointPulley = computed(() => ({x: this.canvasWidth() / 10 * 8, y: this.canvasHeight() / 10 * 8} as Point));
  drehomat = computed(() => new Drehomat(this.rect(), this.pointPulley(), this.gamma(), this.gammaSpeed()));
  drehomatPlotter = computed(() => this.canvas() ? new DrehomatPlotter(this.drehomat(), this.canvas()!.nativeElement) : null);

  plotData = computed(() => {
    // get values from drehomat from gamma 0 to 360
    const documentStyle = getComputedStyle(document.documentElement);

    const values: { x: number, y: number }[] = [];
    for (let g = 0; g <= Math.PI * 2; g += Math.PI / 30) {
      const gamma = g + this.gamma();

      const val = this.drehomat().getValues(g + gamma);
      values.push({x: this.toDegree(gamma), y: val.c});
    }

    return {
      labels: values.map(x => x.x),
      datasets: [
        {
          label: 'length c',
          data: values.map(x => x.y),
          fill: false,
          borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
          tension: 0.4
        }
      ]
    };
  });

  toDegree(rad: number) {
    return Math.floor(rad * 180 / Math.PI);
  }

  constructor() {
    interval(10).pipe(takeUntilDestroyed()).subscribe(
      () => {
        this.gamma.set(this.gamma() + this.gammaSpeed());
        this.drehomatPlotter()?.plotScene(this.gamma());
      }
    )
  }

  ngOnInit() {
    this.initChart();
  }


  options: any;
  platformId = inject(PLATFORM_ID);
  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      this.options = {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        aspectRatio: 1,
        plugins: {
          legend: {labels: {color: textColor}}
        },
        scales: {
          x: {
            ticks: {color: textColorSecondary},
            grid: {color: surfaceBorder, drawBorder: false}
          },
          y: {
            ticks: {color: textColorSecondary},
            grid: {color: surfaceBorder, drawBorder: false}
          }
        }
      };
    }
  }

}
