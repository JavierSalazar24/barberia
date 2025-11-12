// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle')
const navLinks = document.querySelector('.nav-links')

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active')
})

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active')
  })
})

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute('href'))
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
})

// Scroll Reveal Animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
    }
  })
}, observerOptions)

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))

// Policy Links (placeholder alerts)
document.getElementById('privacyLink').addEventListener('click', (e) => {
  e.preventDefault()
  alert(
    'Política de Privacidad:\n\nEn Barbería Javs respetamos tu privacidad. Los datos personales recopilados se utilizan únicamente para gestionar reservas y mejorar nuestros servicios. No compartimos tu información con terceros.'
  )
})

document.getElementById('termsLink').addEventListener('click', (e) => {
  e.preventDefault()
  alert(
    'Términos y Condiciones:\n\n1. Las reservas deben confirmarse con 24 horas de anticipación.\n2. Cancelaciones con menos de 2 horas de anticipación pueden tener cargo.\n3. Los precios están sujetos a cambios sin previo aviso.\n4. Nos reservamos el derecho de admisión.'
  )
})

// Lazy Loading for Images
if ('loading' in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[loading="lazy"]')
  images.forEach((img) => {
    img.src = img.src
  })
} else {
  // Fallback for browsers that don't support lazy loading
  const script = document.createElement('script')
  script.src =
    'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js'
  document.body.appendChild(script)
}
