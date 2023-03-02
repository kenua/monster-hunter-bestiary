'use strict';

import {
   login 
} from './firebase.js';

export default function addLoginFunctionality() {
   const loginForm = document.getElementById('login-form');
   const loginEmailField = document.getElementById('login-email');
   const loginPasswordField = document.getElementById('login-password');
   const loginErrorMessage = document.getElementById('login-error-message');
   loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
   
      try {
         loginErrorMessage.textContent = '';
         await login(loginEmailField.value, loginPasswordField.value);
   
      } catch (err) {
         if (err.code) {
            if (err.code === 'auth/user-not-found') loginErrorMessage.textContent = 'User does not exist';
            if (err.code === 'auth/wrong-password') loginErrorMessage.textContent = 'Wrong password';
         } else {
            throw err;
         }
      }
   });
}