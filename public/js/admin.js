    const socket = io();
    const notificationSound = document.getElementById('notificationSound');
    const typingIndicator = document.getElementById('typing-indicator');
    const chatTabs = document.querySelectorAll('.chat-tab');
    const chatLists = document.querySelectorAll('.chat-list');
    const chatItems = document.querySelectorAll('.chat-item');
    const currentUser = document.getElementById('current-user');
    const chatMessages = document.getElementById('chat-messages');
    const replyForm = document.getElementById('reply-form');
    const replyInput = document.getElementById('reply-input');
    const closeChat = document.getElementById('close-chat');
    const activeChats = document.getElementById('active-chats');
    let activeChatId;

    chatItems.forEach(item => {
      item.addEventListener('click', loadChat);
    });

    chatTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        chatTabs.forEach(t => t.classList.remove('active'));
        chatLists.forEach(l => l.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tabName}-chats`).classList.add('active');
      });
    });

    socket.emit('admin connect');



    async function loadChat() {
      chatItems.forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      activeChatId = this.getAttribute('data-id');

      // Remove the new chat indicator when clicked
      const indicator = this.querySelector('.new-chat-indicator');
      if (indicator) {
        indicator.remove();
      }

      try {
        const response = await fetch(`/admin/chat/${activeChatId}`);
        const chat = await response.json();
        currentUser.textContent = chat.user.name + (chat.isOpen ? '' : ' (Closed)');
        chatMessages.innerHTML = '';
        chat.initialQuestions.forEach(q => {
          addMessage(`Q: ${q.question}`, 'user', chat.startedAt);
          addMessage(`A: ${q.answer}`, 'admin', chat.startedAt);
        });
        chat.messages.forEach(msg => {
          addMessage(msg.content, msg.sender, msg.timestamp);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
        socket.emit('join chat', activeChatId);
        replyForm.style.display = chat.isOpen ? 'flex' : 'none';
        closeChat.style.display = chat.isOpen ? 'block' : 'none';
      } catch (error) {
        console.error('Error fetching chat:', error);
      }
    }

    function formatTime(timestamp) {
      if (!timestamp) return 'Invalid Date';
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function addMessage(content, sender, timestamp) {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${sender}-message`;

      const messageContent = document.createElement('div');
      messageContent.textContent = content;
      messageElement.appendChild(messageContent);

      const timeElement = document.createElement('div');
      timeElement.className = 'message-time';
      timeElement.textContent = formatTime(timestamp || new Date()); // Use current time if timestamp is not provided
      messageElement.appendChild(timeElement);

      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }



    replyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (replyInput.value && activeChatId) {
        try {
          const response = await fetch('/admin/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: activeChatId, content: replyInput.value })
          });
          const data = await response.json();
          if (data.success) {
            addMessage(replyInput.value, 'admin');
            replyInput.value = '';
          }
        } catch (error) {
          console.error('Error sending reply:', error);
        }
      }
    });

    closeChat.addEventListener('click', async () => {
      if (activeChatId) {
        try {
          const response = await fetch('/close-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: activeChatId })
          });
          const data = await response.json();
          if (data.success) {
            addMessage('Chat closed', 'admin');
            replyForm.style.display = 'none';
            closeChat.style.display = 'none';
            document.querySelector(`[data-id="${activeChatId}"]`).remove();
            activeChatId = null;
            currentUser.textContent = '';
          }
        } catch (error) {
          console.error('Error closing chat:', error);
        }
      }
    });


    let typingTimeout;
    replyInput.addEventListener('input', () => {
      if (activeChatId) {
        socket.emit('typing', { chatId: activeChatId, isTyping: true });
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          socket.emit('typing', { chatId: activeChatId, isTyping: false });
        }, 1000);
      }
    });

    socket.on('typing', ({ chatId, isTyping }) => {
      if (chatId === activeChatId) {
        typingIndicator.style.display = isTyping ? 'block' : 'none';
      }
    });

    function initializeAudio() {
      notificationSound.play().then(() => {
        notificationSound.pause();
        notificationSound.currentTime = 0;
      }).catch(error => {
        console.log('Audio play failed:', error);
      });
    }

    function playNotificationSound() {
      notificationSound.play().catch(error => {
        console.error('Error playing sound:', error);
        // Fallback: show a visual notification
        showVisualNotification();
      });
    }

    function showVisualNotification() {
      console.log('New message received!');
      // Flash the title
      let originalTitle = document.title;
      document.title = '🔔 New Message!';
      setTimeout(() => { document.title = originalTitle; }, 3000);
    }
    document.addEventListener('click', initializeAudio, { once: true });

    socket.on('chat message', (msg) => {
      if (msg.chatId === activeChatId) {
        addMessage(msg.content, msg.sender, msg.timestamp || new Date().toISOString());

        // Play notification sound if the message is from the user
        if (msg.sender === 'user') {
          playNotificationSound();
        }
      }
    });

    socket.on('new chat', (chat) => {
      const chatList = document.getElementById('open-chats');
      const chatItem = document.createElement('div');
      chatItem.className = 'chat-item new-chat';
      chatItem.setAttribute('data-id', chat._id);
      chatItem.innerHTML = `
            <div class="new-chat-indicator"></div>
            <div class="chat-avatar">${chat.userName.charAt(0).toUpperCase()}</div>
            <div class="chat-info">
                <div class="chat-name">${chat.userName}</div>
                <div class="chat-preview">${chat.problem}</div>
                <div class="chat-time">${formatTime(chat.startedAt)}</div>
            </div>
        `;
      chatItem.addEventListener('click', loadChat);
      chatList.insertBefore(chatItem, chatList.firstChild);

      // If the closed chats tab is active, switch to open chats
      const openChatsTab = document.querySelector('.chat-tab[data-tab="open"]');
      openChatsTab.click();

      playNotificationSound();

      // Remove the new-chat class after animation
      setTimeout(() => {
        chatItem.classList.remove('new-chat');
      }, 2000);
    });
    socket.on('chat closed', (chatId) => {
      const chatItem = document.querySelector(`[data-id="${chatId}"]`);
      if (chatItem) {
        chatItem.classList.add('closed-chat-item');
        const chatName = chatItem.querySelector('.chat-name');
        chatName.textContent += ' (Closed)';
        const chatPreview = chatItem.querySelector('.chat-preview');
        chatPreview.textContent = `Closed on ${new Date().toLocaleString()}`;
        document.getElementById('closed-chats').appendChild(chatItem);
      }
      if (chatId === activeChatId) {
        addMessage('Chat closed', 'admin', new Date());
        replyForm.style.display = 'none';
        closeChat.style.display = 'none';
        currentUser.textContent += ' (Closed)';
      }
    });

