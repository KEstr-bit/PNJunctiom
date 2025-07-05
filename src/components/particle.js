export default class Particle {
  constructor(x, y, mass, charge, color, radius) {
    this.x = x;
    this.y = y;
    this.nextX = x;
    this.nextY = y;
    this.mass = mass;
    this.charge = charge;
    this.radius = radius;
    this.accelX = 0;
    this.accelY = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.color = color;
    this.isAlive = true;
  }

  update(time)
  {

  }

    // Дополнительный метод для установки скорости
  setVelocity(vx, vy) {
    this.speedX = vx;
    this.speedY = vy;
  }

  // Дополнительный метод для применения силы (F = ma)
  applyForce(fx, fy) {
    this.accelX += fx / this.mass;
    this.accelY += fy / this.mass;
  }

}