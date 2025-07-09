import { ELECTRON_CONFIG } from '../config.js';
import Particle from './Particle';

export class Electron extends Particle {
  constructor(x, y, speedX, speedY) {
    super(
      x, 
      y, 
      ELECTRON_CONFIG.MASS, 
      ELECTRON_CONFIG.CHARGE, 
      ELECTRON_CONFIG.DEFAULT_COLOR, 
      ELECTRON_CONFIG.RADIUS
    );

    this.speedX = speedX || 0;
    this.speedY = speedY || 0;
  }

  update(time) {

    // Обновляем текущую позицию
    this.x = this.nextX;
    this.y = this.nextY;
    
    // Применяем ускорение (если есть)
    this.speedX += this.accelX * time;
    this.speedY += this.accelY * time;

    this.accelX = 0;
    this.accelY = 0;

    // Обновляем позицию на основе скорости
    this.nextX = this.x + this.speedX * time;
    this.nextY = this.y + this.speedY * time;
    
  }

}