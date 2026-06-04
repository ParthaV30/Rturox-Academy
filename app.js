document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Cursor Glow Effect (matches rturox.com style)
    initCursorGlow();
    
    // 2. Identify current page and load appropriate components
    if (document.getElementById('application-form')) {
        initMultiStepForm();
        initProgramSelections();
    }
    
    if (document.getElementById('admin-dashboard-container')) {
        initAdminDashboard();
    }
});

/**
 * Creates and tracks the radial cursor glow effect.
 */
function initCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

/**
 * Handles Tab switcher on Landing Page (Internships vs Courses)
 */
window.switchTab = function(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    const selectedBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const selectedContent = document.getElementById(`${tabName}-content`);
    
    if (selectedBtn && selectedContent) {
        selectedBtn.classList.add('active');
        selectedContent.classList.add('active');
    }
};

/**
 * Custom Interaction for Program Selection Cards
 */
function initProgramSelections() {
    const options = document.querySelectorAll('.custom-option');
    options.forEach(opt => {
        const input = opt.querySelector('input');
        
        // Match initial status
        if (input && input.checked) {
            opt.classList.add('selected');
        }

        opt.addEventListener('click', (e) => {
            if (e.target !== input) {
                input.checked = !input.checked;
                // Dispatch change event to trigger updates
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        if (input) {
            input.addEventListener('change', () => {
                // If it's a radio button, clear others in the same group first
                if (input.type === 'radio') {
                    const name = input.name;
                    document.querySelectorAll(`input[name="${name}"]`).forEach(rad => {
                        rad.closest('.custom-option').classList.remove('selected');
                    });
                }
                
                if (input.checked) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
                
                // Extra logic for program choice to toggle sections in step 2
                if (input.name === 'programChoice') {
                    toggleSpecializationFields(input.value);
                }
            });
        }
    });
}

function toggleSpecializationFields(choice) {
    const specializationGroup = document.getElementById('specialization-group');
    if (!specializationGroup) return;
    
    const select = specializationGroup.querySelector('select');
    
    // Reset options
    select.innerHTML = '<option value="" disabled selected>Select your domain...</option>';
    
    const domains = [
        { value: 'python', label: 'Full Stack Python Development' },
        { value: 'java', label: 'Full Stack Java Development' },
        { value: 'web', label: 'Full Stack Web Development (MERN/Next.js)' },
        { value: 'uiux', label: 'UI/UX Design & Prototyping (Figma)' },
        { value: 'mobile', label: 'Mobile App Development (Flutter/React Native)' },
        { value: 'automation', label: 'AI Automation & Business Systems' }
    ];
    
    if (choice === 'Internship') {
        specializationGroup.style.display = 'block';
        specializationGroup.querySelector('label').innerHTML = 'Internship Domain <span class="required">*</span>';
        domains.forEach(d => {
            select.innerHTML += `<option value="Intern - ${d.label}">${d.label} Internship</option>`;
        });
    } else if (choice === 'Course') {
        specializationGroup.style.display = 'block';
        specializationGroup.querySelector('label').innerHTML = 'Course Selected <span class="required">*</span>';
        domains.forEach(d => {
            select.innerHTML += `<option value="Course - ${d.label}">${d.label} Course</option>`;
        });
    } else { // Both
        specializationGroup.style.display = 'block';
        specializationGroup.querySelector('label').innerHTML = 'Primary Focus Area <span class="required">*</span>';
        domains.forEach(d => {
            select.innerHTML += `<option value="Both - ${d.label}">${d.label} (Course + Internship)</option>`;
        });
    }
}

/**
 * Interactive Multi-step Application Form Manager
 */
function initMultiStepForm() {
    const form = document.getElementById('application-form');
    const panels = Array.from(document.querySelectorAll('.form-panel'));
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const stepNodes = Array.from(document.querySelectorAll('.step-node'));
    const progressBar = document.querySelector('.form-step-progress');
    const modal = document.getElementById('success-modal');
    
    let currentStep = 0;
    
    updateStepsUI();

    // Next button clicks
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateStepsUI();
                scrollToForm();
            }
        });
    });

    // Prev button clicks
    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateStepsUI();
            scrollToForm();
        });
    });

    // Submit handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateStep(currentStep)) {
            submitForm();
        }
    });

    function updateStepsUI() {
        // Show/hide panels
        panels.forEach((panel, idx) => {
            panel.classList.toggle('active', idx === currentStep);
        });

        // Update step nodes status (active/completed)
        stepNodes.forEach((node, idx) => {
            node.classList.toggle('active', idx === currentStep);
            node.classList.toggle('completed', idx < currentStep);
        });

        // Update progress bar width percentage
        const progressPercentage = (currentStep / (panels.length - 1)) * 100;
        if (progressBar) {
            progressBar.style.width = progressPercentage + '%';
        }
    }

    function scrollToForm() {
        const formSec = document.querySelector('.form-section');
        if (formSec) {
            formSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function validateStep(stepIdx) {
        let isValid = true;
        const currentPanel = panels[stepIdx];
        
        // Find all inputs in the current panel that are required or need validation
        const inputs = currentPanel.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        // Custom validation based on step
        if (stepIdx === 0) {
            // Email and Phone formatting validation
            const email = currentPanel.querySelector('input[type="email"]');
            if (email && email.value && !isValidEmail(email.value)) {
                showError(email, 'Please enter a valid email address');
                isValid = false;
            }

            const phone = currentPanel.querySelector('input[name="phone"]');
            if (phone && phone.value && !isValidPhone(phone.value)) {
                showError(phone, 'Enter a valid 10-digit number');
                isValid = false;
            }
            
            const whatsapp = currentPanel.querySelector('input[name="whatsapp"]');
            if (whatsapp && whatsapp.value && !isValidPhone(whatsapp.value)) {
                showError(whatsapp, 'Enter a valid 10-digit number');
                isValid = false;
            }
        }
        
        return isValid;
    }

    function validateInput(input) {
        // Reset state
        clearError(input);
        
        if (input.value.trim() === '') {
            showError(input, 'This field is required');
            return false;
        }
        
        return true;
    }

    function showError(input, message) {
        const group = input.closest('.form-group');
        if (group) {
            group.classList.add('has-error');
            let errorDiv = group.querySelector('.error-msg');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-msg';
                group.appendChild(errorDiv);
            }
            errorDiv.textContent = message;
        }
    }

    function clearError(input) {
        const group = input.closest('.form-group');
        if (group) {
            group.classList.remove('has-error');
        }
    }

    // Attach dynamic input listeners to remove error classes on keystroke
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => clearError(input));
        input.addEventListener('change', () => clearError(input));
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^\d{10}$/.test(phone.replace(/[\s-]/g, ''));
    }

    /**
     * Gathers form data, saves to localStorage, and triggers success screen
     */
    function submitForm() {
        const formData = new FormData(form);
        const applicant = {
            id: 'RTX-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 100),
            name: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            whatsapp: formData.get('whatsapp'),
            college: formData.get('collegeName'),
            department: formData.get('department'),
            year: formData.get('gradYear'),
            program: formData.get('programChoice'),
            specialization: formData.get('specialization'),
            experience: formData.get('skillLevel'),
            github: formData.get('githubUrl') || 'N/A',
            linkedin: formData.get('linkedinUrl') || 'N/A',
            notes: formData.get('sop') || 'N/A',
            status: 'Pending', // Pending, Interview, Accepted, Rejected
            appliedAt: new Date().toISOString()
        };

        // Retrieve existing applications or initiate empty list
        const applications = JSON.parse(localStorage.getItem('rturox_candidates') || '[]');
        applications.push(applicant);
        localStorage.setItem('rturox_candidates', JSON.stringify(applications));

        // Show Success Modal
        if (modal) {
            modal.classList.add('active');
            
            // Set text inside modal
            const nameEl = document.getElementById('success-candidate-name');
            if (nameEl) nameEl.textContent = applicant.name;

            // Dynamically set WhatsApp template confirmation
            const waUrl = `https://wa.me/916381169124?text=${encodeURIComponent(
                `Hi Rturox Academy Team, my name is ${applicant.name}. I have just submitted my registration for the ${applicant.program} program focusing on ${applicant.specialization}. (Application ID: ${applicant.id}). Please review my details!`
            )}`;
            const waBtn = document.getElementById('success-whatsapp-btn');
            if (waBtn) waBtn.href = waUrl;
        }
        
        form.reset();
        currentStep = 0;
        updateStepsUI();
        
        // Reset selections manually
        document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        const specializationGroup = document.getElementById('specialization-group');
        if (specializationGroup) specializationGroup.style.display = 'none';
    }
}

