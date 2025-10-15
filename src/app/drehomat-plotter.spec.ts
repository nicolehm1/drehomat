import { DrehomatPlotter } from './drehomat-plotter';
import { Drehomat, Rectangle, Point } from './drehomat';

function createDrehomat(): Drehomat {
  const rect: Rectangle = { width: 100, height: 50, pivotX: 10, pivotY: 10 };
  const pulley: Point = { x: 150, y: 120 };
  return new Drehomat(rect, pulley, 0, 0.05);
}

describe('DrehomatPlotter', () => {
  let canvas: HTMLCanvasElement;
  let drehomat: Drehomat;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    drehomat = createDrehomat();
  });

  it('should create an instance', () => {
    const plotter = new DrehomatPlotter(drehomat, canvas);
    expect(plotter).toBeTruthy();
  });

  it('should plot without throwing', () => {
    const plotter = new DrehomatPlotter(drehomat, canvas);
    expect(() => plotter.plotScene(0)).not.toThrow();
  });
});
