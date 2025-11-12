// Verificar autenticación
const supabase = window.supabase.createClient(
  'https://nfanjxrqxuqcppfjdmjg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mYW5qeHJxeHVxY3BwZmpkbWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODk1MzUsImV4cCI6MjA3ODQ2NTUzNX0.9FbQj8sMQAlRMi1t2--KVEv8XDYAzUswVj6WMDOJpcs'
)

let currentUser = null

async function checkAuth() {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    window.location.href = '../login.html'
    return false
  }

  currentUser = session.user
  document.getElementById('userName').textContent = currentUser.email

  const { data: profileData } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single()

  if (profileData) {
    document.getElementById('perfilNombre').value = profileData.nombre || ''
    document.getElementById('perfilTelefono').value = profileData.telefono || ''
  }

  document.getElementById('perfilEmail').value = currentUser.email

  return true
}

// Navegación
document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault()

    // Actualizar navegación activa
    document
      .querySelectorAll('.nav-item')
      .forEach((nav) => nav.classList.remove('active'))
    item.classList.add('active')

    // Mostrar sección correspondiente
    const section = item.dataset.section
    document
      .querySelectorAll('.content-section')
      .forEach((sec) => sec.classList.remove('active'))
    document.getElementById(`${section}-section`).classList.add('active')

    // Actualizar título
    const titles = {
      reservaciones: 'Reservaciones',
      servicios: 'Servicios',
      galeria: 'Galería',
      usuarios: 'Usuarios',
      perfil: 'Mi Perfil'
    }
    document.getElementById('sectionTitle').textContent = titles[section]

    // Cargar datos si es necesario
    if (section === 'reservaciones') loadReservaciones()
    if (section === 'servicios') loadServicios()
    if (section === 'galeria') loadGaleria()
    if (section === 'usuarios') loadUsuarios()
  })
})

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = '../login.html'
})

// Modal
const modal = document.getElementById('modal')
const modalClose = document.getElementById('modalClose')

function openModal(title, content) {
  document.getElementById('modalTitle').textContent = title
  document.getElementById('modalBody').innerHTML = content
  modal.classList.add('active')
}

function closeModal() {
  modal.classList.remove('active')
}

modalClose.addEventListener('click', closeModal)
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal()
})

// ==================== RESERVACIONES ====================
async function loadReservaciones() {
  const tbody = document.getElementById('reservacionesTableBody')
  tbody.innerHTML = '<tr><td colspan="8" class="loading">Cargando...</td></tr>'

  const { data, error } = await supabase
    .from('reservaciones')
    .select('*')
    .order('atendida', { ascending: true })
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })

  if (error) {
    console.error('Error al cargar reservaciones:', error)
    tbody.innerHTML =
      '<tr><td colspan="8" class="loading">Error al cargar</td></tr>'
    return
  }

  if (data && data.length > 0) {
    tbody.innerHTML = data
      .map(
        (res) => `
            <tr class="${res.atendida ? 'atendida' : ''}">
                <td>${res.nombre}</td>
                <td>${res.telefono}</td>
                <td>${res.servicio}</td>
                <td>${formatDate(res.fecha)}</td>
                <td>${formatTime(res.hora)}</td>
                <td>-</td>
                <td>
                    <label class="checkbox-label">
                        <input type="checkbox" ${res.atendida ? 'checked' : ''} 
                               onchange="toggleAtendida('${
                                 res.id
                               }', this.checked)">
                        <span>${res.atendida ? 'Sí' : 'No'}</span>
                    </label>
                </td>
                <td>
                    ${
                      res.atendida
                        ? `
                        <button class="btn btn-danger btn-small" onclick="deleteReservacion('${res.id}')">
                            Eliminar
                        </button>
                    `
                        : '-'
                    }
                </td>
            </tr>
        `
      )
      .join('')
  } else {
    tbody.innerHTML =
      '<tr><td colspan="8" class="loading">No hay reservaciones</td></tr>'
  }
}

