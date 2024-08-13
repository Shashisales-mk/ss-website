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
      slidesPerView: 3,
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
      allowTouchMove: false, // Disable swiping
  });

  // Add click event listeners to slides
  swiper.slides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
          if (slide.classList.contains('swiper-slide-prev')) {
              swiper.slidePrev();
          } else if (slide.classList.contains('swiper-slide-next')) {
              swiper.slideNext();
          }
      });
  });
});



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










const wheels = document.querySelectorAll('.wheel');
let currentWheelIndex = 0;
const wheelAnimation = document.querySelector('.wheel-animation');
let isAnimating = false; // Flag to track animation state

function showWheel(index, direction) {
  wheels.forEach((wheel, i) => {
    if (i === index) {
      wheel.classList.add('active');
    } else {
      wheel.classList.remove('active');
    }
  });
}

// Show the first wheel initially
showWheel(currentWheelIndex, 'forward');

// Add event listener for scroll
wheelAnimation.addEventListener('wheel', (event) => {
  if (isAnimating) return; // Ignore scroll event if animation is in progress

  const delta = event.deltaY;
  const maxIndex = wheels.length - 1;

  if (delta > 0) {
    // Scroll down
    if (currentWheelIndex < maxIndex) {
      currentWheelIndex++;
      startAnimation('forward');
    }
  } else {
    // Scroll up
    if (currentWheelIndex > 0) {
      currentWheelIndex--;
      startAnimation('reverse');
    }
  }
}, { passive: true });

// Prevent body scroll when a wheel is active
document.addEventListener('wheel', (event) => {
  if (isAnimating) {
    event.preventDefault();
  }
}, { passive: false });

function startAnimation(direction) {
  isAnimating = true; // Set the animation flag

  showWheel(currentWheelIndex, direction);

  // Wait for the animation to complete
  const animationDuration = 1500; // Adjust this value based on your transition durations
  setTimeout(() => {
    isAnimating = false; // Reset the animation flag
  }, animationDuration);
}

// Add event listener for touch events
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

let initialY = null;

function handleTouchStart(event) {
  initialY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  if (isAnimating) {
    event.preventDefault(); // Prevent body scroll during animation
    return; // Exit the function to avoid further execution
  }

  if (!initialY) return;

  const currentY = event.touches[0].clientY;
  const diff = initialY - currentY;

  if (Math.abs(diff) > 50) { // Set a threshold for scrolling
    if (diff > 0) {
      // Scroll down
      if (currentWheelIndex < wheels.length - 1) {
        currentWheelIndex++;
        startAnimation('forward');
      }
    } else {
      // Scroll up
      if (currentWheelIndex > 0) {
        currentWheelIndex--;
        startAnimation('reverse');
      }
    }

    initialY = null; // Reset initialY after handling the scroll
  }
}

// Unlock body scroll after animation is finished
setTimeout(() => {
  document.removeEventListener('touchmove', preventBodyScroll, { passive: false });
}, animationDuration + 100); // Add a small buffer time (100ms) after animation is finished

// Prevent body scroll when a wheel is active
const preventBodyScroll = (event) => {
  const activeWheel = document.querySelector('.wheel.active');
  if (activeWheel) {
    event.preventDefault();
  }
};

document.addEventListener('touchmove', preventBodyScroll, { passive: false });



