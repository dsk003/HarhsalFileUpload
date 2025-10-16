/**
 * File Upload Application
 * Vanilla JavaScript with Class-Based Architecture
 */

class FileUploadApp {
  constructor() {
    // State
    this.user = null;
    this.token = localStorage.getItem('token') || null;
    this.selectedFile = null;
    this.isUploading = false;
    
    // DOM Elements
    this.elements = {};
    
    // Initialize app
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    this.cacheElements();
    this.attachEventListeners();
    await this.checkAuth();
  }

  /**
   * Cache all DOM elements
   */
  cacheElements() {
    // Screens
    this.elements.loadingScreen = document.getElementById('loading-screen');
    this.elements.loginScreen = document.getElementById('login-screen');
    this.elements.signupScreen = document.getElementById('signup-screen');
    this.elements.mainApp = document.getElementById('main-app');

    // Login form
    this.elements.loginForm = document.getElementById('login-form');
    this.elements.loginUsername = document.getElementById('login-username');
    this.elements.loginPassword = document.getElementById('login-password');
    this.elements.loginError = document.getElementById('login-error');
    this.elements.loginSubmitBtn = document.getElementById('login-submit-btn');
    this.elements.switchToSignup = document.getElementById('switch-to-signup');

    // Signup form
    this.elements.signupForm = document.getElementById('signup-form');
    this.elements.signupUsername = document.getElementById('signup-username');
    this.elements.signupPassword = document.getElementById('signup-password');
    this.elements.signupConfirmPassword = document.getElementById('signup-confirm-password');
    this.elements.signupError = document.getElementById('signup-error');
    this.elements.signupSubmitBtn = document.getElementById('signup-submit-btn');
    this.elements.switchToLogin = document.getElementById('switch-to-login');

    // Main app
    this.elements.usernameDisplay = document.getElementById('username-display');
    this.elements.logoutBtn = document.getElementById('logout-btn');
    this.elements.premiumBtn = document.getElementById('premium-btn');
    this.elements.paymentMessage = document.getElementById('payment-message');

    // File upload
    this.elements.uploadArea = document.getElementById('upload-area');
    this.elements.fileInput = document.getElementById('file-input');
    this.elements.selectFileBtn = document.getElementById('select-file-btn');
    this.elements.uploadTitle = document.getElementById('upload-title');
    this.elements.uploadSubtitle = document.getElementById('upload-subtitle');
    this.elements.uploadBtn = document.getElementById('upload-btn');
    this.elements.uploadStatus = document.getElementById('upload-status');

    // File list
    this.elements.refreshBtn = document.getElementById('refresh-btn');
    this.elements.fileListContent = document.getElementById('file-list-content');
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Auth form submissions
    this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.elements.signupForm.addEventListener('submit', (e) => this.handleSignup(e));

    // Switch between login and signup
    this.elements.switchToSignup.addEventListener('click', () => this.showSignup());
    this.elements.switchToLogin.addEventListener('click', () => this.showLogin());

    // Logout
    this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());

    // Premium button
    this.elements.premiumBtn.addEventListener('click', () => this.handlePremiumClick());

    // File upload
    this.elements.selectFileBtn.addEventListener('click', () => this.elements.fileInput.click());
    this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.elements.uploadBtn.addEventListener('click', () => this.handleUpload());

