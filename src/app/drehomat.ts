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
    const pointPulley_abs = this.pointPulley;

    const angleA = this.angle(pointPulley_abs, punktX_abs);

    let angleC = 0;
    const angleC1 = this.angle(pointPulley_abs, punktA_abs);
    const angleC2 = this.angle(pointPulley_abs, punktB_abs);
    const angleC3 = this.angle(pointPulley_abs, punktC_abs);
    const angleC4 = this.angle(pointPulley_abs, punktD_abs);

    // Winkel in Grad
    const epsilon1 = angleC1 - angleA;
    const epsilon2 = angleC2 - angleA;
    const epsilon3 = angleC3 - angleA;
    const epsilon4 = angleC4 - angleA;
    const maxEpsilon = this.gammaSpeed > 0 ? Math.min(epsilon1, epsilon2, epsilon3, epsilon4) : Math.max(epsilon1, epsilon2, epsilon3, epsilon4);

    // --- Werte berechnen ---
    // Längen (Euklidischer Abstand)
    const length_a = this.lengthTo(punktX_abs, pointPulley_abs);
    const length_b = this.lengthTo(punktA_abs, punktX_abs);
    const length_c1 = this.lengthTo(punktA_abs, pointPulley_abs);
    const length_c2 = this.lengthTo(punktB_abs, pointPulley_abs);
    const length_c3 = this.lengthTo(punktC_abs, pointPulley_abs);
    const length_c4 = this.lengthTo(punktD_abs, pointPulley_abs);

    let c = 0;
    let edge = 'A';

    const circumference = this.rect.width + this.rect.height + this.rect.width + this.rect.height; // Umfang des Rechtecks
     // Länge des Rechtecks in Abhängigkeit von gamma

    if (this.gammaSpeed > 0){
      if (epsilon1 === maxEpsilon) {
        const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
        c = length_c1 + length+ this.rect.width + this.rect.height + this.rect.width;
        edge = 'A';
        angleC = angleC1;
        punkt_abs = punktA_abs;
      } else if (epsilon2 === maxEpsilon) {
        const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
        c = length_c2 + length + this.rect.width+ this.rect.height;
        edge = 'B';
        angleC = angleC2;
        punkt_abs = punktB_abs;
      } else if (epsilon3 === maxEpsilon) {
        const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));
        c = length_c3 + length + this.rect.width;
        edge = 'C';
        angleC = angleC3;
        punkt_abs = punktC_abs;
      } else if (epsilon4 === maxEpsilon) {
        const length = circumference * Math.floor(Math.abs(this.gamma + Math.PI) / (2 * Math.PI));
        c = length_c4 + length ;
        edge = 'D';
        angleC = angleC4;
        punkt_abs = punktD_abs;
      }
    }else{
      if (epsilon1 === maxEpsilon) {
        const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));

        c = length_c1 + length + this.rect.height + this.rect.width + this.rect.height;
        edge = 'A';
        angleC = angleC1;
        punkt_abs = punktA_abs;
      } else if (epsilon2 === maxEpsilon) {
        const length = circumference * Math.floor(Math.abs(this.gamma - Math.PI) / (2 * Math.PI));

        c = length_c2 + length ;
        edge = 'B';
        angleC = angleC2;
        punkt_abs = punktB_abs;
      } else if (epsilon3 === maxEpsilon) {
        const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));

        c = length_c3 + length + this.rect.height;
        edge = 'C';
        angleC = angleC3;
        punkt_abs = punktC_abs;
      } else if (epsilon4 === maxEpsilon) {
        const length = circumference * Math.floor(Math.abs(this.gamma) / (2 * Math.PI));

        c = length_c4 + length + this.rect.height + this.rect.width;
        edge = 'D';
        angleC = angleC4;
        punkt_abs = punktD_abs;
      }
    }


    return {
      punkt_abs,
      punktA_abs,
      punktB_abs,
      punktC_abs,
      punktD_abs,
      punktX_abs,
      length_a,
      length_b,
      c,
      length_c1,
      length_c2,
      length_c3,
      length_c4,
      maxEpsilon,
      epsilon1,
      epsilon2,
      epsilon3,
      epsilon4,
      angleA,
      angleC,
      angleC1,
      angleC2,
      angleC3,
      angleC4,
      edge
    };
  }
}
