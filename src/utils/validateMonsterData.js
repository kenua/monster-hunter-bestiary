'use strict';

export default function validateMonsterData(data, imageFile) {
   let { name, type, element, desc, weakness, habitat } = data;
   let errors = {
      name: null,
      type: null,
      element: null,
      desc: null,
      weakness: null,
      habitat: null,
   };
   let checkExistanceOfString = (str, key) => {
      if (!str || str.length === 0 || str.length > 100) {
         errors[key] = `Provide a ${key} for monster (no more than 100 characters)`;
      }
   };

   checkExistanceOfString(name, 'name');
   checkExistanceOfString(type, 'type');
   checkExistanceOfString(element, 'element');

   if (!desc || desc.length === 0 || desc.length > 500) {
      errors.desc = `Provide a description for monster (no more than 500 characters)`;
   }

   if (!weakness || weakness.length === 0) {
      errors.weakness = 'Provide a single weakness for monster';
   }

   if (!habitat || habitat.length === 0) {
      errors.habitat = 'Provide a single habitat for monster';
   }

   if (imageFile !== null && (imageFile === undefined || imageFile.type !== 'image/png')) {
      errors.imageFile = 'Provide an image file (only .png textension is allowed)';
   }

   for (let key in errors) {
      if (errors[key]) return errors;
   }

   return null;
}