// chatbot


const socket = io();
let chatId;
let currentQuestion = 0;
const questions = [
"How may I help you? (Estimated wait time: 30 seconds)",
"What's your name?",
"What's your email address?",
// "Please describe your problem."
];
const answers = {};
const notificationSound = document.getElementById('notificationSound');
const typingIndicator = document.getElementById('typing-indicator');
const chatPreview = document.getElementById('chat-preview');
const chatPreviewClose = document.getElementById('chat-preview-close');
const chatButton = document.getElementById('chat-button');
const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSubmit = document.getElementById('chat-submit');



chatButton.addEventListener('click', () => {
if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
chatContainer.style.display = 'block';
chatPreview.style.display = 'none';
if (currentQuestion === 0) {
    askNextQuestion();
}
} else {
chatContainer.style.display = 'none';
}
});

function toggleChatPreview(show) {
chatPreview.style.display = show ? 'flex' : 'none';
}

// Show chat preview by default
toggleChatPreview(true);

function askNextQuestion() {
if (currentQuestion < questions.length) {
addBotMessage(questions[currentQuestion]);
}
}

function addBotMessage(message) {
const messageElement = document.createElement('div');
messageElement.className = 'message bot-message';
messageElement.textContent = message;
chatMessages.appendChild(messageElement);
chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addUserMessage(message) {
const messageElement = document.createElement('div');
messageElement.className = 'message user-message';
messageElement.textContent = message;
chatMessages.appendChild(messageElement);
chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatSubmit.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
sendMessage();
}
});

function sendMessage() {
const message = chatInput.value.trim();
if (message) {
if (currentQuestion < questions.length) {
answers[currentQuestion] = message;
addUserMessage(message);
currentQuestion++;
if (currentQuestion < questions.length) {
askNextQuestion();
} else {
startChat();
}
} else {
if (chatId) {
socket.emit('chat message', { chatId, content: message });
addUserMessage(message);
} else {
console.error('Chat not initialized');
addBotMessage("There was an error sending your message. Please try again.");
}
}
chatInput.value = '';
}
}

async function startChat() {
try {
const response = await fetch('/start-chat', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(answers)
});
const data = await response.json();
chatId = data.chatId;
socket.emit('join chat', chatId);
addBotMessage("To offer you the best solution, may i ask a couple of questions?");
} catch (error) {
console.error('Error starting chat:', error);
addBotMessage("I'm sorry, there was an error starting the chat. Please try again later.");
}
}

let typingTimeout;
chatInput.addEventListener('input', () => {
if (chatId) {
socket.emit('typing', { chatId, isTyping: true });
clearTimeout(typingTimeout);
typingTimeout = setTimeout(() => {
    socket.emit('typing', { chatId, isTyping: false });
}, 1000);
}
});

socket.on('typing', ({ isTyping }) => {
typingIndicator.style.display = isTyping ? 'block' : 'none';
});


socket.on('chat message', (msg) => {
if (msg.sender === 'admin') {
addBotMessage(msg.content);
// Play notification sound for admin messages
notificationSound.play().catch(error => console.error('Error playing sound:', error));
}
});

socket.on('chat closed', () => {
addBotMessage("This chat has been closed. Thank you for using our service.");
chatInput.disabled = true;
chatSubmit.disabled = true;
});

socket.on('error', (errorMsg) => {
console.error('Socket error:', errorMsg);
addBotMessage(`Error: ${errorMsg}`);
});

// chatbot




