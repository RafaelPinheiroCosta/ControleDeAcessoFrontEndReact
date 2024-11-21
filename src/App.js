// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import AcessoTable from './componentes/AcessoTable';
import CadastroPage from './componentes/CadastroPage';
import { ServerIpProvider } from './componentes/ServerIpContext'; // Importa o contexto de IP

const theme = createTheme({
  palette: {
    primary: {
      main: '#0951DB',
    },
    secondary: {
      main: '#DB2908',
    },
  },
});

function App() {
  return (
    <ServerIpProvider> {/* Envolve o app com o provedor de IP */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Controle de Acesso
              </Typography>
              <Button color="inherit" component={Link} to="/">Home</Button>
              <Button color="inherit" component={Link} to="/cadastro">Cadastrar</Button>
            </Toolbar>
          </AppBar>
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<AcessoTable />} />
              <Route path="/cadastro" element={<CadastroPage />} />
            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </ServerIpProvider>
  );
}

export default App;
