import React from 'react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import authReducer from '../features/auth/authSlice';
import PrivateRoute from './PrivateRoute';

function renderWithState(ui, preloadedState, initialEntries = ['/dashboard']) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>
  );
}

describe('PrivateRoute onboarding guard', () => {
  it('redirects unverified users to verify-otp before any protected page', () => {
    renderWithState(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requireProfileComplete>
              <div>Dashboard Page</div>
            </PrivateRoute>
          }
        />
        <Route path="/verify-otp" element={<div>Verify OTP Page</div>} />
      </Routes>,
      {
        auth: {
          user: { name: 'Test User', email: 'test@example.com', isNewUser: false },
          isAuthenticated: true,
          isNewUser: false,
          isProfileComplete: true,
          onboardingStep: 7,
          isEmailVerified: false,
          loading: false,
          error: null,
        },
      }
    );

    expect(screen.getByText('Verify OTP Page')).toBeInTheDocument();
  });

  it('redirects incomplete-profile users from dashboard to onboarding', () => {
    renderWithState(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requireProfileComplete>
              <div>Dashboard Page</div>
            </PrivateRoute>
          }
        />
        <Route path="/onboarding" element={<div>Onboarding Page</div>} />
      </Routes>,
      {
        auth: {
          user: { name: 'Test User', isNewUser: true },
          isAuthenticated: true,
          isNewUser: true,
          isProfileComplete: false,
          onboardingStep: 3,
          isEmailVerified: true,
          loading: false,
          error: null,
        },
      }
    );

    expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
  });

  it('allows complete-profile users to access dashboard', () => {
    renderWithState(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requireProfileComplete>
              <div>Dashboard Page</div>
            </PrivateRoute>
          }
        />
        <Route path="/onboarding" element={<div>Onboarding Page</div>} />
      </Routes>,
      {
        auth: {
          user: { name: 'Test User', isNewUser: false },
          isAuthenticated: true,
          isNewUser: false,
          isProfileComplete: true,
          onboardingStep: 7,
          isEmailVerified: true,
          loading: false,
          error: null,
        },
      }
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
