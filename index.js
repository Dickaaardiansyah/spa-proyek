import { router, setupRoutes } from './routes.js';
document.addEventListener('DOMContentLoaded', function () {
  setupRoutes();
  checkAuthStatus();
  initializeLoginPage(); // Always initialize login components regardless of auth status
  updateActiveNavLink(); // Initialize active nav link highlighting
  checkAuthStatus();
});

// Check authentication status and update UI accordingly
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('heroSection')?.classList.add('hidden');
    document.getElementById('dashboard')?.classList.remove('hidden');
    document.getElementById('openLoginDialog')?.classList.add('hidden');
    document.getElementById('logoutBtn')?.classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(link => {
    initializeDashboard();
    link.classList.remove('auth-required-hidden');
    });
    
  } else {
    document.getElementById('heroSection')?.classList.remove('hidden');
    document.getElementById('dashboard')?.classList.add('hidden');
    document.getElementById('openLoginDialog')?.classList.remove('hidden');
    document.getElementById('logoutBtn')?.classList.add('hidden');
    document.querySelectorAll('.nav-link.auth-required').forEach(link => {
      link.classList.add('auth-required-hidden');
    });
  }

  function updateActiveNavLink() {
    const currentPath = router.getPath();
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPath = link.getAttribute('href').slice(1); // Remove the #
      if (linkPath === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Add this event listener to update active link when route changes
  window.addEventListener('hashchange', updateActiveNavLink);
}

function initializeLoginPage() {
  const dialog = document.getElementById('loginDialog');
  const openLoginButton = document.getElementById('openLoginDialog');
  const openRegisterButton = document.getElementById('openRegisterDialog');
  const closeButton = document.getElementById('closeDialog');
  const closeButton2 = document.getElementById('closeDialog2');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const switchToRegister = document.getElementById('switchToRegister');
  const switchToLogin = document.getElementById('switchToLogin');

  // Reset any previous event listeners to prevent duplicates
  if (openLoginButton) {
    const newOpenLoginButton = openLoginButton.cloneNode(true);
    openLoginButton.parentNode.replaceChild(newOpenLoginButton, openLoginButton);
    newOpenLoginButton.addEventListener('click', () => {
      dialog.showModal();
      showForm(loginForm, registerForm);
    });
  }

  if (openRegisterButton) {
    const newOpenRegisterButton = openRegisterButton.cloneNode(true);
    openRegisterButton.parentNode.replaceChild(newOpenRegisterButton, openRegisterButton);
    newOpenRegisterButton.addEventListener('click', () => {
      dialog.showModal();
      showForm(registerForm, loginForm);
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', () => dialog.close());
  }

  if (closeButton2) {
    closeButton2.addEventListener('click', () => dialog.close());
  }

  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(registerForm, loginForm);
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showForm(loginForm, registerForm);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog && dialog.open) {
      dialog.close();
    }
  });

  // Ensure forms are in correct initial state
  if (loginForm && registerForm) {
    // Make sure they start with proper visibility
    loginForm.hidden = true;
    registerForm.hidden = true;
    loginForm.classList.remove('show', 'hide');
    registerForm.classList.remove('show', 'hide');
  }

  // Ensure loading overlay exists
  let loadingOverlay = document.getElementById('loadingOverlay');
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.innerHTML = `<div class="loading-spinner"></div>`;
    document.body.appendChild(loadingOverlay);
    loadingOverlay.style.display = 'none';
  }

  // Handle Register
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
}

// Better form transition handling
function showForm(show, hide) {
  if (!show || !hide) return;

  // Reset any previous animations/states
  show.classList.remove('show', 'hide');
  hide.classList.remove('show', 'hide');

  // Handle transition with animation
  hide.classList.add('hide');
  
  setTimeout(() => {
    hide.hidden = true;
    hide.setAttribute("aria-hidden", "true");

    show.hidden = false;
    show.classList.add('show');
    show.setAttribute("aria-hidden", "false");
    
    const firstInput = show.querySelector('input');
    if (firstInput) firstInput.focus();
  }, 200);
}

// Show loading overlay function
function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
  }
}

// Hide loading overlay function
function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

