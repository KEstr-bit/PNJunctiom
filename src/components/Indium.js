import { INDIUM_CHARGE, INDIUM_STARTING_CHARGE, INDIUM_COLOR, MIN_TEMPERATURE_FOR_MOVEMENT, ACTIVATION_TEMPERATURE } from '../config';
import { probability } from '../utils/helpers';
import { Atom } from './Atom';

export class Indium extends Atom {
  constructor(x, y, onGenerateChargeCarrier) {
    super(
      x, 
      y, 
      INDIUM_CHARGE,
      INDIUM_STARTING_CHARGE, 
      INDIUM_COLOR,
      onGenerateChargeCarrier
    );

    // Атом индия по умолчанию неподвижен
    this.canMove = false;
  }

  // Устанавливает температуру и определяет, может ли атом двигаться
  setTemperature(temperature) {
    super.setTemperature(temperature);
    this.canMove = temperature < MIN_TEMPERATURE_FOR_MOVEMENT;
  }

  update(time) {
    super.update(time);

    // Сбрасываем заряд, если он есть
    if (this.charge > 0) {
      this.charge = 0;
    }

    // Если атом не заряжен и температура выше пороговой, пытаемся передать заряд соседу
    if (this.charge === 0 && this.temperature > ACTIVATION_TEMPERATURE) {
      let success = false;

      // Выбираем случайного соседа
      if (this.neighbors.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.neighbors.length);
        const neighbor = this.neighbors[randomIndex];

        // Если сосед существует и не заряжен, передаем ему заряд
        if (neighbor && neighbor.charge === 0) {
          this.charge = -1;      // Индий становится отрицательно заряженным
          neighbor.charge = 1;   // Сосед становится положительно заряженным
          success = true;
        }
      }
    }
  }
}