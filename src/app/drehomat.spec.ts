import { Drehomat, Rectangle, Point } from './drehomat';

describe('Drehomat', () => {
  let rect: Rectangle;
  let pulley: Point;

  beforeEach(() => {
    rect = { width: 100, height: 50, pivotX: 0, pivotY: 0 };
    pulley = { x: 200, y: 200 };
  });

  it('should create an instance', () => {
    const instance = new Drehomat(rect, pulley, 0, 0.1);
    expect(instance).toBeTruthy();
  });

  it('should calculate values', () => {
    const instance = new Drehomat(rect, pulley, 0, 0.1);
    const values = instance.getValues(0);
    expect(values.c).toBeDefined();
    expect(values.punktA_abs).toBeDefined();
  });
});
