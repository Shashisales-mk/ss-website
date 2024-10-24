const countryCodesData = [
    { name: "Afghanistan", code: "+93" },
    { name: "Albania", code: "+355" },
    { name: "Algeria", code: "+213" },
    { name: "American Samoa", code: "+1-684" },
    { name: "Andorra", code: "+376" },
    { name: "Angola", code: "+244" },
    { name: "Anguilla", code: "+1-264" },
    { name: "Antarctica", code: "+672" },
    { name: "Antigua and Barbuda", code: "+1-268" },
    { name: "Argentina", code: "+54" },
    { name: "Armenia", code: "+374" },
    { name: "Aruba", code: "+297" },
    { name: "Australia", code: "+61" },
    { name: "Austria", code: "+43" },
    { name: "Azerbaijan", code: "+994" },
    { name: "Bahamas", code: "+1-242" },
    { name: "Bahrain", code: "+973" },
    { name: "Bangladesh", code: "+880" },
    { name: "Barbados", code: "+1-246" },
    { name: "Belarus", code: "+375" },
    { name: "Belgium", code: "+32" },
    { name: "Belize", code: "+501" },
    { name: "Benin", code: "+229" },
    { name: "Bermuda", code: "+1-441" },
    { name: "Bhutan", code: "+975" },
    { name: "Bolivia", code: "+591" },
    { name: "Bosnia and Herzegovina", code: "+387" },
    { name: "Botswana", code: "+267" },
    { name: "Brazil", code: "+55" },
    { name: "British Indian Ocean Territory", code: "+246" },
    { name: "British Virgin Islands", code: "+1-284" },
    { name: "Brunei", code: "+673" },
    { name: "Bulgaria", code: "+359" },
    { name: "Burkina Faso", code: "+226" },
    { name: "Burundi", code: "+257" },
    { name: "Cambodia", code: "+855" },
    { name: "Cameroon", code: "+237" },
    { name: "Canada", code: "+1" },
    { name: "Cape Verde", code: "+238" },
    { name: "Cayman Islands", code: "+1-345" },
    { name: "Central African Republic", code: "+236" },
    { name: "Chad", code: "+235" },
    { name: "Chile", code: "+56" },
    { name: "China", code: "+86" },
    { name: "Christmas Island", code: "+61" },
    { name: "Cocos Islands", code: "+61" },
    { name: "Colombia", code: "+57" },
    { name: "Comoros", code: "+269" },
    { name: "Cook Islands", code: "+682" },
    { name: "Costa Rica", code: "+506" },
    { name: "Croatia", code: "+385" },
    { name: "Cuba", code: "+53" },
    { name: "Curacao", code: "+599" },
    { name: "Cyprus", code: "+357" },
    { name: "Czech Republic", code: "+420" },
    { name: "Democratic Republic of the Congo", code: "+243" },
    { name: "Denmark", code: "+45" },
    { name: "Djibouti", code: "+253" },
    { name: "Dominica", code: "+1-767" },
    { name: "Dominican Republic", code: "+1-809" },
    { name: "East Timor", code: "+670" },
    { name: "Ecuador", code: "+593" },
    { name: "Egypt", code: "+20" },
    { name: "El Salvador", code: "+503" },
    { name: "Equatorial Guinea", code: "+240" },
    { name: "Eritrea", code: "+291" },
    { name: "Estonia", code: "+372" },
    { name: "Ethiopia", code: "+251" },
    { name: "Falkland Islands", code: "+500" },
    { name: "Faroe Islands", code: "+298" },
    { name: "Fiji", code: "+679" },
    { name: "Finland", code: "+358" },
    { name: "France", code: "+33" },
    { name: "French Polynesia", code: "+689" },
    { name: "Gabon", code: "+241" },
    { name: "Gambia", code: "+220" },
    { name: "Georgia", code: "+995" },
    { name: "Germany", code: "+49" },
    { name: "Ghana", code: "+233" },
    { name: "Gibraltar", code: "+350" },
    { name: "Greece", code: "+30" },
    { name: "Greenland", code: "+299" },
    { name: "Grenada", code: "+1-473" },
    { name: "Guam", code: "+1-671" },
    { name: "Guatemala", code: "+502" },
    { name: "Guernsey", code: "+44-1481" },
    { name: "Guinea", code: "+224" },
    { name: "Guinea-Bissau", code: "+245" },
    { name: "Guyana", code: "+592" },
    { name: "Haiti", code: "+509" },
    { name: "Honduras", code: "+504" },
    { name: "Hong Kong", code: "+852" },
    { name: "Hungary", code: "+36" },
    { name: "Iceland", code: "+354" },
    { name: "India", code: "+91" },
    { name: "Indonesia", code: "+62" },
    { name: "Iran", code: "+98" },
    { name: "Iraq", code: "+964" },
    { name: "Ireland", code: "+353" },
    { name: "Isle of Man", code: "+44-1624" },
    { name: "Israel", code: "+972" },
    { name: "Italy", code: "+39" },
    { name: "Ivory Coast", code: "+225" },
    { name: "Jamaica", code: "+1-876" },
    { name: "Japan", code: "+81" },
    { name: "Jersey", code: "+44-1534" },
    { name: "Jordan", code: "+962" },
    { name: "Kazakhstan", code: "+7" },
    { name: "Kenya", code: "+254" },
    { name: "Kiribati", code: "+686" },
    { name: "Kosovo", code: "+383" },
    { name: "Kuwait", code: "+965" },
    { name: "Kyrgyzstan", code: "+996" },
    { name: "Laos", code: "+856" },
    { name: "Latvia", code: "+371" },
    { name: "Lebanon", code: "+961" },
    { name: "Lesotho", code: "+266" },
    { name: "Liberia", code: "+231" },
    { name: "Libya", code: "+218" },
    { name: "Liechtenstein", code: "+423" },
    { name: "Lithuania", code: "+370" },
    { name: "Luxembourg", code: "+352" },
    { name: "Macau", code: "+853" },
    { name: "Macedonia", code: "+389" },
    { name: "Madagascar", code: "+261" },
    { name: "Malawi", code: "+265" },
    { name: "Malaysia", code: "+60" },
    { name: "Maldives", code: "+960" },
    { name: "Mali", code: "+223" },
    { name: "Malta", code: "+356" },
    { name: "Marshall Islands", code: "+692" },
    { name: "Mauritania", code: "+222" },
    { name: "Mauritius", code: "+230" },
    { name: "Mayotte", code: "+262" },
    { name: "Mexico", code: "+52" },
    { name: "Micronesia", code: "+691" },
    { name: "Moldova", code: "+373" },
    { name: "Monaco", code: "+377" },
    { name: "Mongolia", code: "+976" },
    { name: "Montenegro", code: "+382" },
    { name: "Montserrat", code: "+1-664" },
    { name: "Morocco", code: "+212" },
    { name: "Mozambique", code: "+258" },
    { name: "Myanmar", code: "+95" },
    { name: "Namibia", code: "+264" },
    { name: "Nauru", code: "+674" },
    { name: "Nepal", code: "+977" },
    { name: "Netherlands", code: "+31" },
    { name: "Netherlands Antilles", code: "+599" },
    { name: "New Caledonia", code: "+687" },
    { name: "New Zealand", code: "+64" },
    { name: "Nicaragua", code: "+505" },
    { name: "Niger", code: "+227" },
    { name: "Nigeria", code: "+234" },
    { name: "Niue", code: "+683" },
    { name: "North Korea", code: "+850" },
    { name: "Northern Mariana Islands", code: "+1-670" },
    { name: "Norway", code: "+47" },
    { name: "Oman", code: "+968" },
    { name: "Pakistan", code: "+92" },
    { name: "Palau", code: "+680" },
    { name: "Palestine", code: "+970" },
    { name: "Panama", code: "+507" },
    { name: "Papua New Guinea", code: "+675" },
    { name: "Paraguay", code: "+595" },
    { name: "Peru", code: "+51" },
    { name: "Philippines", code: "+63" },
    { name: "Pitcairn", code: "+64" },
    { name: "Poland", code: "+48" },
    { name: "Portugal", code: "+351" },
    { name: "Puerto Rico", code: "+1-787" },
    { name: "Qatar", code: "+974" },
    { name: "Republic of the Congo", code: "+242" },
    { name: "Reunion", code: "+262" },
    { name: "Romania", code: "+40" },
    { name: "Russia", code: "+7" },
    { name: "Rwanda", code: "+250" },
    { name: "Saint Barthelemy", code: "+590" },
    { name: "Saint Helena", code: "+290" },
    { name: "Saint Kitts and Nevis", code: "+1-869" },
    { name: "Saint Lucia", code: "+1-758" },
    { name: "Saint Martin", code: "+590" },
    { name: "Saint Pierre and Miquelon", code: "+508" },
    { name: "Saint Vincent and the Grenadines", code: "+1-784" },
    { name: "Samoa", code: "+685" },
    { name: "San Marino", code: "+378" },
    { name: "Sao Tome and Principe", code: "+239" },
    { name: "Saudi Arabia", code: "+966" },
    { name: "Senegal", code: "+221" },
    { name: "Serbia", code: "+381" },
    { name: "Seychelles", code: "+248" },
    { name: "Sierra Leone", code: "+232" },
    { name: "Singapore", code: "+65" },
    { name: "Sint Maarten", code: "+1-721" },
    { name: "Slovakia", code: "+421" },
    { name: "Slovenia", code: "+386" },
    { name: "Solomon Islands", code: "+677" },
    { name: "Somalia", code: "+252" },
    { name: "South Africa", code: "+27" },
    { name: "South Korea", code: "+82" },
    { name: "South Sudan", code: "+211" },
    { name: "Spain", code: "+34" },
    { name: "Sri Lanka", code: "+94" },
    { name: "Sudan", code: "+249" },
    { name: "Suriname", code: "+597" },
    { name: "Svalbard and Jan Mayen", code: "+47" },
    { name: "Swaziland", code: "+268" },
    { name: "Sweden", code: "+46" },
    { name: "Switzerland", code: "+41" },
    { name: "Syria", code: "+963" },
    { name: "Taiwan", code: "+886" },
    { name: "Tajikistan", code: "+992" },
    { name: "Tanzania", code: "+255" },
    { name: "Thailand", code: "+66" },
    { name: "Togo", code: "+228" },
    { name: "Tokelau", code: "+690" },
    { name: "Tonga", code: "+676" },
    { name: "Trinidad and Tobago", code: "+1-868" },
    { name: "Tunisia", code: "+216" },
    { name: "Turkey", code: "+90" },
    { name: "Turkmenistan", code: "+993" },
    { name: "Turks and Caicos Islands", code: "+1-649" },
    { name: "Tuvalu", code: "+688" },
    { name: "U.S. Virgin Islands", code: "+1-340" },
    { name: "Uganda", code: "+256" },
    { name: "Ukraine", code: "+380" },
    { name: "United Arab Emirates", code: "+971" },
    { name: "United Kingdom", code: "+44" },
    { name: "United States", code: "+1" },
    { name: "Uruguay", code: "+598" },
    { name: "Uzbekistan", code: "+998" },
    { name: "Vanuatu", code: "+678" },
    { name: "Vatican", code: "+379" },
    { name: "Venezuela", code: "+58" },
    { name: "Vietnam", code: "+84" },
    { name: "Wallis and Futuna", code: "+681" },
    { name: "Western Sahara", code: "+212" },
    { name: "Yemen", code: "+967" },
    { name: "Zambia", code: "+260" },
    { name: "Zimbabwe", code: "+263" }
];

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
const sp2 = document.querySelector('.sp2');
const stripSpans = document.querySelectorAll('.ssstrip span');
const pt = document.querySelector(".ssstrip")

