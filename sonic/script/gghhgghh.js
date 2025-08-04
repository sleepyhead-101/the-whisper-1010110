 document.addEventListener('DOMContentLoaded', function() {
            // Form elements
            const form = document.getElementById('whisperForm');
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const checkbox = document.getElementById('agree-checkbox');
            const submitBtn = document.getElementById('submitBtn');
            
            // Error elements
            const nameError = document.getElementById('name-error');
            const emailError = document.getElementById('email-error');
            const passwordError = document.getElementById('password-error');
            const termsError = document.getElementById('terms-error');
            
            // Requirement indicators
            const emailAt = document.getElementById('email-at');
            const emailDot = document.getElementById('email-dot');
            const emailDomain = document.getElementById('email-domain');
            const lengthReq = document.getElementById('length-req');
            const numberReq = document.getElementById('number-req');
            const letterReq = document.getElementById('letter-req');
            
            // Password strength
            const strengthMeter = document.getElementById('strength-meter');
            const buttonText = document.querySelector('.button-text');
            
            // Ghost elements
            const ghosts = document.querySelectorAll('.ghost');
            
            // Add ghost trail effect
            ghosts.forEach(ghost => {
                ghost.addEventListener('mouseenter', function() {
                    createGhostTrail(this);
                });
            });
            
            function createGhostTrail(ghost) {
                const trail = document.createElement('div');
                trail.className = 'ghost-trail';
                const rect = ghost.getBoundingClientRect();
                trail.style.left = `${rect.left}px`;
                trail.style.top = `${rect.top}px`;
                trail.style.width = `${rect.width}px`;
                trail.style.height = `${rect.height}px`;
                document.body.appendChild(trail);
                
                // Remove after animation completes
                setTimeout(() => {
                    trail.remove();
                }, 2000);
            }
            
            // Toggle password visibility
            const togglePassword = document.querySelector('.toggle-password');
            if (togglePassword) {
                togglePassword.addEventListener('click', function() {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    const icon = this.querySelector('i');
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                    
                    // Update aria-label for accessibility
                    const isVisible = type === 'text';
                    this.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
                });
            }
            
            // Name validation
            nameInput.addEventListener('input', function() {
                validateName();
                checkFormValidity();
            });
            
            // Email validation
            emailInput.addEventListener('input', function() {
                validateEmail();
                checkFormValidity();
            });
            
            // Password validation
            passwordInput.addEventListener('input', function() {
                validatePassword();
                checkFormValidity();
            });
            
            // Terms checkbox
            checkbox.addEventListener('change', function() {
                validateTerms();
                checkFormValidity();
            });
            
            // Form submission
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validate all fields again in case user bypassed client-side validation
                const isNameValid = validateName();
                const isEmailValid = validateEmail();
                const isPasswordValid = validatePassword();
                const isTermsValid = validateTerms();
                
                if (!isNameValid || !isEmailValid || !isPasswordValid || !isTermsValid) {
                    if (!isTermsValid) {
                        termsError.classList.add('show');
                        document.querySelector('.custom-checkbox').classList.add('shake');
                        setTimeout(() => {
                            document.querySelector('.custom-checkbox').classList.remove('shake');
                        }, 500);
                    }
                    return;
                }
                
                // Show loading state
                document.getElementById('loading').style.display = 'block';
                form.style.display = 'none';
                submitBtn.disabled = true;
                buttonText.textContent = 'Processing...';
                
                // Submit the form to FormSubmit
                const formData = new FormData(form);
                
                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        document.getElementById('loading').style.display = 'none';
                        document.getElementById('successMessage').style.display = 'block';
                        
                        // Redirect after success
                        setTimeout(function() {
                            window.location.href = 'load.html';
                        }, 2000);
                    } else {
                        throw new Error('Form submission failed');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    document.getElementById('loading').style.display = 'none';
                    form.style.display = 'block';
                    submitBtn.disabled = false;
                    buttonText.textContent = 'Continue to Whisper Wall';
                    alert('There was an error submitting the form. Please try again.');
                });
            });
            
            function validateName() {
                const name = nameInput.value.trim();
                const isValid = name.length > 0;
                
                nameError.style.display = isValid ? 'none' : 'block';
                nameInput.setAttribute('aria-invalid', !isValid);
                
                return isValid;
            }
            
            function validateEmail() {
                const email = emailInput.value.trim();
                const atValid = email.includes('@');
                const dotValid = email.includes('.');
                const domainValid = /\.(com|net|org|edu|gov|io|co|uk|us|ca|au|nz|de|fr|es|it)$/i.test(email);
                
                // Update requirement indicators
                emailAt.classList.toggle('valid', atValid);
                emailAt.classList.toggle('invalid', !atValid);
                emailDot.classList.toggle('valid', dotValid);
                emailDot.classList.toggle('invalid', !dotValid);
                emailDomain.classList.toggle('valid', domainValid);
                emailDomain.classList.toggle('invalid', !domainValid);
                
                // More comprehensive email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValid = emailRegex.test(email) && domainValid;
                
                emailError.style.display = isValid ? 'none' : 'block';
                emailInput.setAttribute('aria-invalid', !isValid);
                
                return isValid;
            }
            
            function validatePassword() {
                const password = passwordInput.value;
                const hasLength = password.length >= 8;
                const hasNumber = /\d/.test(password);
                const hasLetter = /[a-zA-Z]/.test(password);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                
                // Update requirement indicators
                lengthReq.classList.toggle('valid', hasLength);
                lengthReq.classList.toggle('invalid', !hasLength);
                numberReq.classList.toggle('valid', hasNumber);
                numberReq.classList.toggle('invalid', !hasNumber);
                letterReq.classList.toggle('valid', hasLetter);
                letterReq.classList.toggle('invalid', !hasLetter);
                
                const isValid = hasLength && hasNumber && hasLetter;
                passwordError.style.display = isValid ? 'none' : 'block';
                passwordInput.setAttribute('aria-invalid', !isValid);
                
                // Update strength meter with more sophisticated calculation
                let strength = 0;
                if (hasLength) strength += 30;
                if (hasNumber) strength += 20;
                if (hasLetter) strength += 20;
                if (hasSpecialChar) strength += 30;
                if (password.length > 12) strength += 10;
                
                // Cap at 100
                strength = Math.min(strength, 100);
                
                strengthMeter.style.width = `${strength}%`;
                
                // Set color based on strength
                if (strength < 40) {
                    strengthMeter.style.backgroundColor = 'var(--error)';
                } else if (strength < 70) {
                    strengthMeter.style.backgroundColor = 'var(--warning)';
                } else {
                    strengthMeter.style.backgroundColor = 'var(--success)';
                }
                
                return isValid;
            }
            
            function validateTerms() {
                const isValid = checkbox.checked;
                termsError.classList.toggle('show', !isValid);
                return isValid;
            }
            
            function checkFormValidity() {
                const isNameValid = validateName();
                const isEmailValid = validateEmail();
                const isPasswordValid = validatePassword();
                const isTermsValid = validateTerms();
                
                submitBtn.disabled = !(isNameValid && isEmailValid && isPasswordValid && isTermsValid);
                
                if (!submitBtn.disabled) {
                    buttonText.textContent = 'Continue to Whisper Wall';
                }
            }
            
            // Add focus styles for keyboard navigation
            document.addEventListener('keyup', function(e) {
                if (e.key === 'Tab') {
                    const focusedElement = document.activeElement;
                    if (focusedElement.classList.contains('checkbox-label')) {
                        focusedElement.classList.add('focus-visible');
                    }
                }
            });
            
            document.addEventListener('click', function(e) {
                document.querySelectorAll('.checkbox-label').forEach(label => {
                    label.classList.remove('focus-visible');
                });
            });
        });