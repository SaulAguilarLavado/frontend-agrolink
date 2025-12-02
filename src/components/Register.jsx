import React, { useState } from "react";
import authService from "../services/authService";
import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Box,
  Stack,
} from "@mui/material";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    userType: "agricultor",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successful, setSuccessful] = useState(false);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccessful(false);
    setLoading(true);

    try {
      const response = await authService.register(formData);
      setMessage(response.data || "Registro exitoso");
      setSuccessful(true);
    } catch (error) {
      const resMessage =
        (error.response && error.response.data) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
      setSuccessful(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: 'url("/images/fondo-agrolink.jpeg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 520,
            borderRadius: 3,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >

          {/* HEADER */}
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700}>
              Crear cuenta
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Únete a AgroLink y gestiona toda tu producción fácilmente 🌱
            </Typography>
          </Box>

          {/* FORMULARIO VERTICAL */}
          <form onSubmit={handleRegister}>
            <Stack spacing={2} sx={{ width: "75%", mx: "auto" }}>
              <TextField
                label="Nombre *"
                name="name"
                onChange={onChange}
                required
                fullWidth
              />

              <TextField
                label="Apellido *"
                name="lastname"
                onChange={onChange}
                required
                fullWidth
              />

              <TextField
                label="Correo Electrónico *"
                name="email"
                onChange={onChange}
                required
                fullWidth
              />

              <TextField
                label="Contraseña *"
                type="password"
                name="password"
                onChange={onChange}
                required
                fullWidth
              />

              <TextField
                label="Dirección"
                name="address"
                onChange={onChange}
                fullWidth
              />

              <TextField
                label="Teléfono"
                name="phone"
                onChange={onChange}
                fullWidth
              />

              <TextField
                select
                label="Tipo de Usuario"
                name="userType"
                value={formData.userType}
                onChange={onChange}
                fullWidth
              >
                <MenuItem value="agricultor">Agricultor</MenuItem>
                <MenuItem value="comprador">Comprador</MenuItem>
              </TextField>

              <Box textAlign="center" sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  size="large"
                  sx={{ width: "50%" }}
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "REGISTRARSE"}
                </Button>
              </Box>
            </Stack>

          </form>

          {message && (
            <Alert severity={successful ? "success" : "error"} sx={{ mt: 3 }}>
              {message}
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
