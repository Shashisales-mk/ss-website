window.removeEventListener('beforeunload', (e) => {
    console.log(e);

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


// fetch conuntry codes
fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
        const countryCodeSelect = document.getElementById('countryCode');

        data.forEach(country => {
            if (country.idd?.root && country.idd?.suffixes) {
                const countryCode = `${country.idd.root}${country.idd.suffixes[0]}`;
                const option = document.createElement('option');
                option.value = countryCode;
                option.text = `${country.name.common} (${countryCode})`;

                // Append option to the select element
                countryCodeSelect.appendChild(option);

                // Check if the country is India and set it as default
                if (country.name.common === "India") {
                    option.selected = true;  // Set as default selected
                }
            }
        });
    })
    .catch(error => console.error('Error fetching country codes:', error));

    const timeZones = moment.tz.names();
    const select = document.getElementById('timeZone');

    // Add time zones to select element
    timeZones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.text = zone;
        select.appendChild(option);
    });



// menu script

document.querySelector('.ham-cont').addEventListener('click', function (event) {
    event.stopPropagation();

    const menu = document.querySelector('.mob-menu');
    const hamburger = document.querySelector('.ham-cont');
    const lpMenuBar = document.querySelector('.lp-menu-bar');
    const lpMenuBarBgBlur = document.querySelector('.lp-menu-bar-overlay');

    hamburger.classList.toggle('active');

    // Toggle LP menu bar visibility with scaling animation
    if (!lpMenuBar.classList.contains('show')) {
        lpMenuBar.style.display = 'block';  // Ensure it's displayed first
        lpMenuBarBgBlur.style.display = 'block';  // Display the overlay

        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
            lpMenuBar.classList.add('show'); // Add show class for scaling and opacity
            lpMenuBarBgBlur.classList.add('show'); // Add show class for the overlay
        });
    } else {
        lpMenuBar.classList.remove('show'); // Remove show class to scale it out
        lpMenuBarBgBlur.classList.remove('show'); // Remove show class for the overlay

        setTimeout(() => {
            lpMenuBar.style.display = 'none'; // Hide it after the animation ends
            lpMenuBarBgBlur.style.display = 'none'; // Hide the overlay after animation
        }, 400); // Match the duration of the CSS transition
    }

    // Original mobile menu functionality
    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        setTimeout(() => {
            menu.style.display = 'none'; // Hide the mobile menu after animation
        }, 300);
    } else {
        menu.style.display = 'flex'; // Show the mobile menu
        setTimeout(() => {
            menu.classList.add('show'); // Add the show class for animation
        }, 10);
    }
});



document.querySelectorAll('.like, .dislike').forEach(button => {
    const itemId = button.closest('li').getAttribute('id');
    const storageKey = `user-action-${itemId}`;
    let storedAction = JSON.parse(localStorage.getItem(storageKey)) || { liked: false, disliked: false };

    // Add classes on page load based on stored actions
    const likeButton = button.closest('.like-dislike').querySelector('.like .aata');
    const dislikeButton = button.closest('.like-dislike').querySelector('.dislike .aata');

    if (storedAction.liked) {
        likeButton.classList.add('blue-add');
    }
    if (storedAction.disliked) {
        dislikeButton.classList.add('red-add');
    }

    button.addEventListener('click', async (e) => {
        const isLike = e.currentTarget.classList.contains('like');
        let finalAction;

        // Determine the action based on current state and clicked button
        if (isLike && storedAction.liked) {
            finalAction = 'undo-like';
            storedAction.liked = false;
            likeButton.classList.remove('blue-add');
        } else if (!isLike && storedAction.disliked) {
            finalAction = 'undo-dislike';
            storedAction.disliked = false;
            dislikeButton.classList.remove('red-add');
        } else if (isLike && storedAction.disliked) {
            finalAction = 'switch-to-like';
            storedAction.liked = true;
            storedAction.disliked = false;
            likeButton.classList.add('blue-add');
            dislikeButton.classList.remove('red-add');
        } else if (!isLike && storedAction.liked) {
            finalAction = 'switch-to-dislike';
            storedAction.disliked = true;
            storedAction.liked = false;
            dislikeButton.classList.add('red-add');
            likeButton.classList.remove('blue-add');
        } else if (isLike) {
            finalAction = 'like';
            storedAction.liked = true;
            likeButton.classList.add('blue-add');
        } else {
            finalAction = 'dislike';
            storedAction.disliked = true;
            dislikeButton.classList.add('red-add');
        }

        try {
            const response = await fetch('/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemId, action: finalAction })
            });

            const data = await response.json();
            if (response.ok) {
                // Update the small tag with the new count values
                likeButton.closest('.like-dislike').querySelector('.like small').textContent = data.likes;
                dislikeButton.closest('.like-dislike').querySelector('.dislike small').textContent = data.dislikes;

                // Store the updated action in local storage
                localStorage.setItem(storageKey, JSON.stringify(storedAction));
            }
        } catch (err) {
            console.error('Error updating like/dislike:', err);
        }
    });
});
