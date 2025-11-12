// Inicializar Supabase
const supabase = window.supabase.createClient(
  'https://tanlxkccrqdejovluzxm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhbmx4a2NjcnFkZWpvdmx1enhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDM2NTQsImV4cCI6MjA3ODQ3OTY1NH0.mQSJTIG5IlUpKMj0WL0yO_7A2aYCUhhx3XqZ6jwN2JE'
)

let serviciosData = []
let galeriaData = []
let serviciosCarouselIndex = 0
let galeriaCarouselIndex = 0
let currentPage = 0
const PAGE_SIZE = 6

// Cache de elementos (se asume que existen en el DOM)
const gridEl = document.getElementById('servicesGrid')
const prevBtn = document.getElementById('servicesPrev')
const nextBtn = document.getElementById('servicesNext')
const carouselEl = document.getElementById('servicesCarousel')

// Cargar servicios desde Supabase
async function loadServicios() {
  const result = await supabase
    .from('servicios')
    .select('id,nombre,precio,descripcion,duracion,orden,activo') // selecciona sólo lo necesario

  console.log(result)

  if (result.error) {
    console.error('Error al cargar servicios:', result.error)
    return
  }

  serviciosData = Array.isArray(result.data) ? result.data : []
  currentPage = 0
  renderServiciosPage()
  loadServiciosEnForm() // conserva tu llamada existente si la tienes
}

// Renderiza SOLO la página actual (6 items)
function renderServiciosPage() {
  if (!gridEl) return

  const total = serviciosData.length
  if (total === 0) {
    gridEl.innerHTML = `
      <div class="service-card">
        <h3>No hay servicios activos</h3>
      </div>`
    updateNav(1)
    return
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  // Clamp de página por si cambia el total dinámicamente
  currentPage = Math.min(Math.max(0, currentPage), totalPages - 1)

  const start = currentPage * PAGE_SIZE
  const end = start + PAGE_SIZE
  const slice = serviciosData.slice(start, end)

  // --- Animación de salida ---
  gridEl.classList.add('fade-out-carrousel')

  setTimeout(() => {
    gridEl.innerHTML = slice
      .map(
        (s) => `
      <div class="service-card">
        <h3>${s.nombre}</h3>
        <p class="service-price">$${Number(s.precio).toLocaleString(
          'es-MX'
        )}</p>
        <p class="service-card-description">${s.descripcion ?? ''}</p>
        <small class="service-duration">${s.duracion} minutos</small>
      </div>
    `
      )
      .join('')

    // --- Animación de entrada ---
    gridEl.classList.remove('fade-out-carrousel')
    gridEl.classList.add('fade-in-carrousel')

    // Limpia la clase después de la animación
    setTimeout(() => gridEl.classList.remove('fade-in-carrousel'), 500)

    updateNav(totalPages)
  }, 300) // tiempo de salida
}

function updateNav(totalPages) {
  // Oculta flechas si no hay paginación
  const hasPaging = totalPages > 1
  if (prevBtn) prevBtn.style.display = hasPaging ? 'flex' : 'none'
  if (nextBtn) nextBtn.style.display = hasPaging ? 'flex' : 'none'

  // Deshabilita en extremos
  if (prevBtn) prevBtn.disabled = currentPage === 0
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages - 1
}

// Handlers de navegación
prevBtn?.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--
    renderServiciosPage()
  }
})

nextBtn?.addEventListener('click', () => {
  const totalPages = Math.ceil(serviciosData.length / PAGE_SIZE)
  if (currentPage < totalPages - 1) {
    currentPage++
    renderServiciosPage()
  }
})

// Navegación por teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prevBtn?.click()
  if (e.key === 'ArrowRight') nextBtn?.click()
})

// Swipe móvil
let touchStartX = 0
carouselEl?.addEventListener(
  'touchstart',
  (e) => {
    touchStartX = e.changedTouches[0].clientX
  },
  { passive: true }
)

carouselEl?.addEventListener(
  'touchend',
  (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX
    const threshold = 50 // px
    if (dx > threshold) prevBtn?.click() // swipe derecha -> anterior
    if (dx < -threshold) nextBtn?.click() // swipe izquierda -> siguiente
  },
  { passive: true }
)

function loadServiciosEnForm() {
  const select = document.getElementById('service')
  if (!select) return

  select.innerHTML =
    '<option value="">Selecciona un servicio</option>' +
    serviciosData
      .map((s) => `<option value="${s.id}">${s.nombre} - $${s.precio}</option>`)
      .join('')
}

// Cargar galería desde Supabase
async function loadGaleria() {
  const { data, error } = await supabase
    .from('galeria')
    .select('*')
    .eq('activo', true)
    .order('orden')

  if (error) {
    console.error('Error al cargar galería:', error)
    return
  }

  galeriaData = data
  renderGaleria()
  startGalleryAutoplay()
}

