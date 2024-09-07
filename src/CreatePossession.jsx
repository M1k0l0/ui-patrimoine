import React, { useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function CreateNewPossession() {
  const [libelle, setLibelle] = useState('');
  const [valeur, setValeur] = useState(0);
  const [dateDebut, setDateDebut] = useState(new Date());
  const [tauxAmortissement, setTauxAmortissement] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!libelle || valeur <= 0 || tauxAmortissement < 0 || !dateDebut) {
      setError('Please fill all fields correctly.');
      return;
    }
    fetch('https://patrimoine-economique-l6ee.onrender.com/possession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libelle,
        valeur: parseFloat(valeur),
        dateDebut: dateDebut.toISOString(),
        tauxAmortissement: parseFloat(tauxAmortissement)
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setSuccess('Possession created successfully!');
        setError('');
        setLibelle('');
        setValeur(0);
        setDateDebut(new Date());
        setTauxAmortissement(0);
      })
      .catch(error => {
        setError('Error creating possession: ' + error.message);
        setSuccess('');
      });
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Create new possession</h1>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Valeur</th>
                <th>Date début</th>
                <th>Taux d'Amortissement</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Form.Control
                    type="text"
                    value={libelle}
                    onChange={(event) => setLibelle(event.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={valeur}
                    onChange={(event) => setValeur(Number(event.target.value))}
                  />
                </td>
                <td>
                  <DatePicker
                    selected={dateDebut}
                    onChange={(date) => setDateDebut(date)}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={tauxAmortissement}
                    onChange={(event) => setTauxAmortissement(Number(event.target.value))}
                  />
                </td>
                <td>
                  <Button className='button' type="submit" onClick={handleSubmit}>Create</Button>
                </td>
              </tr>
            </tbody>
          </Table>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {success && <div className="alert alert-success mt-3">{success}</div>}
        </Col>
      </Row>
    </Container>
  );
}

export default CreateNewPossession;
