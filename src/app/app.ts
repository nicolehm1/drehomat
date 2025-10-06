import {AfterViewInit, Component, computed, ElementRef, signal, viewChild} from '@angular/core';
import {Drehomat, Point, Rectangle} from './drehomat';
import {DrehomatPlotter} from './drehomat-plotter';
import {interval} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {InputNumber} from 'primeng/inputnumber';
import {UIChart} from 'primeng/chart';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Button} from 'primeng/button';
import {Splitter} from 'primeng/splitter';

@Component({
  selector: 'app-root',
  imports: [FormsModule, InputNumber, UIChart, Button, Splitter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('animationsCanvas');
  chart = viewChild<UIChart>('chart');

  gamma = signal(0);
  rectWidth = signal(20);
  rectHeight = signal(200);
  rectPivotX = signal(100);
  rectPivotY = signal(350);

  fps = signal(30);
  gammaPerSecond = signal(-0.4);

  gammaSpeed = computed(() => this.gammaPerSecond() / this.fps());
  umin = computed(() => (60 * (this.gammaPerSecond() / (2 * Math.PI))).toFixed(2));

  rect = computed(() =>
    ({
      width: this.rectWidth(),
      height: this.rectHeight(),
      pivotX: this.rectPivotX(),
      pivotY: this.rectPivotY(),
    } as Rectangle));

  PulleyX = signal(800);
  PulleyY = signal(50);

  pointPulley = computed(() => ({x: this.PulleyX(), y : this.PulleyY()} as Point));
  drehomat = computed(() => new Drehomat(this.rect(), this.pointPulley(), this.gamma(), this.gammaSpeed()));
  drehomatPlotter = computed(() => this.canvas() ? new DrehomatPlotter(this.drehomat(), this.canvas()!.nativeElement) : null);
  offsetLength = signal(0);

  plotData = signal(
    ({
      datasets: [
        {
          label: 'length c',
          data: [] as { x: number, y: number }[],
          showLine: true,
          parsing: false,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--p-cyan-500'),
          tension: 0.4,
          yAxisID: 'yLength'
        },
        {
          label: 'speed c',
          data: [] as { x: number, y: number }[],
          showLine: true,
          parsing: false,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--p-cyan-500'),
          tension: 0.4,
          yAxisID: 'ySpeed'
        }
      ]
    })
  );

  reset() {

    // this.gamma.set(0);
    this.offsetLength.set(this.drehomat().getValues(this.gamma()).c);

    this.plotData.update(
      x => {
        x.datasets[0].data = [];
        x.datasets[1].data = [];
        return x;
      }
    )
  }

  loop = signal(true);

  toggleLoop() {
    this.loop.update(x => !x);
  }

  constructor() {
    interval(this.fps()).pipe(takeUntilDestroyed()).subscribe(
      () => {
        this.drehomatPlotter()?.plotScene(this.gamma());

        if (!this.loop()) {
          return;
        }

        if (this.gammaSpeed() === 0) {
          this.reset();
          return;
        }

        this.gamma.set(this.gamma() + this.gammaSpeed());

        const c = this.drehomat().getValues(this.gamma()).c;
        const c_next = this.drehomat().getValues(this.gamma() + this.gammaSpeed()).c;
        const c_per_s = (c_next - c) * this.fps();

        this.plotData.update(
          x => {
            x.datasets[0].data
              = [
              ...x.datasets[0].data.slice(-5000),
              {x: this.gamma(), y: c - this.offsetLength()}];

            x.datasets[1].data
              = [
              ...x.datasets[1].data.slice(-5000),
              {x: this.gamma(), y: c_per_s}];

            return x;
          }
        );

        if (this.options) {
          this.options.scales.x.max = Math.max(...this.plotData().datasets[0].data.map(p => p.x)) * 1.02;
          this.options.scales.x.min = Math.min(...this.plotData().datasets[0].data.map(p => p.x)) * 1.02;
        }

        this.chart()?.refresh()
      }
    )
  }

  options: {
    responsive: boolean;
    maintainAspectRatio: boolean;
    animation: boolean;
    plugins: { legend: { labels: { color: string } } };
    scales: {
      x: {
        type: string;
        min: number;
        max: number;
        ticks: { color: string };
        grid: { color: string; drawBorder: boolean }
      };
      yLength: { // ehemals y
        position: 'left';
        ticks: { color: string };
        grid: { color: string; drawBorder: boolean };
      };
      ySpeed: {
        position: 'right';
        ticks: { color: string };
        grid: { color: string; drawBorder: boolean };
      };
    }
  } | null = null;

  ngAfterViewInit(): void {
    this.options =
      {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        plugins: {legend: {labels: {color: getComputedStyle(document.documentElement).getPropertyValue('--p-text-color')}}},
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: 500,
            ticks: {color: getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color')},
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--p-content-border-color'),
              drawBorder: false
            }
          },

        yLength: {
          position: 'left',
          ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--p-content-border-color'),
            drawBorder: false
          }
        },
        ySpeed: {
          position: 'right',
          ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--p-text-muted-color') },
          grid: {
            // optional: kein Gitter für rechte Achse
            color: 'transparent',
            drawBorder: false
          }
        }
        }
      }
  }
}