// Handle registration form submission
async function handleRegister(e) {
  e.preventDefault();
  
  const usernameInput = document.getElementById('regUsername');
  const emailInput = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');
  const registerErrorDiv = document.getElementById('registerError');
  
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Reset previous error state
  registerErrorDiv.textContent = '';
  registerErrorDiv.classList.remove('show-error');
  usernameInput.classList.remove('input-error');
  emailInput.classList.remove('input-error');
  passwordInput.classList.remove('input-error');

  let hasError = false;
  let errorMessage = '';

  if (!username) {
    usernameInput.classList.add('input-error');
    errorMessage = 'Username harus diisi.';
    hasError = true;
  }
  
  if (!email.includes('@')) {
    emailInput.classList.add('input-error');
    errorMessage = errorMessage ? errorMessage + ' Email harus valid.' : 'Email harus valid.';
    hasError = true;
  }
  
  if (password.length < 8) {
    passwordInput.classList.add('input-error');
    errorMessage = errorMessage ? errorMessage + ' Password minimal 8 karakter.' : 'Password minimal 8 karakter.';
    hasError = true;
  }

  if (hasError) {
    registerErrorDiv.textContent = errorMessage;
    registerErrorDiv.classList.add('show-error');
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.classList.add('shake');
      setTimeout(() => {
        registerForm.classList.remove('shake');
      }, 500);
    }
    return;
  }

  showLoading();
  
  try {
    const response = await fetch('https://story-api.dicoding.dev/v1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, email, password }),
    });

    const data = await response.json();
    hideLoading();
    
    if (!data.error) {
      // Show success message and switch to login form
      registerErrorDiv.textContent = data.message || 'Registrasi berhasil! Silakan login.';
      registerErrorDiv.style.color = '#27ae60';
      registerErrorDiv.classList.add('show-error');
      
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      setTimeout(() => {
        showForm(loginForm, registerForm);
      }, 1500);
    } else {
      // Show error message
      registerErrorDiv.textContent = data.message || 'Gagal melakukan registrasi.';
      registerErrorDiv.classList.add('show-error');
      const registerForm = document.getElementById('registerForm');
      if (registerForm) {
        registerForm.classList.add('shake');
        setTimeout(() => {
          registerForm.classList.remove('shake');
        }, 500);
      }
    }
  } catch (error) {
    hideLoading();
    console.error('Register error:', error);
    registerErrorDiv.textContent = 'Terjadi kesalahan saat registrasi. Coba lagi nanti.';
    registerErrorDiv.classList.add('show-error');
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();

  const dialog = document.getElementById('loginDialog');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const loginErrorDiv = document.getElementById('loginError');
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Reset previous error state
  loginErrorDiv.textContent = '';
  loginErrorDiv.classList.remove('show-error');
  emailInput.classList.remove('input-error');
  passwordInput.classList.remove('input-error');

  if (!email || password.length < 1) {
    loginErrorDiv.textContent = 'Email dan password wajib diisi.';
    loginErrorDiv.classList.add('show-error');
    if (!email) emailInput.classList.add('input-error');
    if (password.length < 1) passwordInput.classList.add('input-error');
    return;
  }

  dialog.close();

  // Show loading indicator with SweetAlert
  Swal.fire({
    title: 'Loading...',
    html: 'Sedang memproses login',
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false
  });

  try {
    const response = await fetch('https://story-api.dicoding.dev/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.error) {
      localStorage.setItem('token', data.loginResult.token);
      localStorage.setItem('name', data.loginResult.name);
      localStorage.setItem('userId', data.loginResult.userId);

      // Close the loading indicator
      Swal.close();

      // Show success message with SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Anda akan masuk ke dashboard...',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        checkAuthStatus();
        router.navigateTo('/dashboard'); // Update UI based on authentication status
      });
      
    } else {
      // Close loading indicator
      Swal.close();
      
      // Show error message in the form
      dialog.showModal();
      loginErrorDiv.textContent = data.message || 'Username atau password tidak sesuai';
      loginErrorDiv.classList.add('show-error');
      emailInput.classList.add('input-error');
      passwordInput.classList.add('input-error');
      
      // Shake animation for better feedback
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.classList.add('shake');
        setTimeout(() => {
          loginForm.classList.remove('shake');
        }, 500);
      }
    }
  } catch (error) {
    // Close loading indicator
    Swal.close();
    
    console.error('Login error:', error);
    dialog.showModal();
    loginErrorDiv.textContent = 'Terjadi kesalahan saat login. Coba lagi nanti.';
    loginErrorDiv.classList.add('show-error');
  }
}

function initializeDashboard() {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');

  if (!token) {
    router.navigateTo('/'); // Ensure UI is updated properly
    return;
  }

  const usernameElement = document.getElementById('username');
  if (usernameElement && name) {
    usernameElement.textContent = name;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    // Remove any existing event listeners
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    newLogoutBtn.addEventListener('click', handleLogout);
  }

  // Initialize map
  initializeMap();
  
  // Initialize camera and audio features
  initializeMediaFeatures();
  
  // Get stories
  fetchStories();
  
  // Setup story form submission
  setupStoryForm();
  
  // Setup modal functionality
  setupModal();
}

