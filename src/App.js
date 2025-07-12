import React from 'react';
import { PNJunction } from './components/PNJunction';
import { AppRenderer } from './AppRenderer';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      acceptorPercent: 0,
      donorPercent: 0,
      particles: [],
      temperature:0,
      voltage: 0,
      currentMeasurements: [],
      isRunning: true,
      speedMultiplier: 1,
      averagedMeasurements: [],
      measurementBuffer: [],
      timeCounter: 0
    };

    this.lastUpdateTime = 0;
    this.updateInterval = 333;
    this.graphUpdateInterval = 3000;
    this.simulationEngine = new PNJunction(800, 480, 400);
  }

  handleAcceptorChange = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ acceptorPercent: newValue }, () => {
      this.simulationEngine.setAcceptorPercent(newValue);
      this.updateAtomTypes();
    });
  };

  handleDonorChange = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ donorPercent: newValue }, () => {
      this.simulationEngine.setDonorPercent(newValue);
      this.updateAtomTypes();
    });
  };

  handleTemperatureChange = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ temperature: newValue }, () => {
      this.simulationEngine.setTemperature(newValue);
    });
  };

  handleVoltageChange = (e) => {
    const newValue = parseFloat(e.target.value);
    this.setState({ voltage: newValue }, () => {
      this.simulationEngine.setVoltage(newValue);
    });
  };

  updateAtomTypes = () => {
    this.forceUpdate();
  };

  toggleSimulation = () => {
    this.setState(prevState => ({
      isRunning: !prevState.isRunning
    }));
  };

  resetSimulation = () => {
    this.simulationEngine.reset();
    this.setState({
      currentMeasurements: [],
      startTime: Date.now()
    });
  };

  increaseSpeed = () => {
    if (this.state.speedMultiplier < 8) {
      const newSpeed = this.state.speedMultiplier * 2;
      this.setState({ speedMultiplier: newSpeed });
    }
  };

  decreaseSpeed = () => {
    if (this.state.speedMultiplier > 0.25) {
      const newSpeed = this.state.speedMultiplier / 2;
      this.setState({ speedMultiplier: newSpeed });
    }
  };

  componentDidMount() {
    this.animationFrame = requestAnimationFrame(this.animate);
    this.measurementInterval = setInterval(this.takeMeasurement, this.updateInterval);
    this.graphUpdateTimer = setInterval(this.updateGraphData, this.graphUpdateInterval);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationFrame);
    clearInterval(this.measurementInterval);
    clearInterval(this.graphUpdateTimer);
  }

  animate = (timestamp) => {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }
    
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    if (this.state.isRunning)
      this.simulationEngine.update(deltaTime / 10000 * this.state.speedMultiplier);
    const updatedParticles = this.simulationEngine.getAllCircles();
    this.setState({ particles: updatedParticles });
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  takeMeasurement = () => {
    const current = this.simulationEngine.getCurrent();
    if (!isNaN(current)) {
      this.setState(prevState => ({
        measurementBuffer: [...prevState.measurementBuffer, current]
      }));
    }
  };

  updateGraphData = () => {
    if (this.state.measurementBuffer.length > 0) {
      const average = this.state.measurementBuffer.reduce((a, b) => a + b, 0) / 
                     this.state.measurementBuffer.length;
      
      this.setState(prevState => {
        const newTime = prevState.timeCounter + (this.graphUpdateInterval / 1000);
        return {
          averagedMeasurements: [
            ...prevState.averagedMeasurements,
            {
              time: newTime,
              current: average
            }
          ].slice(-20),
          measurementBuffer: [],
          timeCounter: newTime
        };
      });
    }
  };
    
  render() {
    return (
      <AppRenderer
        {...this.state}
        simulationEngine={this.simulationEngine}
        handleAcceptorChange={this.handleAcceptorChange}
        handleDonorChange={this.handleDonorChange}
        handleTemperatureChange={this.handleTemperatureChange}
        handleVoltageChange={this.handleVoltageChange}
        toggleSimulation={this.toggleSimulation}
        resetSimulation={this.resetSimulation}
        increaseSpeed={this.increaseSpeed}
        decreaseSpeed={this.decreaseSpeed}
      />
    );
  }
}

export default App;