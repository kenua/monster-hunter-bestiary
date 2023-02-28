'use strict';

import { initializeApp } from "firebase/app";
import { 
   getFirestore,
   doc,
   collection,
   addDoc,
   getDoc,
   getDocs,
   updateDoc,
   deleteDoc,
   query,
   where,
   serverTimestamp,
   onSnapshot
} from 'firebase/firestore';
import {
   getStorage,
   ref,
   uploadBytes,
   getDownloadURL,
   deleteObject
} from 'firebase/storage';
import validateMonsterData from './validateMonsterData.js';

// # FIREBASE CONFIG
const firebaseConfig = {
   apiKey: "AIzaSyAEN3M_XgmQuzDItUU8ZFC-0cNai0Hmkmg",
   authDomain: "monster-hunter-bestiary.firebaseapp.com",
   projectId: "monster-hunter-bestiary",
   storageBucket: "monster-hunter-bestiary.appspot.com",
   messagingSenderId: "130871450239",
   appId: "1:130871450239:web:b83e3d88567106cf103d4a"
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const monstersCollection = collection(db, 'monsters');

// # FIRESTORE CRUD FUNCTIONS
async function createNewMonsterDoc(data, imageFile) {
   // throw array with errors if data is invalid
   let errors = validateMonsterData(data, imageFile);

   if (errors) throw errors;

   // add monster doc to firebase
   try {
      let { name, type, element, desc, weakness, habitat } = data;
      let imageRef = ref(storage, imageFile.name);
      let uploadResult = await uploadBytes(imageRef, imageFile);
      let imageURL = await getDownloadURL(imageRef);
      let docRef = await addDoc(monstersCollection, {
         name: name, 
         type: type,
         element: element,
         desc: desc,
         weakness: weakness,
         habitat: habitat,
         image: {
            filename: imageFile.name,
            url: imageURL,
         },
         timestamp: serverTimestamp(),
      });

      return true;    
   } catch (err) {
      throw new Error('An error occurred while uploading monster');
   }
}

async function getMonstersDoc(habitat = null) {
   let res;

   try {
      // get docs by a certain habitat
      if ((typeof habitat) === 'string' && habitat.length > 0) {
         let q = query(monstersCollection, where('habitat', 'array-contains', habitat));
         res = await getDocs(q);
   
      // get all docs
      } else {
         res = await getDocs(monstersCollection);
      }
      
      let docs = res.docs.map(doc => {
         return {
            ...doc.data(),
            id: doc.id,
         }
      });

      return docs;
   } catch (err) {
      throw new Error('An error occurred while fetching monster(s)');
   }

}

async function getSingleMonsterDoc(id) {
   try {
      let docRef = doc(db, 'monsters', id);
      let monsterDoc = await getDoc(docRef);

      return {
         ...monsterDoc.data(),
         id: monsterDoc.id,
      };
   } catch (err) {
      throw new Error('An error occurred while getting a monster');
   }
}

async function updateMonsterDoc(id = '', data, newImageFile = null) {
   let errors = validateMonsterData(data, newImageFile);

   if (errors) throw errors;
  
   try {
      let docRef = doc(db, 'monsters', id);

      // delete old image and upload new one
      if (newImageFile) {
         let oldImage = (await getDoc(docRef)).data().image;
         let oldImageRef = ref(storage, oldImage.filename);

         await deleteObject(oldImageRef);

         let newImageRef = ref(storage, newImageFile.name);
         let uploadResult = await uploadBytes(newImageRef, newImageFile);
         let newImageURL = await getDownloadURL(newImageRef);

         data.image = {
            filename: newImageFile.name,
            url: newImageURL,
         };
      }

      await updateDoc(docRef, data);
      return true;
   } catch (err) {
      throw new Error('An error occurred while updating monster');
   }
}

async function deleteMonsterDoc(id) {
   try {
      let docRef = doc(db, 'monsters', id);
      let docImage = (await getDoc(docRef)).data().image;
      let docImageRef = ref(storage, docImage.filename);

      await deleteObject(docImageRef);
      await deleteDoc(docRef);
   } catch (err) {
      throw new Error('An error occurred while deleting monster');
   }
}

function listenToDocChanges(callback) {
   return onSnapshot(
      monstersCollection,
      callback
   );
}

export {
   createNewMonsterDoc,
   getMonstersDoc,
   getSingleMonsterDoc,
   updateMonsterDoc,
   deleteMonsterDoc,
   listenToDocChanges,
};