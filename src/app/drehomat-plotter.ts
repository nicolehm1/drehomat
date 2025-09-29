import {Drehomat} from './drehomat';

export class DrehomatPlotter {
  private ctx: CanvasRenderingContext2D;
  cartesianOptions: { xMax: number; xStep: number; yMax: number; yStep: number; margin: number } ;


  constructor(private drehomat: Drehomat, private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;

    this.cartesianOptions = {
      xMax : this.canvas.width,
      xStep: this.canvas.width / 10,
      yMax : this.canvas.height,
      yStep: this.canvas.height / 10,
      margin: this.canvas.width /20
    };
  }

  plotScene(gamma: number) {

    // Leinwand bei jedem Frame löschen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.plotCartesianDiagram(this.cartesianOptions);

    const values = this.drehomat.getValues(gamma);

    const punktA_abs = this.toDiagramm(values.punktA_abs);
    const punktB_abs = this.toDiagramm(values.punktB_abs);
    const punktC_abs = this.toDiagramm(values.punktC_abs);
    const punktD_abs = this.toDiagramm(values.punktD_abs);
    const punktX_abs = this.toDiagramm(values.punktX_abs);
    const punkt_abs = this.toDiagramm(values.punkt_abs);
    const pointPulley = this.toDiagramm(this.drehomat.pointPulley);

    this.lineTo(punktA_abs, punktB_abs, '', 'green');
    this.lineTo(punktB_abs, punktC_abs, '', 'green');
    this.lineTo(punktC_abs, punktD_abs, '', 'green');
    this.lineTo(punktD_abs, punktA_abs, '', 'green');

    this.point(punktX_abs);

    // // Linie a (von X nach O) zeichnen

    this.lineTo(punktX_abs, pointPulley, 'a');

    this.lineToPulley(punkt_abs, pointPulley, values.edge)
    this.lineTo(punkt_abs, punktX_abs, 'b');
    this.epsilon(pointPulley,values.angleA, values.angleC, 'ε' + values.edge);
    this.point(punkt_abs);

    this.point(pointPulley);
  }

  toDiagramm(p: { x: number, y: number }): { x: number, y: number } {

    const xScale = 1 / this.cartesianOptions.xMax * (this.cartesianOptions.xMax - this.cartesianOptions.margin * 2);
    const yScale = 1 / this.cartesianOptions.yMax * (this.cartesianOptions.yMax - this.cartesianOptions.margin * 2);

    return {x: (p.x * xScale) + 50, y: this.cartesianOptions.yMax - p.y * yScale - 50};
  }

  epsilon(p: { x: number, y: number },angleA: number, angleC1: number, name: string) {
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 60,- angleA, -angleC1); // Swapped angles
    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.fillStyle = 'red';
    this.ctx.fillText(name, p.x - 40, p.y - 30);
  }

  point(p: { x: number, y: number }) {
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); // Punkt A
    this.ctx.fill();
  }

  lineToPulley(p: { x: number, y: number },p2: { x: number, y: number }, name: string) {
    // Linie c (von A nach O) zeichnen
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = 'cyan';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.fillText(name, (p.x + p2.x) / 2 + 10, (p.y + p2.y) / 2);
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

  plotCartesianDiagram(options: {
    xMax?: number,
    yMax?: number,
    xStep?: number,
    yStep?: number,
    margin?: number,
    showGrid?: boolean,
    font?: string
  } = {}): void {
    const {
      xMax = 10,
      yMax = 10,
      xStep = 1,
      yStep = 1,
      margin = 50,
      showGrid = true,
      font = '12px sans-serif'
    } = options;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Canvas leeren
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.font = font;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#222';
    ctx.fillStyle = '#fff';

    // Koordinatensystem: Origin links unten
    const originX = margin;
    const originY = h - margin;

    // Nutzbarer Bereich
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;

    // Umrechnung von Modellwert -> Pixel
    const scaleX = plotW / xMax;
    const scaleY = plotH / yMax;

    // Raster
    if (showGrid) {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertikal
      for (let x = 0; x <= xMax; x += xStep) {
        const px = originX + x * scaleX;
        ctx.beginPath();
        ctx.moveTo(px, originY);
        ctx.lineTo(px, originY - plotH);
        ctx.stroke();
      }

      // Horizontal
      for (let y = 0; y <= yMax; y += yStep) {
        const py = originY - y * scaleY;
        ctx.beginPath();
        ctx.moveTo(originX, py);
        ctx.lineTo(originX + plotW, py);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Achsen
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    // x-Achse
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + plotW, originY);
    ctx.stroke();

    // y-Achse
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - plotH);
    ctx.stroke();

    // Achsenpfeile
    const arrow = (x1: number, y1: number, x2: number, y2: number) => {
      const headLen = 10;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const ang = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(ang - Math.PI / 6), y2 - headLen * Math.sin(ang - Math.PI / 6));
      ctx.lineTo(x2 - headLen * Math.cos(ang + Math.PI / 6), y2 - headLen * Math.sin(ang + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
    };
    arrow(originX, originY, originX + plotW, originY);              // x
    arrow(originX, originY, originX, originY - plotH);               // y

    // Ticks + Labels
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = 0; x <= xMax; x += xStep) {
      const px = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, originY - 5);
      ctx.lineTo(px, originY + 5);
      ctx.stroke();
      ctx.fillText(String(x), px, originY + 8);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = 0; y <= yMax; y += yStep) {
      const py = originY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(originX - 5, py);
      ctx.lineTo(originX + 5, py);
      ctx.stroke();
      if (y !== 0) ctx.fillText(String(y), originX - 8, py);
    }

    // Achsen-Beschriftung
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('x', originX + plotW + 15, originY - 5);
    ctx.textAlign = 'left';
    ctx.fillText('y', originX + 5, originY - plotH - 10);

    ctx.restore();
  }
}
