export default class Circle {
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

}