import {Component, computed, ElementRef, signal, viewChild, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Drehomat, Point, Rectangle} from './drehomat';
import {DrehomatPlotter} from './drehomat-plotter';
import {interval} from 'rxjs';
import {DecimalPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DecimalPipe, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('drehomat');
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('animationsCanvas');

  canvasWidth = computed(()=>this.canvas()?.nativeElement.width ?? 800);
  canvasHeight = computed(()=>this.canvas()?.nativeElement.height ?? 600);

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

  pointPulley  =computed(()=> ({x: this.canvasWidth()/10 * 8, y: this.canvasHeight()/10 * 8} as Point));
  drehomat = computed(() => new Drehomat(this.rect(), this.pointPulley(), this.gamma(), this.gammaSpeed()));
  drehomatPlotter = computed(() => this.canvas() ? new DrehomatPlotter(this.drehomat(), this.canvas()!.nativeElement) : null);

  plotData = computed(() => {
    // get values from drehomat from gamma 0 to 360
    const values : {x: number, y: number}[] = [];
    for (let g = 0; g <= Math.PI * 2; g += Math.PI / 100) {
      const val = this.drehomat().getValues(g);
      values.push({x: g, y: val.c});
    }
    return values;

  });

  constructor() {
    interval(10).subscribe(
      () => {
        this.gamma.set(this.gamma() + this.gammaSpeed());
        this.drehomatPlotter()?.plotScene(this.gamma());
      }
    )
  }

}