async function toggleAtendida(id, atendida) {
  const { error } = await supabase
    .from('reservaciones')
    .update({ atendida: atendida })
    .eq('id', id)

  if (error) {
    alert('Error al actualizar: ' + error.message)
  } else {
    loadReservaciones()
  }
}

async function deleteReservacion(id) {
  if (!confirm('¿Estás seguro de eliminar esta reservación?')) return

  const { error } = await supabase.from('reservaciones').delete().eq('id', id)

  if (error) {
    alert('Error al eliminar: ' + error.message)
  } else {
    loadReservaciones()
  }
}

// ==================== SERVICIOS ====================
async function loadServicios() {
  const grid = document.getElementById('serviciosGrid')
  grid.innerHTML = '<div class="loading-card">Cargando servicios...</div>'

  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .order('orden')

  if (error) {
    console.error('Error al cargar servicios:', error)
    return
  }

  if (data && data.length > 0) {
    grid.innerHTML = data
      .map(
        (serv) => `
            <div class="service-card">
                <h3>${serv.nombre}</h3>
                <div class="price">$${Number.parseFloat(serv.precio).toFixed(
                  2
                )}</div>
                <div class="badge ${serv.activo ? 'active' : 'inactive'}">
                    ${serv.activo ? 'Activo' : 'Inactivo'}
                </div>
                <p class="description">${serv.descripcion}</p>
                <div class="actions">
                    <button class="btn btn-secondary btn-small" onclick='editServicio(${JSON.stringify(
                      serv
                    ).replace(/'/g, '&apos;')})'>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteServicio('${
                      serv.id
                    }')">
                        Eliminar
                    </button>
                </div>
            </div>
        `
      )
      .join('')
  } else {
    grid.innerHTML = '<div class="loading-card">No hay servicios</div>'
  }
}

document.getElementById('addServiceBtn').addEventListener('click', () => {
  openModal(
    'Agregar Servicio',
    `
        <form id="serviceForm" class="admin-form" autocomplete="off">
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" required>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" required></textarea>
            </div>
            <div class="form-group">
                <label>Precio</label>
                <input type="number" name="precio" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Duración (minutos)</label>
                <input type="number" name="duracion" value="30" required>
            </div>
            <div class="form-group">
                <label>Orden</label>
                <input type="number" name="orden" value="0">
            </div>
            <button type="submit" class="btn btn-primary">Guardar</button>
        </form>
    `
  )

  document
    .getElementById('serviceForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)

      const { error } = await supabase.from('servicios').insert([
        {
          nombre: formData.get('nombre'),
          descripcion: formData.get('descripcion'),
          precio: Number.parseFloat(formData.get('precio')),
          duracion: Number.parseInt(formData.get('duracion')),
          orden: Number.parseInt(formData.get('orden'))
        }
      ])

      if (error) {
        alert('Error al guardar: ' + error.message)
      } else {
        closeModal()
        loadServicios()
      }
    })
})

function editServicio(serv) {
  openModal(
    'Editar Servicio',
    `
        <form id="serviceEditForm" class="admin-form" autocomplete="off">
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" value="${
                  serv.nombre
                }" required>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" required>${
                  serv.descripcion
                }</textarea>
            </div>
            <div class="form-group">
                <label>Precio</label>
                <input type="number" name="precio" value="${
                  serv.precio
                }" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Duración (minutos)</label>
                <input type="number" name="duracion" value="${
                  serv.duracion
                }" required>
            </div>
            <div class="form-group">
                <label>Orden</label>
                <input type="number" name="orden" value="${serv.orden}">
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="activo" ${
                      serv.activo ? 'checked' : ''
                    }>
                    <span>Activo</span>
                </label>
            </div>
            <button type="submit" class="btn btn-primary">Actualizar</button>
        </form>
    `
  )

  document
    .getElementById('serviceEditForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)

      const { error } = await supabase
        .from('servicios')
        .update({
          nombre: formData.get('nombre'),
          descripcion: formData.get('descripcion'),
          precio: Number.parseFloat(formData.get('precio')),
          duracion: Number.parseInt(formData.get('duracion')),
          orden: Number.parseInt(formData.get('orden')),
          activo: formData.get('activo') === 'on'
        })
        .eq('id', serv.id)

      if (error) {
        alert('Error al actualizar: ' + error.message)
      } else {
        closeModal()
        loadServicios()
      }
    })
}

