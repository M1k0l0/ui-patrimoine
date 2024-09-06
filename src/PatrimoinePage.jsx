import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Chart from 'chart.js/auto';
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';
import Possession from "../../models/possessions/Possession";
import Patrimoine from "../../models/Patrimoine";
import Flux from "../../models/possessions/Flux";

function PatrimoineSite() {
    const [dateSelectionnee, setDateSelectionnee] = useState(new Date());
    const [patrimoine, setPatrimoine] = useState(null);
    const [valeurPatrimoine, setValeurPatrimoine] = useState(null);
    const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
    const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
    const [jour, setJour] = useState(1);
    const [chart, setChart] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3000/possession')
          .then(res => res.json())
          .then(data => {
            const possessions = data.map((possession) => {
              const dateDebut = new Date(possession.dateDebut);
              const dateFin = possession.dateFin ? new Date(possession.dateFin) : null;
              return new Possession(
                possession.possesseur,
                possession.libelle,
                parseFloat(possession.valeur),
                dateDebut,
                dateFin,
                possession.tauxAmortissement !== null ? parseFloat(possession.tauxAmortissement) : null
              );
            });
    
            const patrimoine = new Patrimoine("John Doe", possessions);
            setPatrimoine(patrimoine);
            setLoading(false);
          })
          .catch(err => {
            setError('Failed to load data: ' + err.message);
            setLoading(false);
          });
      }, []);
    
    const calculerValeurPatrimoine = () => {
        if (patrimoine) {
          let valeur = 0;
          patrimoine.possessions.forEach((possession) => {
            if (possession instanceof Possession ) {
              valeur += possession.getValeur(dateSelectionnee);
            } else if (possession instanceof Flux) {
              valeur += possession.getValeur(dateSelectionnee);
            }
          });
          console.log("Valeur calculée:", valeur); // Debugging
          setValeurPatrimoine(valeur);
        }
      };

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3000/patrimoine/range', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'month', dateDebut, dateFin, jour })
            });
            const data = await response.json();

            if (chart) {
                chart.destroy();
            }

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
                        y: { beginAtZero: true }
                    }
                }
            });

            setChart(newChart);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateDebut, dateFin, jour]);

    const handleDateDebutChange = (e) => {
        setDateDebut(e.target.value);
    };

    const handleDateFinChange = (e) => {
        setDateFin(e.target.value);
    };

    const handleJourChange = (e) => {
        setJour(parseInt(e.target.value, 10));
    };

    return (
        <Container>
            <Row className='mt-4'>
                <Col md={12}>
                    <h1>Patrimoine</h1>
                </Col>
            </Row>
            
            <Form>
                <div className="mb-4 mt-5">
                  <label className='labelStyle'>Sélectionner une date :</label>
                  <DatePicker
                    selected={dateSelectionnee}
                    onChange={(date) => setDateSelectionnee(date)}
                    dateFormat="yyyy-MM-dd"
                    className='datePickerStyle'
                  />
                </div>
                <Button style={{ backgroundColor: 'gray' }} onClick={calculerValeurPatrimoine}>Valider</Button>
              </Form>
              {valeurPatrimoine !== null && (
                <div className="mt-4">
                  <h3>Valeur Totale du Patrimoine</h3>
                  <p>{valeurPatrimoine.toFixed(2)} Ariary</p>
                </div>
              )}
            <Row className='mt-4' style={{ width: "100%" }}>
                <Col md={6}>
                    <Form>
                        <Form.Group controlId="dateDebut">
                            <Form.Label>Date début:</Form.Label>
                            <Form.Control type="date" value={dateDebut} onChange={handleDateDebutChange} />
                        </Form.Group>
                        <Form.Group controlId="dateFin">
                            <Form.Label>Date fin:</Form.Label>
                            <Form.Control type="date" value={dateFin} onChange={handleDateFinChange} />
                        </Form.Group>
                        <Form.Group controlId="jour">
                            <Form.Label>Jour:</Form.Label>
                            <Form.Control type="number" value={jour} onChange={handleJourChange} />
                        </Form.Group>
                        <Button variant="primary" type="button" onClick={fetchData}>
                            Valider
                        </Button>
                    </Form>
                </Col>
                <Col md={6}>
                    <canvas id="patrimoineChart"></canvas>
                </Col>
            </Row>
        </Container>
    );
}

export default PatrimoineSite;