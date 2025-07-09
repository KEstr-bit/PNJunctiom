import  {Atom}  from './Atom';

export class Silicium extends Atom {
  constructor(x, y, onGenerateChargeCarrier) {
    super(
        x, 
        y, 
        1,
        0, 
        'red',
        onGenerateChargeCarrier
    );

  }

update(time)
{
    super.update(time);
    
    this.chargeX = this.nextX;
    this.chargeY = this.nextY;
    this.transferCharge();
}

  transferCharge(time) {
    let closestAtom = null;
    let minDistance = Infinity;

    // Находим ближайший атом из соседей
    this.neighbors.forEach(neighbor => {
        if (neighbor !== this && neighbor.canMove && neighbor.charge <= 0) {
            // Вычисляем расстояние до текущего соседа
            const dx = neighbor.x - this.chargeX;
            const dy = neighbor.y - this.chargeY;
            const distance = dx * dx + dy * dy; // используем квадрат расстояния для оптимизации
            
            if (distance < minDistance) {
                minDistance = distance;
                closestAtom = neighbor;
            }
        }
    });



    // Если нашли подходящий атом, передаём заряд
    if (closestAtom) {

        // Полностью передаем заряд
        closestAtom.charge += this.charge;
        closestAtom.chargeX = this.chargeX;
        closestAtom.chargeY = this.chargeY;
        closestAtom.accelX = this.accelX;
        closestAtom.accelY = this.accelY;
        closestAtom.speedX = this.speedX;
        closestAtom.speedY = this.speedY;
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

