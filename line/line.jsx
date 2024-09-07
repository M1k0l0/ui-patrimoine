import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Chart from 'chart.js/auto';

function LineChart() {
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
  const [chart, setChart] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://patrimoine-economique-l6ee.onrender.com/patrimoine/range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateDebut, dateFin })
      });
      const data = await response.json();

      if (chart) {
        chart.destroy();
      }

      const minValue = Math.min(...data);
      const maxValue = Math.max(...data);

      const ctx = document.getElementById('patrimoineChart').getContext('2d');
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((_, index) => `Jour ${index + 1}`),
          datasets: [{
            label: 'Valeur Patrimoine',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: { beginAtZero: true },
            y: {
              beginAtZero: true,
              suggestedMin: minValue - 1000000,
              suggestedMax: maxValue + 1000000
            }
          }
        }
      });

      setChart(newChart);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDateDebutChange = (e) => {
    setDateDebut(e.target.value);
  };

  const handleDateFinChange = (e) => {
    setDateFin(e.target.value);
  };

  const handleValidateClick = () => {
    fetchData();
  };

  return (
    <Container fluid>
      <Row className='mt-4' style={{width : "100%"}}>
        <Col md={6} style={{width : "100%"}}>
          <Form>
            <Form.Group controlId="dateDebut">
              <Form.Label>Date début:</Form.Label>
              <Form.Control type="date" value={dateDebut} onChange={handleDateDebutChange} />
            </Form.Group>
            <Form.Group controlId="dateFin">
              <Form.Label>Date fin:</Form.Label>
              <Form.Control type="date" value={dateFin} onChange={handleDateFinChange} />
            </Form.Group>
            <Button className='button' variant="primary" type="button" onClick={handleValidateClick}>
              Valider
            </Button>
          </Form>
        </Col>
      </Row>
      <Row className='mt-4'>
        <Col md={12}>
          <div className="chart-container">
           <canvas id="patrimoineChart" style={{ width: '100%', height: '50vh' }}></canvas>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default LineChart;