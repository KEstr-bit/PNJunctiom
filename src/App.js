import React from 'react';
import './App.css';
import { Electron } from './components/Electron';
import  {Atom}  from './components/Atom';
import { probability } from './utils/helpers';
import { SimulationCanvas } from './SimulationCanvas';
import { PNJunction } from './components/PNJunction';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      acceptorPercent: 5,
      donorPercent: 5,
      particles: [],
      maxElectrons: 10,
      currentElectrons: 0,
      temperature: 50,
      voltage: 0,
      currentTimeData: [],
      startTime: Date.now(),
      currentMeasurements: [],
      lastUpdateTime: 0,
      isRunning: true, // Добавлено состояние для паузы/старта
      speedMultiplier: 1, // Множитель скорости
    };

    this.lastUpdateTime = 0;
    this.updateInterval = 333;
    this.graphUpdateInterval = 1000;
    this.simulationEngine = new PNJunction(800,480,400);
  }

// Обновленный метод для изменения акцепторов
  handleAcceptorChange = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ acceptorPercent: newValue }, () => {
      this.simulationEngine.setAcceptorPercent(newValue);
      this.updateAtomTypes();
    });
  };

  // Обновленный метод для изменения доноров
  handleDonorChange = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ donorPercent: newValue }, () => {
      this.simulationEngine.setDonorPercent(newValue);
      this.updateAtomTypes();
    });
  };

  // Обновленный метод для изменения температуры
  handleTemperatureChange = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ temperature: newValue }, () => {
      this.simulationEngine.setTemperature(newValue);
    });
  };

  // Обновленный метод для изменения напряжения
  handleVoltageChange = (e) => {
    const newValue = parseFloat(e.target.value);
    this.setState({ voltage: newValue }, () => {
      this.simulationEngine.setVoltage(newValue);
    });
  };

  // Метод для обновления типов атомов
  updateAtomTypes = () => {
    this.simulationEngine.updateAtomTypes(
      this.state.acceptorPercent,
      this.state.donorPercent
    );
    this.forceUpdate(); // Принудительное обновление для отображения изменений
  };

  // Методы для управления симуляцией
  toggleSimulation = () => {
    this.setState(prevState => ({
      isRunning: !prevState.isRunning
    }), () => {
      this.simulationEngine.setPaused(!this.state.isRunning);
    });
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
      this.simulationEngine.setSpeedMultiplier(newSpeed);
    }
  };

  decreaseSpeed = () => {
    if (this.state.speedMultiplier > 0.25) {
      const newSpeed = this.state.speedMultiplier / 2;
      this.setState({ speedMultiplier: newSpeed });
      this.simulationEngine.setSpeedMultiplier(newSpeed);
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
  


  this.simulationEngine.update(deltaTime/1000);
  const updatedParticles = this.simulationEngine.getAllCircles();
  this.setState({ particles: updatedParticles });
  this.animationFrame = requestAnimationFrame(this.animate);
};

  takeMeasurement = () => {
    const current = this.simulationEngine.getCurrent();
    if (!isNaN(current) && isFinite(current)) {
      this.setState(prevState => ({
        currentMeasurements: [...prevState.currentMeasurements, current]
      }));
    }
  };

    
render() {
    const { voltage, isRunning, speedMultiplier } = this.state;
    const leftSign = voltage >= 0 ? '+' : '-';
    const rightSign = voltage >= 0 ? '-' : '+';
    
    // Создаем элемент для p-n перехода
    const pnJunction = (
      <div
        style={{
          position: 'absolute',
          left: '398px',
          top: '0',
          width: '4px',
          height: '100%',
          borderLeft: '2px dashed #e67e22',
          borderRight: '2px dashed #e67e22',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#e67e22',
            fontWeight: 'bold',
            fontSize: '14px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: '2px 5px',
            borderRadius: '3px'
          }}
        >
          p-n переход
        </div>
      </div>
    );

    return (
      <div className="App" style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '20px' 
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          margin: '0 0 20px',
          color: '#333'
        }}>
          Модель p-n перехода
        </h1>
        
        {/* Основной блок с симуляцией и графиком */}
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Блок симуляции */}
          <div style={{ 
            flex: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '10px',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: leftSign === '+' ? '#e74c3c' : '#3498db',
                marginRight: '15px',
                width: '40px',
                textAlign: 'center'
              }}>
                {leftSign}
              </div>
              
              <div style={{ position: 'relative' }}>
                <SimulationCanvas particles={this.state.particles || []} />
                {pnJunction}
              </div>
              
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: rightSign === '+' ? '#e74c3c' : '#3498db',
                marginLeft: '15px',
                width: '40px',
                textAlign: 'center'
              }}>
                {rightSign}
              </div>
            </div>

            {/* Панель управления */}
            <div style={{ 
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '6px'
            }}>
              <h3 style={{ 
                marginTop: 0,
                marginBottom: '15px',
                color: '#444'
              }}>
                Параметры системы
              </h3>
              
              {/* Добавленные кнопки управления */}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <button
                  onClick={this.toggleSimulation}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: isRunning ? '#e74c3c' : '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    flex: 1
                  }}
                >
                  {isRunning ? 'Пауза' : 'Старт'}
                </button>
                
                <button
                  onClick={this.resetSimulation}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    flex: 1
                  }}
                >
                  Перезагрузка
                </button>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flex: 1
                }}>
                  <button
                    onClick={this.decreaseSpeed}
                    disabled={speedMultiplier <= 0.25}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: speedMultiplier > 0.25 ? 'pointer' : 'not-allowed',
                      opacity: speedMultiplier > 0.25 ? 1 : 0.6,
                      fontWeight: 'bold',
                      flex: 1
                    }}
                  >
                    -
                  </button>
                  
                  <div style={{
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {speedMultiplier}x
                  </div>
                  
                  <button
                    onClick={this.increaseSpeed}
                    disabled={speedMultiplier >= 8}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: speedMultiplier < 8 ? 'pointer' : 'not-allowed',
                      opacity: speedMultiplier < 8 ? 1 : 0.6,
                      fontWeight: 'bold',
                      flex: 1
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    Акцепторы (In): {this.state.acceptorPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={this.state.acceptorPercent}
                    onChange={this.handleAcceptorChange}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    Доноры (As): {this.state.donorPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={this.state.donorPercent}
                    onChange={this.handleDonorChange}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    Температура: {this.state.temperature}°C
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={this.state.temperature}
                    onChange={this.handleTemperatureChange}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    Напряжение: {this.state.voltage}В
                  </label>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={this.state.voltage}
                    onChange={this.handleVoltageChange}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Блок графика и информации */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
            
          }}>
            <div style={{ 
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              flex: 1
            }}>
              <h3 style={{ 
                marginTop: 0,
                marginBottom: '15px',
                color: '#444'
              }}>
                График тока
              </h3>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">

                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                marginTop: 0,
                marginBottom: '15px',
                color: '#444'
              }}>
                Состояние системы
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                fontSize: '14px'
              }}>
                <div>
                  <div style={{ color: '#777' }}>Макс. электронов:</div>
                  <div style={{ fontWeight: 'bold' }}>{this.state.maxElectrons}</div>
                </div>
                <div>
                  <div style={{ color: '#777' }}>Текущих электронов:</div>
                  <div style={{ fontWeight: 'bold' }}>
                      {this.state.particles.filter(p => p instanceof Electron).length}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#777' }}>Температура:</div>
                  <div style={{ fontWeight: 'bold' }}>{this.state.temperature}°C</div>
                </div>
                <div>
                  <div style={{ color: '#777' }}>Напряжение:</div>
                  <div style={{ fontWeight: 'bold' }}>{this.state.voltage}В</div>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                marginTop: 0,
                marginBottom: '15px',
                color: '#444'
              }}>
                Легенда
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#e74c3c', 
                    borderRadius: '50%', 
                    marginRight: '8px' 
                  }}></div>
                  <span>Кремний (Si)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#9b59b6', 
                    borderRadius: '50%', 
                    marginRight: '8px' 
                  }}></div>
                  <span>Индий (In)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#2ecc71', 
                    borderRadius: '50%', 
                    marginRight: '8px' 
                  }}></div>
                  <span>Мышьяк (As)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#3498db', 
                    borderRadius: '50%', 
                    marginRight: '8px' 
                  }}></div>
                  <span>Электроны</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;