
// foot quote form script
document.getElementById("getq").addEventListener("click", function() {
  var mobFoot = document.getElementById("mob-foot");
  var overlay = document.getElementById("overlay");

  console.log("Click detected on getq element");
  mobFoot.style.display = 'none';

  if (mobFoot.style.display === "none" || mobFoot.style.display === "") {
      mobFoot.style.display = "block";
      document.querySelector('.get-quote-menu').style.display = 'block';

      if (window.innerWidth <= 768) {
          document.querySelector('.get-quote-menu').style.position = 'fixed';
          document.querySelector('.get-quote-menu').style.right = '5%';
          document.querySelector('.get-quote-menu').style.top = '50%';
          document.querySelector('.get-quote-menu').style.transform = 'translateY(-50%)';
          document.querySelector('.get-quote-menu').style.width = '90%';
          document.querySelector('.get-quote-menu').style.padding = '3vw';
          document.querySelector('.get-quote-menu').style.background = '#d9d9d9c2';
          document.querySelector('.contact-left-in').style.padding = '2vw 0';

          document.querySelectorAll('.get-quote-menu .contact-left-in input, textarea').forEach(function(element) {
              element.style.fontSize = "3.5vw";
              element.style.height = "10vw";
          });

          document.querySelector('.get-quote-menu .ser-h textarea').style.height = "20vw";
          document.querySelector('.get-quote-menu .form-submit input').style.height = '7vw';
          document.querySelector('.get-quote-menu .form-submit input').style.width = '25vw';
          document.querySelector('.get-quote-menu .form-submit input').style.borderRadius = '25px';
          document.querySelector('.get-quote-menu .form-submit input').style.fontSize = '3.5vw';
          document.querySelector('.get-quote-menu .fila div').style.width = '50%';
          document.querySelector('.contact-left').style.background = "transparent";
      }

      overlay.style.display = "block"; 
  } else {
      mobFoot.style.display = "none"; 
      overlay.style.display = "none"; 
  }
});

document.getElementById("overlay").addEventListener("click", function() {
  var mobFoot = document.getElementById("mob-foot");
  var overlay = document.getElementById("overlay");
  
  if (window.innerWidth <= 768) {  
      mobFoot.style.display = "none";
  }

  document.querySelector('.get-quote-menu').removeAttribute('style');
  document.querySelector('.contact-left-in').removeAttribute('style');

  document.querySelectorAll('.get-quote-menu .contact-left-in input, textarea').forEach(function(element) {
      element.removeAttribute('style');
  });

  document.querySelector('.get-quote-menu .ser-h textarea').removeAttribute('style');
  document.querySelector('.get-quote-menu .form-submit input').removeAttribute('style');
  document.querySelector('.get-quote-menu .fila div').removeAttribute('style');
  document.querySelector('.contact-left').removeAttribute('style');

  overlay.style.display = "none"; 
});

// foot quote form script

function validateForm() {
  var firstName = document.getElementById('firstName').value;
  var lastName = document.getElementById('lastName').value;
  var phone = document.getElementById('phone').value;
  var email = document.getElementById('email').value;
  var service = document.getElementById('service').value;

  // Remove non-digit characters for length check
  var phoneDigits = phone.replace(/[^\d+]/g, '');

  if (phoneDigits.length < 8) {
      alert('Please enter a valid phone number with valid format of your country');
      return false;
  }

  if (firstName.trim() === '' || lastName.trim() === '' || phone.trim() === '' || email.trim() === '' || service.trim() === '') {
      alert('All fields are required');
      return false;
  }

  if (!/^[A-Za-z ]+$/.test(firstName) || !/^[A-Za-z ]+$/.test(lastName)) {
      alert('Names should only contain letters and spaces');
      return false;
  }
  

  // Simple phone validation (allows digits, spaces, hyphens, and parentheses)
  if (!/^\+[\d\s\-()]+$/.test(phone)) {
      alert('Phone number should only contain digits, spaces, hyphens, or parentheses');
      return false;
  }

  // Simple email validation
  if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address');
      return false;
  }


  return true;
}




const tiles = document.querySelectorAll('.tile');
const mainView = document.querySelector('.main-view');

tiles.forEach(tile => {
  tile.addEventListener('click', () => {
    const tileImage = tile.querySelector('img').src;
    const tileHeading = tile.querySelector('h2').textContent;
    const tileDescription = tile.querySelector('p').textContent;
    const pageLink = tile.querySelector('.tile-link').href;

    mainView.innerHTML = `
      <img src="${tileImage}" alt="${tileHeading}">
      <div class="text">
        <h2>${tileHeading}</h2>
        <p>${tileDescription}</p>
        <div style="display: flex; justify-content: center;"><a href="${pageLink}" class="tile-link">Read More</a></div>
      </div>
    `;
  });
});

const tiles2 = document.querySelectorAll('.tile2');
const mainView2 = document.querySelector('.main-view2');

tiles2.forEach(tile2 => {
  tile2.addEventListener('click', () => {
    const tileImage = tile2.querySelector('img').src;
    const tileHeading = tile2.querySelector('h2').textContent;

    mainView2.innerHTML = `
      <img src="${tileImage}" alt="${tileHeading}">
      <div class="text">
        <h2>${tileHeading}</h2>
      </div>
    `;
  });
});


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