//   <!-- subscriber script -->
    document.addEventListener("DOMContentLoaded", function () {
      const openCreateSubscriberLink = document.querySelector(
        ".open-create-subscriber"
      );
      const createNewDiv = document.querySelector(".create-new");

      openCreateSubscriberLink.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent the default link behavior

        if (
          createNewDiv.style.display === "none" ||
          createNewDiv.style.display === ""
        ) {
          createNewDiv.style.display = "block";
          this.textContent = " Create New Subscriber";
        } else {
          createNewDiv.style.display = "none";
          this.textContent = "Create New Subscriber";
        }
      });
    });
//   <!-- subscriber script -->

//   <!-- character limit -->
    function updateCharCount(textarea) {
      const maxLength = textarea.getAttribute("maxlength");
      const currentLength = textarea.value.length;
      document.getElementById(
        "charCount"
      ).innerText = `${currentLength} / ${maxLength} characters`;
    }
//   <!-- character limit -->

//   <!-- testimonial section -->
    function toggleEditForm(formId) {
      const form = document.getElementById(formId);
      if (form.style.display === "none") {
        form.style.display = "block";
      } else {
        form.style.display = "none";
      }
    }

    function showEditTestimonialForm(id) {
      const testimonial = testimonials.find((t) => t._id === id);
      document.getElementById("editTestimonialId").value = id;
      document.getElementById("editTestimonialText").value = testimonial.text;
      document.getElementById("editTestimonialName").value = testimonial.name;
      document.getElementById("editTestimonialForm").style.display = "block";
    }

    function showEditTestimonialPageForm(id) {
      const testimonialPage = testimonialPages.find((tp) => tp._id === id);
      document.getElementById("editTestimonialPageId").value = id;

      document.getElementById("editGrowthStory").value =
        testimonialPage.growthStory;

      document.getElementById("editTestimonialPageForm").style.display = "block";
    }


    function hideAllSections() {
      document.querySelector(".blog-section").style.display = "none";
      document.querySelector(".gallery-section").style.display = "none";
      document.querySelector(".testimonial-section").style.display = "none";
      document.querySelector(".comment-section").style.display = "none";
      document.querySelector(".subscriber-section").style.display = "none";
      document.querySelector(".chatbot-section").style.display = "none";
      document.querySelector(".team-section").style.display = "none";
      document.querySelector(".job-section").style.display = "none";
      document.querySelector(".application-section").style.display = "none";
      // Add additional sections here if needed
    }

    // Function to show the selected section and set it as active in the sidebar
    function showSection(sectionId, navId) {
      hideAllSections();
      document.querySelector(`.${sectionId}`).style.display = "flex";
      document
        .querySelectorAll(".sideNavBar li")
        .forEach((item) => item.classList.remove("active"));
      document.getElementById(navId).classList.add("active");
      localStorage.setItem("activeSection", sectionId);
      localStorage.setItem("activeNav", navId);
    }
    // Function to show the selected section and set it as active in the sidebar
    function showSection6(sectionId, navId) {
      hideAllSections();
      document.querySelector(".chatbot-section").style.display = "flex";
      document
        .querySelectorAll(".sideNavBar li")
        .forEach((item) => item.classList.remove("active"));
      document.getElementById(navId).classList.add("active");
      localStorage.setItem("activeSection", sectionId);
      localStorage.setItem("activeNav", navId);
    }

    // When the document is fully loaded
    document.addEventListener("DOMContentLoaded", function () {
      // Check if there's an active section stored in local storage
      const activeSection =
        localStorage.getItem("activeSection") || "blog-section";
      const activeNav = localStorage.getItem("activeNav") || "sec1";
      showSection(activeSection, activeNav);
    });

    // Event listeners for sidebar menu items
    document.getElementById("sec1").addEventListener("click", function () {
      showSection("blog-section", "sec1");
    });

    document.getElementById("sec2").addEventListener("click", function () {
      showSection("gallery-section", "sec2");
    });

    document.getElementById("sec3").addEventListener("click", function () {
      showSection("testimonial-section", "sec3");
    });

    document.getElementById("sec4").addEventListener("click", function () {
      showSection("comment-section", "sec4");
    });
    document.getElementById("sec5").addEventListener("click", function () {
      showSection("subscriber-section", "sec5");
    });
    document.getElementById("sec6").addEventListener("click", function () {
      document.querySelector(".chatbot-section").style.display = "flex";
      showSection("chatbot-section", "sec6")
    });
    document.getElementById("sec7").addEventListener("click", function () {
      document.querySelector(".team-section").style.display = "flex";
      showSection("team-section", "sec7")
    });
    document.getElementById("sec8").addEventListener("click", function () {
      document.querySelector(".job-section").style.display = "flex";
      showSection("job-section", "sec8")
    });
    document.getElementById("sec9").addEventListener("click", function () {
      document.querySelector(".application-section").style.display = "flex";
      showSection("application-section", "sec8")
    });

    // Ensure the form submission keeps the section visible
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", function () {
        const activeSection = document.querySelector(".sideNavBar .active").id;
        const sectionMap = {
          sec1: "blog-section",
          sec2: "gallery-section",
          sec3: "testimonial-section",
          sec4: "comment-section",
          sec5: "subcriber-section",
          sec6: "chatbot-section",
          sec7: "team-section",
          sec8: "job-section",
          sec9: "application-section",
        };
        localStorage.setItem("activeSection", sectionMap[activeSection]);
      });
    });
//   <!-- testimonial section -->

    const menuItems = document.querySelectorAll(".sideNavBar li");

    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        menuItems.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");
      });
    });

    document.addEventListener("DOMContentLoaded", function () {
      const form = document.getElementById("delete-multiple-form");
      const deleteButton = document.getElementById("delete-multiple-button");
      const checkboxes = document.querySelectorAll('input[name="selectedItems"]');

      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
          deleteButton.style.display = [...checkboxes].some((cb) => cb.checked)
            ? "block"
            : "none";
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if ([...checkboxes].some((cb) => cb.checked)) {
          if (confirm("Are you sure you want to delete these items?")) {
            this.submit();
          }
        } else {
          alert("Please select items to delete");
        }
      });
    });

    async function fetchGalleryItems() {
      const response = await fetch("/gallery");
      const galleryItems = await response.json();
      const galleryContainer = document.getElementById("galleryContainer");

      galleryItems.forEach((item) => {
        const galIn = document.createElement("div");
        galIn.classList.add("gal-in");

        const mediaElement = document.createElement(
          item.type === "image" ? "img" : "video"
        );
        if (item.type === "video") {
          const source = document.createElement("source");
          source.src = item.src;
          source.type = "video/webm";
          mediaElement.appendChild(source);
          mediaElement.autoplay = true;
          mediaElement.loop = true;
          mediaElement.muted = true;
        } else {
          mediaElement.src = item.src;
        }
        mediaElement.classList.add("clickable");
        galIn.appendChild(mediaElement);

        const ul = document.createElement("ul");
        item.tags.forEach((tag) => {
          const li = document.createElement("li");
          li.textContent = tag;
          ul.appendChild(li);
        });
        galIn.appendChild(ul);

        galleryContainer.appendChild(galIn);
      });
    }

    document.addEventListener("DOMContentLoaded", fetchGalleryItems);
    async function fetchGalleryItems() {
      const response = await fetch("/allBlogs");
      const galleryItems = await response.json();
      const galleryContainer = document.getElementById("galleryContainer");

      galleryItems.forEach((item) => {
        const galIn = document.createElement("div");
        galIn.classList.add("gal-in");

        const mediaElement = document.createElement(
          item.type === "image" ? "img" : "video"
        );
        if (item.type === "video") {
          const source = document.createElement("source");
          source.src = item.src;
          source.type = "video/webm";
          mediaElement.appendChild(source);
          mediaElement.autoplay = true;
          mediaElement.loop = true;
          mediaElement.muted = true;
        } else {
          mediaElement.src = item.src;
        }
        mediaElement.classList.add("clickable");
        galIn.appendChild(mediaElement);

        const ul = document.createElement("ul");
        item.tags.forEach((tag) => {
          const li = document.createElement("li");
          li.textContent = tag;
          ul.appendChild(li);
        });
        galIn.appendChild(ul);

        galleryContainer.appendChild(galIn);
      });
    }
    document.addEventListener("DOMContentLoaded", fetchGalleryItems);

    function downloadTableAsCSV(tableId) {
      // Get the table element using the provided tableId
      const table = document.getElementById(tableId);

      // Check if the table exists
      if (!table) {
        console.error("No table found with ID:", tableId);
        return;
      }

      // Create an array to hold the CSV data
      const csvData = [];

      // Get the table headers (only 'Name' and 'Email')
      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim()
      );
      // Filter the headers to keep only 'Name' and 'Email'
      const filteredHeaders = headers.filter(
        (header) => header === "Name" || header === "Email"
      );
      csvData.push(filteredHeaders.join(","));

      // Get the table rows
      const rows = Array.from(table.querySelectorAll("tbody tr"));

      // Convert each row to a CSV row, but only for 'Name' and 'Email'
      rows.forEach((row) => {
        // Get the 'Name' and 'Email' cells only
        const cells = Array.from(row.querySelectorAll("td"));
        const nameEmailData = [
          cells[0].textContent.trim(),
          cells[1].textContent.trim(),
        ];
        csvData.push(nameEmailData.join(","));
      });

      // Create a CSV string from the data array
      const csvString = csvData.join("\n");

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
      a.download = "subscriber_data.csv";
      a.style.display = "none";
      document.body.appendChild(a);

      // Trigger the download
      a.click();

      // Remove the temporary anchor element
      document.body.removeChild(a);
    }
