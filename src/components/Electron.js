import { ELECTRON_CONFIG } from '../config.js';

export default class Electron extends Circle {
  constructor(x, y) {
    super(
      x, 
      y, 
      ELECTRON_CONFIG.MASS, 
      ELECTRON_CONFIG.CHARGE, 
      ELECTRON_CONFIG.DEFAULT_COLOR, 
      ELECTRON_CONFIG.RADIUS
    );
  }

  update(time) {

    // Обновляем текущую позицию
    this.x = this.nextX;
    this.y = this.nextY;
    
    // Применяем ускорение (если есть)
    this.speedX += this.accelX * time;
    this.speedY += this.accelY * time;

    // Обновляем позицию на основе скорости
    this.nextX = this.x + this.speedX * time;
    this.nextY = this.y + this.speedY * time;
    
  }

}