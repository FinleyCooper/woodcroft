import './styles.css';

class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();


    this.init();
  }

  async getBookedDates() {
        try {
            const response = await fetch('/api/booked-dates');
            const data = await response.json();
            return data.booked_dates;
        } catch (error) {
            console.error('Error fetching booked dates:', error);
            return [];
        }
    }
  
  init() {
    this.getBookedDates()
    .then(dates  => {
        this.bookedDates = dates;
    })
    .catch(error => {
        console.error('Error fetching booked dates:', error);
        this.bookedDates = [];
    })
    .finally(() => {
        this.renderCalendar();
        this.bindEvents();
    });

  }
  
  bindEvents() {
    document.getElementById('prevMonth')?.addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.renderCalendar();
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.renderCalendar();
    });
  }
  
  renderCalendar() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthHeader = document.getElementById('currentMonth');
    if (monthHeader) {
      monthHeader.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    }
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';
    
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayElement = this.createDayElement(daysInPrevMonth - i, true);
      calendarDays.appendChild(dayElement);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = this.createDayElement(day, false);
      calendarDays.appendChild(dayElement);
    }
    
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      const dayElement = this.createDayElement(day, true);
      calendarDays.appendChild(dayElement);
    }
  }
  
  createDayElement(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
      dayElement.classList.add('other-month');
    } else {
      const dateString = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      if (this.bookedDates.includes(dateString)) {
        dayElement.classList.add('booked');
      } else {
        dayElement.classList.add('available');
      }
    }
    
    return dayElement;
  }
}

function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('.main-nav a[data-section]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      
      if (section) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const offsetTop = section.offsetTop - headerHeight;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initFormHandling() {
  const enquiryForm = document.getElementById('enquiryForm');
  
  enquiryForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(enquiryForm);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Form submitted:', data);
    
    fetch("/api/enquiry", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(_result => {
        alert('Thank you for your enquiry! We will get back to you soon.');
        enquiryForm.reset();
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your enquiry. Please try again later.');
    });
    
  });
}

function initPhotoGallery() {
  const photoItems = document.querySelectorAll('.photo-item');
  
  photoItems.forEach(item => {
    const img = item.querySelector('img');
    const overlay = item.querySelector('.photo-overlay');
    
    if (img && overlay) {
      item.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.1)';
      });
      
      item.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  new Calendar();
  initSmoothScrolling();
  initFormHandling();
  initPhotoGallery();
  
  const today = new Date().toISOString().split('T')[0];
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  
  if (checkinInput) checkinInput.setAttribute('min', today);
  if (checkoutInput) checkoutInput.setAttribute('min', today);
  
  checkinInput?.addEventListener('change', (e) => {
    const checkinDate = new Date(e.target.value);
    checkinDate.setDate(checkinDate.getDate() + 1);
    const minCheckout = checkinDate.toISOString().split('T')[0];
    checkoutInput?.setAttribute('min', minCheckout);
  });
  
  // Initialize admin portal
  window.adminPortal = new AdminPortal();
  
  // Admin form date handling
  const bookingArrival = document.getElementById('booking-arrival');
  const bookingDeparture = document.getElementById('booking-departure');
  
  if (bookingArrival) bookingArrival.setAttribute('min', today);
  if (bookingDeparture) bookingDeparture.setAttribute('min', today);
  
  bookingArrival?.addEventListener('change', (e) => {
    const arrivalDate = new Date(e.target.value);
    arrivalDate.setDate(arrivalDate.getDate() + 1);
    const minDeparture = arrivalDate.toISOString().split('T')[0];
    bookingDeparture?.setAttribute('min', minDeparture);
  });
});

// Admin Portal functionality
class AdminPortal {
  constructor() {
    this.authToken = null;
    this.init();
  }
  
  init() {
    this.bindEvents();
  }
  
