export type Rectangle = { width: number, height: number, pivotX: number, pivotY: number };
export type Point = { x: number, y: number };

export class Drehomat {
  constructor(public rect: Rectangle, public pointPulley: Point, public gamma: number, public gammaSpeed: number) {
    this.pointA_rel = ({x: -this.rect.width / 2, y: -this.rect.height / 2});
    this.pointB_rel = ({x: +this.rect.width / 2, y: -this.rect.height / 2});
    this.pointC_rel = ({x: +this.rect.width / 2, y: +this.rect.height / 2});
    this.pointD_rel = ({x: -this.rect.width / 2, y: +this.rect.height / 2});
    this.pointX_rel = ({x: 0, y: 0});
  }

  pointA_rel: Point;
  pointB_rel: Point;
  pointC_rel: Point;
  pointD_rel: Point;
  pointX_rel: Point;


  rotate(punkt: Point, gamma: number): Point {
    const p = {x: this.rect.pivotX + punkt.x, y: this.rect.pivotY + punkt.y};
    const origin = {x: this.rect.pivotX, y: this.rect.pivotY};
    const cosAngle = Math.cos(gamma);
    const sinAngle = Math.sin(gamma);

    // Verschieben des Punktes zum Ursprung, rotieren und zurückverschieben
    const x = p.x - origin.x;
    const y = p.y - origin.y;

    const neuX = x * cosAngle - y * sinAngle;
    const neuY = x * sinAngle + y * cosAngle;

    return {
      x: neuX + origin.x,
      y: neuY + origin.y
    };
  }

  angle(p1: Point, p2: Point) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  lengthTo(p1: Point, p2: Point) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  }

  getValues(angle: number) {
    let punkt_abs: Point = {x: 0, y: 0};
    const punktA_abs = this.rotate(this.pointA_rel, angle);
    const punktB_abs = this.rotate(this.pointB_rel, angle);
    const punktC_abs = this.rotate(this.pointC_rel, angle);
    const punktD_abs = this.rotate(this.pointD_rel, angle);
    const punktX_abs = this.rotate(this.pointX_rel, angle);

    const angleA = this.angle(this.pointPulley, punktX_abs);

    let angleC = 0;
    const angleC1 = this.angle(this.pointPulley, punktA_abs);
    const angleC2 = this.angle(this.pointPulley, punktB_abs);
    const angleC3 = this.angle(this.pointPulley, punktC_abs);
    const angleC4 = this.angle(this.pointPulley, punktD_abs);

    const epsilon1 = angleC1 - angleA;
    const epsilon2 = angleC2 - angleA;
    const epsilon3 = angleC3 - angleA;
    const epsilon4 = angleC4 - angleA;

    let edge: 'A' | 'B' | 'C' | 'D' = 'A';
    const maxEpsilon = this.gammaSpeed > 0 ? Math.min(epsilon1, epsilon2, epsilon3, epsilon4) : Math.max(epsilon1, epsilon2, epsilon3, epsilon4);
    if (epsilon1 === maxEpsilon) {
      edge = 'A';
      angleC = angleC1;
      punkt_abs = punktA_abs;
    } else if (epsilon2 === maxEpsilon) {
      edge = 'B';
      angleC = angleC2;
      punkt_abs = punktB_abs;
    } else if (epsilon3 === maxEpsilon) {
      edge = 'C';
      angleC = angleC3;
      punkt_abs = punktC_abs;
    } else if (epsilon4 === maxEpsilon) {
      edge = 'D';
      angleC = angleC4;
      punkt_abs = punktD_abs;
    }

    const length = this.getC( punktA_abs, punktB_abs, punktC_abs, punktD_abs, edge);

    let c = 0;
    if (edge === 'A')
      c = length.length_c1;
    else if (edge === 'B')
      c = length.length_c2;
    else if (edge === 'C')
      c = length.length_c3;
    else if (edge === 'D')
      c = length.length_c4;


    return {
      punkt_abs,
      punktA_abs,
      punktB_abs,
      punktC_abs,
      punktD_abs,
      punktX_abs,
      c,
      angleA,
      angleC,
      edge
    };
  }

  getC(punktA_abs :Point, punktB_abs:Point, punktC_abs:Point, punktD_abs:Point, edge: 'A' | 'B' | 'C' | 'D') {

    const circumference = this.rect.width + this.rect.height + this.rect.width + this.rect.height; // Umfang des Rechtecks

    let length_c1 = this.lengthTo(punktA_abs, this.pointPulley);
    let length_c2 = this.lengthTo(punktB_abs, this.pointPulley);
    let length_c3 = this.lengthTo(punktC_abs, this.pointPulley);
    let length_c4 = this.lengthTo(punktD_abs, this.pointPulley);

    if (this.gammaSpeed > 0) {
      if (this.rect.pivotY > this.pointPulley.y) {
        if (edge === 'A') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c1 += length + this.rect.width + this.rect.height + this.rect.width;
        } else if (edge === 'B') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c2 += length + this.rect.width + this.rect.height;
        } else if (edge === 'C') {
          const length = circumference * Math.floor(Math.abs(this.gamma + Math.PI) / (2 * Math.PI));
          length_c3 += length + this.rect.width;
        } else if (edge === 'D') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c4 += length + this.rect.height + this.rect.width + this.rect.height + this.rect.width;
        }
      } else {
        if (edge === 'A') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c1 += length + this.rect.width + this.rect.height + this.rect.width;
        } else if (edge === 'B') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c2 += length + this.rect.width + this.rect.height;
        } else if (edge === 'C') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c3 += length + this.rect.width;
        } else if (edge === 'D') {
          const length = circumference * Math.floor(Math.abs(this.gamma + Math.PI) / (2 * Math.PI));
          length_c4 += length;
        }
      }
    } else {
      if (this.rect.pivotY > this.pointPulley.y) {
        if (edge === 'A') {
          const length = circumference * Math.floor(Math.abs(this.gamma - Math.PI) / (2 * Math.PI));
          length_c1 += length - this.rect.width;
        } else if (edge === 'B') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c2 += length;
        } else if (edge === 'C') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c3 += length + this.rect.height;
        } else if (edge === 'D') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c4 += length + this.rect.height + this.rect.width;
        }
      } else {
        if (edge === 'A') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c1 += length + this.rect.height + this.rect.width + this.rect.height;
        } else if (edge === 'B') {
          const length = circumference * Math.floor(Math.abs(this.gamma - Math.PI) / (2 * Math.PI));
          length_c2 += length;
        } else if (edge === 'C') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c3 += length + this.rect.height;
        } else if (edge === 'D') {
          const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
          length_c4 += length + this.rect.height + this.rect.width;
        }
      }
    }

    return {
      length_c1,
      length_c2,
      length_c3,
      length_c4,
    }
  }
}
