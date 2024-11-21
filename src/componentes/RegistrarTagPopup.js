import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, CircularProgress, Select, MenuItem } from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { useServerIp } from "./ServerIpContext"; // Importa o hook de contexto

const RegistrarTagPopup = ({ open, onClose, usuarioId, atualizarTabela }) => {
    const theme = useTheme();
    const { serverIp } = useServerIp(); // Acessa o IP do contexto
    const [status, setStatus] = useState("Aproxime a tag para registrar...");
    const [loading, setLoading] = useState(false);
    const [dispositivoSelecionado, setDispositivoSelecionado] = useState(""); // Estado para o dispositivo selecionado

    // Lista de dispositivos
    const dispositivos = [
        "Dispositivo 1",
        "Dispositivo 2",
        "Dispositivo 3",
        "Dispositivo 4",
        "Dispositivo 5",
        "Dispositivo 6",
    ];

    const iniciarRegistroTag = async () => {
        setLoading(true);
        setStatus("Iniciando o registro da tag...");
        try {
            const response = await axios.post(`${serverIp}/iniciarRegistroTag`, { 
                usuarioId,
                dispositivo: dispositivoSelecionado // Envia o dispositivo selecionado
            });
            if (response.status === 200) {
                setStatus("Aguardando a aproximação da tag...");
                verificarStatusRegistro();
            }
        } catch (error) {
            setStatus("Erro ao iniciar registro da tag.");
            setLoading(false);
        }
    };

    const verificarStatusRegistro = async () => {
        const intervalo = setInterval(async () => {
            try {
                const resposta = await axios.get(`${serverIp}/verificarStatusTag/${usuarioId}`);
                if (resposta.data.status === "sucesso") {
                    setStatus("Registro concluído com sucesso!");
                    setLoading(false);
                    clearInterval(intervalo);
                    atualizarTabela();
                    setTimeout(onClose, 3000); // Fechar após 1 segundo
                }
            } catch (error) {
                setStatus("Erro ao verificar o status.");
                setLoading(false);
                clearInterval(intervalo);
            }
        }, 2000); // Verifica a cada 2 segundos
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle style={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
                Registrar Tag
            </DialogTitle>
            <DialogContent style={{ padding: theme.spacing(3), textAlign: "center" }}>
                <Typography variant="body1" style={{ color: theme.palette.text.primary }}>
                    {status}
                </Typography>
                <Select
                    fullWidth
                    value={dispositivoSelecionado}
                    onChange={(e) => setDispositivoSelecionado(e.target.value)}
                    disabled={loading} // Desabilita quando estiver carregando
                    displayEmpty
                >
                    <MenuItem value="" disabled>Selecione o dispositivo</MenuItem>
                    {dispositivos.map((dispositivo, index) => (
                        <MenuItem key={index} value={dispositivo}>{dispositivo}</MenuItem>
                    ))}
                </Select>
                {loading && <CircularProgress style={{ marginTop: theme.spacing(2), color: theme.palette.primary.main }} />}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={iniciarRegistroTag}
                    variant="contained"
                    color="primary"
                    style={{ backgroundColor: theme.palette.primary.main }}
                    disabled={loading || !dispositivoSelecionado} // Desabilita até que um dispositivo seja selecionado
                >
                    Iniciar Registro
                </Button>
                <Button onClick={onClose} color="secondary" variant="outlined" disabled={loading}>
                    Cancelar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RegistrarTagPopup;