document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('founderVideo');
  const videoContainer = document.querySelector('.video-container');
  const customPointer = document.createElement('div');
  customPointer.classList.add('custom-pointer');
  document.body.appendChild(customPointer);

  let isFullWidth = false;

  videoContainer.addEventListener('click', toggleVideoSize);
  videoContainer.addEventListener('mouseenter', showPointer);
  videoContainer.addEventListener('mouseleave', hidePointer);
  window.addEventListener('mousemove', movePointer);

  function toggleVideoSize() {
    if (!isFullWidth) {
      video.classList.add('video-full-width');
      video.muted = false;
      document.body.style.cursor = 'none';
      customPointer.textContent = 'Close Reel';
      customPointer.classList.add('show-pointer');
      isFullWidth = true;
    } else {
      video.classList.remove('video-full-width');
      video.muted = true;
      document.body.style.cursor = 'auto';
      customPointer.classList.remove('show-pointer');
      isFullWidth = false;
    }
  }

  function showPointer() {
    if (!isFullWidth) {
      customPointer.textContent = 'Show Reel';
      customPointer.classList.add('show-pointer');
    }
  }

  function hidePointer() {
    if (!isFullWidth) {
      customPointer.classList.remove('show-pointer');
    }
  }

  function movePointer(e) {
    customPointer.style.left = `${e.clientX - 35}px`;
    customPointer.style.top = `${e.clientY - 35}px`;
  }
});




// -----------------------------------------------------------------------------------------------------------
// Design Page

document.addEventListener('DOMContentLoaded', function() {
  // Function to handle visibility check
  function handleIntersection(entries, observer) {
      entries.forEach(entry => {
          const rocSec = entry.target;
          if (entry.isIntersecting) {
              rocSec.classList.add('active');
              setTimeout(function() {
                  rocSec.classList.add('reset');
              }, 1300);
          } else {
              rocSec.classList.remove('active');
              rocSec.classList.remove('reset');
          }
      });
  }

  // Set up Intersection Observer
  const observer = new IntersectionObserver(handleIntersection, {
      threshold: [0.7] // Trigger when at least 80% of the element is in view
  });

  const rocSec = document.getElementById('roc-sec');
  observer.observe(rocSec);

  // Throttle function to limit the rate of calls to a function
  function throttle(fn, wait) {
      let time = Date.now();
      return function() {
          if ((time + wait - Date.now()) < 0) {
              fn();
              time = Date.now();
          }
      }
  }

  // For Mobile - Design-section-two
  const forMobSection = document.querySelector('.design-section-two');
  const tblElements = document.querySelectorAll('.tbl');

  function isElementInCenter(element) {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const elementCenter = rect.top + rect.height / 2;
      return elementCenter >= windowHeight / 3 && elementCenter <= (2 * windowHeight) / 3;
  }

  function handleScrollEffect() {
      if (window.innerWidth <= 768) {
          if (isElementInCenter(forMobSection)) {
              forMobSection.style.backgroundColor = 'white';
              tblElements.forEach(function(tblElement) {
                  tblElement.classList.remove('white-text');
              });
          } else {
              forMobSection.style.backgroundColor = 'black';
              tblElements.forEach(function(tblElement) {
                  tblElement.classList.add('white-text');
              });
          }
      }
  }

  window.addEventListener('scroll', handleScrollEffect);
  window.addEventListener('resize', handleScrollEffect);


  handleScrollEffect();

  // Rocket animation for mobile
  if (window.innerWidth <= 600) {
      var rocket = document.getElementById("rocket");
      var rocketImage = rocket.querySelector("img");

      rocket.addEventListener("animationstart", function() {
          rocketImage.src = "/assets/images/rocket.webp";
      });

      rocket.addEventListener("animationiteration", function() {
          rocketImage.src = "/assets/images/rocket.webp";
      });

      rocket.addEventListener("animationstart", function(e) {
          var duration = e.target.getAnimations()[0].effect.getTiming().duration;

          setTimeout(function() {
              rocketImage.src = "/assets/images/rocket2.webp";
          }, 0.1220 * duration);

          setTimeout(function() {
              rocketImage.src = "/assets/images/rocket.webp";
          }, 0.3333 * duration);

          setTimeout(function() {
              rocketImage.src = "/assets/images/rocket2.webp";
          }, 0.6667 * duration);

          setTimeout(function() {
              rocketImage.src = "/assets/images/rocket.webp";
          }, duration);
      });
  }

  // Hover effect for images
  function addHoverEffect(elementId, originalSrc, hoverSrc) {
      const element = document.getElementById(elementId).querySelector('img');
      element.addEventListener('mouseenter', function() {
          element.src = hoverSrc;
      });
      element.addEventListener('mouseleave', function() {
          element.src = originalSrc;
      });
  }

  addHoverEffect('ar1', '/assets/images/ar1.webp', '/assets/images/ar11.webp');
  addHoverEffect('ar2', '/assets/images/ar2.webp', '/assets/images/ar22.webp');
  addHoverEffect('ar3', '/assets/images/ar3.webp', '/assets/images/ar33.webp');
  addHoverEffect('ar4', '/assets/images/ar4.webp', '/assets/images/ar44.webp');

  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  function handleScroll() {
      animatedElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

          if (isInViewport) {
              element.classList.add('scrolled');
          } else {
              element.classList.remove('scrolled');
          }
      });
  }

  window.addEventListener('scroll', throttle(handleScroll, 100));
  window.addEventListener('load', handleScroll);


  animatedElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
          element.classList.add('scrolled');
      });

      element.addEventListener('mouseleave', () => {
          const rect = element.getBoundingClientRect();
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

          if (!isInViewport) {
              element.classList.remove('scrolled');
          }
      });
  });
});




