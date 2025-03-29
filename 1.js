class Power {
    constructor(energy, power, level) {
      this.energy = energy;
      this.power = power;
      this.level = level;
    }
    powerControl() {
      let powerPoints = this.power - this.energy;
      return `You have these many power points ${powerPoints}`;
    }
  }
  
  let ryu = new Power(200, 500, 1);
  console.log(ryu.powerControl()); // چاپ نتیجه متد powerControl()
  console.log(ryu); // چاپ شیء ryu