function handleLogout() {
  Swal.fire({
    title: 'Logout',
    text: 'Apakah Anda yakin ingin keluar?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, Logout',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      showLoading();
      logoutFromServer()
        .then(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('name');
          localStorage.removeItem('userId');
          hideLoading();
          
          Swal.fire({
            icon: 'success',
            title: 'Logout Berhasil!',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            router.navigateTo('/'); // Navigate to home page
            checkAuthStatus(); // Update UI based on authentication status
          });
        })
        .catch((error) => {
          hideLoading();
          console.error('Error during logout:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Terjadi kesalahan saat logout. Coba lagi nanti.'
          });
        });
    }
  });
}

async function logoutFromServer() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Note: This endpoint might not exist, check API documentation
    const response = await fetch('https://story-api.dicoding.dev/v1/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Logout response:', data.message);
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    // If logout API doesn't exist, we'll still continue with clearing local storage
    return { message: 'Logged out locally' };
  }
}

// Map initialization and functionality
let map = null;
let storiesMap = null;
let userMarker = null;
let markers = [];

function initializeMap() {
  // Initialize location map for new story
  map = L.map('map').setView([-6.200000, 106.816666], 13); // Default to Jakarta
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Initialize stories map
  storiesMap = L.map('storiesMap').setView([-6.200000, 106.816666], 5); // Wider view for Indonesia
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(storiesMap);

  // Get current location button
  const getCurrentLocationBtn = document.getElementById('getCurrentLocationBtn');
  if (getCurrentLocationBtn) {
    getCurrentLocationBtn.addEventListener('click', getUserLocation);
  }

  // Make maps responsive when container becomes visible
  setTimeout(() => {
    map.invalidateSize();
    storiesMap.invalidateSize();
  }, 100);
}