async function deleteServicio(id) {
  if (!confirm('¿Estás seguro de eliminar este servicio?')) return

  const { error } = await supabase.from('servicios').delete().eq('id', id)

  if (error) {
    alert('Error al eliminar: ' + error.message)
  } else {
    loadServicios()
  }
}

// ==================== GALERÍA ====================
async function loadGaleria() {
  const grid = document.getElementById('galeriaGrid')
  grid.innerHTML = '<div class="loading-card">Cargando galería...</div>'

  const { data, error } = await supabase
    .from('galeria')
    .select('*')
    .order('orden')

  if (error) {
    console.error('Error al cargar galería:', error)
    return
  }

  if (data && data.length > 0) {
    grid.innerHTML = data
      .map(
        (img) => `
            <div class="gallery-card">
                <img src="${img.imagen_url}" alt="${img.titulo}">
                <div class="card-content">
                    <h4>${img.titulo}</h4>
                    <div class="badge ${img.activo ? 'active' : 'inactive'}">
                        ${img.activo ? 'Activo' : 'Inactivo'}
                    </div>
                    <div class="actions">
                        <button class="btn btn-secondary btn-small" onclick='editGaleria(${JSON.stringify(
                          img
                        ).replace(/'/g, '&apos;')})'>
                            Editar
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteGaleria('${
                          img.id
                        }')">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join('')
  } else {
    grid.innerHTML = '<div class="loading-card">No hay imágenes</div>'
  }
}

document.getElementById('addGalleryBtn').addEventListener('click', () => {
  openModal(
    'Agregar Imagen',
    `
        <form id="galleryForm" class="admin-form" autocomplete="off">
            <div class="form-group">
                <label>Título</label>
                <input type="text" name="titulo" required>
            </div>
            <div class="form-group">
                <label>URL de la Imagen</label>
                <input type="url" name="imagen_url" placeholder="https://..." required>
            </div>
            <div class="form-group">
                <label>Orden</label>
                <input type="number" name="orden" value="0">
            </div>
            <button type="submit" class="btn btn-primary">Guardar</button>
        </form>
    `
  )

  document
    .getElementById('galleryForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)

      const { error } = await supabase.from('galeria').insert([
        {
          titulo: formData.get('titulo'),
          imagen_url: formData.get('imagen_url'),
          orden: Number.parseInt(formData.get('orden'))
        }
      ])

      if (error) {
        alert('Error al guardar: ' + error.message)
      } else {
        closeModal()
        loadGaleria()
      }
    })
})

function editGaleria(img) {
  openModal(
    'Editar Imagen',
    `
        <form id="galleryEditForm" class="admin-form" autocomplete="off">
            <div class="form-group">
                <label>Título</label>
                <input type="text" name="titulo" value="${img.titulo}" required>
            </div>
            <div class="form-group">
                <label>URL de la Imagen</label>
                <input type="url" name="imagen_url" value="${
                  img.imagen_url
                }" required>
            </div>
            <div class="form-group">
                <label>Orden</label>
                <input type="number" name="orden" value="${img.orden}">
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="activo" ${
                      img.activo ? 'checked' : ''
                    }>
                    <span>Activo</span>
                </label>
            </div>
            <button type="submit" class="btn btn-primary">Actualizar</button>
        </form>
    `
  )

  document
    .getElementById('galleryEditForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)

      const { error } = await supabase
        .from('galeria')
        .update({
          titulo: formData.get('titulo'),
          imagen_url: formData.get('imagen_url'),
          orden: Number.parseInt(formData.get('orden')),
          activo: formData.get('activo') === 'on'
        })
        .eq('id', img.id)

      if (error) {
        alert('Error al actualizar: ' + error.message)
      } else {
        closeModal()
        loadGaleria()
      }
    })
}

async function deleteGaleria(id) {
  if (!confirm('¿Estás seguro de eliminar esta imagen?')) return

  const { error } = await supabase.from('galeria').delete().eq('id', id)

  if (error) {
    alert('Error al eliminar: ' + error.message)
  } else {
    loadGaleria()
  }
}

// ==================== USUARIOS ====================
async function loadUsuarios() {
  const tbody = document.getElementById('usuariosTableBody')
  tbody.innerHTML = '<tr><td colspan="5" class="loading">Cargando...</td></tr>'

  // Nota: No podemos listar todos los usuarios de auth.users directamente
  // Solo podemos ver los perfiles en admin_profiles
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al cargar usuarios:', error)
    tbody.innerHTML =
      '<tr><td colspan="5" class="loading">Error al cargar</td></tr>'
    return
  }

  if (data && data.length > 0) {
    tbody.innerHTML = data
      .map(
        (user) => `
            <tr>
                <td>${user.nombre}</td>
                <td>${user.id}</td>
                <td>${user.telefono || '-'}</td>
                <td>${formatDate(user.created_at)}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteUsuario('${
                      user.id
                    }')">
                        Eliminar
                    </button>
                </td>
            </tr>
        `
      )
      .join('')
  } else {
    tbody.innerHTML =
      '<tr><td colspan="5" class="loading">No hay usuarios</td></tr>'
  }
}

document.getElementById('addUserBtn').addEventListener('click', () => {
  openModal(
    'Agregar Usuario',
    `
        <form id="userForm" class="admin-form" autocomplete="off">
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" required>
            </div>
            <div class="form-group">
                <label>Teléfono</label>
                <input type="tel" name="telefono">
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" name="password" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary">Guardar</button>
        </form>
    `
  )

  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.get('email'),
      password: formData.get('password'),
      options: {
        data: {
          nombre: formData.get('nombre'),
          telefono: formData.get('telefono')
        }
      }
    })

    if (authError) {
      alert('Error al crear usuario: ' + authError.message)
      return
    }

    // Crear perfil en admin_profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert([
          {
            id: authData.user.id,
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono')
          }
        ])

      if (profileError) {
        alert('Error al crear perfil: ' + profileError.message)
      } else {
        alert('Usuario creado exitosamente. Debe confirmar su email.')
        closeModal()
        loadUsuarios()
      }
    }
  })
})

async function deleteUsuario(id) {
  if (id === currentUser.id) {
    alert('No puedes eliminar tu propio usuario')
    return
  }

  if (!confirm('¿Estás seguro de eliminar este usuario?')) return

  alert(
    'Para eliminar usuarios de auth, debes hacerlo desde el panel de Supabase directamente.'
  )
}

// ==================== PERFIL ====================
document.getElementById('perfilForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)
  const nombre = formData.get('nombre')
  const telefono = formData.get('telefono')
  const password = formData.get('password')

  // Actualizar perfil en admin_profiles
  const { error: profileError } = await supabase.from('admin_profiles').upsert({
    id: currentUser.id,
    nombre: nombre,
    telefono: telefono
  })

  if (profileError) {
    alert('Error al actualizar perfil: ' + profileError.message)
    return
  }

  // Actualizar contraseña si se proporcionó
  if (password) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password: password
    })

    if (passwordError) {
      alert('Error al actualizar contraseña: ' + passwordError.message)
      return
    }
  }

  alert('Perfil actualizado exitosamente')
  checkAuth()
})

// ==================== UTILIDADES ====================
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX')
}

function formatTime(timeString) {
  return timeString.substring(0, 5)
}

// Inicializar
// checkAuth().then((authenticated) => {
//   if (authenticated) {
//     loadReservaciones()
//   }
// })
