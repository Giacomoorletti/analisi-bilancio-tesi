// src/App.js
import React, { useContext } from 'react';
import BilancioForm from './components/BilancioForm';
import RisultatiDashboard from './components/RisultatiDashboard'; // 1. Importa il nuovo componente
import { Container, Typography, Box } from '@mui/material';
import { AnalysisContext } from './context/AnalysisContext';

function App() {
  const { state } = useContext(AnalysisContext); // Leggiamo lo stato per debug

  // Utile per vedere lo stato cambiare nella console mentre interagiamo
  console.log("Stato attuale dell'App:", state);

  return (
    <Container maxWidth="lg"> {/* Aumentiamo la larghezza per farci stare tutto */}
      <Box sx={{ my: 4 }}> 
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Applicazione di Analisi di Bilancio
        </Typography>
        
        <BilancioForm />

        <RisultatiDashboard /> {/* 2. Aggiungi il componente qui */}

      </Box>
    </Container>
  );
}

export default App;