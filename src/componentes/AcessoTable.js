// AcessoTable.js
import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Fade, Paper, Avatar } from '@mui/material';
import { ServerIpContext } from './ServerIpContext';

function AcessoTable() {
  const { serverIp } = useContext(ServerIpContext);
  const [dados, setDados] = useState([]);
  const [novosRegistros, setNovosRegistros] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});

  const atualizarTabela = () => {
    if (!serverIp) return;
    fetch(`${serverIp}/atualizacao`)
      .then((response) => {
        if (!response.ok) throw new Error('Erro na requisição');
        return response.json();
      })
      .then((data) => {
        const novos = data.filter(
          (registro) => !dados.some((d) => d.nome === registro.nome && d.horario === registro.horario)
        );
        setNovosRegistros(novos);
        setDados(data);
      })
      .catch((error) => console.error('Erro:', error));
  };

  useEffect(() => {
    if (serverIp) {
      atualizarTabela();
      const interval = setInterval(atualizarTabela, 1000);
      return () => clearInterval(interval);
    }
  }, [serverIp]);

  const handleImageLoad = (registroNome) => {
    setLoadedImages((prev) => ({ ...prev, [registroNome]: true }));
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" color="primary" gutterBottom>
        Registros de Acesso
      </Typography>
      <Grid container spacing={2} sx={{ maxWidth: 800, mt: 2 }}>
        {dados.map((registro, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Fade in={novosRegistros.includes(registro)} timeout={{ enter: 500 }}>
              
              <Card component={Paper} elevation={3} sx={{ backgroundColor: 'background.paper' }}>
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 140, backgroundColor: 'background.default' }}>
                  {registro.imagem && registro.imagem !== '-' ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`${serverIp}/imagens/${registro.imagem}`}
                      alt={`Imagem de ${registro.nome}`}
                      onLoad={() => handleImageLoad(registro.nome)}
                      onError={(e) => {
                        e.target.onerror = null;
                        handleImageLoad(registro.nome, false);
                      }}
                      sx={{ objectFit: 'cover', width: '100%', maxWidth: 140 }}
                    />
                  ) : (
                    <Avatar 
                      src={""}
                      alt="Avatar"
                      sx={{
                        width: 140,
                        height: 140,
                        bgcolor: 'primary.main',
                        fontSize: 40,
                      }}
                    />
                  )}
                </Box>
                <CardContent>
                  <Typography variant="h6" color="text.primary" align="center">
                    {registro.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Horário de Acesso: {registro.horario}
                  </Typography>
                </CardContent>
              </Card>

            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AcessoTable;