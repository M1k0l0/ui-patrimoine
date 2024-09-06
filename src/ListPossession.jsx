import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Container, Row, Col } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import Possession from "../../models/possessions/Possession";
import Patrimoine from "../../models/Patrimoine";
import Flux from "../../models/possessions/Flux";
import CreateNewPossession from './CreatePossession';

function PossessionLIst() {
  const [dateSelectionnee, setDateSelectionnee] = useState(new Date());
  const [patrimoine, setPatrimoine] = useState(null);
  const [valeurPatrimoine, setValeurPatrimoine] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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


  const handleEdit = (libelle) => {
    const newValue = prompt("Enter new value for possession:");
    if (newValue === null) return; 
    fetch(`http://localhost:3000/possession/${libelle}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libelle: parseFloat(newValue) })
    })
        .then(res => res.json())
        .then(updatedPossession => {
            const updatedPossessions = patrimoine.possessions.map(p =>
                p.libelle === libelle ? {
                    ...p,
                    ...updatedPossession,
                    dateDebut: new Date(updatedPossession.dateDebut),
                    dateFin: updatedPossession.dateFin ? new Date(updatedPossession.dateFin) : null
                } : p
            );
            setPatrimoine(prevPatrimoine => ({
                ...prevPatrimoine,
                possessions: updatedPossessions
            }));
        })
        .catch(err => setError('Failed to update possession: ' + err.message));
};

  const handleClose = (libelle) => {
  fetch(`http://localhost:3000/possession/${libelle}/close`, {
    method: 'POST'
  })
    .then(res => res.json())
    .then(() => {
      setPatrimoine(prevPatrimoine => ({
        ...prevPatrimoine,
        possessions: prevPatrimoine.possessions.filter(p => p.libelle !== libelle)
      }));
    })
    .catch(err => setError('Failed to close possession: ' + err.message));
    };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Possession</h1>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Libellé</th>
                    <th>Valeur initiale</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Amortissement</th>
                    <th>Valeur actuelle</th>
                    <th>Option</th>
                  </tr>
                </thead>
                <tbody>
                  {patrimoine &&
                    patrimoine.possessions.map((possession, index) => (
                      <tr key={index}>
                        <td>{possession.libelle}</td>
                        <td>{possession.valeur}</td>
                        <td>{possession.dateDebut instanceof Date ? possession.dateDebut.toISOString().split('T')[0] : 'Invalid Date'}</td>
                        <td>{possession.dateFin ? (possession.dateFin instanceof Date ? possession.dateFin.toISOString().split('T')[0] : 'Invalid Date') : 'N/A'}</td>
                        <td>{possession.tauxAmortissement}</td>
                        <td>{(possession instanceof Possession || possession instanceof Flux) ? possession.getValeur(dateSelectionnee).toFixed(2) : 'N/A'}</td>
                        <td>
                          <Button variant="warning" onClick={() => handleEdit(possession.libelle)}>Edit</Button>
                          <Button variant="info" onClick={() => handleClose(possession.libelle)}>Close</Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </>
          )}
        </Col>
      </Row>
      <CreateNewPossession/>
    </Container>
  );
}

export default PossessionLIst;