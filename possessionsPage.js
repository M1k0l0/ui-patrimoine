import React, { useState } from 'react';
import { Table, Button, Form, Container, Card, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PossessionsPage = () => {
  const [possessions, setPossessions] = useState([
    {
      libelle: 'Ordinateur Portable',
      valeurInitiale: 1200,
      datedebut: new Date('2022-06-01'),
      datefin: new Date('2025-06-01'),
      amortissement: 300,
      valeurActuelle: 900
    },
    {
      libelle: 'Voiture',
      valeurInitiale: 20000,
      datedebut: new Date('2020-01-01'),
      datefin: new Date('2025-01-01'),
      amortissement: 4000,
      valeurActuelle: 16000
    },
    {
      libelle: 'Télévision',
      valeurInitiale: 800,
      datedebut: new Date('2021-03-01'),
      datefin: new Date('2024-03-01'),
      amortissement: 200,
      valeurActuelle: 600
    },
    {
      libelle: 'Réfrigérateur',
      valeurInitiale: 1500,
      datedebut: new Date('2020-07-01'),
      datefin: new Date('2025-07-01'),
      amortissement: 300,
      valeurActuelle: 1200
    }
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalValue, setTotalValue] = useState(0);

  const calculatePatrimoineValue = () => {
    const dateNow = new Date();
    let total = 0;

    possessions.forEach((possession) => {
      let valeurActuelle = possession.valeurInitiale - possession.amortissement;
      if (selectedDate > dateNow) {
        total += valeurActuelle;
      } else {
        // Calcul de la valeur actuelle en fonction de la date
        const amortissement = ((selectedDate - possession.datedebut) / (possession.datefin - possession.datedebut)) * possession.amortissement;
        total += possession.valeurInitiale - amortissement;
      }
    });

    setTotalValue(total);
  };

  const resetTotalValue = () => {
    setTotalValue(0);
  };

  return (
    <Container className="my-4">
      <h1 className="mb-4 text-center">Liste des Possessions</h1>
      <Card className="mb-4 background-section">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Libelle</th>
                <th>Valeur Initiale</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Amortissement</th>
                <th>Valeur Actuelle</th>
              </tr>
            </thead>
            <tbody>
              {possessions.map((possession, index) => (
                <tr key={index}>
                  <td>{possession.libelle}</td>
                  <td>{possession.valeurInitiale} €</td>
                  <td>{possession.datedebut.toDateString()}</td>
                  <td>{possession.datefin.toDateString()}</td>
                  <td>{possession.amortissement} €</td>
                  <td>{possession.valeurActuelle} €</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Date Sélectionnée</Form.Label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    className="form-control"
                  />
                </Form.Group>
                <Button className="btn-custom mb-2" onClick={calculatePatrimoineValue}>Calculer la Valeur du Patrimoine</Button>
                <Button variant="secondary" className="mb-2" onClick={resetTotalValue}>Réinitialiser</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body className="text-center">
              <h2>Valeur Totale du Patrimoine</h2>
              <p className="display-4">{totalValue.toFixed(2)} €</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PossessionsPage;
