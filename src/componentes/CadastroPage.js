import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import RegistrarTagPopup from "./RegistrarTagPopup";
import { useServerIp } from "./ServerIpContext";
import { Check, Add} from "@mui/icons-material";  // Mudança no ícone de edição para "Add"
import Webcam from "react-webcam";

const PaginaCadastro = () => {
  const theme = useTheme();
  const { serverIp } = useServerIp();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cadastros, setCadastros] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [usuarioIdSelecionado, setUsuarioIdSelecionado] = useState(null);
  const [originalImagem, setOriginalImagem] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);
  const [imagem, setImagem] = useState("");
  const [nomeImagem, setNomeImagem] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    carregarCadastros();
  }, []);

  const carregarCadastros = async () => {
    const response = await axios.get(`${serverIp}/cadastros`);
    setCadastros(response.data);
  };

  const handleCaptureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImagem(imageSrc);
    setShowWebcam(false);
  };

  const handleCadastro = async () => {
    try {
      const idAcesso = usuarioIdSelecionado && cadastros.find((usuario) => usuario.id === usuarioIdSelecionado)?.idAcesso || "-";
      
      const cadastroData = {
        nome,
        telefone,
        email,
        imagem: imagem !== originalImagem ? imagem.replace("data:image/png;base64,", "") : "-", // Envia base64 apenas se imagem foi alterada,
        nomeImagem,
        idAcesso
      };

      if (isEditMode) {
        await axios.put(`${serverIp}/cadastro/atualizar/${usuarioIdSelecionado}`, cadastroData);
        // Se a imagem foi alterada, solicite ao backend para remover a anterior
        if (imagem !== originalImagem && originalImagem !== "-") {
          await axios.delete(`${serverIp}/imagens/deletar/${nomeImagem}`);
        }
      } else {
        await axios.post(`${serverIp}/cadastro`, cadastroData);
      }

      resetForm();
      carregarCadastros();
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
    }
  };

  const handleSelecionarUsuario = (usuario) => {
    setUsuarioIdSelecionado(usuario.id);
    setNome(usuario.nome);
    setTelefone(usuario.telefone);
    setEmail(usuario.email);
    setNomeImagem(usuario.imagem)
    if(usuario.imagem!=="-"){
      axios
        .get(`${serverIp}/imagens/${usuario.imagem}`, { responseType: "blob" })
        .then((response) => {
          const reader = new FileReader();
          reader.onload = () => {
            setImagem(reader.result); // base64 da imagem do servidor
            setOriginalImagem(reader.result); // Base64 para comparação
          };
          reader.readAsDataURL(response.data);
        });
    }else{      
      setImagem("-"); 
      setOriginalImagem("-"); 
    }

    setIsEditMode(true);
  };

  const handleDeletarUsuario = async () => {
    if (usuarioIdSelecionado) {    
        await  axios.delete(`${serverIp}/cadastro/deletar/${usuarioIdSelecionado}`);
        if(imagem!=="-")
          await  axios.delete(`${serverIp}/imagens/deletar/${nomeImagem}`)    
        resetForm();
        carregarCadastros();
    }
}; 

  const handleCancelar = () => {
    resetForm();
  };

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setEmail("");
    setImagem("-");
    setUsuarioIdSelecionado(null);
    setIsEditMode(false);
    setShowWebcam(false);
    setNomeImagem("");
  };

  const abrirPopupRegistroTag = (id) => {
    setUsuarioIdSelecionado(id);
    setOpenPopup(true);
  };

  const fecharPopupRegistroTag = () => {
    setOpenPopup(false);
    setUsuarioIdSelecionado(null);
    carregarCadastros();
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: theme.spacing(4), marginTop: theme.spacing(4) }}>
        <Typography variant="h4" align="center" gutterBottom>
          Cadastro de Usuários
        </Typography>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mb: 4,
            alignItems: "center",
          }}
        >
          {!showWebcam && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Avatar
                src={imagem !== "-" ? imagem : ""}
                alt="Avatar"
                sx={{
                  width: 200,
                  height: 200,
                  cursor: "pointer",
                }}
                onClick={() => setShowWebcam(true)}
              />
            </Box>
          )}

          {showWebcam && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ width: "100%", maxWidth: 200 }}
            >
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  videoConstraints={{
                    facingMode: "user",
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                  }}
                />
              </Box>
              <Button variant="contained" onClick={handleCaptureImage} sx={{ mt: 2 }}>
                Capturar Imagem
              </Button>
            </Box>
          )}

          <TextField
            label="Nome"
            variant="outlined"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
          />
          <TextField
            label="Telefone"
            variant="outlined"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <Box display="flex" justifyContent="space-between" width="100%">
            <Button
              variant="contained"
              color="primary"
              onClick={handleCadastro}
            >
              {isEditMode ? "Salvar Alterações" : "Cadastrar"}
            </Button>
            {isEditMode && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeletarUsuario}
                >
                  Deletar
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancelar}
                >
                  Cancelar
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Tabela de Cadastros */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Foto</TableCell>
                <TableCell align="center">Nome</TableCell>
                <TableCell align="center">Acesso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cadastros.map((cadastro) => (
                <TableRow
                  key={cadastro.id}
                  onClick={() => handleSelecionarUsuario(cadastro)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: cadastro.id === usuarioIdSelecionado ? "#f0f0f0" : "inherit",
                  }}
                >
                  <TableCell align="center">
                    <Avatar
                      src={cadastro.imagem !== "-" ? `${serverIp}/imagens/${cadastro.imagem}` : ""}
                      alt="Avatar"
                      sx={{ width: 100, height: 100 }}
                    />
                  </TableCell>
                  <TableCell align="center">{cadastro.nome}</TableCell>
                  <TableCell align="center">
                    {cadastro.idAcesso === "-" || cadastro.idAcesso === null ? (
                      <IconButton
                        color="secondary"
                        onClick={() => abrirPopupRegistroTag(cadastro.id)}
                      >
                        <Add />  {/* Ícone de adição para acesso */}
                      </IconButton>
                    ) : (
                      <Check color="primary" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {openPopup && (
        <RegistrarTagPopup
          open={openPopup}
          onClose={fecharPopupRegistroTag}
          usuarioId={usuarioIdSelecionado}
          atualizarTabela={carregarCadastros}
        />
      )}
    </Container>
  );
};

export default PaginaCadastro;
