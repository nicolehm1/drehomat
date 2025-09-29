import {Drehomat} from './drehomat';

export class DrehomatPlotter {
  private ctx: CanvasRenderingContext2D;

  constructor(private drehomat: Drehomat, private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  plotScene(gamma: number) {

    // Leinwand bei jedem Frame löschen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const values = this.drehomat.getValues(gamma);

    this.lineTo(values.punktA_abs, values.punktB_abs, '', 'green');
    this.lineTo(values.punktB_abs, values.punktC_abs, '', 'green');
    this.lineTo(values.punktC_abs, values.punktD_abs, '', 'green');
    this.lineTo(values.punktD_abs, values.punktA_abs, '', 'green');

    this.point(values.punktX_abs);

    // // Linie a (von X nach O) zeichnen

    this.lineTo(values.punktX_abs, this.drehomat.pointPulley, 'a');

    this.lineToPulley(values.punkt_abs, values.edge)
    this.lineTo(values.punkt_abs, values.punktX_abs, 'b');
    this.epsilon(values.angleA, values.angleC, 'ε' + values.edge);
    this.point(values.punkt_abs);

    this.point(this.drehomat.pointPulley);
  }

  epsilon(angleA: number, angleC1: number, name: string) {
    this.ctx.beginPath();
    this.ctx.arc(this.drehomat.pointPulley.x, this.drehomat.pointPulley.y, 60, angleA, angleC1); // Swapped angles
    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.fillStyle = 'red';
    this.ctx.fillText(name, this.drehomat.pointPulley.x - 40, this.drehomat.pointPulley.y - 30);
  }

  point(p: { x: number, y: number }) {
    this.ctx.fillStyle = 'blue';
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); // Punkt A
    this.ctx.fill();
  }

  lineToPulley(p: { x: number, y: number }, name: string) {
    // Linie c (von A nach O) zeichnen
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
    this.ctx.lineTo(this.drehomat.pointPulley.x, this.drehomat.pointPulley.y);
    this.ctx.strokeStyle = 'cyan';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.fillText(name, (p.x + this.drehomat.pointPulley.x) / 2 + 10, (p.y + this.drehomat.pointPulley.y) / 2);
  }

  lineTo(p1: { x: number, y: number }, p2: { x: number, y: number }, name: string, strokeStyle = 'purple') {
    // Linie c (von A nach O) zeichnen
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.fillText(name, (p1.x + p2.x) / 2 + 10, (p1.y + p2.y) / 2);
  }
}
