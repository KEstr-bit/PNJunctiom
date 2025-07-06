import  {Atom}  from './Atom';
import { probability } from '../utils/helpers';
import { Electron } from './Electron';

export class Arsenicum extends Atom {
  constructor(x, y, onGenerateChargeCarrier) {
    super(
        x, 
        y, 
        1,
        0, 
        'green',
        10, 
        onGenerateChargeCarrier
    );

    this.canMove = false;
  }

update(time)
{
    super.update(time);

    if(this.charge === 0 && probability(Math.sqrt(1)))
    {
        const angle = Math.random() * Math.PI * 2; // Случайный угол
        const electronX = this.x + Math.cos(angle) * this.radius * 2;
        const electronY = this.y + Math.sin(angle) * this.radius * 2;
        this.onGenerateChargeCarrier(new Electron(electronX, electronY))
        this.charge ++;
    }

}

  
}

