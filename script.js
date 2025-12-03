// --- 1. MOCK DATABASE AND DUPLICATE CHECK LOGIC ---

// In a real application, this list would be securely stored and checked on a server.
// We are mocking it here for front-end demonstration.
const registeredUsers = [
    { email: 'user@example.com', username: 'demo', password: 'password123' },
    { email: 'test@mail.com', username: 'tester', password: 'securepass' }
];

/**
 * Checks if an email is already present in the registeredUsers array.
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the email is already registered, false otherwise.
 */
const isEmailAlreadyRegistered = (email) => {
    // Convert both the input email and the stored email to lowercase for case-insensitive checking.
    return registeredUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// --- 2. MESSAGE DISPLAY UTILITY ---

const showMessage = (formId, message, isError = false) => {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const existingMessage = form.querySelector('.submission-message');
    if (existingMessage) existingMessage.remove();

    const msgElement = document.createElement('p');
    msgElement.classList.add('submission-message');
    msgElement.textContent = message;
    
    // Styling the message based on success or error
    let color = isError ? '#cc0000' : '#1e4d9c';
    let background = isError ? '#ffebee' : '#e0f7fa';

    msgElement.style.cssText = `color: ${color}; text-align: center; margin-top: 15px; font-weight: bold; background: ${background}; padding: 10px; border-radius: 4px;`;
    form.appendChild(msgElement);
    
    if (!isError) {
        form.reset(); 
    }
    
    setTimeout(() => msgElement.remove(), 7000);
};

// --- 3. ANIMATION AND NAVIGATION SETUP (Standard) ---

const sections = document.querySelectorAll('section');
const forms = document.querySelectorAll('form');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = { threshold: 0.1 };

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

sections.forEach(section => scrollObserver.observe(section));
forms.forEach(form => scrollObserver.observe(form));

const navObserver = new IntersectionObserver((entries) => {
    let activeId = null;
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (!activeId || entry.intersectionRatio > entries.find(e => e.target.id === activeId)?.intersectionRatio || entry.boundingClientRect.top < window.innerHeight / 2) {
                activeId = entry.target.id;
            }
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === activeId) {
            link.classList.add('active');
        }
    });
}, { threshold: 0.5, rootMargin: "-50% 0px -49% 0px" });

sections.forEach(section => navObserver.observe(section));

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupBtn = document.getElementById('showSignupBtn');

showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    signupForm.classList.add('animate'); 
    signupForm.scrollIntoView({ behavior: 'smooth' });
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showMessage('loginForm', 'Login Successful! Redirecting to Dashboard... (Placeholder Action)');
});

// --- 4. SIGNUP LOGIC WITH DUPLICATE BLOCKING INTEGRATION ---

const signupSteps = document.querySelectorAll('#signupForm .form-step');
const nextStepBtns = document.querySelectorAll('#signupForm .next-step-btn');
const prevStepBtns = document.querySelectorAll('#signupForm .prev-step-btn');
let currentSignupStep = 0;

const navigateSignupStep = (direction) => {
    const nextStep = currentSignupStep + direction;
    if (nextStep >= 0 && nextStep < signupSteps.length) {
        signupSteps[currentSignupStep].classList.remove('active-step');
        currentSignupStep = nextStep;
        signupSteps[currentSignupStep].classList.add('active-step');
    }
};

nextStepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const activeStep = signupSteps[currentSignupStep];
        const inputs = activeStep.querySelectorAll('input[required]');
        let allValid = true;

        inputs.forEach(input => {
            if (!input.value) {
                allValid = false;
                input.style.border = '2px solid red';
            } else {
                input.style.border = '1px solid #ced4da';
            }
        });

        if (allValid) {
            // ** CRITICAL STEP: Check for duplicate email before moving to Step 2 **
            if (currentSignupStep === 0) {
                const regEmail = document.getElementById('reg-email').value;
                if (isEmailAlreadyRegistered(regEmail)) {
                    showMessage('signupForm', 'Error: An account with this email already exists. Please login.', true);
                    return; // Stop navigation if email is a duplicate
                }
            }
            navigateSignupStep(1);
        } else {
            alert('Please fill in all required fields.');
        }
    });
});

prevStepBtns.forEach(btn => btn.addEventListener('click', () => navigateSignupStep(-1)));

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const emailInput = document.getElementById('reg-email');
    const usernameInput = document.getElementById('reg-username');

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        showMessage('signupForm', 'Error: Passwords do not match.', true);
        confirmPasswordInput.style.border = '2px solid red';
        return;
    }

    // A final check on submission (in case the user bypassed earlier checks)
    if (isEmailAlreadyRegistered(emailInput.value)) {
        showMessage('signupForm', 'Error: An account with this email already exists. Please login.', true);
        return;
    }

    // ** SUCCESS: Register the new user in the mock array **
    registeredUsers.push({
        email: emailInput.value,
        username: usernameInput.value,
        password: password 
    });
    console.log('Registered Users:', registeredUsers); 

    showMessage('signupForm', 'Account Registration Complete! Please log in above.');
    
    // Reset form state and return to login form
    signupForm.reset();
    document.getElementById('reg-password').style.border = '1px solid #ced4da';
    document.getElementById('reg-confirm-password').style.border = '1px solid #ced4da';
    
    signupSteps[currentSignupStep].classList.remove('active-step');
    currentSignupStep = 0;
    signupSteps[currentSignupStep].classList.add('active-step');
    
    setTimeout(() => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        loginForm.classList.add('animate');
    }, 500); 
});

// --- 5. APPOINTMENT AND CONTACT FORM LOGIC (Retained) ---

const appointmentForm = document.getElementById('appointmentForm');
const appointmentSteps = document.querySelectorAll('#appointmentForm .form-step');
let currentAppointmentStep = 0;

const navigateAppointmentStep = (direction) => {
    const activeStep = appointmentSteps[currentAppointmentStep];
    const nextStep = currentAppointmentStep + direction;

    
    if (direction === 1) {
          const inputs = activeStep.querySelectorAll('input[required]');
          let allValid = true;
          inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value) {
                allValid = false;
                input.style.border = '2px solid red';
            } else {
                input.style.border = '1px solid #ced4da';
            }
        });

        if (!allValid) {
            alert('Please fill in the required field before proceeding.');
            return; 
        }
    }
    
    if (nextStep >= 0 && nextStep < appointmentSteps.length) {
        appointmentSteps[currentAppointmentStep].classList.remove('active');
        currentAppointmentStep = nextStep;
        appointmentSteps[currentAppointmentStep].classList.add('active');
    }
};

appointmentForm.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateAppointmentStep(1));
});

appointmentForm.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateAppointmentStep(-1));
});

appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const lastStepInputs = appointmentSteps[currentAppointmentStep].querySelectorAll('input[required]');
    let allValid = true;
    lastStepInputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value) {
            allValid = false;
            input.style.border = '2px solid red';
        } else {
            input.style.border = '1px solid #ced4da';
        }
    });

    if (allValid) {
        showMessage('appointmentForm', 'Booking Confirmed! A representative will contact you shortly.');
          
        appointmentSteps[currentAppointmentStep].classList.remove('active');
        currentAppointmentStep = 0;
        appointmentSteps[currentAppointmentStep].classList.add('active');
    } else {
          alert('Please fill in the required field before submitting.');
    }
});

document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showMessage('contactForm', 'Inquiry Sent! We will respond to your email within 24 hours.');
});