/**
 * Navigation utility function to close Success Modal
 */
window.closeModal = function() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

/**
 * Quick Helper to Fill Mock Data for demonstration/testing
 */
window.fillDemoForm = function() {
    const form = document.getElementById('application-form');
    if (!form) return;
    
    // Step 1
    form.querySelector('input[name="fullName"]').value = 'Saritha Kumar';
    form.querySelector('input[name="email"]').value = 'saritha.kumar@gmail.com';
    form.querySelector('input[name="phone"]').value = '9876543210';
    form.querySelector('input[name="whatsapp"]').value = '9876543210';
    
    // Step 2
    // Program choice - Let's choose Both
    const radBoth = document.getElementById('choiceBoth');
    if (radBoth) {
        radBoth.checked = true;
        radBoth.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Wait a brief moment for the specialization select to populate
    setTimeout(() => {
        const specSelect = form.querySelector('select[name="specialization"]');
        if (specSelect) specSelect.value = 'Both - Full Stack Python Development';
        
        form.querySelector('select[name="skillLevel"]').value = 'Intermediate';
    }, 100);
    
    // Step 3
    form.querySelector('input[name="collegeName"]').value = 'PSG College of Technology';
    form.querySelector('input[name="department"]').value = 'B.Tech Information Technology';
    form.querySelector('select[name="gradYear"]').value = '2027';
    form.querySelector('input[name="githubUrl"]').value = 'https://github.com/saritha-tech';
    form.querySelector('input[name="linkedinUrl"]').value = 'https://linkedin.com/in/sarithakumar';
    form.querySelector('textarea[name="sop"]').value = 'Highly interested in full-stack Python engineering. Eager to gain real project experience working with the Rturox tech studio team.';
};

/**
 * ----------------------------------------------------
 * Administrative Dashboard Functions (`admin.html`)
 * ----------------------------------------------------
 */
let candidates = [];
let selectedCandidateId = null;

function initAdminDashboard() {
    // 1. Setup Password Gate
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (!isAuth) {
        showPinLock();
    } else {
        loadDashboardData();
    }
}

function showPinLock() {
    // Ensure lock overlay exists
    let lockOverlay = document.getElementById('lock-overlay');
    if (!lockOverlay) return;
    
    lockOverlay.style.display = 'flex';
    
    const pinInputs = Array.from(document.querySelectorAll('.pin-digit'));
    const errorMsg = lockOverlay.querySelector('.error-msg');
    
    // Focus first input
    if (pinInputs[0]) pinInputs[0].focus();
    
    // Input chaining logic
    pinInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                if (index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                } else {
                    // All digits entered, check pin
                    verifyPin();
                }
            } else if (e.key === 'Backspace') {
                if (index > 0) {
                    pinInputs[index - 1].focus();
                }
            }
        });
    });
    
    function verifyPin() {
        const pin = pinInputs.map(input => input.value).join('');
        if (pin === '2026') { // Standard Rturox coordinator passcode
            sessionStorage.setItem('admin_authenticated', 'true');
            lockOverlay.style.opacity = '0';
            setTimeout(() => {
                lockOverlay.style.display = 'none';
                loadDashboardData();
            }, 300);
        } else {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Invalid passcode. Please try again.';
            pinInputs.forEach(input => input.value = '');
            pinInputs[0].focus();
        }
    }
}

