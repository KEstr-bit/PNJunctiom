import './Particle.css';

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

  getCoords(){
    const data = {x: this.x, y: this.y}
    return data
  }

  getChargeSymbol() {
    if (this.charge > 0) return '+';
    if (this.charge < 0) return '-';
    return ' ';
  }

  getDynamicStyles() {
    return {
      left: `${this.x - this.radius}px`,
      top: `${this.y - this.radius}px`,
      width: `${this.radius * 2}px`,
      height: `${this.radius * 2}px`,
      backgroundColor: this.color,
      fontSize: `30px`, // Размер шрифта пропорционален радиусу
      lineHeight: `2px`, // Центрирование текста по вертикали
    };
  }

  render() {
    return (
      <div className="particle" style={this.getDynamicStyles()}>
        {this.getChargeSymbol()}
      </div>
    );
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