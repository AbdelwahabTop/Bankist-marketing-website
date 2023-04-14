'use strict';
//////////////////////////////////
// Element Selection
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
const nav = document.querySelector('.nav');

///////////////////////////////////////
// Modal window
const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

///////////////////////////////////////////
// Button Scrolling
btnScrollTo.addEventListener('click', function () {
  section1.scrollIntoView({ behavior: 'smooth' });
});

/////////////////////////////////////////////////
// Page navigation using Event Delegation
// ==> we are adding here the exact same callback function once to each of these three elements, and that will impact performance.
/*document.querySelectorAll('.nav__link').forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    const id = this.getAttribute('href');
    document.querySelector(id).scrollIntoView({behavior: 'smooth'});
  })
})*/
// ==>using Event Delegation: we the fact of event bubble up by putting the eventlistener on a comman parent of all the elements, and then we can catch that event in this parent and handel it there.
// 1. Add event listener to common parent element
// 2. Determine what element originated the event

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  // Matching strategy
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

////////////////////////////////////////////////////
// Tabbed component

tabsContainer.addEventListener('click', function (e) {
  // ==> choosing the element we click on it even it is the btn it self or the span inside the btn.
  const clicked = e.target.closest('.operations__tab');

  // ==> Guard clause
  if (!clicked) return;

  // Remove active classes
  tabs.forEach(c => c.classList.remove('operations__tab--active'));
  tabsContent.forEach(t => t.classList.remove('operations__content--active'));

  // Active tab
  clicked.classList.add('operations__tab--active');

  // Active content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

////////////////////////////////////////////////////////////
// Menu fade animation
// ==> using (this) key word instead of (opacity) argument to handleHover cuz bind method make (this) keyword carry the value that passed into it = this.
const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

// Passing "arguments" into handler
nav.addEventListener('mouseover', handleHover.bind(0.5));

nav.addEventListener('mouseout', handleHover.bind(1));

//////////////////////////////////////////////////////////////////////////////
// Sticky navigation
// ==> using scroll event is bad cuz it always fire when scrolling. even if the scroll was so small and that give us bad performance.
// ==> constant value for section1
/*const initialCoords = section1.getBoundingClientRect();

window.addEventListener('scroll', function () {
  if(window.scrollY > initialCoords.top) nav.classList.add('sticky');
  else nav.classList.remove('sticky'); 
});*/

////// The Intersection Observer API.
// Our Target
const header = document.querySelector('.header');
// getting the hight of navbar denamiclly to make it responsevie not just a constant value -90.
const navHeight = nav.getBoundingClientRect().height;

// our function that will run when the condition happen.// enrties is an array that carry the values of threshold
const stickyNav = function (entries) {
  const [entry] = entries;
  // console.log(entry);
  // condition to show the nav bar when the header is now longer intersecting with viewpoart
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headObserver = new IntersectionObserver(stickyNav, {
  // root is the something that we need our target to intersect with and we assign it to null cuz null mean the viewpoart.
  root: null,
  // threshold is the persent of our target that we need to intersect with the root. and zero mean that when ever the header just intersect with viewpoat do that function, and when ever it's compleatly gone go back to normal.
  threshold: 0,
  // rootMargin is abox that will be applied out side or inside our target element
  rootMargin: `-${navHeight}px`,
});
// applaying observation
headObserver.observe(header);

/////////////////////////////////////////////////////////////
// Reveal Sections
const allSections = document.querySelectorAll('.section');

// we passed another argument which is the sectionObserver to stop fire it after it work in removing classes. to get better performance.
const revealSection = function (entries, observer) {
  const [entry] = entries;
  // Guard clause
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  // stop observation
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

// applaying observation for each section, and adding class section hidden to add the animation
allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

/////////////////////////////////////////////////////////////////////////////////
// Lazy loading images
const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function (enrties, observer) {
  const [entry] = enrties;

  if (!entry.isIntersecting) return;

  //Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '-200px',
});

imgTargets.forEach(img => imgObserver.observe(img));
/////////////////////////////////////////////////////////////////////
/////// Slider ////////
const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');
  let curSlide = 0;
  const maxSlide = slides.length;

  // Functions
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };
  init();

  // Event handler
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    e.key === 'ArrowRight' && nextSlide();
  });

  dotContainer.addEventListener('click', function (e) {
    if (!e.target.classList.contains('dots__dot')) return;
    const { slide } = e.target.dataset;
    goToSlide(slide);
    activateDot(slide);
  });
};
slider();

/////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function (e) {
  console.log('HTML parsed', e);
});
