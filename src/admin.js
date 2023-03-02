'use strict';

import './sass/admin.scss';
import {
   listenStateChange
} from './utils/firebase.js';
import loginForm from './assets/markup/login-form.html';
import adminContent from './assets/markup/admin-content.html';
import updateForm from './assets/markup/update-form.html';
import addAdminFunctionality from './utils/addAdminFunctionality';
import addLoginFunctionality from './utils/addLoginFunctionality';

listenStateChange((user) => {
   // print admin page
   if (user) {
      document.body.innerHTML = `
         ${updateForm}
         <div class="lines-pattern">
            ${adminContent}
         </div>
      `;
      addAdminFunctionality();

   // print login page
   } else {
      document.body.innerHTML = `
         <div class="lines-pattern">
            ${loginForm}
         </div>
      `;
      addLoginFunctionality();
   }
});