function loadDashboardData() {
    // Fetch registered students
    candidates = JSON.parse(localStorage.getItem('rturox_candidates') || '[]');
    
    // Render Statistics & Tables
    updateDashboardUI();
    
    // Setup Filter Event Listeners
    setupFilters();
}

function seedDummyData() {
    candidates = [
        {
            id: 'RTX-928172-12',
            name: 'Kavin Prasad',
            email: 'kavin.prasad@gmail.com',
            phone: '9840294821',
            whatsapp: '9840294821',
            college: 'Coimbatore Institute of Technology',
            department: 'B.E. Computer Science Engineering',
            year: '2026',
            program: 'Internship',
            specialization: 'Intern - Full Stack Web Development (MERN/Next.js)',
            experience: 'Intermediate',
            github: 'https://github.com/kavinprasad',
            linkedin: 'https://linkedin.com/in/kavin-prasad',
            notes: 'Looking for a challenging internship. I have built two React projects already.',
            status: 'Accepted',
            appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
            id: 'RTX-103982-45',
            name: 'Nisha Sundar',
            email: 'nisha.sundar@yahoo.com',
            phone: '9043810293',
            whatsapp: '9043810293',
            college: 'Amrita Vishwa Vidyapeetham',
            department: 'B.E. Electronics & Communication',
            year: '2027',
            program: 'Course',
            specialization: 'Course - UI/UX Design & Prototyping (Figma)',
            experience: 'Beginner',
            github: 'N/A',
            linkedin: 'https://linkedin.com/in/nisha-sundar',
            notes: 'Passionate about mobile designs and interfaces. Excited to learn Figma professionally.',
            status: 'Interview',
            appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
            id: 'RTX-837190-23',
            name: 'Rahul Dev',
            email: 'rahul.dev@outlook.com',
            phone: '8098123456',
            whatsapp: '8098123456',
            college: 'Sri Krishna College of Engineering & Tech',
            department: 'B.Tech Information Technology',
            year: '2026',
            program: 'Both',
            specialization: 'Both - Full Stack Python Development',
            experience: 'Intermediate',
            github: 'https://github.com/rahul-dev-99',
            linkedin: 'https://linkedin.com/in/rahuldev',
            notes: 'Want to master Python Django and do an internship concurrently to apply my knowledge.',
            status: 'Pending',
            appliedAt: new Date().toISOString() // today
        }
    ];
    localStorage.setItem('rturox_candidates', JSON.stringify(candidates));
}

