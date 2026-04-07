import { Box, Container, Paper, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #f4f6f8 0%, #d6e7ea 55%, #fbe8d5 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 5 } }}>
          <Typography variant="h4" mb={1}>
            WiseSystems Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Stay organized with secure, token-based to-do management.
          </Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