function updateStripText(text) {
    stripSpans.forEach(span => {
        span.textContent = `${text} ${text} ${text} ${text}`;
    });
}

function addStrokeEffect() {
    stripSpans.forEach(span => {
        span.classList.add('change-text');
    });
}

function removeStrokeEffect() {
    stripSpans.forEach(span => {
        span.classList.remove('change-text');
    });
}

// Hover effects for sp1
sp1.addEventListener('mouseover', () => {
    updateStripText('Customized Website Development');
    addStrokeEffect();
    pt.style.zIndex = 2;
  
});

sp1.addEventListener('mouseout', () => {
    updateStripText('Shashi Sales And Marketing');
    removeStrokeEffect();
    pt.style.zIndex = 0;
   
});

// Hover effects for sp2
sp2.addEventListener('mouseover', () => {
    updateStripText('Task Automation Solutions');
    addStrokeEffect();
    pt.style.zIndex = 2;
  
});

sp2.addEventListener('mouseout', () => {
    updateStripText('Shashi Sales And Marketing');
    removeStrokeEffect();
    pt.style.zIndex = 0;
   
});



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
    const prevBtn = document.getElementById('prevBtn');
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
    prevBtn.addEventListener('click', () => {
        infoSection.style.display = 'block';
        appointmentSection.style.display = 'none';
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
function populateCountryCodes() {
    const countryCodeSelect = document.getElementById('countryCode');

    // Clear existing options
    countryCodeSelect.innerHTML = '';

    // Add countries in alphabetical order (already sorted in our data)
    countryCodesData.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.text = `${country.name} (${country.code})`;

        // Set India as default
        if (country.name === "India") {
            option.selected = true;
        }

        countryCodeSelect.appendChild(option);
    });
}

// Call the function when the document is ready
document.addEventListener('DOMContentLoaded', populateCountryCodes);



// timezones
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
