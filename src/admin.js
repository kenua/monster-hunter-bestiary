'use strict';

import './sass/admin.scss';
import { 
   createNewMonsterDoc,
   updateMonsterDoc, 
   deleteMonsterDoc,
   listenToDocChanges,
   getSingleMonsterDoc
} from './utils/firebase.js';
import monsterItemMarkup from './assets/markup/admin-monster-item.html';
import { fadeIn, fadeOut } from './utils/fadeFunctions.js';

const form = document.getElementById('create-monster-form');
const imageErrorMessage = document.getElementById('monster-image-error-message');
const nameErrorMessage = document.getElementById('monster-name-error-message');
const descErrorMessage = document.getElementById('monster-desc-error-message');
const optionErrorMessage = document.getElementById('monster-options-error-message');
const manageMonstersContainer = document.getElementById('manage-monsters-container');
const updateFormContainer = document.getElementById('update-form-container');
const updateForm = document.getElementById('update-monster-form');
const updateformHeading = document.getElementById('update-form-heading');
const updateFormIdField = updateForm.elements['monster-id'];
const updateFormImageField = updateForm.elements['monster-image'];
const updateFormNameField = updateForm.elements['monster-name'];
const updateFormDescField = updateForm.elements['monster-desc'];
const updateFormTypeField = updateForm.elements['type'];
const updateFormElementField = updateForm.elements['element'];
const updateFormWeaknessField = updateForm.elements['weakness'];
const updateFormHabitatField = updateForm.elements['habitat'];

form.addEventListener('submit', createNewMonster);
manageMonstersContainer.addEventListener('click', handleMonsterButtons);
listenToDocChanges(printMonsters);
updateFormContainer.addEventListener('click', closeUpdateForm);

async function createNewMonster(e) {
   e.preventDefault();

   // grab form data
   const imageInput = form.elements['monster-image'];
   const name = form.elements['monster-name'];
   const desc = form.elements['monster-desc'];
   const type = form.elements['type'];
   const element = form.elements['element'];
   const weakness = [...form.elements['weakness']].reduce((acc, node) => {
      if (node.checked) {
         acc.push(node.value);
      }
      return acc;
   }, []);
   const habitat = [...form.elements['habitat']].reduce((acc, node) => {
      if (node.checked) {
         acc.push(node.value);
      }
      return acc;
   }, []);

   // clean error messages
   imageErrorMessage.textContent = '';
   nameErrorMessage.textContent = '';
   descErrorMessage.textContent = '';
   optionErrorMessage.textContent = '';

   // create monster doc
   try {
      await createNewMonsterDoc({ 
            name: name.value, 
            desc: desc.value, 
            type: type.value, 
            element: element.value, 
            weakness, 
            habitat 
         }, 
         imageInput.files[0]
      );
      
      // clean fields' value
      imageInput.value = '';
      name.value = '';
      desc.value = '';
      type.value = '';
      element.value = '';
      [...form.elements['weakness']].forEach((node) => {
         node.checked = false;
      });
      [...form.elements['habitat']].forEach((node) => {
         node.checked = false;
      });
   // print error messages
   } catch (err) {
      if (!(err instanceof Error)) {
         imageErrorMessage.textContent = err.imageFile ? err.imageFile : '';
         nameErrorMessage.textContent = err.name ? err.name : '';
         descErrorMessage.textContent = err.desc ? err.desc : '';
         let optionMessages = '';
         optionMessages += err.type ? err.type + '<br>' : '';
         optionMessages += err.element ? err.element + '<br>' : '';
         optionMessages += err.weakness ? err.weakness + '<br>' : '';
         optionMessages += err.habitat ? err.habitat + '<br>' : '';
         optionErrorMessage.innerHTML = optionMessages;
      } else {
         throw err;
      }
   }
}

function printMonsters(snapshot) {
   let monsterDocs = snapshot.docs.map(doc => 
      ({...doc.data(), id: doc.id })
   );
   let content = '';

   monsterDocs.forEach(monsterDoc => {
      let markup = monsterItemMarkup;
      markup = markup.replace('[URL]', monsterDoc.image.url);
      markup = markup.replace('[ALT]', monsterDoc.image.filename);
      markup = markup.replace('[NAME]', monsterDoc.name);
      markup = markup.replace('[DESC]', monsterDoc.desc);
      markup = markup.replace('[TYPE]', monsterDoc.type);
      markup = markup.replace('[ELEMENT]', monsterDoc.element);
      markup = markup.replace('[WEAKNESS]', monsterDoc.weakness.join(', '));
      markup = markup.replace('[HABITAT]', monsterDoc.habitat.join(', '));
      markup = markup.replace(/\[ID\]/g, monsterDoc.id);
      content += markup;
   });
   manageMonstersContainer.innerHTML = content;
}

function handleMonsterButtons(e) {
   let target = e.target;

   if (target.nodeName === 'BUTTON' && target.dataset.id) {
      if (target.textContent === 'Delete') deleteMonsterDoc(target.dataset.id);
      if (target.textContent === 'Update') openUpdateForm(target.dataset.id);
   }
}

async function openUpdateForm(id) {
   let monsterDoc = await getSingleMonsterDoc(id);

   document.body.style.overflow = 'hidden';
   updateformHeading.textContent = `Update ${monsterDoc.name}`;
   // fill up update form
   updateFormIdField.value = monsterDoc.id;
   updateFormNameField.value = monsterDoc.name;
   updateFormDescField.value = monsterDoc.desc;
   updateFormTypeField.forEach((typeField) => 
      (typeField.value === monsterDoc.type) ?  typeField.checked = true : null
   );
   updateFormElementField.forEach((elementField) => 
      (elementField.value === monsterDoc.element) ? elementField.checked = true : null
   );
   monsterDoc.weakness.forEach(weakness =>
      updateFormWeaknessField.forEach(field => (field.value === weakness) ? field.checked = true : null)
   );
   monsterDoc.habitat.forEach(habitat =>
      updateFormHabitatField.forEach(field => (field.value === habitat) ? field.checked = true : null)
   );
   fadeIn(updateFormContainer, 'block');
}

function closeUpdateForm(e) {
   if (e.target.dataset.exit) {
      fadeOut(updateFormContainer, () => {
         document.body.style.overflow = '';
         updateFormWeaknessField.forEach(field => field.checked = false);
         updateFormHabitatField.forEach(field =>  field.checked = false);
      });
   }
}

   // updateMonsterDoc('OPtxyDp6TNpc5hCorY4B', {
   //       name, desc, type, element, weakness, habitat,
   //    },
   //    imageInput.files[0]
   // )