function renderGaleria() {
  const carousel = document.getElementById('galleryCarousel')
  const indicators = document.getElementById('galleryIndicators')
  if (!carousel || galeriaData.length === 0) return

  carousel.innerHTML = galeriaData
    .map(
      (img, index) => `
                <div class="gallery-slide ${index === 0 ? 'active' : ''}">
                    <img src="./${img.imagen_url}" alt="${img.titulo}"/>
                    <div class="gallery-caption">${img.titulo}</div>
                </div>
            `
    )
    .join('')

  indicators.innerHTML = galeriaData
    .map(
      (_, index) =>
        `<span class="indicator ${
          index === 0 ? 'active' : ''
        }" onclick="goToGallerySlide(${index})"></span>`
    )
    .join('')
}

function moveGalleryCarousel(direction) {
  galeriaCarouselIndex += direction
  if (galeriaCarouselIndex < 0) galeriaCarouselIndex = galeriaData.length - 1
  if (galeriaCarouselIndex >= galeriaData.length) galeriaCarouselIndex = 0
  updateGallerySlide()
}

function goToGallerySlide(index) {
  galeriaCarouselIndex = index
  updateGallerySlide()
}

function updateGallerySlide() {
  const slides = document.querySelectorAll('.gallery-slide')
  const indicators = document.querySelectorAll('.indicator')

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === galeriaCarouselIndex)
  })

  indicators.forEach((ind, i) => {
    ind.classList.toggle('active', i === galeriaCarouselIndex)
  })
}

function startGalleryAutoplay() {
  setInterval(() => moveGalleryCarousel(1), 5000)
}

// Controles del carousel de galería
document
  .getElementById('galleryPrev')
  ?.addEventListener('click', () => moveGalleryCarousel(-1))
document
  .getElementById('galleryNext')
  ?.addEventListener('click', () => moveGalleryCarousel(1))

// Cargar horarios disponibles para reservaciones
async function loadAvailableTimes() {
  const dateInput = document.getElementById('date')
  const timeSelect = document.getElementById('time')

  if (!dateInput.value) {
    timeSelect.innerHTML =
      '<option value="">Primero selecciona una fecha</option>'
    return
  }

  const selectedDate = new Date(dateInput.value + 'T00:00:00')
  const dayOfWeek = selectedDate.getDay()

  // Validar que no sea domingo
  if (dayOfWeek === 0) {
    timeSelect.innerHTML =
      '<option value="">No trabajamos los domingos</option>'
    return
  }

  // Obtener citas ocupadas para esa fecha
  const { data: reservaciones, error } = await supabase
    .from('reservaciones')
    .select('hora')
    .eq('fecha', dateInput.value)

  if (error) {
    console.error('Error al cargar horarios:', error)
    return
  }

  const horasOcupadas = reservaciones.map((r) => r.hora)

  // Generar horarios disponibles (9:00 AM - 8:00 PM, intervalos de 30 min)
  const horarios = []
  for (let hora = 9; hora <= 20; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      if (hora === 20 && minuto > 0) break

      const horaStr = `${hora.toString().padStart(2, '0')}:${minuto
        .toString()
        .padStart(2, '0')}:00`

      if (!horasOcupadas.includes(horaStr)) {
        const horaDisplay = `${hora > 12 ? hora - 12 : hora}:${minuto
          .toString()
          .padStart(2, '0')} ${hora >= 12 ? 'PM' : 'AM'}`
        horarios.push(`<option value="${horaStr}">${horaDisplay}</option>`)
      }
    }
  }

  timeSelect.innerHTML =
    '<option value="">Selecciona una hora</option>' + horarios.join('')
}

// Configurar fecha mínima
const dateInput = document.getElementById('date')
if (dateInput) {
  dateInput.min = new Date().toISOString().split('T')[0]
  dateInput.addEventListener('change', loadAvailableTimes)
}

// Manejar envío del formulario de reservaciones
document
  .getElementById('reservationForm')
  ?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = {
      nombre: document.getElementById('name').value,
      email: document.getElementById('name').value + '@cliente.com', // Simplificado
      telefono: document.getElementById('phone').value,
      servicio:
        document.getElementById('service').options[
          document.getElementById('service').selectedIndex
        ].text,
      fecha: document.getElementById('date').value,
      hora: document.getElementById('time').value,
      mensaje: document.getElementById('notes').value
    }

    const { data, error } = await supabase
      .from('reservaciones')
      .insert([formData])

    const messageDiv = document.getElementById('reservationMessage')

    if (error) {
      messageDiv.className = 'reservation-message error'
      messageDiv.textContent =
        'Error al realizar la reservación. Por favor intenta de nuevo.'
      console.error('Error:', error)
    } else {
      messageDiv.className = 'reservation-message success'
      messageDiv.textContent =
        '¡Reservación realizada con éxito! Nos pondremos en contacto contigo pronto.'
      document.getElementById('reservationForm').reset()

      setTimeout(() => {
        messageDiv.textContent = ''
        messageDiv.className = 'reservation-message'
      }, 5000)
    }
  })

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
  loadServicios()
  loadGaleria()
})
