function handleSignup(event) {
    event.preventDefault();
    
    const userData = {
        id: 'user_' + Date.now(),
        fullName: document.getElementById('signupName').value,
        email: document.getElementById('signupEmail').value,
        phone: document.getElementById('signupPhone').value,
        password: document.getElementById('signupPassword').value,
        signupDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionPlan: 'None',
        accessEndTime: null,
        status: 'Active'
    };

    // Store user data
    let users = JSON.parse(localStorage.getItem('i2s_users') || '[]');
    users.push(userData);
    localStorage.setItem('i2s_users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(userData));

    // Close signup modal and redirect
    closeSignupModal();
    window.location.href = 'dashboard.html';
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    let users = JSON.parse(localStorage.getItem('i2s_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('i2s_users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Close login modal and redirect
        closeLoginModal();
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials');
    }
}

function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    const newPassword = document.getElementById('newPassword').value;

    let users = JSON.parse(localStorage.getItem('i2s_users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
        // Update password
        users[userIndex].password = newPassword;
        users[userIndex].lastLogin = new Date().toISOString();
        localStorage.setItem('i2s_users', JSON.stringify(users));

        alert('Password reset successful! Please login with your new password.');
        closeResetModal();
        openLoginModal();
    } else {
        alert('Email not found');
    }
}
