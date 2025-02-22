import React, { useState } from 'react';
import { Box, Typography, Button, Stack, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import Link from 'next/link';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import axios from 'axios'
import Cookies from 'js-cookie';
interface LoginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLogin = ({ title, subtitle, subtext }: LoginType) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response); // Check what is returned

      if (response.status === 200) {
        // Save token to localStorage or cookies
        Cookies.set('token', response.data.token, { expires: 1, secure: true, sameSite: 'Strict' }); // Store token in cookies
        window.location.href = '/admin'; // Redirect to dashboard or home page
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Box component="form" onSubmit={handleLogin}>
        <Stack>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="email" mb="5px">
              Email Address
            </Typography>
            <CustomTextField
              id="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </Box>
          <Box mt="25px">
            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="password" mb="5px">
              Password
            </Typography>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
          </Box>
          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label="Remember this Device"
              />
            </FormGroup>
            <Typography
              component={Link}
              href="/forgot-password"
              fontWeight="500"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
              }}
            >
              Forgot Password?
            </Typography>
          </Stack>
        </Stack>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        <Button type="submit" color="primary" variant="contained" size="large" fullWidth>
          Sign In
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthLogin;