const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Make sure this file exists

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
console.log("✅ Firebase Admin initialized successfully!");

// Example API endpoint: Fetch all users from Firestore
app.get("/api/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

  
  // UI Updates based on auth state
  function updateUIBasedOnAuth(user) {
    if (user) {
      loginBtn.style.display = 'none';
      signupBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      
      // Update user profile in dashboard if dashboard is visible
      const userNameElement = document.querySelector('.user-name');
      const userEmailElement = document.querySelector('.user-email');
      
      if (userNameElement && userEmailElement) {
        userNameElement.textContent = user.displayName || 'User';
        userEmailElement.textContent = user.email;
      }
      
      // If a profile image exists, update it
      const profileImage = document.querySelector('.profile-image img');
      if (profileImage) {
        profileImage.src = user.photoURL || '/api/placeholder/60/60';
      }
    } else {
      loginBtn.style.display = 'inline-block';
      signupBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
    }
  }
  
  // Auth Modal
  function toggleAuthModal(action) {
    if (!authModal) {
      createAuthModal();
    }
    
    authModal.style.display = 'flex';
    
    // Set active tab based on action
    if (action === 'login') {
      setActiveTab('login');
    } else if (action === 'signup') {
      setActiveTab('signup');
    }
  }
  
  function createAuthModal() {
    // Create modal in the DOM if it doesn't exist
    const modalHTML = `
      <div id="auth-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Account Access</h2>
            <button class="close-modal">&times;</button>
          </div>
          
          <div class="auth-tabs">
            <button class="auth-tab" data-tab="login">Log In</button>
            <button class="auth-tab" data-tab="signup">Sign Up</button>
          </div>
          
          <div id="login-form" class="auth-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" id="login-email" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" id="login-password" required>
            </div>
            <div class="remember-me">
              <input type="checkbox" id="remember-me">
              <label for="remember-me">Remember me</label>
            </div>
            <div class="forgot-password">
              <a href="#" id="forgot-password">Forgot password?</a>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Log In</button>
          </div>
          
          <div id="signup-form" class="auth-form">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" id="signup-name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" id="signup-email" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" id="signup-password" required>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input type="password" class="form-control" id="signup-confirm-password" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Create Account</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Get the newly created elements
    authModal = document.getElementById('auth-modal');
    const closeModalBtn = authModal.querySelector('.close-modal');
    const authTabBtns = authModal.querySelectorAll('.auth-tab');
    const loginFormEl = document.getElementById('login-form');
    const signupFormEl = document.getElementById('signup-form');
    const forgotPasswordLink = document.getElementById('forgot-password');
    
    // Add event listeners
    closeModalBtn.addEventListener('click', () => {
      authModal.style.display = 'none';
    });
    
    authTabBtns.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        setActiveTab(tabName);
      });
    });
    
    loginFormEl.addEventListener('submit', handleLogin);
    signupFormEl.addEventListener('submit', handleSignup);
    
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.style.display = 'none';
      }
    });
  }
  
  function setActiveTab(tabName) {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    // Remove active class from all tabs and forms
    authTabs.forEach(tab => tab.classList.remove('active'));
    authForms.forEach(form => form.classList.remove('active'));
    
    // Add active class to selected tab and form
    const selectedTab = document.querySelector(`.auth-tab[data-tab="${tabName}"]`);
    const selectedForm = document.getElementById(`${tabName}-form`);
    
    if (selectedTab && selectedForm) {
      selectedTab.classList.add('active');
      selectedForm.classList.add('active');
    }
  }
  
  // Auth handlers
  async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    try {
      // Set persistence based on remember me option
      const persistence = rememberMe 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION;
      
      await auth.setPersistence(persistence);
      await auth.signInWithEmailAndPassword(email, password);
      
      // Close modal and show success message
      authModal.style.display = 'none';
      showToast('Success', 'You have successfully logged in!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showToast('Error', error.message, 'error');
    }
  }
  
  async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      showToast('Error', 'Passwords do not match!', 'error');
      return;
    }
    
    try {
      // Create user
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      // Update profile
      await userCredential.user.updateProfile({
        displayName: name
      });
      
      // Create user document in Firestore
      await db.collection('users').doc(userCredential.user.uid).set({
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        eventsRegistered: [],
        quizzesCompleted: []
      });
      
      // Close modal and show success message
      authModal.style.display = 'none';
      showToast('Success', 'Your account has been created successfully!', 'success');
    } catch (error) {
      console.error('Signup error:', error);
      showToast('Error', error.message, 'error');
    }
  }
  
  async function handleLogout() {
    try {
      await auth.signOut();
      showToast('Success', 'You have been logged out!', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error', error.message, 'error');
    }
  }
  
  async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    
    if (!email) {
      showToast('Error', 'Please enter your email address', 'error');
      return;
    }
    
    try {
      await auth.sendPasswordResetEmail(email);
      showToast('Success', 'Password reset email sent!', 'success');
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast('Error', error.message, 'error');
    }
  }
  
  // Event Management Functions
  async function fetchEvents() {
    try {
      const snapshot = await db.collection('events').orderBy('date').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Error', 'Failed to load events', 'error');
      return [];
    }
  }
  
  async function fetchFeaturedEvents() {
    try {
      const snapshot = await db.collection('events')
        .where('featured', '==', true)
        .orderBy('date')
        .limit(3)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching featured events:', error);
      showToast('Error', 'Failed to load featured events', 'error');
      return [];
    }
  }
  
  async function fetchUserEvents() {
    if (!currentUser) return [];
    
    try {
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();
      
      if (!userData || !userData.eventsRegistered || userData.eventsRegistered.length === 0) {
        return [];
      }
      
      // Get event details for all registered events
      const eventPromises = userData.eventsRegistered.map(eventId => 
        db.collection('events').doc(eventId).get()
      );
      
      const eventSnapshots = await Promise.all(eventPromises);
      
      return eventSnapshots.map(doc => {
        if (doc.exists) {
          return {
            id: doc.id,
            ...doc.data()
          };
        }
        return null;
      }).filter(event => event !== null);
    } catch (error) {
      console.error('Error fetching user events:', error);
      showToast('Error', 'Failed to load your registered events', 'error');
      return [];
    }
  }
  
  function formatDate(timestamp) {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  function createEventCard(event) {
    return `
      <div class="event-card">
        <div class="event-image">
          <img src="${event.imageUrl || '/api/placeholder/300/200'}" alt="${event.title}">
          <div class="event-date">${formatDate(event.date)}</div>
        </div>
        <div class="event-content">
          <h3 class="event-title">${event.title}</h3>
          <div class="event-details">
            <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
            <div><i class="fas fa-clock"></i> ${event.time}</div>
          </div>
          <div class="event-actions">
            <a href="#" class="btn btn-primary" onclick="showRegistration('${event.id}')">Register</a>
            <a href="#" class="btn btn-outline" onclick="showEventDetails('${event.id}')">Details</a>
          </div>
        </div>
      </div>
    `;
  }
  
  async function showEventList() {
    try {
      const events = await fetchEvents();
      
      if (events.length === 0) {
        mainContent.innerHTML = `
          <section class="container">
            <h2 class="section-title">All Events</h2>
            <p style="text-align: center;">No events found</p>
          </section>
        `;
        return;
      }
      
      const eventsHTML = events.map(event => createEventCard(event)).join('');
      
      mainContent.innerHTML = `
        <section class="container">
          <h2 class="section-title">All Events</h2>
          <div class="events-grid">
            ${eventsHTML}
          </div>
        </section>
      `;
    } catch (error) {
      console.error('Error showing event list:', error);
      showToast('Error', 'Failed to display events', 'error');
    }
  }
  
  async function showEventDetails(eventId) {
    try {
      const eventDoc = await db.collection('events').doc(eventId).get();
      
      if (!eventDoc.exists) {
        showToast('Error', 'Event not found', 'error');
        return;
      }
      
      const event = {
        id: eventDoc.id,
        ...eventDoc.data()
      };
      
      // Create modal for event details
      const modalHTML = `
        <div id="event-details-modal" class="modal">
          <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
              <h2 class="modal-title">${event.title}</h2>
              <button class="close-modal">&times;</button>
            </div>
            <div style="padding: 20px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${event.imageUrl || '/api/placeholder/700/350'}" alt="${event.title}" style="max-width: 100%; border-radius: 10px;">
              </div>
              
              <div style="display: flex; flex-wrap: wrap; margin-bottom: 20px;">
                <div style="flex: 1; min-width: 200px; margin-bottom: 15px;">
                  <p><i class="fas fa-calendar-alt" style="color: var(--primary-color); margin-right: 10px;"></i> <strong>Date:</strong> ${formatDate(event.date)}</p>
                  <p><i class="fas fa-clock" style="color: var(--primary-color); margin-right: 10px;"></i> <strong>Time:</strong> ${event.time}</p>
                  <p><i class="fas fa-map-marker-alt" style="color: var(--primary-color); margin-right: 10px;"></i> <strong>Location:</strong> ${event.location}</p>
                </div>
                <div style="flex: 1; min-width: 200px; margin-bottom: 15px;">
                  <p><i class="fas fa-user-friends" style="color: var(--primary-color); margin-right: 10px;"></i> <strong>Organizer:</strong> ${event.organizer}</p>
                  <p><i class="fas fa-ticket-alt" style="color: var(--primary-color); margin-right: 10px;"></i> <strong>Price:</strong> ${event.price ? '$' + event.price : 'Free'}</p>
                  <p><i class="fas fa-users" style="color: var(--primary-color); margin-right: 10px;"></i> <strong>Capacity:</strong> ${event.capacity || 'Unlimited'}</p>
                </div>
              </div>
              
              <h3 style="margin-bottom: 10px; color: var(--dark-color);">About This Event</h3>
              <div style="margin-bottom: 20px;">
                ${event.description || 'No description available'}
              </div>
              
              ${event.schedule ? `
              <h3 style="margin-bottom: 10px; color: var(--dark-color);">Schedule</h3>
              <div style="margin-bottom: 20px;">
                ${event.schedule}
              </div>
              ` : ''}
              
              <div style="text-align: center; margin-top: 20px;">
                <button class="btn btn-primary" onclick="showRegistration('${event.id}')">Register for This Event</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Get modal elements
      const modal = document.getElementById('event-details-modal');
      const closeBtn = modal.querySelector('.close-modal');
      
      // Show modal
      modal.style.display = 'flex';
      
      // Add event listeners
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Error showing event details:', error);
      showToast('Error', 'Failed to load event details', 'error');
    }
  }
  
  async function showRegistration(eventId) {
    // Check if user is logged in
    if (!currentUser) {
      showToast('Info', 'Please log in to register for events', 'info');
      toggleAuthModal('login');
      return;
    }
    
    try {
      // Get event details
      const eventDoc = await db.collection('events').doc(eventId).get();
      
      if (!eventDoc.exists) {
        showToast('Error', 'Event not found', 'error');
        return;
      }
      
      const event = {
        id: eventDoc.id,
        ...eventDoc.data()
      };
      
      // Check if user is already registered
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();
      
      if (userData.eventsRegistered && userData.eventsRegistered.includes(eventId)) {
        showToast('Info', 'You are already registered for this event', 'info');
        return;
      }
      
      // Create registration form modal
      const modalHTML = `
        <div id="registration-modal" class="modal">
          <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
              <h2 class="modal-title">Register for ${event.title}</h2>
              <button class="close-modal">&times;</button>
            </div>
            
            <form id="registration-form" class="event-registration">
              <div class="form-section">
                <h3 class="form-section-title">Personal Information</h3>
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-control" id="reg-name" value="${currentUser.displayName || ''}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" id="reg-email" value="${currentUser.email}" required readonly>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" id="reg-phone" required>
                </div>
              </div>
              
              <div class="form-section">
                <h3 class="form-section-title">Additional Information</h3>
                <div class="form-group">
                  <label class="form-label">How did you hear about this event?</label>
                  <select class="form-control" id="reg-source">
                    <option value="">Select an option</option>
                    <option value="social">Social Media</option>
                    <option value="email">Email</option>
                    <option value="friend">Friend or Colleague</option>
                    <option value="search">Search Engine</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Special Requirements or Comments</label>
                  <textarea class="form-control" id="reg-comments" rows="3"></textarea>
                </div>
              </div>
              
              <div class="form-group">
                <input type="checkbox" id="reg-terms" required>
                <label for="reg-terms">I agree to the terms and conditions</label>
              </div>
              
              <button type="submit" class="btn btn-primary" style="width: 100%;">Complete Registration</button>
            </form>
          </div>
        </div>
      `;
      
      // Add modal to DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Get modal elements
      const modal = document.getElementById('registration-modal');
      const closeBtn = modal.querySelector('.close-modal');
      const regForm = document.getElementById('registration-form');
      
      // Show modal
      modal.style.display = 'flex';
      
      // Add event listeners
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
      
      // Handle form submission
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const registrationData = {
          eventId: event.id,
          eventTitle: event.title,
          name: document.getElementById('reg-name').value,
          email: document.getElementById('reg-email').value,
          phone: document.getElementById('reg-phone').value,
          source: document.getElementById('reg-source').value,
          comments: document.getElementById('reg-comments').value,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        try {
          // Add registration to registrations collection
          const registrationRef = await db.collection('registrations').add(registrationData);
          
          // Update user document
          await db.collection('users').doc(currentUser.uid).update({
            eventsRegistered: firebase.firestore.FieldValue.arrayUnion(event.id)
          });
          
          // Update event registrations count
          await db.collection('events').doc(event.id).update({
            registrationsCount: firebase.firestore.FieldValue.increment(1)
          });
          
          // Add notification for user
          await db.collection('notifications').add({
            userId: currentUser.uid,
            title: 'Registration Confirmed',
            message: `You have successfully registered for ${event.title}`,
            type: 'registration',
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          // Close modal
          modal.remove();
          
          // Show success message
          showToast('Success', 'You have successfully registered for this event!', 'success');
        } catch (error) {
          console.error('Registration error:', error);
          showToast('Error', 'Registration failed: ' + error.message, 'error');
        }
      });
    } catch (error) {
      console.error('Error showing registration form:', error);
      showToast('Error', 'Failed to load registration form', 'error');
    }
  }
  
  // Dashboard Functions
  async function toggleDashboard() {
    if (!currentUser) {
      showToast('Info', 'Please log in to access your dashboard', 'info');
      toggleAuthModal('login');
      return;
    }
    
    try {
      // Fetch user data
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();
      
      // Fetch user's registered events
      const userEvents = await fetchUserEvents();
      
      // Create dashboard HTML
      mainContent.innerHTML = `
        <section class="container">
          <h2 class="section-title">Your Dashboard</h2>
          <div class="dashboard">
            <div class="dashboard-sidebar">
              <div class="user-profile">
                <div class="profile-image">
                  <img src="${currentUser.photoURL || '/api/placeholder/60/60'}" alt="Profile Picture">
                </div>
                <div>
                  <div class="user-name">${currentUser.displayName || 'User'}</div>
                  <div class="user-email">${currentUser.email}</div>
                </div>
              </div>
              
              <ul class="dashboard-menu">
                <li><a href="#" class="active" onclick="showDashboardPanel('overview')"><i class="fas fa-home"></i> Overview</a></li>
                <li><a href="#" onclick="showDashboardPanel('my-events')"><i class="fas fa-calendar-alt"></i> My Events</a></li>
                <li><a href="#" onclick="showDashboardPanel('my-quizzes')"><i class="fas fa-question-circle"></i> My Quizzes</a></li>
                <li><a href="#" onclick="showDashboardPanel('notifications')"><i class="fas fa-bell"></i> Notifications</a></li>
                <li><a href="#" onclick="showDashboardPanel('profile')"><i class="fas fa-user"></i> Profile Settings</a></li>
              </ul>
            </div>
            
            <div class="dashboard-content">
              <!-- Overview Panel (default) -->
              <div id="overview-panel" class="dashboard-panel active">
                <h3 style="margin-bottom: 1.5rem;">Dashboard Overview</h3>
                
                <div class="stats-grid">
                  <div class="stat-card events">
                    <div class="stat-value">${userEvents.length}</div>
                    <div class="stat-label">Events Registered</div>
                  </div>
                  <div class="stat-card quiz">
                    <div class="stat-value">${userData.quizzesCompleted ? userData.quizzesCompleted.length : 0}</div>
                    <div class="stat-label">Quizzes Completed</div>
                  </div>
                  <div class="stat-card completed">
                    <div class="stat-value">0</div>
                    <div class="stat-label">Achievements</div>
                  </div>
                  <div class="stat-card pending">
                    <div class="stat-value">0</div>
                    <div class="stat-label">Pending Actions</div>
                  </div>
                </div>
                
                <h4 style="margin: 1.5rem 0 1rem;">Upcoming Events</h4>
                ${userEvents.length > 0 ? `
                  <div class="events-grid">
                    ${userEvents.slice(0, 3).map(event => createEventCard(event)).join('')}
                  </div>
                ` : '<p>You have not registered for any events yet.</p>'}
                
                <div style="margin-top: 2rem;">
                  <h4 style="margin-bottom: 1rem;">Recent Notifications</h4>
                  <div class="notification-center">
                    <div class="notification unread">
                      <div class="notification-icon">
                        <i class="fas fa-bell"></i>
                      </div>
                      <div class="notification-content">
                        <div class="notification-title">Welcome to FestHub!</div>
                        <div class="notification-message">Thank you for joining our platform. Explore events and more!</div>
                        <div class="notification-time">Just now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Other panels will be created when needed -->
              <div id="my-events-panel" class="dashboard-panel">
                <!-- Content will be loaded dynamically -->
              </div>
              
              <div id="my-quizzes-panel" class="dashboard-panel">
                <!-- Content will be loaded dynamically -->
              </div>
              
              <div id="notifications-panel" class="dashboard-panel">
                <!-- Content will be loaded dynamically -->
              </div>
              
              <div id="profile-panel" class="dashboard-panel">
                <!-- Content will be loaded dynamically -->
              </div>
            </div>
          </div>
        </section>
      `;
      
      // Add event listeners for dashboard menu
      const dashboardMenuLinks = document.querySelectorAll('.dashboard-menu a');
      dashboardMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Remove active class from all menu links
          dashboardMenuLinks.forEach(item => item.classList.remove('active'));
          
          // Add active class to clicked link
          this.classList.add('active');
        });
      });
    } catch (error) {
        console.error('Error showing dashboard:', error);
        showToast('Error', 'Failed to load dashboard', 'error');
      }
    }
    
    // Dashboard Panel Functions
    function showDashboardPanel(panelId) {
      // Hide all panels
      const allPanels = document.querySelectorAll('.dashboard-panel');
      allPanels.forEach(panel => panel.classList.remove('active'));
      
      // Show selected panel
      const selectedPanel = document.getElementById(`${panelId}-panel`);
      if (selectedPanel) {
        selectedPanel.classList.add('active');
        
        // Load panel content if needed
        switch(panelId) {
          case 'my-events':
            loadMyEventsPanel();
            break;
          case 'my-quizzes':
            loadMyQuizzesPanel();
            break;
          case 'notifications':
            loadNotificationsPanel();
            break;
          case 'profile':
            loadProfilePanel();
            break;
          // No need for overview case as it's already loaded by default
        }
      }
    }
    
    async function loadMyEventsPanel() {
      const panelElement = document.getElementById('my-events-panel');
      
      try {
        const userEvents = await fetchUserEvents();
        
        if (userEvents.length === 0) {
          panelElement.innerHTML = `
            <h3>My Registered Events</h3>
            <p>You haven't registered for any events yet.</p>
            <a href="#" class="btn btn-primary" onclick="showEventList()">Browse Events</a>
          `;
          return;
        }
        
        // Sort events by date
        userEvents.sort((a, b) => {
          const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
          return dateA - dateB;
        });
        
        // Separate upcoming and past events
        const now = new Date();
        const upcomingEvents = userEvents.filter(event => {
          const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
          return eventDate >= now;
        });
        
        const pastEvents = userEvents.filter(event => {
          const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
          return eventDate < now;
        });
        
        // Create HTML for events
        panelElement.innerHTML = `
          <h3>My Registered Events</h3>
          
          <div class="events-tabs">
            <button class="events-tab active" data-tab="upcoming">Upcoming Events (${upcomingEvents.length})</button>
            <button class="events-tab" data-tab="past">Past Events (${pastEvents.length})</button>
          </div>
          
          <div id="upcoming-events" class="events-tab-content active">
            ${upcomingEvents.length > 0 ? `
              <div class="events-list">
                ${upcomingEvents.map(event => createEventListItem(event)).join('')}
              </div>
            ` : '<p>No upcoming events</p>'}
          </div>
          
          <div id="past-events" class="events-tab-content">
            ${pastEvents.length > 0 ? `
              <div class="events-list">
                ${pastEvents.map(event => createEventListItem(event)).join('')}
              </div>
            ` : '<p>No past events</p>'}
          </div>
        `;
        
        // Add event listeners for tabs
        const eventTabs = document.querySelectorAll('.events-tab');
        eventTabs.forEach(tab => {
          tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and content
            eventTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.events-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab and content
            this.classList.add('active');
            document.getElementById(`${tabName}-events`).classList.add('active');
          });
        });
      } catch (error) {
        console.error('Error loading my events panel:', error);
        panelElement.innerHTML = `
          <h3>My Registered Events</h3>
          <p class="error-message">Failed to load events. Please try again later.</p>
        `;
      }
    }
    
    function createEventListItem(event) {
      const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      return `
        <div class="event-list-item">
          <div class="event-list-image">
            <img src="${event.imageUrl || '/api/placeholder/120/80'}" alt="${event.title}">
          </div>
          <div class="event-list-content">
            <h4>${event.title}</h4>
            <div class="event-list-details">
              <div><i class="fas fa-calendar-alt"></i> ${formattedDate}</div>
              <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
            </div>
          </div>
          <div class="event-list-actions">
            <button class="btn btn-outline" onclick="showEventDetails('${event.id}')">
              <i class="fas fa-info-circle"></i> Details
            </button>
            ${eventDate >= new Date() ? `
              <button class="btn btn-danger" onclick="cancelRegistration('${event.id}')">
                <i class="fas fa-times-circle"></i> Cancel
              </button>
            ` : `
              <button class="btn btn-secondary" onclick="showQuizPanel('${event.id}')">
                <i class="fas fa-comment-alt"></i> Feedback
              </button>
            `}
          </div>
        </div>
      `;
    }
    
    async function cancelRegistration(eventId) {
      if (!currentUser) {
        showToast('Error', 'You must be logged in to cancel a registration', 'error');
        return;
      }
      
      // Confirm before cancellation
      if (!confirm('Are you sure you want to cancel your registration for this event?')) {
        return;
      }
      
      try {
        // Get event details for notification
        const eventDoc = await db.collection('events').doc(eventId).get();
        const event = eventDoc.data();
        
        // Update user document to remove event from registered events
        await db.collection('users').doc(currentUser.uid).update({
          eventsRegistered: firebase.firestore.FieldValue.arrayRemove(eventId)
        });
        
        // Update event registrations count
        await db.collection('events').doc(eventId).update({
          registrationsCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        // Find and update registration status
        const registrationsSnapshot = await db.collection('registrations')
          .where('eventId', '==', eventId)
          .where('email', '==', currentUser.email)
          .get();
        
        if (!registrationsSnapshot.empty) {
          registrationsSnapshot.forEach(async doc => {
            await db.collection('registrations').doc(doc.id).update({
              status: 'cancelled',
              cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          });
        }
        
        // Add notification
        await db.collection('notifications').add({
          userId: currentUser.uid,
          title: 'Registration Cancelled',
          message: `You have cancelled your registration for ${event.title}`,
          type: 'cancellation',
          read: false,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Success', 'Your registration has been cancelled', 'success');
        
        // Reload events panel
        loadMyEventsPanel();
      } catch (error) {
        console.error('Error cancelling registration:', error);
        showToast('Error', 'Failed to cancel registration: ' + error.message, 'error');
      }
    }
    
    async function loadMyQuizzesPanel() {
      const panelElement = document.getElementById('my-quizzes-panel');
      
      try {
        // Get user data
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (!userData.quizzesCompleted || userData.quizzesCompleted.length === 0) {
          panelElement.innerHTML = `
            <h3>My Quizzes & Feedback</h3>
            <p>You haven't completed any quizzes or feedback forms yet.</p>
            <p>After attending events, you'll be able to provide feedback and earn points!</p>
          `;
          return;
        }
        
        // Fetch quiz details
        const quizPromises = userData.quizzesCompleted.map(quizId => 
          db.collection('quizzes').doc(quizId).get()
        );
        
        const quizSnapshots = await Promise.all(quizPromises);
        
        const quizzes = quizSnapshots.map(doc => {
          if (doc.exists) {
            return {
              id: doc.id,
              ...doc.data()
            };
          }
          return null;
        }).filter(quiz => quiz !== null);
        
        // Create HTML for quizzes
        panelElement.innerHTML = `
          <h3>My Quizzes & Feedback</h3>
          
          <div class="quiz-list">
            ${quizzes.map(quiz => `
              <div class="quiz-card">
                <div class="quiz-header">
                  <h4>${quiz.title}</h4>
                  <div class="quiz-badge ${quiz.score >= 70 ? 'success' : 'warning'}">${quiz.score}%</div>
                </div>
                <div class="quiz-details">
                  <p><strong>Event:</strong> ${quiz.eventTitle}</p>
                  <p><strong>Completed:</strong> ${formatDate(quiz.completedAt)}</p>
                  <p><strong>Questions:</strong> ${quiz.totalQuestions}</p>
                </div>
                <div class="quiz-actions">
                  <button class="btn btn-outline" onclick="viewQuizResults('${quiz.id}')">
                    <i class="fas fa-eye"></i> View Results
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } catch (error) {
        console.error('Error loading my quizzes panel:', error);
        panelElement.innerHTML = `
          <h3>My Quizzes & Feedback</h3>
          <p class="error-message">Failed to load quizzes. Please try again later.</p>
        `;
      }
    }
    
    async function loadNotificationsPanel() {
      const panelElement = document.getElementById('notifications-panel');
      
      try {
        // Fetch user notifications
        const notificationsSnapshot = await db.collection('notifications')
          .where('userId', '==', currentUser.uid)
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get();
        
        const notifications = notificationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (notifications.length === 0) {
          panelElement.innerHTML = `
            <h3>Notifications</h3>
            <p>You don't have any notifications yet.</p>
          `;
          return;
        }
        
        // Create HTML for notifications
        panelElement.innerHTML = `
          <h3>Notifications</h3>
          <div class="action-bar">
            <button class="btn btn-sm btn-outline" onclick="markAllNotificationsAsRead()">
              <i class="fas fa-check-double"></i> Mark All as Read
            </button>
            <button class="btn btn-sm btn-outline" onclick="clearAllNotifications()">
              <i class="fas fa-trash"></i> Clear All
            </button>
          </div>
          
          <div class="notification-center">
            ${notifications.map(notification => `
              <div class="notification ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon">
                  ${getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                  <div class="notification-title">${notification.title}</div>
                  <div class="notification-message">${notification.message}</div>
                  <div class="notification-time">${formatNotificationTime(notification.timestamp)}</div>
                </div>
                <div class="notification-actions">
                  ${notification.read ? '' : `
                    <button class="btn btn-icon" onclick="markNotificationAsRead('${notification.id}')">
                      <i class="fas fa-check"></i>
                    </button>
                  `}
                  <button class="btn btn-icon" onclick="deleteNotification('${notification.id}')">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        
        // Add event listeners
        document.querySelectorAll('.notification').forEach(notif => {
          notif.addEventListener('click', function(e) {
            if (!e.target.closest('.notification-actions')) {
              const notifId = this.getAttribute('data-id');
              markNotificationAsRead(notifId);
            }
          });
        });
      } catch (error) {
        console.error('Error loading notifications panel:', error);
        panelElement.innerHTML = `
          <h3>Notifications</h3>
          <p class="error-message">Failed to load notifications. Please try again later.</p>
        `;
      }
    }
    
    function getNotificationIcon(type) {
      switch (type) {
        case 'registration':
          return '<i class="fas fa-ticket-alt"></i>';
        case 'cancellation':
          return '<i class="fas fa-calendar-times"></i>';
        case 'reminder':
          return '<i class="fas fa-clock"></i>';
        case 'update':
          return '<i class="fas fa-sync-alt"></i>';
        default:
          return '<i class="fas fa-bell"></i>';
      }
    }
    
    function formatNotificationTime(timestamp) {
      if (!timestamp) return 'Just now';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    async function markNotificationAsRead(notificationId) {
      try {
        await db.collection('notifications').doc(notificationId).update({
          read: true
        });
        
        // Update UI
        const notification = document.querySelector(`.notification[data-id="${notificationId}"]`);
        if (notification) {
          notification.classList.remove('unread');
          const markReadBtn = notification.querySelector('.notification-actions button:first-child');
          if (markReadBtn) {
            markReadBtn.remove();
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
        showToast('Error', 'Failed to update notification', 'error');
      }
    }
    
    async function markAllNotificationsAsRead() {
      try {
        const batch = db.batch();
        
        // Get all unread notifications
        const unreadNotificationsSnapshot = await db.collection('notifications')
          .where('userId', '==', currentUser.uid)
          .where('read', '==', false)
          .get();
        
        // Update each notification in batch
        unreadNotificationsSnapshot.forEach(doc => {
          batch.update(doc.ref, { read: true });
        });
        
        // Commit batch
        await batch.commit();
        
        // Update UI
        document.querySelectorAll('.notification.unread').forEach(notification => {
          notification.classList.remove('unread');
          const markReadBtn = notification.querySelector('.notification-actions button:first-child');
          if (markReadBtn) {
            markReadBtn.remove();
          }
        });
        
        showToast('Success', 'All notifications marked as read', 'success');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showToast('Error', 'Failed to update notifications', 'error');
      }
    }
    
    async function deleteNotification(notificationId) {
      try {
        await db.collection('notifications').doc(notificationId).delete();
        
        // Remove from UI
        const notification = document.querySelector(`.notification[data-id="${notificationId}"]`);
        if (notification) {
          notification.remove();
        }
        
        // Check if no notifications left
        const notificationsPanel = document.getElementById('notifications-panel');
        if (notificationsPanel && !notificationsPanel.querySelector('.notification')) {
          notificationsPanel.innerHTML = `
            <h3>Notifications</h3>
            <p>You don't have any notifications.</p>
          `;
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        showToast('Error', 'Failed to delete notification', 'error');
      }
    }
    
    async function clearAllNotifications() {
      // Confirm before clearing
      if (!confirm('Are you sure you want to delete all notifications?')) {
        return;
      }
      
      try {
        const batch = db.batch();
        
        // Get all user notifications
        const notificationsSnapshot = await db.collection('notifications')
          .where('userId', '==', currentUser.uid)
          .get();
        
        // Add delete operations to batch
        notificationsSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Commit batch
        await batch.commit();
        
        // Update UI
        const notificationsPanel = document.getElementById('notifications-panel');
        if (notificationsPanel) {
          notificationsPanel.innerHTML = `
            <h3>Notifications</h3>
            <p>You don't have any notifications.</p>
          `;
        }
        
        showToast('Success', 'All notifications cleared', 'success');
      } catch (error) {
        console.error('Error clearing notifications:', error);
        showToast('Error', 'Failed to clear notifications', 'error');
      }
    }
    
    async function loadProfilePanel() {
      const panelElement = document.getElementById('profile-panel');
      
      try {
        // Get user data
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data() || {};
        
        panelElement.innerHTML = `
          <h3>Profile Settings</h3>
          
          <div class="profile-content">
            <div class="profile-image-container">
              <div class="profile-image large">
                <img src="${currentUser.photoURL || '/api/placeholder/120/120'}" alt="Profile Picture">
              </div>
              <button class="btn btn-sm btn-outline" id="change-photo-btn">
                <i class="fas fa-camera"></i> Change Photo
              </button>
              <input type="file" id="photo-upload" accept="image/*" style="display: none;">
            </div>
            
            <form id="profile-form" class="form-container">
              <div class="form-section">
                <h4 class="form-section-title">Personal Information</h4>
                
                <div class="form-group">
                  <label class="form-label">Display Name</label>
                  <input type="text" class="form-control" id="profile-name" value="${currentUser.displayName || ''}" required>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" class="form-control" value="${currentUser.email}" readonly>
                  <small class="form-helper">To change your email, please contact support</small>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" id="profile-phone" value="${userData.phone || ''}">
                </div>
              </div>
              
              <div class="form-section">
                <h4 class="form-section-title">Preferences</h4>
                
                <div class="form-group">
                  <label class="form-label">Bio</label>
                  <textarea class="form-control" id="profile-bio" rows="3">${userData.bio || ''}</textarea>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Interests</label>
                  <div class="interest-tags" id="interest-tags">
                    ${(userData.interests || []).map(interest => `
                      <div class="interest-tag">
                        ${interest}
                        <button type="button" class="remove-interest" data-interest="${interest}">&times;</button>
                      </div>
                    `).join('')}
                    <input type="text" id="new-interest" placeholder="Add interest...">
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" id="profile-notifications" ${userData.notificationsEnabled !== false ? 'checked' : ''}>
                    Receive email notifications about events
                  </label>
                </div>
              </div>
              
              <div class="form-section">
                <h4 class="form-section-title">Account Security</h4>
                
                <button type="button" class="btn btn-outline" id="change-password-btn">
                  <i class="fas fa-lock"></i> Change Password
                </button>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        `;
        
        // Add event listeners
        const changePhotoBtn = document.getElementById('change-photo-btn');
        const photoUpload = document.getElementById('photo-upload');
        const profileForm = document.getElementById('profile-form');
        const changePasswordBtn = document.getElementById('change-password-btn');
        const newInterestInput = document.getElementById('new-interest');
        
        changePhotoBtn.addEventListener('click', () => {
          photoUpload.click();
        });
        
        photoUpload.addEventListener('change', handleProfilePhotoUpload);
        
        profileForm.addEventListener('submit', handleProfileUpdate);
        
        changePasswordBtn.addEventListener('click', showChangePasswordForm);
        
        // Interests management
        newInterestInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            
            const interest = newInterestInput.value.trim();
            if (interest) {
              addInterestTag(interest);
              newInterestInput.value = '';
            }
          }
        });
        
        // Add remove interest event listeners
        document.querySelectorAll('.remove-interest').forEach(btn => {
          btn.addEventListener('click', function() {
            const interest = this.getAttribute('data-interest');
            this.closest('.interest-tag').remove();
          });
        });
      } catch (error) {
        console.error('Error loading profile panel:', error);
        panelElement.innerHTML = `
          <h3>Profile Settings</h3>
          <p class="error-message">Failed to load profile. Please try again later.</p>
        `;
      }
    }
    
    function addInterestTag(interest) {
      const interestTags = document.getElementById('interest-tags');
      const tagHTML = `
        <div class="interest-tag">
          ${interest}
          <button type="button" class="remove-interest" data-interest="${interest}">&times;</button>
        </div>
      `;
      
      // Insert before the input
      const newInterestInput = document.getElementById('new-interest');
      interestTags.insertAdjacentHTML('beforeend', tagHTML);
      
      // Add event listener to the new remove button
      const newRemoveBtn = interestTags.querySelector(`.remove-interest[data-interest="${interest}"]`);
      newRemoveBtn.addEventListener('click', function() {
        this.closest('.interest-tag').remove();
      });
    }
    
    async function handleProfilePhotoUpload(e) {
      if (!e.target.files || !e.target.files[0]) return;
      
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        showToast('Error', 'Please select an image file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Error', 'Image size should be less than 5MB', 'error');
        return;
      }
      
      try {
        showToast('Info', 'Uploading image...', 'info');
        
        // Create storage reference
        const storageRef = storage.ref(`profile_images/${currentUser.uid}/${Date.now()}_${file.name}`);
        
        // Upload file
        const uploadTask = storageRef.put(file);
        
        // Monitor upload
        uploadTask.on('state_changed', 
          // Progress function
          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          // Error function
          error => {
            console.error('Upload error:', error);
            showToast('Error', 'Failed to upload image', 'error');
          },
          // Complete function
          async () => {
            // Get download URL
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            
            // Update user profile
            await currentUser.updateProfile({
              photoURL: downloadURL
            });
            
            // Update profile image in UI
            const profileImages = document.querySelectorAll('.profile-image img');
            profileImages.forEach(img => {
              img.src = downloadURL;
            });
            
            showToast('Success', 'Profile photo updated', 'success');
          }
        );
      } catch (error) {
        console.error('Profile photo upload error:', error);
        showToast('Error', 'Failed to update profile photo', 'error');
      }
    }
    
    async function handleProfileUpdate(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('profile-name');
      const phoneInput = document.getElementById('profile-phone');
      const bioInput = document.getElementById('profile-bio');
      const notificationsCheckbox = document.getElementById('profile-notifications');
      
      // Get interests
      const interestElements = document.querySelectorAll('.interest-tag');
      const interests = Array.from(interestElements).map(el => 
        el.textContent.trim()
      );
      
      try {
        showToast('Info', 'Saving profile...', 'info');
        
        // Update user profile
        await currentUser.updateProfile({
          displayName: nameInput.value
        });
        
        // Update user document in Firestore
        await db.collection('users').doc(currentUser.uid).update({
          name: nameInput.value,
          phone: phoneInput.value,
          bio: bioInput.value,
          interests: interests,
          notificationsEnabled: notificationsCheckbox.checked,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user name in UI
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
          el.textContent = nameInput.value || 'User';
        });
        
        showToast('Success', 'Profile updated successfully', 'success');
      } catch (error) {
        console.error('Profile update error:', error);
        showToast('Error', 'Failed to update profile: ' + error.message, 'error');
      }
    }
    
    function showChangePasswordForm() {
      // Create change password modal
      const modalHTML = `
        <div id="change-password-modal" class="modal">
          <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
              <h2 class="modal-title">Change Password</h2>
              <button class="close-modal">&times;</button>
            </div>
            
            <form id="change-password-form" class="form-container">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" class="form-control" id="current-password" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" class="form-control" id="new-password" required>
                <small class="form-helper">Password must be at least 6 characters</small>
              </div>
              
              <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input type="password" class="form-control" id="confirm-password" required>
              </div>
              
              <button type="submit" class="btn btn-primary" style="width: 100%;">Update Password</button>
            </form>
          </div>
        </div>
      `;
      
      // Add modal to DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Get modal elements
      const modal = document.getElementById('change-password-modal');
      const closeBtn = modal.querySelector('.close-modal');
      const form = document.getElementById('change-password-form');
      
      // Show modal
      modal.style.display = 'flex';
      
      // Add event listeners
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
      
      // Handle form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate passwords match
    if (newPassword !== confirmPassword) {
        showToast('Error', 'New passwords do not match', 'error');
        return;
      }
      
      // Validate password length
      if (newPassword.length < 6) {
        showToast('Error', 'Password must be at least 6 characters long', 'error');
        return;
      }
      
      try {
        // Get email credential
        const credential = firebase.auth.EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        
        // Re-authenticate user
        await currentUser.reauthenticateWithCredential(credential);
        
        // Update password
        await currentUser.updatePassword(newPassword);
        
        // Close modal
        modal.remove();
        
        showToast('Success', 'Password updated successfully', 'success');
      } catch (error) {
        console.error('Password change error:', error);
        
        // Show appropriate error message
        if (error.code === 'auth/wrong-password') {
          showToast('Error', 'Current password is incorrect', 'error');
        } else {
          showToast('Error', 'Failed to update password: ' + error.message, 'error');
        }
      }
    });
  }
  
  // Function to view quiz results
  async function viewQuizResults(quizId) {
    try {
      // Get quiz data
      const quizDoc = await db.collection('quizzes').doc(quizId).get();
      
      if (!quizDoc.exists) {
        showToast('Error', 'Quiz not found', 'error');
        return;
      }
      
      const quiz = quizDoc.data();
      
      // Create modal for quiz results
      const modalHTML = `
        <div id="quiz-results-modal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title">${quiz.title} Results</h2>
              <button class="close-modal">&times;</button>
            </div>
            
            <div class="modal-body">
              <div class="quiz-score-summary">
                <div class="quiz-score-circle ${quiz.score >= 70 ? 'success' : 'warning'}">
                  ${quiz.score}%
                </div>
                <div class="quiz-score-details">
                  <p><strong>Event:</strong> ${quiz.eventTitle}</p>
                  <p><strong>Completed:</strong> ${formatDate(quiz.completedAt)}</p>
                  <p><strong>Correct Answers:</strong> ${quiz.correctAnswers} out of ${quiz.totalQuestions}</p>
                  <p><strong>Points Earned:</strong> ${quiz.pointsEarned || 0}</p>
                </div>
              </div>
              
              <div class="quiz-answers">
                <h3>Your Answers</h3>
                
                ${quiz.questions.map((question, index) => `
                  <div class="quiz-answer-item ${question.userAnswer === question.correctAnswer ? 'correct' : 'incorrect'}">
                    <div class="quiz-question-number">${index + 1}</div>
                    <div class="quiz-question-content">
                      <p class="quiz-question-text">${question.text}</p>
                      <p class="quiz-answer-text">
                        <strong>Your answer:</strong> ${question.userAnswer}
                        ${question.userAnswer !== question.correctAnswer ? 
                          `<br><strong>Correct answer:</strong> ${question.correctAnswer}` : ''}
                      </p>
                      ${question.explanation ? `<p class="quiz-answer-explanation">${question.explanation}</p>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
              
              ${quiz.feedback ? `
                <div class="quiz-feedback">
                  <h3>Your Feedback</h3>
                  <div class="feedback-rating">
                    ${Array(5).fill().map((_, i) => `
                      <i class="fas fa-star ${i < quiz.feedback.rating ? 'filled' : ''}"></i>
                    `).join('')}
                    <span>${quiz.feedback.rating}/5</span>
                  </div>
                  <p class="feedback-text">${quiz.feedback.comments || 'No comments provided.'}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
      
      // Add modal to DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Get modal elements
      const modal = document.getElementById('quiz-results-modal');
      const closeBtn = modal.querySelector('.close-modal');
      
      // Show modal
      modal.style.display = 'flex';
      
      // Add event listeners
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Error loading quiz results:', error);
      showToast('Error', 'Failed to load quiz results', 'error');
    }
  }
  
  // Function to show quiz/feedback panel for an event
  async function showQuizPanel(eventId) {
    try {
      // Get event details
      const eventDoc = await db.collection('events').doc(eventId).get();
      
      if (!eventDoc.exists) {
        showToast('Error', 'Event not found', 'error');
        return;
      }
      
      const event = {
        id: eventDoc.id,
        ...eventDoc.data()
      };
      
      // Check if quiz exists for this event
      const quizSnapshot = await db.collection('quizzes')
        .where('eventId', '==', eventId)
        .where('userId', '==', currentUser.uid)
        .get();
      
      // If user already completed quiz, show results
      if (!quizSnapshot.empty) {
        viewQuizResults(quizSnapshot.docs[0].id);
        return;
      }
      
      // Get quiz template for this event
      const quizTemplateSnapshot = await db.collection('quizTemplates')
        .where('eventId', '==', eventId)
        .limit(1)
        .get();
      
      if (quizTemplateSnapshot.empty) {
        showToast('Error', 'No feedback form available for this event', 'error');
        return;
      }
      
      const quizTemplate = {
        id: quizTemplateSnapshot.docs[0].id,
        ...quizTemplateSnapshot.docs[0].data()
      };
      
      // Create modal for quiz/feedback
      const modalHTML = `
        <div id="event-quiz-modal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title">${quizTemplate.title}</h2>
              <button class="close-modal">&times;</button>
            </div>
            
            <form id="event-quiz-form" class="form-container">
              <div class="quiz-intro">
                <p>${quizTemplate.description || `Please answer a few questions about the "${event.title}" event you attended.`}</p>
              </div>
              
              <div id="quiz-questions">
                ${quizTemplate.questions.map((question, index) => `
                  <div class="quiz-question" data-question-id="${index}">
                    <h3 class="question-text">${question.text}</h3>
                    
                    ${question.type === 'multiple-choice' ? `
                      <div class="question-options">
                        ${question.options.map(option => `
                          <label class="option-label">
                            <input type="radio" name="question-${index}" value="${option}" required>
                            <span class="option-text">${option}</span>
                          </label>
                        `).join('')}
                      </div>
                    ` : question.type === 'rating' ? `
                      <div class="rating-stars" data-question="${index}">
                        ${Array(5).fill().map((_, i) => `
                          <i class="far fa-star" data-rating="${i+1}"></i>
                        `).join('')}
                        <input type="hidden" name="question-${index}" required>
                      </div>
                    ` : `
                      <textarea name="question-${index}" class="form-control" 
                        rows="3" placeholder="Your answer..." required></textarea>
                    `}
                  </div>
                `).join('')}
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      `;
      
      // Add modal to DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Get modal elements
      const modal = document.getElementById('event-quiz-modal');
      const closeBtn = modal.querySelector('.close-modal');
      const form = document.getElementById('event-quiz-form');
      
      // Initialize star ratings
      const ratingElements = document.querySelectorAll('.rating-stars');
      ratingElements.forEach(ratingEl => {
        const stars = ratingEl.querySelectorAll('.fa-star');
        const questionIndex = ratingEl.getAttribute('data-question');
        const hiddenInput = ratingEl.querySelector(`input[name="question-${questionIndex}"]`);
        
        stars.forEach(star => {
          star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            
            // Clear all stars
            stars.forEach(s => s.className = 'far fa-star');
            
            // Fill stars up to selected rating
            for (let i = 0; i < rating; i++) {
              stars[i].className = 'fas fa-star';
            }
            
            // Set hidden input value
            hiddenInput.value = rating;
          });
        });
      });
      
      // Show modal
      modal.style.display = 'flex';
      
      // Add event listeners
      closeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to close? Your answers will not be saved.')) {
          modal.remove();
        }
      });
      
      // Handle form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Collect answers
        const answers = [];
        
        quizTemplate.questions.forEach((question, index) => {
          const answerEl = form.elements[`question-${index}`];
          let answer = '';
          
          if (question.type === 'multiple-choice') {
            const selectedOption = form.querySelector(`input[name="question-${index}"]:checked`);
            answer = selectedOption ? selectedOption.value : '';
          } else {
            answer = answerEl.value;
          }
          
          answers.push({
            questionId: index,
            questionText: question.text,
            questionType: question.type,
            answer: answer
          });
        });
        
        try {
          // Calculate score if it's a quiz
          let score = 0;
          let correctAnswers = 0;
          
          if (quizTemplate.isQuiz) {
            quizTemplate.questions.forEach((question, index) => {
              if (question.type === 'multiple-choice' && question.correctAnswer) {
                const userAnswer = answers[index].answer;
                if (userAnswer === question.correctAnswer) {
                  correctAnswers++;
                }
              }
            });
            
            score = Math.round((correctAnswers / quizTemplate.questions.length) * 100);
          }
          
          // Points awarded
          const pointsEarned = quizTemplate.isQuiz ? 
            Math.max(10, Math.floor((score / 100) * 50)) : 20;
          
          // Create quiz/feedback record
          const quizData = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName,
            eventId: eventId,
            eventTitle: event.title,
            templateId: quizTemplate.id,
            title: quizTemplate.title,
            isQuiz: quizTemplate.isQuiz,
            answers: answers,
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: quizTemplate.questions.length,
            pointsEarned: pointsEarned,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          
          // Save to Firebase
          const quizRef = await db.collection('quizzes').add(quizData);
          
          // Update user points
          await db.collection('users').doc(currentUser.uid).update({
            quizzesCompleted: firebase.firestore.FieldValue.arrayUnion(quizRef.id),
            points: firebase.firestore.FieldValue.increment(pointsEarned)
          });
          
          // Create notification
          await db.collection('notifications').add({
            userId: currentUser.uid,
            title: quizTemplate.isQuiz ? 'Quiz Completed' : 'Feedback Submitted',
            message: quizTemplate.isQuiz ? 
              `You scored ${score}% on the "${quizTemplate.title}" quiz and earned ${pointsEarned} points!` :
              `Thank you for your feedback on the "${event.title}" event! You earned ${pointsEarned} points.`,
            type: 'update',
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          // Close modal
          modal.remove();
          
          // Show success message
          showToast('Success', quizTemplate.isQuiz ? 
            `Quiz completed successfully! You scored ${score}%` : 
            'Feedback submitted successfully!', 'success');
          
          // Reload quiz panel
          setTimeout(() => {
            loadMyQuizzesPanel();
          }, 1000);
        } catch (error) {
          console.error('Error submitting quiz/feedback:', error);
          showToast('Error', 'Failed to submit: ' + error.message, 'error');
        }
      });
    } catch (error) {
      console.error('Error showing quiz panel:', error);
      showToast('Error', 'Failed to load feedback form', 'error');
    }
  }
  
  // Helper function to format dates
  function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Function to show event list
  function showEventList() {
    // Hide dashboard
    document.getElementById('dashboard-container').style.display = 'none';
    
    // Show events section
    const eventsSection = document.getElementById('events-section');
    eventsSection.style.display = 'block';
    
    // Load events
    loadEvents();
  }
  
  // Initialize dashboard on load
  document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        currentUser = user;
        initDashboard();
      } else {
        window.location.href = 'login.html';
      }
    });
  });