    // Drag and drop
    this.elements.uploadArea.addEventListener('dragenter', (e) => this.handleDrag(e));
    this.elements.uploadArea.addEventListener('dragleave', (e) => this.handleDrag(e));
    this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDrag(e));
    this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

    // Refresh file list
    this.elements.refreshBtn.addEventListener('click', () => this.loadFiles());
  }

  /**
   * Check authentication status
   */
  async checkAuth() {
    if (!this.token) {
      this.showScreen('login');
      return;
    }

    try {
      const response = await this.apiRequest('/api/auth/verify', {
        method: 'GET'
      });

      this.user = response.user;
      this.showMainApp();
    } catch (error) {
      console.error('Auth verification failed:', error);
      this.token = null;
      localStorage.removeItem('token');
      this.showScreen('login');
    }
  }

  /**
   * Handle login form submission
   */
  async handleLogin(e) {
    e.preventDefault();
    
    const username = this.elements.loginUsername.value.trim();
    const password = this.elements.loginPassword.value;

    // Clear previous errors
    this.hideError('login');

    // Basic validation
    if (!username || !password) {
      this.showError('login', 'Please fill in all fields');
      return;
    }

    // Disable form
    this.setFormLoading('login', true);

    try {
      const response = await this.apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      this.user = response.user;
      this.token = response.session.access_token;
      localStorage.setItem('token', this.token);
      
      this.showMainApp();
    } catch (error) {
      this.showError('login', error.message || 'Failed to login');
    } finally {
      this.setFormLoading('login', false);
    }
  }

  /**
   * Handle signup form submission
   */
  async handleSignup(e) {
    e.preventDefault();
    
    const username = this.elements.signupUsername.value.trim();
    const password = this.elements.signupPassword.value;
    const confirmPassword = this.elements.signupConfirmPassword.value;

    // Clear previous errors
    this.hideError('signup');

    // Basic validation
    if (!username || !password || !confirmPassword) {
      this.showError('signup', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('signup', 'Passwords do not match');
      return;
    }

    // Disable form
    this.setFormLoading('signup', true);

    try {
      const response = await this.apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      // Check if session exists (it will be null if email confirmation is required)
      if (!response.session || !response.session.access_token) {
        this.showError('signup', 'Email confirmation is required. Please check your email or contact support.');
        return;
      }

      this.user = response.user;
      this.token = response.session.access_token;
      localStorage.setItem('token', this.token);
      
      this.showMainApp();
    } catch (error) {
      this.showError('signup', error.message || 'Failed to create account');
    } finally {
      this.setFormLoading('signup', false);
    }
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    try {
      await this.apiRequest('/api/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.user = null;
    this.token = null;
    localStorage.removeItem('token');
    this.showScreen('login');
  }

  /**
   * Handle premium button click
   */
  handlePremiumClick() {
    this.elements.paymentMessage.style.display = 'block';
    setTimeout(() => {
      this.elements.paymentMessage.style.display = 'none';
    }, 3000);
  }

  /**
   * Handle file selection
   */
  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.updateUploadUI();
    }
  }

  /**
   * Handle drag events
   */
  handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      this.elements.uploadArea.classList.add('drag-active');
    } else if (e.type === 'dragleave') {
      this.elements.uploadArea.classList.remove('drag-active');
    }
  }

  /**
   * Handle file drop
   */
  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.elements.uploadArea.classList.remove('drag-active');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      this.selectedFile = e.dataTransfer.files[0];
      this.updateUploadUI();
    }
  }

  /**
   * Update upload UI based on selected file
   */
  updateUploadUI() {
    if (this.selectedFile) {
      this.elements.uploadTitle.textContent = this.selectedFile.name;
      this.elements.uploadSubtitle.textContent = this.formatFileSize(this.selectedFile.size);
      this.elements.selectFileBtn.textContent = 'Choose Different File';
      this.elements.uploadBtn.style.display = 'flex';
    } else {
      this.elements.uploadTitle.textContent = 'Drag & drop your file here';
      this.elements.uploadSubtitle.textContent = 'or';
      this.elements.selectFileBtn.textContent = 'Select File';
      this.elements.uploadBtn.style.display = 'none';
    }
    this.elements.uploadStatus.style.display = 'none';
  }

  /**
   * Handle file upload
   */
  async handleUpload() {
    if (!this.selectedFile) {
      this.showUploadStatus('error', 'Please select a file first');
      return;
    }

    this.isUploading = true;
    this.elements.uploadBtn.disabled = true;
    this.elements.uploadBtn.innerHTML = '<span class="spinner"></span> Uploading...';
    this.hideUploadStatus();

    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      const data = await response.json();
      
      this.showUploadStatus('success', `File "${data.file.name}" uploaded successfully!`);
      
      // Reset file selection
      this.selectedFile = null;
      this.elements.fileInput.value = '';
      this.updateUploadUI();
      
      // Refresh file list
      this.loadFiles();
    } catch (error) {
      this.showUploadStatus('error', error.message || 'Failed to upload file');
    } finally {
      this.isUploading = false;
      this.elements.uploadBtn.disabled = false;
      this.elements.uploadBtn.innerHTML = 'Upload File';
    }
  }

  /**
   * Load files from server
   */
  async loadFiles() {
    this.elements.fileListContent.innerHTML = `
      <div class="loading">
        <div class="spinner-large"></div>
        <p>Loading files...</p>
      </div>
    `;

    try {
      const response = await this.apiRequest('/api/files', {
        method: 'GET'
      });

      if (response.files.length === 0) {
        this.elements.fileListContent.innerHTML = `
          <div class="empty-state">
            <p>No files uploaded yet</p>
            <p class="empty-subtitle">Upload your first file to get started</p>
          </div>
        `;
      } else {
        this.renderFiles(response.files);
      }
    } catch (error) {
      this.elements.fileListContent.innerHTML = `
        <div class="error-state">
          <p>Failed to load files</p>
          <button onclick="app.loadFiles()" class="retry-button">Retry</button>
        </div>
      `;
    }
  }

  /**
   * Render files in the file list
   */
  renderFiles(files) {
    const filesHTML = files.map(file => `
      <div class="file-card">
        <div class="file-icon">${this.getFileIcon(file.name)}</div>
        <div class="file-info">
          <h3 class="file-name" title="${file.name}">${file.name}</h3>
          <p class="file-meta">
            ${this.formatFileSize(file.metadata?.size)}
            ${file.created_at ? ` • ${this.formatDate(file.created_at)}` : ''}
          </p>
        </div>
        <a 
          href="${file.url}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="view-button"
          title="View file"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-width="2"/>
            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </a>
      </div>
    `).join('');

    this.elements.fileListContent.innerHTML = `
      <div class="files-grid">
        ${filesHTML}
      </div>
    `;
  }

  /**
   * Show main application after login
   */
  showMainApp() {
    this.elements.usernameDisplay.textContent = this.user.username;
    this.showScreen('main');
    this.loadFiles();
  }

  /**
   * Show login screen
   */
  showLogin() {
    this.showScreen('login');
    this.elements.loginForm.reset();
    this.hideError('login');
  }

  /**
   * Show signup screen
   */
  showSignup() {
    this.showScreen('signup');
    this.elements.signupForm.reset();
    this.hideError('signup');
  }

  /**
   * Show a specific screen
   */
  showScreen(screen) {
    this.elements.loadingScreen.style.display = 'none';
    this.elements.loginScreen.style.display = 'none';
    this.elements.signupScreen.style.display = 'none';
    this.elements.mainApp.style.display = 'none';

    switch (screen) {
      case 'loading':
        this.elements.loadingScreen.style.display = 'flex';
        break;
      case 'login':
        this.elements.loginScreen.style.display = 'flex';
        break;
      case 'signup':
        this.elements.signupScreen.style.display = 'flex';
        break;
      case 'main':
        this.elements.mainApp.style.display = 'block';
        break;
    }
  }

  /**
   * Show error message
   */
  showError(form, message) {
    const errorElement = form === 'login' ? this.elements.loginError : this.elements.signupError;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  /**
   * Hide error message
   */
  hideError(form) {
    const errorElement = form === 'login' ? this.elements.loginError : this.elements.signupError;
    errorElement.style.display = 'none';
  }

  /**
   * Set form loading state
   */
  setFormLoading(form, isLoading) {
    const submitBtn = form === 'login' ? this.elements.loginSubmitBtn : this.elements.signupSubmitBtn;
    const inputs = form === 'login' 
      ? [this.elements.loginUsername, this.elements.loginPassword]
      : [this.elements.signupUsername, this.elements.signupPassword, this.elements.signupConfirmPassword];

    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading 
      ? (form === 'login' ? 'Signing in...' : 'Creating account...')
      : (form === 'login' ? 'Sign In' : 'Create Account');

    inputs.forEach(input => input.disabled = isLoading);
  }

  /**
   * Show upload status message
   */
  showUploadStatus(type, message) {
    this.elements.uploadStatus.className = `status-message ${type}`;
    this.elements.uploadStatus.textContent = `${type === 'success' ? '✓' : '✗'} ${message}`;
    this.elements.uploadStatus.style.display = 'block';
  }

  /**
   * Hide upload status message
   */
  hideUploadStatus() {
    this.elements.uploadStatus.style.display = 'none';
  }

  /**
   * Make API request with authentication
   */
  async apiRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return await response.json();
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  /**
   * Get file icon based on extension
   */
  getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return '🖼️';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension)) {
      return '🎥';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    } else if (['txt', 'doc', 'docx'].includes(extension)) {
      return '📝';
    } else if (['zip', 'rar', '7z'].includes(extension)) {
      return '📦';
    } else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
      return '🎵';
    }
    return '📁';
  }
}

// Initialize the app when DOM is ready
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new FileUploadApp();
  });
} else {
  app = new FileUploadApp();
}

