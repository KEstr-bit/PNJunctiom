import { probability } from '../utils/helpers';
import  {Atom}  from './Atom';

export class Indium extends Atom {
  constructor(x, y, onGenerateChargeCarrier) {
    super(
        x, 
        y, 
        1,
        0, 
        'purple',
        onGenerateChargeCarrier
    );

    this.canMove = false;
  }

setTemperature(temperature)
  {
    super.setTemperature(temperature);
    if(temperature < 1)
      this.canMove = true;
    else
      this.canMove = false;
  }


update(time)
{
    super.update(time);

    if(this.charge > 0)
      this.charge = 0

    if(this.charge === 0 && probability(1.67**(-1/this.temperature)))
    {
        let succes = false;

        let index = Math.floor(Math.random()*this.neighbors.length);
        const neighbor = this.neighbors[index]

        if(neighbor !== undefined)
        {
        if(neighbor.charge === 0 )
        {
            this.charge = -1;
            neighbor.charge = 1;
            succes = true;
        }
    }

    }


}

  
}

