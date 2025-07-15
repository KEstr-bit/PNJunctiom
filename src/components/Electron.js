// Импорт конфигурации электрона и базового класса Particle
import { ELECTRON_CONFIG } from '../config.js';
import Particle from './Particle';

// Класс Electron, расширяющий базовый класс Particle
export class Electron extends Particle {
  constructor(x, y, speedX, speedY) {
    // Вызов конструктора родительского класса Particle с параметрами из конфига
    super(
      x, 
      y, 
      ELECTRON_CONFIG.MASS, 
      ELECTRON_CONFIG.CHARGE, 
      ELECTRON_CONFIG.DEFAULT_COLOR, 
      ELECTRON_CONFIG.RADIUS
    );

    // Инициализация скорости электрона (если не передана - используется 0)
    this.speedX = speedX || 0;
    this.speedY = speedY || 0;
  }

  // Метод обновления состояния электрона с учетом прошедшего времени
  update(time) {
    // Обновляем текущую позицию на основе вычисленных ранее nextX/nextY
    this.x = this.nextX;
    this.y = this.nextY;
    
    // Применяем ускорение к скорости (если ускорение было задано)
    this.speedX += this.accelX * time;
    this.speedY += this.accelY * time;

    // Сбрасываем ускорение после применения
    this.accelX = 0;
    this.accelY = 0;

    // Вычисляем следующую позицию на основе текущей скорости
    this.nextX = this.x + this.speedX * time;
    this.nextY = this.y + this.speedY * time;
  }
}