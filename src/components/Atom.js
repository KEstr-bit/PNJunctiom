import { ATOM_CONFIG } from '../config';
import { probability } from '../utils/helpers';
import { Electron } from './Electron';
import Particle from './Particle';

export class Atom extends Particle {
  constructor(x, y, mass, charge, color, onGenerateChargeCarrier) {
    super(
      x, 
      y, 
      mass,
      charge, 
      color, 
      ATOM_CONFIG.DEFAULT_RADIUS
    );

    // Колбек для генерации носителей заряда (электронов)
    this.onGenerateChargeCarrier = (electron, atom) => onGenerateChargeCarrier(electron, this);
    
    // Базовые координаты (центр колебаний)
    this.baseX = x;
    this.baseY = y;
    
    // Флаг возможности движения
    this.canMove = true;
    
    // Температура атома (влияет на вероятность эмиссии электронов)
    this.temperature = 0;
    
    // Массив соседних атомов
    this.neighbors = [];
    
    // Текущие координаты заряда
    this.chargeX = x;
    this.chargeY = y;
  }

  // Получение текущих координат заряда
  getCoords() {
    return {x: this.chargeX, y: this.chargeY};
  }

  // Установка новых координат заряда
  setCoords(x, y) {
    this.chargeX = x;
    this.chargeY = y;
  }

  // Установка соседних атомов
  setNeighbors(neighbors) {
    this.neighbors = neighbors;
  }

  // Установка температуры атома
  setTemperature(temperature) {
    this.temperature = temperature;
  }

  // Метод движения атома
  move(time) {
    // Применяем ускорение к скорости
    this.speedX += this.accelX * time;
    this.speedY += this.accelY * time;

    // Сбрасываем ускорение после применения
    this.accelX = 0;
    this.accelY = 0;

    // Вычисляем следующую позицию на основе скорости
    this.nextX = this.chargeX + this.speedX * time;
    this.nextY = this.chargeY + this.speedY * time;
  }

  // Основной метод обновления состояния атома
  update(time) {
    super.update(time);

    // Если атом может двигаться - обновляем его позицию
    if(this.canMove) {
      this.move(time);
    }

    // Проверка вероятности эмиссии электрона (зависит от температуры)
    if(probability(ATOM_CONFIG.EMISSION_PROBABILITY_FACTOR * 
                  ATOM_CONFIG.TEMPERATURE_BASE ** 
                  (-ATOM_CONFIG.TEMPERATURE_DIVISOR / this.temperature))) {
      
      // Случайное колебательное движение атома
      const angle = Math.random() * Math.PI * 2; 
      this.x = this.baseX + this.radius * Math.cos(angle) * ATOM_CONFIG.MOVEMENT_FACTOR;
      this.y = this.baseY + this.radius * Math.sin(angle) * ATOM_CONFIG.MOVEMENT_FACTOR;
      
      // Если атом нейтрален - может эмитировать электрон
      if(this.charge === 0) {
        const angle = Math.random() * Math.PI * 2;
        const electronX = this.x + Math.cos(angle) * this.radius * ATOM_CONFIG.ELECTRON_EMISSION_FACTOR;
        const electronY = this.y + Math.sin(angle) * this.radius * ATOM_CONFIG.ELECTRON_EMISSION_FACTOR;
        
        // Генерация нового электрона с начальной скоростью
        this.onGenerateChargeCarrier(
          new Electron(
            electronX, 
            electronY,  
            Math.cos(angle) * ATOM_CONFIG.ELECTRON_EMISSION_SPEED, 
            Math.sin(angle) * ATOM_CONFIG.ELECTRON_EMISSION_SPEED
          ), 
          this
        );
      }
    }
  }
}