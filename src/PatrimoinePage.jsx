import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Possession from "../../models/possessions/Possession";
import Patrimoine from "../../models/Patrimoine";
import Flux from "../../models/possessions/Flux";
import LineChart from '../line/line';

function PatrimoineSite() {
  const [dateSelectionnee, setDateSelectionnee] = useState(new Date());
  const [patrimoine, setPatrimoine] = useState(null);
  const [valeurPatrimoine, setValeurPatrimoine] = useState(null);
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
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
      })
      .catch(err => {
        console.error('Failed to load data:', err.message);
      });
  }, []);

  const calculerValeurPatrimoine = () => {
    if (patrimoine) {
      let valeur = 0;
      patrimoine.possessions.forEach((possession) => {
        if (possession instanceof Possession) {
          valeur += possession.getValeur(dateSelectionnee);
        } else if (possession instanceof Flux) {
          valeur += possession.getValeur(dateSelectionnee);
        }
      });
      setValeurPatrimoine(valeur);
    }
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
        <Button className='button' onClick={calculerValeurPatrimoine}>Valider</Button>
      </Form>
      {valeurPatrimoine !== null && (
        <div className="mt-4">
          <h3>Valeur Totale du Patrimoine</h3>
          <p className='valeur'>{valeurPatrimoine.toFixed(2)} Ariary</p>
        </div>
      )}
      <LineChart/>
    </Container>
  );
}

export default PatrimoineSite;