// for seo page 


document.addEventListener('DOMContentLoaded', function(){

    var previousLogoPath1 = "";
    var previousLogoPath2 = "";
    var previousLogoPath3 = "";

    function updateContentAndImage(ben, priceId, moyHed1, moyP1, moyHed2, moyP2, moyHed3, moyP3, logoPath1, logoPath2, logoPath3) {
        document.getElementById("moy2in").innerHTML = ben;
        document.getElementById("priceid").innerHTML = priceId;
        document.getElementById("moyhed1").innerHTML = moyHed1;
        document.getElementById("moyp1").innerHTML = moyP1;
        document.getElementById("moyhed2").innerHTML = moyHed2;
        document.getElementById("moyp2").innerHTML = moyP2;
        document.getElementById("moyhed3").innerHTML = moyHed3;
        document.getElementById("moyp3").innerHTML = moyP3;

        var Logo1 = document.getElementById("pre-logo1");
        Logo1.src = logoPath1;

        var Logo2 = document.getElementById("pre-logo2");
        Logo2.src = logoPath2;

        var Logo3 = document.getElementById("pre-logo3");
        Logo3.src = logoPath3;

        previousLogoPath1 = logoPath1;
        previousLogoPath2 = logoPath2;
        previousLogoPath3 = logoPath3;
    }

    document.getElementById("borr1").addEventListener("click", function() {
        handClick1();
        updateContentAndImage(
            `
            <h3 class="fsm">Included In All Plans</h3>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Backlinks from Blogs, Forums, Wiki</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Total 2500 Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>For 1 Website URL</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>For up to 6 Keywords</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>100% DoFollow Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Permanent Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Free Premium Indexing</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Detailed Backlinks Report</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Press Releases</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Social Bookmarks & Blog Comments</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Delivery Full Report Within 15 Working Days</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>100% Safe with Search Engines</p>
            </div>
            <div class="paybtn"><a href="#">Get Quote</a></div>
            `,
            `Starting at <span style="color: #72df6a;font-weight: 700;">Rs. 9990/-</span>`,
            "Content Marketing Needs",
            "With 65+ different content formats, Shashi Sales & Marketing’s dedicated content team can help grow your business through professionally-written, SEO optimized content no matter your industry.",
            "Website Size",
            "The size of your website will determine your relative SEO needs for content, management, on-page optimization, and more. Your Shashi Sales & Marketing strategist will consider your website’s needs for your custom SEO strategy.",
            "Consultation Needs",
            "Every Shashi Sales & Marketing client gets the support of our 500+ digital marketing team, regular consultation calls, and ongoing business reviews. Our team can support complex needs as well, which you can discuss with your web strategist.",
            "/assets/images/ii1.webp",
            "/assets/images/i2.webp",
            "/assets/images/i3.webp"
        );
    });

    document.getElementById("borr2").addEventListener("click", function() {
        handClick2();
        updateContentAndImage(
            `
            <h3 class="fsm">Included In All Plans</h3>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Backlinks from Blogs, Forums, Wiki</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Total 2500 Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>For 1 Website URL</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>For up to 6 Keywords</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>100% DoFollow Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Permanent Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Free Premium Indexing</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Detailed Backlinks Report</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Press Releases</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Social Bookmarks & Blog Comments</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Delivery Full Report Within 15 Working Days</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>100% Safe with Search Engines</p>
            </div>
            <div class="paybtn"><a href="#">Get Quote</a></div>
            `,
            `Starting at <span style="color: #72df6a;font-weight: 700;">$ 1499/-</span>`,
            "Website Size",
            "The size of your website will determine your relative SEO needs for content, management, on-page optimization, and more. Your Shashi Sales & Marketing strategist will consider your website’s needs for your custom SEO strategy.",
            "Content Marketing Needs",
            "With 65+ different content formats, Shashi Sales & Marketing’s dedicated content team can help grow your business through professionally-written, SEO optimized content no matter your industry.",
            "Consultation Needs",
            "Every Shashi Sales & Marketing client gets the support of our 500+ digital marketing team, regular consultation calls, and ongoing business reviews. Our team can support complex needs as well, which you can discuss with your web strategist.",
            "/assets/images/i1.webp",
            "/assets/images/ii2.webp",
            "/assets/images/i3.webp"
        );
    });

    document.getElementById("borr3").addEventListener("click", function() {
        handClick3();
        updateContentAndImage(
            `
            <h3 class="fsm">Included In All Plans</h3>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Backlinks from Blogs, Forums, Wiki</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Total 2500 Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>For 1 Website URL</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>For up to 6 Keywords</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>100% DoFollow Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Permanent Backlinks</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Free Premium Indexing</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Detailed Backlinks Report</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Press Releases</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Social Bookmarks & Blog Comments</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>Delivery Full Report Within 15 Working Days</p>
            </div>
            <div class="moy2-in">
                <p><img height="25" width="25" src="/assets/images/checkIcon.webp" alt="checkIcon"></p>
                <p>100% Safe with Search Engines</p>
            </div>
            <div class="paybtn"><a href="#">Get Quote</a></div>
            `,
            `Starting at <span style="color: #72df6a;font-weight: 700;">$ 2800/-</span>`,
            "Consultation Needs",
            "Every Shashi Sales & Marketing client gets the support of our 500+ digital marketing team, regular consultation calls, and ongoing business reviews. Our team can support complex needs as well, which you can discuss with your web strategist.",
            "Website Size",
            "The size of your website will determine your relative SEO needs for content, management, on-page optimization, and more. Your Shashi Sales & Marketing strategist will consider your website’s needs for your custom SEO strategy.",
            "Content Marketing Needs",
            "With 65+ different content formats, Shashi Sales & Marketing’s dedicated content team can help grow your business through professionally-written, SEO optimized content no matter your industry.",
            "/assets/images/i1.webp",
            "/assets/images/i2.webp",
            "/assets/images/ii3.webp"
        );
    });
    function handClick1(){
        document.getElementById("ba").style.color = "#C4C800";

        document.getElementById("st").style.color = "#000";
        document.getElementById("pr").style.color = "#000";
    }
    function handClick2(){
        document.getElementById("ba").style.color = "#000";
        document.getElementById("st").style.color = "#C4C800";
        document.getElementById("pr").style.color = "#000";
    }
    function handClick3(){
        document.getElementById("st").style.color = "#000";
        document.getElementById("pr").style.color = "#C4C800";
    }
});
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("pre-logo1").src = "/assets/images/ii1.webp";
    document.getElementById("ba").style.color = "#C4C800";
});


