import { SILICIUM_ELECTRON_COUNT, SILICIUM_CHARGE, SILICIUM_COLOR } from '../config';
import { Atom } from './Atom';

export class Silicium extends Atom {
  constructor(x, y, onGenerateChargeCarrier) {
    super(
      x, 
      y, 
      SILICIUM_ELECTRON_COUNT,
      SILICIUM_CHARGE, 
      SILICIUM_COLOR,
      onGenerateChargeCarrier
    );
  }

  //Обновление состояния атома с течением времени
  update(time) {
    super.update(time);
    
    // Обновляем позицию заряда
    this.chargeX = this.nextX;
    this.chargeY = this.nextY;
    
    // Пытаемся передать заряд соседям
    this.transferCharge();
  }

  // Передача заряда ближайшему подходящему атому-соседу

  transferCharge() {
    let closestAtom = null;
    let minDistance = Infinity;

    // Поиск ближайшего атома среди соседей, способного принять заряд
    this.neighbors.forEach(neighbor => {
      if (neighbor !== this && ((neighbor instanceof Silicium && neighbor.charge <= 0) || (neighbor.charge < 0)) && neighbor.canMove ) {
        // Вычисляем квадрат расстояния (оптимизация - избегаем вычисления квадратного корня)
        const dx = neighbor.x - this.chargeX;
        const dy = neighbor.y - this.chargeY;
        const distance = dx * dx + dy * dy;
        
        if (distance < minDistance) {
          minDistance = distance;
          closestAtom = neighbor;
        }
      }
    });

    // Если найден подходящий атом-акцептор
    if (closestAtom) {
      // Полная передача заряда и параметров движения
      closestAtom.charge += this.charge;
      closestAtom.chargeX = this.chargeX;
      closestAtom.chargeY = this.chargeY;
      closestAtom.accelX = this.accelX;
      closestAtom.accelY = this.accelY;
      closestAtom.speedX = this.speedX;
      closestAtom.speedY = this.speedY;
      
      // Сброс заряда и параметров движения текущего атома
      this.charge = 0;
      this.nextX = this.x;
      this.nextY = this.y;
      this.accelX = 0;
      this.accelY = 0;
      this.speedX = 0;
      this.speedY = 0;
    }
  }
}