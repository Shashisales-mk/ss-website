// testimonials section.

document.addEventListener("DOMContentLoaded", function () {
    const swiper = new Swiper('.testimonial-swiper', {
      slidesPerView: 'auto',
      centeredSlides: true,
      spaceBetween: 30,
      loop: true,
      speed: 500,
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      },
      breakpoints: {
        320: {
          slidesPerView: 1.2,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30
        }
      },
      allowTouchMove: true,
    });
  
    swiper.slides.forEach((slide) => {
      slide.addEventListener('click', () => {
        if (slide.classList.contains('swiper-slide-prev')) {
          swiper.slidePrev();
        } else if (slide.classList.contains('swiper-slide-next')) {
          swiper.slideNext();
        }
      });
    });
  });
  
  async function openUserStory() {
    const activeSlide = document.querySelector('.swiper-slide-active');
    if (activeSlide) {
      const testimonialId = activeSlide.dataset.id;
      try {
        const response = await fetch(`/check-user-story/${testimonialId}`);
        const data = await response.json();
        
        if (data.hasStory) {
          window.location.href = `/user-story/${testimonialId}`;
        } else {
          alert('Case Study is not available for this client.');
        }
      } catch (error) {
        console.error('Error checking Case Study availability:', error);
        alert('An error occurred while checking the Case Study availability.');
      }
    }
  }
  
  



const sp1 = document.querySelector('.sp1');
const hi1 = document.querySelector('.hi1');
const sp2 = document.querySelector('.sp2');
const hi2 = document.querySelector('.hi2');

const pt = document.querySelector('.hero-section-landing');

function addHoverEffect(sectionClass, imageClass) {
    const section = document.querySelector(`.${sectionClass}`);
    const image = document.querySelector(`.${imageClass}`);

    section.addEventListener('mouseover', () => {
        image.classList.add('visible');
        pt.classList.add('elevated');
    });

    section.addEventListener('mouseout', () => {
        image.classList.remove('visible');
        pt.classList.remove('elevated');
    });
}

addHoverEffect('sp1', 'hi1'); 
addHoverEffect('sp2', 'hi2');


// popup script

const getqForms = document.querySelectorAll('.getq-form');
const showForm = document.querySelector('.show-form');
const cenPop = document.querySelector('.cen-pop');
const getQuoteMenu = document.querySelector('.get-quote-menu');

getqForms.forEach(getqForm => {
    getqForm.addEventListener('click', function (event) {
        event.preventDefault();
        if (cenPop.style.display === 'none' || cenPop.style.display === '') {
            cenPop.classList.add('flex');
        } else {
            cenPop.classList.remove('flex');
        }
    });
});
document.addEventListener('click', function (event) {
    const isClickOutside = !getQuoteMenu.contains(event.target) && 
                           !Array.from(getqForms).some(form => form.contains(event.target));

    if (isClickOutside) {
        cenPop.classList.remove('flex');
    }
});



// industries we server 

document.addEventListener("DOMContentLoaded", function () {
    const scrollContainer = document.getElementById('scroll-container');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');

    const scrollStep = scrollContainer.clientWidth;

    scrollLeftBtn.addEventListener('click', function () {
        scrollContainer.scrollBy({
            left: -scrollStep,
            behavior: 'smooth'
        });
    });

    scrollRightBtn.addEventListener('click', function () {
        scrollContainer.scrollBy({
            left: scrollStep,
            behavior: 'smooth'
        });
    });

    setInterval(() => {
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        if (scrollContainer.scrollLeft >= maxScrollLeft) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            scrollContainer.scrollBy({ left: scrollStep, behavior: 'smooth' });
        }
    }, 3000); 
});



//   popup script

document.addEventListener('DOMContentLoaded', () => {
  const consultButtons = document.querySelectorAll('.consult'); 
  const popup = document.getElementById('popup');
  const closeBtn = document.querySelector('.close');
  const nextBtn = document.getElementById('nextBtn');
  const infoSection = document.getElementById('infoSection');
  const appointmentSection = document.getElementById('appointmentSection');
  const popupContent = document.querySelector('.popup-content');

  // Attach event listeners to each 'consult' button
  consultButtons.forEach(button => {
      button.addEventListener('click', () => {
          popup.style.display = 'flex';
      });
  });

  closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
  });

  nextBtn.addEventListener('click', () => {
      infoSection.style.display = 'none';
      appointmentSection.style.display = 'block';
  });

  // Close popup when clicking outside the form
  popup.addEventListener('click', (e) => {
      if (e.target === popup) {
          popup.style.display = 'none';
      }
  });

  // Prevent closing when clicking inside the form
  popupContent.addEventListener('click', (e) => {
      e.stopPropagation();
  });
});