function updateDashboardUI() {
    renderStats();
    renderTable();
    renderVisualAnalytics();
}

function renderStats() {
    const total = candidates.length;
    const internships = candidates.filter(c => c.program === 'Internship' || c.program === 'Both').length;
    const courses = candidates.filter(c => c.program === 'Course' || c.program === 'Both').length;
    const pending = candidates.filter(c => c.status === 'Pending').length;
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-interns').textContent = internships;
    document.getElementById('stat-courses').textContent = courses;
    document.getElementById('stat-pending').textContent = pending;
}

function renderTable(filteredCandidates = candidates) {
    const tbody = document.getElementById('applicants-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (filteredCandidates.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    No candidates found matching the selected criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort: newest first
    const sorted = [...filteredCandidates].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    
    sorted.forEach(c => {
        const tr = document.createElement('tr');
        
        // Format Date
        const dateStr = new Date(c.appliedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        // Status Class mappings
        let statusClass = 'pending';
        if (c.status === 'Interview') statusClass = 'interview';
        if (c.status === 'Accepted') statusClass = 'accepted';
        if (c.status === 'Rejected') statusClass = 'rejected';
        
        tr.innerHTML = `
            <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--primary);">${c.id}</td>
            <td><strong style="color: var(--text-white);">${c.name}</strong></td>
            <td>
                <div style="font-size: 0.85rem; color: var(--text-white);">${c.college}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${c.department} • Year ${c.year}</div>
            </td>
            <td>
                <div style="font-size: 0.85rem; color: var(--text-white);">${c.program}</div>
                <div style="font-size: 0.75rem; color: var(--primary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c.specialization}">${c.specialization}</div>
            </td>
            <td>${dateStr}</td>
            <td><span class="status-pill ${statusClass}">${c.status}</span></td>
            <td>
                <div class="action-flex">
                    <span class="action-link" onclick="openDrawer('${c.id}')">View Details</span>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function setupFilters() {
    const search = document.getElementById('admin-search');
    const progFilter = document.getElementById('filter-program');
    const statusFilter = document.getElementById('filter-status');
    const domainFilter = document.getElementById('filter-domain');
    
    if (search) search.addEventListener('input', runFilters);
    if (progFilter) progFilter.addEventListener('change', runFilters);
    if (statusFilter) statusFilter.addEventListener('change', runFilters);
    if (domainFilter) domainFilter.addEventListener('change', runFilters);
}

function runFilters() {
    const query = document.getElementById('admin-search').value.toLowerCase().trim();
    const program = document.getElementById('filter-program').value;
    const status = document.getElementById('filter-status').value;
    const domain = document.getElementById('filter-domain').value;
    
    const filtered = candidates.filter(c => {
        // Search text check
        const matchesSearch = c.name.toLowerCase().includes(query) || 
                              c.college.toLowerCase().includes(query) || 
                              c.email.toLowerCase().includes(query) ||
                              c.id.toLowerCase().includes(query);
                              
        // Program Check
        let matchesProg = true;
        if (program !== 'all') {
            if (program === 'Both') {
                matchesProg = c.program === 'Both';
            } else {
                matchesProg = c.program === program || c.program === 'Both';
            }
        }
        
        // Status Check
        const matchesStatus = status === 'all' || c.status === status;
        
        // Domain Check
        let matchesDomain = true;
        if (domain !== 'all') {
            matchesDomain = c.specialization.toLowerCase().includes(domain);
        }
        
        return matchesSearch && matchesProg && matchesStatus && matchesDomain;
    });
    
    renderTable(filtered);
}

/**
 * Slide-out profile drawer actions
 */
window.openDrawer = function(id) {
    selectedCandidateId = id;
    const c = candidates.find(candidate => candidate.id === id);
    if (!c) return;
    
    // Set field values
    document.getElementById('drawer-candidate-id').textContent = c.id;
    document.getElementById('drawer-name').textContent = c.name;
    document.getElementById('drawer-email').textContent = c.email;
    document.getElementById('drawer-email').href = `mailto:${c.email}`;
    document.getElementById('drawer-phone').textContent = c.phone;
    document.getElementById('drawer-phone').href = `tel:${c.phone}`;
    document.getElementById('drawer-whatsapp').textContent = c.whatsapp;
    document.getElementById('drawer-whatsapp').href = `https://wa.me/91${c.whatsapp}`;
    
    // Fast Outreach CTA Prefills
    const adminWaMessage = `Hi ${c.name}, this is Rturox Academy. We reviewed your application (${c.id}) for the ${c.program} - ${c.specialization}. We would like to schedule a brief call. Are you available this week?`;
    document.getElementById('drawer-whatsapp-btn').href = `https://wa.me/91${c.whatsapp}?text=${encodeURIComponent(adminWaMessage)}`;

    const emailSubject = `Rturox Academy Application Review - ${c.name} (${c.id})`;
    const emailBody = `Dear ${c.name},\n\nThank you for applying to the Rturox Academy ${c.program} program for ${c.specialization}.\n\nWe have reviewed your profile and would like to schedule a 15-minute introductory Google Meet call to discuss the program details, schedule, and prerequisites.\n\nPlease let us know your availability over the next 2-3 days.\n\nBest regards,\nRturox Tech Studio Coordinator\nCoimbatore`;
    document.getElementById('drawer-email-btn').href = `mailto:${c.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    document.getElementById('drawer-college').textContent = c.college;
    document.getElementById('drawer-dept').textContent = c.department;
    document.getElementById('drawer-year').textContent = c.year;
    
    document.getElementById('drawer-program').textContent = c.program;
    document.getElementById('drawer-spec').textContent = c.specialization;
    document.getElementById('drawer-exp').textContent = c.experience;
    
    const githubLink = document.getElementById('drawer-github');
    githubLink.textContent = c.github;
    githubLink.href = c.github !== 'N/A' ? c.github : '#';
    
    const linkedinLink = document.getElementById('drawer-linkedin');
    linkedinLink.textContent = c.linkedin;
    linkedinLink.href = c.linkedin !== 'N/A' ? c.linkedin : '#';
    
    document.getElementById('drawer-sop').textContent = c.notes;
    document.getElementById('drawer-status-select').value = c.status;
    
    // Open drawer
    const drawerOverlay = document.getElementById('drawer-overlay');
    if (drawerOverlay) drawerOverlay.classList.add('active');
};

window.closeDrawer = function() {
    const drawerOverlay = document.getElementById('drawer-overlay');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
    selectedCandidateId = null;
};

window.updateCandidateStatus = function(status) {
    if (!selectedCandidateId) return;
    
    candidates = candidates.map(c => {
        if (c.id === selectedCandidateId) {
            return { ...c, status: status };
        }
        return c;
    });
    
    localStorage.setItem('rturox_candidates', JSON.stringify(candidates));
    updateDashboardUI();
    runFilters(); // Preserve filters
};

window.deleteCandidate = function() {
    if (!selectedCandidateId) return;
    
    if (confirm('Are you sure you want to delete this applicant record? This action cannot be undone.')) {
        candidates = candidates.filter(c => c.id !== selectedCandidateId);
        localStorage.setItem('rturox_candidates', JSON.stringify(candidates));
        closeDrawer();
        updateDashboardUI();
    }
};

/**
 * Formats database to CSV string and starts download process
 */
window.exportToCSV = function() {
    if (candidates.length === 0) {
        alert('No applicant records available to export.');
        return;
    }
    
    // Headers
    const headers = [
        'ID', 'Name', 'Email', 'Phone', 'WhatsApp', 'College', 
        'Department', 'Graduation Year', 'Program Type', 
        'Domain Chosen', 'Skill Level', 'GitHub', 'LinkedIn', 
        'Notes', 'Status', 'Applied Date'
    ];
    
    const csvRows = [headers.join(',')];
    
    candidates.forEach(c => {
        const values = [
            c.id,
            escapeCSV(c.name),
            escapeCSV(c.email),
            c.phone,
            c.whatsapp,
            escapeCSV(c.college),
            escapeCSV(c.department),
            c.year,
            escapeCSV(c.program),
            escapeCSV(c.specialization),
            escapeCSV(c.experience),
            escapeCSV(c.github),
            escapeCSV(c.linkedin),
            escapeCSV(c.notes),
            c.status,
            c.appliedAt
        ];
        csvRows.push(values.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rturox_Academy_Applicants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    function escapeCSV(str) {
        if (str === null || str === undefined) return '';
        let escaped = String(str).replace(/"/g, '""'); // Double escape quotes
        if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
            escaped = `"${escaped}"`; // Wrap in quotes if it contains separator, newline, or quotes
        }
        return escaped;
    }
};

/**
 * Log out and clear session state
 */
window.logoutAdmin = function() {
    sessionStorage.removeItem('admin_authenticated');
    window.location.reload();
};

/**
 * Render Visual Charts for Dashboard Analytics
 */
function renderVisualAnalytics() {
    const ratioProgText = document.getElementById('ratio-prog-text');
    const barProgRatio = document.getElementById('bar-prog-ratio');
    const topDomainText = document.getElementById('top-domain-text');
    
    // If elements are not on page (e.g. index.html), abort
    if (!ratioProgText || !barProgRatio || !topDomainText) return;

    if (candidates.length === 0) {
        ratioProgText.textContent = 'Internships: 0% | Courses: 0%';
        barProgRatio.style.width = '0%';
        topDomainText.textContent = 'No Data Available';
        
        // Clear top domain bars
        ['python', 'java', 'web'].forEach(dom => {
            document.getElementById(`bar-domain-${dom}`).style.width = '0%';
            document.getElementById(`lbl-domain-${dom}`).textContent = '0%';
        });
        return;
    }

    // 1. Calculate Program Allocation Ratio
    const total = candidates.length;
    const internships = candidates.filter(c => c.program === 'Internship').length;
    const courses = candidates.filter(c => c.program === 'Course').length;
    const both = candidates.filter(c => c.program === 'Both').length;

    // Intern share = Internships + half of both, course share = Courses + half of both
    const internPerc = Math.round(((internships + both / 2) / total) * 100);
    const coursePerc = 100 - internPerc;

    ratioProgText.textContent = `Internships: ${internPerc}% | Courses: ${coursePerc}%`;
    barProgRatio.style.width = `${internPerc}%`;

    // 2. Calculate Domain Distribution percentages
    const pythonCount = candidates.filter(c => c.specialization.toLowerCase().includes('python')).length;
    const javaCount = candidates.filter(c => c.specialization.toLowerCase().includes('java')).length;
    const webCount = candidates.filter(c => c.specialization.toLowerCase().includes('web') || c.specialization.toLowerCase().includes('mern')).length;
    
    const pyPerc = total > 0 ? Math.round((pythonCount / total) * 100) : 0;
    const jaPerc = total > 0 ? Math.round((javaCount / total) * 100) : 0;
    const wbPerc = total > 0 ? Math.round((webCount / total) * 100) : 0;

    document.getElementById('bar-domain-python').style.width = `${pyPerc}%`;
    document.getElementById('lbl-domain-python').textContent = `${pyPerc}%`;
    
    document.getElementById('bar-domain-java').style.width = `${jaPerc}%`;
    document.getElementById('lbl-domain-java').textContent = `${jaPerc}%`;
    
    document.getElementById('bar-domain-web').style.width = `${wbPerc}%`;
    document.getElementById('lbl-domain-web').textContent = `${wbPerc}%`;

    // Top domain determination
    const domains = [
        { name: 'Python Full Stack', count: pythonCount },
        { name: 'Java Enterprise', count: javaCount },
        { name: 'Full Stack Web', count: webCount }
    ];
    domains.sort((a, b) => b.count - a.count);
    
    if (domains[0].count > 0) {
        topDomainText.textContent = `Top: ${domains[0].name} (${domains[0].count})`;
    } else {
        topDomainText.textContent = 'No Domain Selected';
    }
}

/**
 * Seed Multiple Random Candidate Records
 */
window.seedMultipleCandidates = function(count) {
    const colleges = [
        'PSG College of Technology', 
        'Coimbatore Institute of Technology', 
        'Amrita Vishwa Vidyapeetham', 
        'Government College of Technology, CBE', 
        'Sri Krishna College of Eng & Tech',
        'Kumaraguru College of Technology'
    ];
    const depts = [
        'B.E. Computer Science Engineering',
        'B.Tech Information Technology',
        'B.E. Electronics & Communication',
        'B.Tech Artificial Intelligence'
    ];
    const names = [
        'Abhishek Raja', 'Divya Balaji', 'Siddharth Nair', 'Pooja Krishnan',
        'Hariharan S.', 'Keerthana Prasad', 'Vijay Karthik', 'Arun Kumar'
    ];
    const programs = ['Internship', 'Course', 'Both'];
    const domains = [
        { value: 'Intern - Full Stack Web Development (MERN/Next.js)', type: 'Internship' },
        { value: 'Intern - Full Stack Python Development', type: 'Internship' },
        { value: 'Intern - Java Enterprise Application Development', type: 'Internship' },
        { value: 'Course - Full Stack Python Development', type: 'Course' },
        { value: 'Course - Full Stack Java Development', type: 'Course' },
        { value: 'Both - Full Stack Web Development (MERN/Next.js)', type: 'Both' }
    ];
    
    const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const statuses = ['Pending', 'Interview', 'Accepted', 'Rejected'];

    for (let i = 0; i < count; i++) {
        const name = names[Math.floor(Math.random() * names.length)] + ' ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + '.';
        const randomCollege = colleges[Math.floor(Math.random() * colleges.length)];
        const randomDept = depts[Math.floor(Math.random() * depts.length)];
        const prog = programs[Math.floor(Math.random() * programs.length)];
        
        // Filter domains matching program choice
        const matchedDomains = domains.filter(d => d.type === prog || (prog === 'Both' && d.type === 'Both'));
        const dom = matchedDomains.length > 0 ? matchedDomains[Math.floor(Math.random() * matchedDomains.length)].value : domains[0].value;
        
        const newCand = {
            id: 'RTX-' + (Math.floor(Math.random() * 900000) + 100000) + '-' + Math.floor(Math.random() * 100),
            name: name,
            email: name.toLowerCase().replace(/[^a-z]/g, '') + '@gmail.com',
            phone: '9' + Math.floor(Math.random() * 900000000 + 100000000),
            whatsapp: '9' + Math.floor(Math.random() * 900000000 + 100000000),
            college: randomCollege,
            department: randomDept,
            year: String(2025 + Math.floor(Math.random() * 5)),
            program: prog,
            specialization: dom,
            experience: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
            github: 'https://github.com/username-test',
            linkedin: 'https://linkedin.com/in/username-test',
            notes: 'Generated via Coordinator DB utility for testing registration flows, filters, search functions and charts.',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            appliedAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString() // random in past 10 days
        };
        candidates.push(newCand);
    }
    
    localStorage.setItem('rturox_candidates', JSON.stringify(candidates));
    updateDashboardUI();
    runFilters();
};

/**
 * Clear Candidates Database completely
 */
window.clearCandidateDatabase = function() {
    if (confirm('CRITICAL ACTION: Are you sure you want to clear the entire applicant database? This will delete all candidates from localStorage.')) {
        if (confirm('Type YES to confirm deletion of all database records.')) {
            candidates = [];
            localStorage.setItem('rturox_candidates', JSON.stringify(candidates));
            updateDashboardUI();
            runFilters();
        }
    }
};

