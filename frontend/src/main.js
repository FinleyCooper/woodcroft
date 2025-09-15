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
});