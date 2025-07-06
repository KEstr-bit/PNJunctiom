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
        10 , 
        onGenerateChargeCarrier
    );

    this.canMove = false;
  }

update(time)
{
    super.update(time);

    if(this.charge === 0 && probability(Math.sqrt(1)))
    {
        let succes = false;

        let index = Math.floor(Math.random()*this.neighbors.length);
        const neighbor = this.neighbors[index]
        console.log(this, this.neighbors, index)
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

