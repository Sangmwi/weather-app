import { useState, useEffect } from 'react'
import axios from 'axios'
import { Container, Card, Spinner, Alert, Row, Col, Button, ButtonGroup } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

// 1. 앱이 실행되자마자 현재위치 기반의 날씨
// 2. 날씨정보에는 도시, 섭씨 화씨 날씨 상태
// 3. 5개의 버튼이 있음(현재위치, 4개는 다른도시)
// 4. 도시버튼 클릭할때마다 해당도시의 날씨정보를 가져옴
// 5. 현재 위치 버튼 누르면 다시 현재위치 기반 날씨
// 6. 데이터 들고오는 동안 로딩스피너 돈다.

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// 도시 정보 상수
const CITIES = {
  수원: { lat: 37.2911, lon: 127.0089 },
  도쿄: { lat: 35.6762, lon: 139.6503 },
  베이징: { lat: 39.9042, lon: 116.4074 },
  LA: { lat: 34.0522, lon: -118.2437 },
  로마: { lat: 41.9028, lon: 12.4964 },
  파리: { lat: 48.8566, lon: 2.3522 },
  런던: { lat: 51.5074, lon: -0.1278 }
}

function App() {
  //null 이면 현재 위치로 보여주기
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords
          resolve({ lat, lon })
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // lat, lon 기반 날씨 데이터 가져오기, setWeatherData에 저장
  const getWeatherByLatLon = async (lat, lon) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await axios.get(BASE_URL, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
        }
      })
      setWeatherData(data)
      console.log("현재 데이터",data)
    } catch (error) {
      setError('날씨 정보를 가져오는데 실패했습니다.')
      console.error('날씨 정보 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  // 도시 선택 시 호출되는 함수
  const handleCitySelect = async (cityName) => {
    setSelectedCity(cityName)
    if (cityName === '현재위치') {
      try {
        const { lat, lon } = await getCurrentLocation()
        await getWeatherByLatLon(lat, lon)
      } catch (error) {
        setError('위치 정보를 가져오는데 실패했습니다.')
      }
    } else {
      const { lat, lon } = CITIES[cityName]
      await getWeatherByLatLon(lat, lon)
    }
  }

  //처음엔 현재 위치로 보여주기
  useEffect(() => {
    handleCitySelect('현재위치')
  }, [])

  // 날씨 아이콘 가져오기 함수  
  const getWeatherIcon = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return '⛈️'
    if (weatherId >= 300 && weatherId < 400) return '🌧️'
    if (weatherId >= 500 && weatherId < 600) return '🌧️'
    if (weatherId >= 600 && weatherId < 700) return '❄️'
    if (weatherId >= 700 && weatherId < 800) return '🌫️'
    if (weatherId === 800) return '☀️'
    if (weatherId > 800) return '☁️'
    return '❓'
  }

  return (
    <div className="app-container">
      <div className="button-container">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={6}>
              <div className="city-buttons">
                <Button
                  variant={selectedCity === '현재위치' ? 'primary' : 'outline-primary'}
                  onClick={() => handleCitySelect('현재위치')}
                  className="city-button"
                >
                  현재위치
                </Button>
                {Object.keys(CITIES).map((city) => (
                  <Button
                    key={city}
                    variant={selectedCity === city ? 'primary' : 'outline-primary'}
                    onClick={() => handleCitySelect(city)}
                    className="city-button"
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {loading && (
        <div className="loading-container">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">로딩중...</span>
          </Spinner>
        </div>
      )}

      <div className="content-container">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={6}>
              {error && (
                <Alert variant="danger" className="my-3">
                  {error}
                </Alert>
              )}

              {weatherData && (
                <Card className="weather-card">
                  <Card.Body className="text-center">
                    <div className="weather-icon mb-3">
                      {getWeatherIcon(weatherData.weather[0].id)}
                    </div>
                    <Card.Title className="city-name mb-4">
                      {weatherData.name}
                    </Card.Title>
                    <Card.Text className="temperature">
                      {Math.round(weatherData.main.temp)}°C / {Math.round((weatherData.main.temp * 9/5) + 32)}°F
                    </Card.Text>
                    <Card.Text className="weather-description">
                      {weatherData.weather[0].description}
                    </Card.Text>
                    <div className="weather-details mt-4">
                      <Row>
                        <Col>
                          <p className="mb-0">습도</p>
                          <p className="detail-value">{weatherData.main.humidity}%</p>
                        </Col>
                        <Col>
                          <p className="mb-0">풍속</p>
                          <p className="detail-value">{weatherData.wind.speed} m/s</p>
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default App
