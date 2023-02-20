'use strict';

function easeInCubic(t, b, c, d) {
   return c*(t/=d)*t*t + b;
}

function fadeOut (nodeRef, callback) {
   // define variables required for timing function
   let start = 1;
   let end = 0;
   let frameRate = 60 / 1000;
   let duration = 1000;
   let step = 0;
   let fadeOutAnimation = () => {
      step++;

      let timingFunction = easeInCubic(step, start, end - start, frameRate * duration);

      nodeRef.style.opacity = timingFunction;

      if (step >= frameRate * duration) {
         nodeRef.style.display = 'none';
         if (callback && (typeof callback) === 'function') callback();
         return;
      }

      requestAnimationFrame(fadeOutAnimation);
   }

   fadeOutAnimation();
}

function fadeIn (nodeRef, display = 'block', callback) {
   // define variables required for timing function
   let start = 0;
   let end = 1;
   let frameRate = 60 / 1000;
   let duration = 1000;
   let step = 0;
   let fadeInAnimation = () => {
      step++;

      let timingFunction = easeInCubic(step, start, end - start, frameRate * duration);

      nodeRef.style.opacity = timingFunction;

      if (step >= frameRate * duration) {
         if (callback && (typeof callback) === 'function') callback();
         return;
      }

      requestAnimationFrame(fadeInAnimation);
   }

   nodeRef.style.display = display;
   nodeRef.style.opacity = 0;
   fadeInAnimation();
}

function fadeInFromBottom(nodeRef, delay = '', callback = null) {
   let listener = (e) => {
      if (e.propertyName !== 'opacity') return;
      nodeRef.removeEventListener('transitionend', listener);
      if (callback) callback();
   };

   nodeRef.style.transition = 'opacity 750ms ease-in-out, transform 750ms ease-in-out';
   nodeRef.style.transitionDelay = delay;
   nodeRef.style.opacity = 1;
   nodeRef.style.transform = 'translateY(0px)';
   nodeRef.addEventListener('transitionend', listener);
}

function fadeOutFromTop(nodeRef, delay = '', callback = null) {
   let listener = (e) => {
      if (e.propertyName !== 'opacity') return;
      nodeRef.removeEventListener('transitionend', listener);
      if (callback) callback();
   }
   
   nodeRef.style.transition = 'opacity 750ms ease-in-out, transform 750ms ease-in-out';
   nodeRef.style.transitionDelay = delay;
   nodeRef.style.opacity = 0;
   nodeRef.style.transform = 'translateY(50px)';
   nodeRef.addEventListener('transitionend', listener);
}

export {
   fadeOut,
   fadeIn,
   fadeInFromBottom,
   fadeOutFromTop,
};