  bindEvents() {
    // Admin link click
    const adminLinks = document.querySelectorAll('.admin-link');
    adminLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAdminPortal();
      });
    });
    
    // Back to site button
    document.getElementById('backToSite')?.addEventListener('click', () => {
      this.hideAdminPortal();
    });
    
    // PIN form submission
    document.getElementById('pin-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.authenticatePin();
    });
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });
    
    // Refresh bookings
    document.getElementById('refresh-bookings')?.addEventListener('click', () => {
      this.loadBookings();
    });
    
    // Create booking form
    document.getElementById('create-booking-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createBooking();
    });
  }
  
  showAdminPortal() {
    const portal = document.getElementById('admin-portal');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    
    portal.classList.remove('hidden');
    main.style.display = 'none';
    footer.style.display = 'none';
    
    // Reset to PIN entry state
    this.showPinEntry();
  }
  
  hideAdminPortal() {
    const portal = document.getElementById('admin-portal');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    
    portal.classList.add('hidden');
    main.style.display = 'block';
    footer.style.display = 'block';
    
    // Reset auth state
    this.authToken = null;
    this.showPinEntry();
  }
  
  showPinEntry() {
    document.getElementById('pin-entry').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-pin').value = '';
    this.hideError();
  }
  
  showDashboard() {
    document.getElementById('pin-entry').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    this.loadBookings();
  }
  
  async authenticatePin() {
    const pin = document.getElementById('admin-pin').value.trim();
    
    if (!pin) {
      this.showError('Please enter a PIN');
      return;
    }
    
    try {
      // Test the PIN by making a request to a protected endpoint
      const response = await fetch("/api/all-bookings", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auth_token: pin })
      });
      
      if (response.ok) {
        this.authToken = pin;
        this.showDashboard();
        this.hideError();
      } else {
        this.showError('Invalid PIN. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      this.showError('Connection error. Please try again.');
    }
  }
  
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data if needed
    if (tabName === 'bookings') {
      this.loadBookings();
    }
  }
  
  async loadBookings() {
    const bookingsList = document.getElementById('bookings-list');
    bookingsList.innerHTML = '<div class="loading">Loading bookings...</div>';
    
    try {
      const response = await fetch("/api/all-bookings", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auth_token: this.authToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.renderBookings(data.bookings);
      } else {
        bookingsList.innerHTML = '<div class="error-message">Failed to load bookings</div>';
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      bookingsList.innerHTML = '<div class="error-message">Connection error</div>';
    }
  }
  
  renderBookings(bookings) {
    const bookingsList = document.getElementById('bookings-list');
    
    if (!bookings || bookings.length === 0) {
      bookingsList.innerHTML = '<div class="loading">No bookings found</div>';
      return;
    }
    
    const bookingsHtml = bookings.map(booking => `
      <div class="booking-card">
        <div class="booking-header">
          <div class="booking-info">
            <h3>${this.escapeHtml(booking.name)}</h3>
            <div class="booking-dates">
              ${this.formatDate(booking.arrival_date)} - ${this.formatDate(booking.departure_date)}
            </div>
          </div>
          <div class="booking-actions">
            <button class="btn-danger" onclick="adminPortal.deleteBooking(${booking.id})">
              Delete
            </button>
          </div>
        </div>
        <div class="booking-details">
          <div class="detail-item">
            <span class="detail-label">Phone</span>
            <span class="detail-value">${this.escapeHtml(booking.phone)}</span>
          </div>
          ${booking.email ? `
          <div class="detail-item">
            <span class="detail-label">Email</span>
            <span class="detail-value">${this.escapeHtml(booking.email)}</span>
          </div>
          ` : ''}
          ${booking.notes ? `
          <div class="detail-item">
            <span class="detail-label">Notes</span>
            <span class="detail-value">${this.escapeHtml(booking.notes)}</span>
          </div>
          ` : ''}
          <div class="detail-item">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value">#${booking.id}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    bookingsList.innerHTML = bookingsHtml;
  }
  
  async deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/remove-booking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auth_token: this.authToken })
      });
      
      if (response.ok) {
        this.loadBookings(); // Refresh the list
        this.showSuccess('Booking deleted successfully');
      } else {
        this.showError('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      this.showError('Connection error');
    }
  }
  
  async createBooking() {
    const form = document.getElementById('create-booking-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!data.name || !data.phone || !data.arrival_date || !data.departure_date) {
      this.showError('Please fill in all required fields');
      return;
    }
    
    // Validate dates
    const arrivalDate = new Date(data.arrival_date);
    const departureDate = new Date(data.departure_date);
    
    if (departureDate <= arrivalDate) {
      this.showError('Departure date must be after arrival date');
      return;
    }
    
    try {
      const response = await fetch("/api/make-booking", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          auth_token: this.authToken
        })
      });
      
      if (response.ok) {
        form.reset();
        this.showSuccess('Booking created successfully');
        // Switch to bookings tab and refresh
        this.switchTab('bookings');
      } else {
        const errorData = await response.json();
        this.showError(errorData.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      this.showError('Connection error');
    }
  }
  
  showError(message) {
    this.hideError();
    const errorDiv = document.getElementById('pin-error') || this.createErrorElement();
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
  
  hideError() {
    const errorDiv = document.getElementById('pin-error');
    if (errorDiv) {
      errorDiv.classList.add('hidden');
    }
  }
  
  showSuccess(message) {
    // Remove any existing success messages
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const activeTabContent = document.querySelector('.tab-content.active');
    activeTabContent.insertBefore(successDiv, activeTabContent.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }
  
  createErrorElement() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'pin-error';
    errorDiv.className = 'error-message hidden';
    document.getElementById('pin-form').appendChild(errorDiv);
    return errorDiv;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}