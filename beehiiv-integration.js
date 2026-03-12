// Beehiiv Newsletter Integration for Girly Being
// Replaces the Supabase newsletter with direct Beehiiv embed

const BEEHIIV_API_KEY = 'your-beehiiv-api-key'; // Get from Beehiiv dashboard
const BEEHIIV_PUBLICATION_ID = 'itsagirlthing'; // From your URL: itsagirlthing.beehiiv.com

// Beehiiv embed form integration
document.addEventListener('DOMContentLoaded', () => {
  
  // Replace all newsletter forms with Beehiiv embed
  integrateBeehiivForms();
  
});

function integrateBeehiivForms() {
  // Find all newsletter signup locations
  const forms = [
    { selector: '.nl-form-wrap', type: 'hero' },
    { selector: '.inl-right', type: 'inline' },
    { selector: '.sn-form', type: 'sidebar' },
    { selector: '.bc-right', type: 'bottom' }
  ];
  
  forms.forEach(({ selector, type }) => {
    const container = document.querySelector(selector);
    if (container) {
      replaceWithBeehiivForm(container, type);
    }
  });
}

function replaceWithBeehiivForm(container, type) {
  // Clear existing content
  container.innerHTML = '';
  
  // Create Beehiiv-style form
  const formHTML = `
    <form class="beehiiv-form" action="https://api.beehiiv.com/v2/subscribers" method="POST" data-beehiiv-form="true">
      <input type="email" name="email" placeholder="your@email.com" required class="beehiiv-input">
      <input type="hidden" name="publication_id" value="${BEEHIIV_PUBLICATION_ID}">
      <button type="submit" class="beehiiv-btn">Subscribe — it's free ✿</button>
    </form>
    <div class="beehiiv-message" style="display:none;"></div>
  `;
  
  container.innerHTML = formHTML;
  
  // Add styling
  addBeehiivStyles();
  
  // Handle form submission
  const form = container.querySelector('.beehiiv-form');
  const messageDiv = container.querySelector('.beehiiv-message');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.querySelector('input[name="email"]').value;
    const btn = form.querySelector('.beehiiv-btn');
    
    // Show loading
    btn.textContent = 'Subscribing...';
    btn.disabled = true;
    
    try {
      // Using Beehiiv's embed approach - redirect to subscribe page
      // Or use their API if you have the key
      const subscribeUrl = `https://itsagirlthing.beehiiv.com/subscribe?email=${encodeURIComponent(email)}`;
      
      // Open in new tab or redirect
      window.open(subscribeUrl, '_blank');
      
      // Show success message
      showMessage(messageDiv, 'Opening subscription page... Check your email!', 'success');
      form.reset();
      
    } catch (error) {
      showMessage(messageDiv, 'Something went wrong. Please try again.', 'error');
      console.error('Newsletter error:', error);
    } finally {
      btn.textContent = 'Subscribe — it\'s free ✿';
      btn.disabled = false;
    }
  });
}

function showMessage(element, message, type) {
  element.textContent = message;
  element.style.display = 'block';
  element.style.padding = '12px 20px';
  element.style.borderRadius = '8px';
  element.style.marginTop = '12px';
  element.style.fontFamily = 'Quicksand, sans-serif';
  element.style.fontSize = '14px';
  element.style.fontWeight = '600';
  element.style.animation = 'fadeIn 0.3s ease';
  
  if (type === 'success') {
    element.style.background = 'linear-gradient(135deg, #27AE60, #2ECC71)';
    element.style.color = 'white';
  } else {
    element.style.background = '#E74C3C';
    element.style.color = 'white';
  }
  
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}

function addBeehiivStyles() {
  if (document.getElementById('beehiiv-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'beehiiv-styles';
  styles.textContent = `
    .beehiiv-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .beehiiv-input {
      padding: 12px 16px;
      border-radius: 9px;
      border: 1.5px solid rgba(201, 100, 128, 0.2);
      background: rgba(255, 255, 255, 0.9);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .beehiiv-input:focus {
      border-color: var(--rose, #C96480);
      box-shadow: 0 0 0 3px rgba(201, 100, 128, 0.08);
    }
    
    .beehiiv-input::placeholder {
      color: #9A7882;
    }
    
    .beehiiv-btn {
      padding: 12px;
      border-radius: 9px;
      border: none;
      background: linear-gradient(135deg, #E8849A, #C96480);
      color: white;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .beehiiv-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(201, 100, 128, 0.3);
    }
    
    .beehiiv-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  
  document.head.appendChild(styles);
}

// Alternative: Direct iframe embed from Beehiiv
function embedBeehiivIframe() {
  // If Beehiiv provides an embed code like:
  // <iframe src="https://embeds.beehiiv.com/..." ...></iframe>
  // Use this instead
  
  const embedCode = `
    <iframe 
      src="https://embeds.beehiiv.com/your-publication-id" 
      data-test-id="beehiiv-embed"
      width="100%"
      height="320"
      frameborder="0"
      scrolling="no"
      style="border-radius: 4px; border: 2px solid #e5e7eb; margin: 0; background-color: transparent;"
    ></iframe>
  `;
  
  // Find containers and replace
  const containers = document.querySelectorAll('.nl-form-wrap, .inl-right');
  containers.forEach(container => {
    container.innerHTML = embedCode;
  });
}
