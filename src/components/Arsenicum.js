import { Atom } from './Atom';
import { probability } from '../utils/helpers';
import { Electron } from './Electron';
import { ARSENICUM_CHARGE, ARSENICUM_STARTING_CHARGE, ARSENICUM_COLOR, MIN_TEMPERATURE_FOR_MOVEMENT } from '../config';

export class Arsenicum extends Atom {
  constructor(x, y, onGenerateChargeCarrier) {
    super(
      x, 
      y, 
      ARSENICUM_CHARGE,
      ARSENICUM_STARTING_CHARGE, 
      ARSENICUM_COLOR,
      onGenerateChargeCarrier
    );

    // Атом мышьяка по умолчанию неподвижен
    this.canMove = false;
  }

  // Устанавливает температуру и определяет, может ли атом двигаться
  setTemperature(temperature) {
    super.setTemperature(temperature);
    this.canMove = temperature < MIN_TEMPERATURE_FOR_MOVEMENT;
  }

  update(time) {
    super.update(time);

    // Если атом не заряжен и температура выше минимальной, генерируем электрон
    if (this.charge === 0 && this.temperature > MIN_TEMPERATURE_FOR_MOVEMENT) {
      // Случайный угол для вылета электрона
      const angle = Math.random() * Math.PI * 2;
      // Позиция электрона рядом с атомом
      const electronX = this.x + Math.cos(angle) * this.radius * 2;
      const electronY = this.y + Math.sin(angle) * this.radius * 2;
      
      this.charge++;
      this.onGenerateChargeCarrier(new Electron(electronX, electronY), this);
    }
  }
}