window.initializeDashboard = initializeDashboard;
window.fetchStories = fetchStories;
window.checkAuthStatus = checkAuthStatus;
  
  function getUserLocation() {
    const locationStatus = document.getElementById('locationStatus');
    
    if (!navigator.geolocation) {
      locationStatus.textContent = 'Geolocation tidak didukung oleh browser Anda';
      return;
    }
    
    locationStatus.textContent = 'Mencari lokasi Anda...';
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lon;
        
        if (userMarker) {
          map.removeLayer(userMarker);
        }
        
        userMarker = L.marker([lat, lon]).addTo(map);
        map.setView([lat, lon], 15);
        
        locationStatus.textContent = `Lokasi ditemukan: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        locationStatus.style.color = '#27ae60';
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak oleh pengguna.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Waktu permintaan lokasi habis.';
            break;
          default:
            errorMessage = 'Terjadi kesalahan saat mendapatkan lokasi.';
        }
        
        locationStatus.textContent = errorMessage;
        locationStatus.style.color = '#e74c3c';
      }
    );
  }
  
  // Camera and audio recording functionality
  function initializeMediaFeatures() {
    let mediaStream = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let capturedImage = null;
    
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const cameraPreview = document.getElementById('cameraPreview');
    const cameraVideo = document.getElementById('cameraVideo');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const captureCanvas = document.getElementById('captureCanvas');
    
    const recordAudioBtn = document.getElementById('recordAudioBtn');
    const audioRecorder = document.getElementById('audioRecorder');
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const audioPreview = document.getElementById('audioPreview');
    
    // Camera functionality
    if (takePhotoBtn) {
      takePhotoBtn.addEventListener('click', async () => {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          cameraVideo.srcObject = mediaStream;
          cameraPreview.classList.remove('hidden');
          
        } catch (error) {
          console.error('Error accessing camera:', error);
          Swal.fire({
            icon: 'error',
            title: 'Akses Kamera Gagal',
            text: 'Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.'
          });
        }
      });
    }
    
    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        const context = captureCanvas.getContext('2d');
        captureCanvas.width = cameraVideo.videoWidth;
        captureCanvas.height = cameraVideo.videoHeight;
        context.drawImage(cameraVideo, 0, 0, captureCanvas.width, captureCanvas.height);
        
        capturedImage = captureCanvas.toDataURL('image/jpeg');
        
        // Create a blob for form submission
        captureCanvas.toBlob((blob) => {
          const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });
          
          // Create a new FileList-like object and assign it to the file input
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          document.getElementById('photo').files = dataTransfer.files;
          
          // Close camera
          closeCamera();
          
          // Show preview of captured image
          Swal.fire({
            title: 'Foto Diambil',
            imageUrl: capturedImage,
            imageAlt: 'Captured photo',
            confirmButtonText: 'OK'
          });
        }, 'image/jpeg');
      });
    }
    
    if (closeCameraBtn) {
      closeCameraBtn.addEventListener('click', closeCamera);
    }
    
    function closeCamera() {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
      }
      cameraPreview.classList.add('hidden');
    }
    
    // Audio recording functionality
    if (recordAudioBtn) {
      recordAudioBtn.addEventListener('click', () => {
        audioRecorder.classList.toggle('hidden');
      });
    }
    
    if (startRecordingBtn) {
      startRecordingBtn.addEventListener('click', async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStream = stream;
          
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];
          
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };
          
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPreview.src = audioUrl;
            audioPlayer.classList.remove('hidden');
            
            // Create a File object from the Blob
            const audioFile = new File([audioBlob], "audio-note.wav", { type: "audio/wav" });
            // We'll need to handle this in the form submission
          };
          
          mediaRecorder.start();
          startRecordingBtn.disabled = true;
          stopRecordingBtn.disabled = false;
          
          Swal.fire({
            icon: 'info',
            title: 'Merekam...',
            text: 'Rekaman audio sedang berlangsung.',
            showConfirmButton: false,
            timer: 2000
          });
          
        } catch (error) {
          console.error('Error accessing microphone:', error);
          Swal.fire({
            icon: 'error',
            title: 'Akses Mikrofon Gagal',
            text: 'Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin.'
          });
        }
      });
    }
    
    if (stopRecordingBtn) {
      stopRecordingBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          mediaStream.getTracks().forEach(track => track.stop());
          
          startRecordingBtn.disabled = false;
          stopRecordingBtn.disabled = true;
          
          Swal.fire({
            icon: 'success',
            title: 'Rekaman Selesai',
            text: 'Audio berhasil direkam.',
            showConfirmButton: false,
            timer: 1500
          });
        }
      });
    }
  }
  
  // Modal setup for story details
  function setupModal() {
    const modal = document.getElementById('storyDetailModal');
    const closeModal = document.getElementById('closeModal');
    
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    
    // Close when clicking outside the modal content
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    });
  }
  
  // Show story detail in modal
  async function showStoryDetail(storyId) {
    const token = localStorage.getItem('token');
    if (!token || !storyId) return;
    
    const modal = document.getElementById('storyDetailModal');
    const contentDiv = document.getElementById('storyDetailContent');
    
    if (!modal || !contentDiv) return;
    
    showLoading();
    
    try {
      const response = await fetch(`https://story-api.dicoding.dev/v1/stories/${storyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      hideLoading();
      
      if (!data.error && data.story) {
        const story = data.story;
        const createdDate = new Date(story.createdAt).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        contentDiv.innerHTML = `
          <div class="story-detail">
            <img src="${story.photoUrl}" alt="Story photo" class="detail-photo">
            <h2>${story.name}</h2>
            <p class="detail-date">${createdDate}</p>
            <p class="detail-desc">${story.description}</p>
            ${story.lat && story.lon ? `
              <div class="detail-location">
                <h3>Lokasi</h3>
                <p>📍 ${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}</p>
                <div id="detailMap" class="map-container"></div>
              </div>
            ` : ''}
          </div>
        `;
        
        modal.style.display = 'block';
        
        // Initialize map in modal if location is available
        if (story.lat && story.lon) {
          setTimeout(() => {
            const detailMap = L.map('detailMap').setView([story.lat, story.lon], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(detailMap);
            
            L.marker([story.lat, story.lon]).addTo(detailMap);
            detailMap.invalidateSize();
          }, 100);
        }
        
      } else {
        throw new Error(data.message || 'Gagal memuat detail cerita');
      }
      
    } catch (error) {
      hideLoading();
      console.error('Error fetching story detail:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || 'Terjadi kesalahan saat memuat detail cerita.'
      });
    }
  }
  
  // Story form submission
  function setupStoryForm() {
    const storyForm = document.getElementById('storyForm');
    
    if (storyForm) {
      storyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire({
            icon: 'error',
            title: 'Autentikasi Gagal',
            text: 'Silakan login kembali.'
          });
          return;
        }
        
        const description = document.getElementById('description').value;
        const photoInput = document.getElementById('photo');
        const lat = document.getElementById('lat').value;
        const lon = document.getElementById('lon').value;
        
        if (!description) {
          Swal.fire({
            icon: 'warning',
            title: 'Form Tidak Lengkap',
            text: 'Deskripsi harus diisi.'
          });
          return;
        }
        
        if (!photoInput.files[0]) {
          Swal.fire({
            icon: 'warning',
            title: 'Form Tidak Lengkap',
            text: 'Foto harus dipilih atau diambil.'
          });
          return;
        }
        
        showLoading();
        
        try {
          const formData = new FormData();
          formData.append('description', description);
          formData.append('photo', photoInput.files[0]);
          
          if (lat && lon) {
            formData.append('lat', lat);
            formData.append('lon', lon);
          }
          
          const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          const result = await response.json();
          hideLoading();
          
          if (!result.error) {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil!',
              text: 'Cerita berhasil diunggah.'
            }).then(() => {
              storyForm.reset();
              if (userMarker) {
                map.removeLayer(userMarker);
                userMarker = null;
              }
              document.getElementById('locationStatus').textContent = '';
              document.getElementById('audioPlayer').classList.add('hidden');
              
              // Refresh stories
              fetchStories();
            });
          } else {
            throw new Error(result.message || 'Gagal mengunggah cerita');
          }
          
        } catch (error) {
          hideLoading();
          console.error('Error submitting story:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message || 'Terjadi kesalahan saat mengunggah cerita.'
          });
        }
      });
    }
  }
  
  // Fetch and display stories
  async function fetchStories() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const storiesContainer = document.getElementById('storiesContainer');
    if (!storiesContainer) return;
    
    showLoading();
    
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      hideLoading();
      
      if (!data.error) {
        displayStories(data.listStory);
        updateStoriesMap(data.listStory);
      } else {
        throw new Error(data.message || 'Gagal memuat cerita');
      }
      
    } catch (error) {
      hideLoading();
      console.error('Error fetching stories:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || 'Terjadi kesalahan saat memuat cerita.'
      });
    }
  }
  
  function displayStories(stories) {
    const storiesContainer = document.getElementById('storiesContainer');
    if (!storiesContainer) return;
    
    storiesContainer.innerHTML = '<h2>Cerita Terbaru</h2>';
    
    if (stories.length === 0) {
      storiesContainer.innerHTML += '<p>Belum ada cerita. Jadilah yang pertama!</p>';
      return;
    }
    
    const storiesGrid = document.createElement('div');
    storiesGrid.className = 'stories-grid';
    
    stories.forEach(story => {
      const storyCard = document.createElement('div');
      storyCard.className = 'story-card';
      storyCard.dataset.id = story.id;
      
      const photoDate = new Date(story.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      storyCard.innerHTML = `
  <div class="story-photo-container">
    <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" class="story-photo">
  </div>
  <div class="story-info">
    <h3>${story.name}</h3>
    <p class="story-date">${photoDate}</p>
    <p class="story-desc">${story.description.length > 100 
      ? story.description.substring(0, 100) + '...' 
      : story.description}</p>
    ${story.lat && story.lon 
      ? `<p class="story-location">📍 Lokasi tersedia</p>` 
      : `<p class="story-location">📍 Lokasi tidak tersedia</p>`}
    <button class="view-story-btn" data-id="${story.id}">Lihat Detail</button>
  </div>
`;

      
      storiesGrid.appendChild(storyCard);
    });
    
    storiesContainer.appendChild(storiesGrid);
    
    // Add click event for view buttons
    const viewButtons = document.querySelectorAll('.view-story-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const storyId = button.dataset.id;
        showStoryDetail(storyId);
      });
    });
    
    // Add click event for story cards (clicking anywhere on the card shows details)
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicked on the button (to avoid double events)
        if (!e.target.classList.contains('view-story-btn')) {
          const storyId = card.dataset.id;
          showStoryDetail(storyId);
        }
      });
    });
  }
  
  function updateStoriesMap(stories) {
    // Clear previous markers
    markers.forEach(marker => storiesMap.removeLayer(marker));
    markers = [];
    
    // Add new markers
    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon])
          .addTo(storiesMap)
          .bindPopup(`
            <div class="map-popup">
              <h4>${story.name}</h4>
              <img src="${story.photoUrl}" alt="Story photo" class="popup-img">
              <p>${story.description.substring(0, 50)}${story.description.length > 50 ? '...' : ''}</p>
              <button class="popup-view-btn" data-id="${story.id}">Detail</button>
            </div>
          `);
        
        // Add click event to popup
        marker.on('popupopen', function() {
          const button = document.querySelector('.popup-view-btn');
          if (button) {
            button.addEventListener('click', function() {
              showStoryDetail(this.dataset.id);
            });
          }
        });
        
        markers.push(marker);
      }
    });
    
    // Adjust map view to show all markers if any
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      storiesMap.fitBounds(group.getBounds().pad(0.1));
    }
    
    // Force map to refresh
    storiesMap.invalidateSize();
  }

  export { initializeDashboard, fetchStories, checkAuthStatus };