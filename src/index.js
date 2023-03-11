import './sass/styles.scss';
import { fadeInFromBottom, fadeOutFromTop } from './utils/fadeFunctions.js';
import {
   getMonstersDoc
} from './utils/firebase';

const cache = {
   locations: [],
   monsters: [],
};

document.addEventListener('DOMContentLoaded', () => {
   const logo = document.getElementById('logo');
   const locations = document.getElementById('locations');
   const locationsContent = locations.firstElementChild;
   const monstersInfo = document.getElementById('monsters-info');
   const monstersInfoContent = monstersInfo.firstElementChild;
   const locationsList = document.getElementById('locations-list');
   const locationHeading = document.getElementById('location-heading');
   const monsterInfoList = document.getElementById('monster-info-list');
   const monstersInfoUl = document.getElementById('monsters-info-ul');
   const infoContainer = document.getElementById('info-container');
   const infoContent = infoContainer.firstElementChild;
   const monsterImageContainer = document.getElementById('monster-image-container');
   const monsterName = document.getElementById('monster-name');
   const monsterDesc = document.getElementById('monster-desc');
   const monsterType = document.getElementById('monster-type');
   const monsterElement = document.getElementById('monster-element');
   const monsterWeakness = document.getElementById('monster-weakness');
   const monsterHabitat = document.getElementById('monster-habitat');
   const backToList = document.getElementById('back-to-list');

   printCurrentLocation();

   window.addEventListener('popstate', (e) => {
      e.preventDefault();
      printCurrentLocation(false);
   });
   // this prevents monsters list to be hidden if the window resizes from mobile to desktop
   window.addEventListener('resize', () => {
      if (window.innerWidth > 1280) {
         monsterInfoList.classList.remove('monsters-info__list--hidden');
      }
   });
   locationsList.addEventListener('click', selectLocation);
   monstersInfoUl.addEventListener('click', printMonsterInfo);
   backToList.addEventListener('click', (e) => {
      e.preventDefault();
      monsterInfoList.classList.remove('monsters-info__list--hidden');
   });

   function printCurrentLocation(pushEntry = true) {
      let currentLocation = location.hash.replace('#', '');

      if (currentLocation === '') {
         // print logo animation, then locations
         logo.style.display = 'flex';
         logo.classList.add('animate-logo');
         document.body.addEventListener('animationend', (e) => {
            let animationName = e.animationName;
            
            if (animationName === 'fadeInAndOut') {
               logo.style.display = 'none';
               locations.classList.remove('hidden');
               fadeInFromBottom(locationsContent);
               history.replaceState(null, '', '#locations');
            }
         });
      } else if (currentLocation === 'locations') {
         printLocationsPage();
      } else {
         // print monsters info
         populateMonstersInfo(currentLocation, pushEntry);
         printMonstersListPage();
      }
   }

   async function populateMonstersInfo(location, pushEntry = true) {
      if (!cache.locations.includes(location)) {
         let monsters = await getMonstersDoc(location);

         // filter out repeated monsters
         if (cache.monsters.length > 0) {
            monsters = monsters.filter((fetchedMonster) => {
               let keepMonster = true;

               for (let i = 0; i < cache.monsters.length; i++) {
                  let localMonster = cache.monsters[i];
   
                  if (localMonster.id === fetchedMonster.id) keepMonster = false;
               }

               return keepMonster;
            });
         }

         monsters.forEach(monster => cache.monsters.push(monster));
         cache.locations.push(location);
      } else {
         console.log(cache);
      }

      if (pushEntry) history.pushState(null, '', `#${location}`);
      generateMonstersList(
         cache.monsters.filter(monster => monster.habitat.includes(location))
      );
      locationHeading.innerHTML = `Monsters from <br> ${location.replace('-', ' ')}`;
   }

   async function selectLocation(e) {
      e.preventDefault();

      let anchor = e.target.closest('a.location-item');

      if (!anchor) return;

      let locationStr = anchor.getAttribute('href').slice(1);

      populateMonstersInfo(locationStr);
      printMonstersListPage();
   }

   function generateMonstersList(monstersArray) {
      let markup = '';

      monstersArray = monstersArray.sort(
         (a, b) => (a.name > b.name) ? 1 : -1
      );
      monstersArray.forEach(monster => {
         markup += `
         <li class="monsters-info__li">
            <button type="button" class="monsters-info-button" value="${monster.id}">
               <span class="button-frame frame--black">
                  <span class="button-frame frame--white">
                     <span class="button-frame frame--black">
                        <span class="button-frame-content">
                           ${monster.name}
                           <span class="monsters-info-button__diamond"></span>
                        </span>
                     </span>
                  </span>
               </span>
            </button>
         </li>
         `;
      });

      monstersInfoUl.innerHTML = markup;
   }

   function printMonsterInfo(e) {
      e.preventDefault();
      
      let button = e.target.closest('button.monsters-info-button');
      let id = button.value;
      let monsterObj = cache.monsters.filter(monster => monster.id === id)[0];
      let { name, desc, type, element, weakness, habitat, image: { filename, url } } = monsterObj;
      let printDataIntoDom = () => {
         monsterImageContainer.innerHTML = `<img src="${url}" alt="${filename}" class="monter-image__img">`;
         monsterName.textContent = name;
         monsterDesc.textContent = desc;
         monsterType.textContent = type;
         monsterElement.textContent = element;
         monsterWeakness.textContent = weakness.join(', ');
         monsterHabitat.textContent = habitat.join(', ');
      };

      [...monstersInfoUl.children].forEach(liNode => 
         liNode.firstElementChild.className = 'monsters-info-button'
      );
      button.className = 'monsters-info-button monsters-info-button--selected';

      if (window.innerWidth < 1280) {
         monsterInfoList.classList.add('monsters-info__list--hidden');
      }

      if (infoContainer.className.includes('hidden')) {
         printDataIntoDom();
         infoContainer.classList.remove('hidden');
         fadeInFromBottom(infoContent);
      } else {
         fadeOutFromTop(infoContent, 0, () => {
            printDataIntoDom();
            fadeInFromBottom(infoContent);
         });
      }
   }

   function printMonstersListPage() {
      fadeOutFromTop(locationsContent, '', () => {
         locations.classList.add('hidden');
         monstersInfo.classList.remove('hidden');
         fadeInFromBottom(monstersInfoContent);
      });
   }

   function printLocationsPage() {
      fadeOutFromTop(monstersInfoContent, '', () => {
         infoContainer.classList.add('hidden');
         infoContent.style.opacity = '';
         infoContent.style.transform = '';
         monstersInfo.classList.add('hidden');
         locations.classList.remove('hidden');
         fadeInFromBottom(locationsContent);
      });
   }
});