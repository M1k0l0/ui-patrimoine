import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Container, Row, Col } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import Possession from "../models/possessions/Possession";
import Patrimoine from "../models/Patrimoine";
import Flux from "../models/possessions/Flux";
import CreateNewPossession from './CreatePossession';

function PossessionList() {
  const [dateSelectionnee, setDateSelectionnee] = useState(new Date());
  const [patrimoine, setPatrimoine] = useState(null);
  const [valeurPatrimoine, setValeurPatrimoine] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPossession, setEditingPossession] = useState(null);
  const [formValues, setFormValues] = useState({
    libelle: '',
    dateFin: '',
  });

  useEffect(() => {
    fetch('https://patrimoine-economique-l6ee.onrender.com/possession')
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

  const handleEdit = (possession) => {
    setEditingPossession(possession);
    setFormValues({
      libelle: possession.libelle,
      dateFin: possession.dateFin ? possession.dateFin.toISOString().split('T')[0] : '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`https://patrimoine-economique-l6ee.onrender.com/possession/${editingPossession.libelle}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libelle: formValues.libelle,
        dateFin: formValues.dateFin ? new Date(formValues.dateFin).toISOString() : null,
      })
    })
      .then(res => res.json())
      .then(updatedPossession => {
        const updatedPossessions = patrimoine.possessions.map(p =>
          p.libelle === editingPossession.libelle ? {
            ...p,
            ...updatedPossession,
            dateFin: updatedPossession.dateFin ? new Date(updatedPossession.dateFin) : null
          } : p
        );
        setPatrimoine(prevPatrimoine => ({
          ...prevPatrimoine,
          possessions: updatedPossessions
        }));
        setEditingPossession(null);
      })
      .catch(err => setError('Failed to update possession: ' + err.message));
  };

  const handleClose = (libelle) => {
    fetch(`https://patrimoine-economique-l6ee.onrender.com/possession/${libelle}/close`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(updatedPossession => {
        const updatedPossessions = patrimoine.possessions.map(p =>
          p.libelle === libelle ? {
            ...p,
            ...updatedPossession,
            dateFin: updatedPossession.dateFin ? new Date(updatedPossession.dateFin) : null
          } : p
        );
        setPatrimoine(prevPatrimoine => ({
          ...prevPatrimoine,
          possessions: updatedPossessions
        }));
        window.location.reload();
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
                          <Button className='button' variant="warning" onClick={() => handleEdit(possession)}>Edit</Button>
                          <Button className='button' variant="info" onClick={() => handleClose(possession.libelle)}>Close</Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
              {editingPossession && (
                <Form onSubmit={handleSubmit}>
                  <h3>Edit Possession</h3>
                  <Form.Group controlId="formLibelle">
                    <Form.Label className='format'>Libellé</Form.Label>
                    <Form.Control type="text" name="libelle" value={formValues.libelle} onChange={handleFormChange} required />
                  </Form.Group>
                  <Form.Group controlId="formDateFin">
                    <Form.Label className='format'>Date Fin</Form.Label>
                    <Form.Control type="date" name="dateFin" value={formValues.dateFin} onChange={handleFormChange} />
                  </Form.Group>
                  <Button className='mise' variant="success" type="submit">Mettre à jour</Button>
                  <Button className='annuler' variant="danger" onClick={() => setEditingPossession(null)}>Annuler</Button>
                </Form>
              )}
            </>
          )}
        </Col>
      </Row>
      <CreateNewPossession />
    </Container>
  );
}

export default PossessionList;