// mobile header
document.addEventListener("DOMContentLoaded", function () {
  var mobileHeader = document.querySelector('.hide-mobile-header-cont');
  var mobileHeaderPopup = document.getElementById('display-mobile-header-cont');
  var serviceHeader = document.querySelector('.hide-service-header-cont');
  var serviceHeaderPopup = document.querySelectorAll('.display-service-header-cont');
  var hideMobileHeaderCont = document.querySelector('.hide-mobile-header-cont');
  var hideServiceHeaderCont = document.querySelector('.hide-service-header-cont');
  var serviceBack = document.getElementById('service-back');

  mobileHeaderPopup.addEventListener("click", function (event) {
    event.stopPropagation();
    mobileHeader.style.display = mobileHeader.style.display === 'none' ? 'block' : 'none';
  });

  serviceHeaderPopup.forEach(function (serviceHeaderPopupItem) {
    serviceHeaderPopupItem.addEventListener("click", function (event) {
      hideMobileHeaderCont.style.display = "none";
      event.stopPropagation();
      serviceHeader.style.display = serviceHeader.style.display === 'none' ? 'block' : 'none';
    });
  });

  serviceBack.addEventListener("click", function (event) {
    hideServiceHeaderCont.style.display = 'none';
    hideMobileHeaderCont.style.display = 'block';
    event.stopPropagation();
  });

  // Close mobile header and service header popup when clicking outside
  document.addEventListener("click", function (event) {
    if (!hideMobileHeaderCont.contains(event.target) && !mobileHeaderPopup.contains(event.target)) {
      mobileHeader.style.display = 'none';
    }
    if (!hideServiceHeaderCont.contains(event.target) && !Array.from(serviceHeaderPopup).some(item => item.contains(event.target))) {
      serviceHeader.style.display = 'none';
    }
  });
});










const wheelsMo = document.querySelectorAll('.wheel-mo');
let currentWheelIndexMo = 0;
const wheelAnimationMo = document.querySelector('.wheel-animation-mo');
let isAnimatingMo = false; // Flag to track animation state

// Function to show the current wheel
function showCurrentWheel(index, direction) {
  wheelsMo.forEach((wheel, i) => {
    if (i === index) {
      wheel.classList.add('active');
    } else {
      wheel.classList.remove('active');
    }
  });
}

// Show the first wheel initially
showCurrentWheel(currentWheelIndexMo, 'forward');

// Add event listener for scroll
wheelAnimationMo.addEventListener('wheel', (event) => {
  if (isAnimatingMo) return; // Ignore scroll event if animation is in progress

  const delta = event.deltaY;
  const maxIndex = wheelsMo.length - 1;

  if (delta > 0) {
    // Scroll down
    if (currentWheelIndexMo < maxIndex) {
      currentWheelIndexMo++;
      initiateAnimation('forward');
    }
  } else {
    // Scroll up
    if (currentWheelIndexMo > 0) {
      currentWheelIndexMo--;
      initiateAnimation('reverse');
    }
  }
}, { passive: true });

// Prevent body scroll when a wheel is active
document.addEventListener('wheel', (event) => {
  if (isAnimatingMo) {
    event.preventDefault();
  }
}, { passive: false });

function initiateAnimation(direction) {
  isAnimatingMo = true; // Set the animation flag

  showCurrentWheel(currentWheelIndexMo, direction);

  // Wait for the animation to complete
  const animationDurationMo = 1500; // Adjust this value based on your transition durations
  setTimeout(() => {
    isAnimatingMo = false; // Reset the animation flag
  }, animationDurationMo);
}

// Add event listener for touch events
document.addEventListener('touchstart', handleTouchStartMo, false);
document.addEventListener('touchmove', handleTouchMoveMo, false);

let initialYMo = null;

function handleTouchStartMo(event) {
  initialYMo = event.touches[0].clientY;
}

function handleTouchMoveMo(event) {
  if (isAnimatingMo) {
    event.preventDefault(); // Prevent body scroll during animation
    return; // Exit the function to avoid further execution
  }

  if (!initialYMo) return;

  const currentY = event.touches[0].clientY;
  const diff = initialYMo - currentY;

  if (Math.abs(diff) > 50) { // Set a threshold for scrolling
    if (diff > 0) {
      // Scroll down
      if (currentWheelIndexMo < wheelsMo.length - 1) {
        currentWheelIndexMo++;
        initiateAnimation('forward');
      }
    } else {
      // Scroll up
      if (currentWheelIndexMo > 0) {
        currentWheelIndexMo--;
        initiateAnimation('reverse');
      }
    }

    initialYMo = null; // Reset initialY after handling the scroll
  }
}

// Prevent body scroll when a wheel is active
const preventBodyScrollMo = (event) => {
  const activeWheel = document.querySelector('.wheel-mo.active');
  if (activeWheel) {
    event.preventDefault();
  }
};

document.addEventListener('touchmove', preventBodyScrollMo, { passive: false });



