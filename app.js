let contadorPersonas = 1;

function crearPersonaInputs(idx) {
  const div = document.createElement('div');
  div.className = 'persona-inputs';
  div.dataset.idx = idx;

  const nombre = document.createElement('input');
  nombre.type = 'text';
  nombre.placeholder = 'Nombre';
  nombre.required = true;
  nombre.name = `nombre_${idx}`;

  const telefono = document.createElement('input');
  telefono.type = 'tel';
  telefono.placeholder = 'Número (con código país, p.ej. 5493410000000)';
  telefono.required = true;
  telefono.pattern = "\\d{9,16}";
  telefono.name = `telefono_${idx}`;

  const remover = document.createElement('button');
  remover.type = 'button';
  remover.className = 'remover';
  remover.innerText = '×';
  remover.title = 'Eliminar persona';
  remover.onclick = () => div.remove();

  div.appendChild(nombre);
  div.appendChild(telefono);
  div.appendChild(remover);

  return div;
}

function agregarPersona() {
  const cont = document.getElementById('personas');
  cont.appendChild(crearPersonaInputs(contadorPersonas++));
}

document.getElementById('agregarPersona').onclick = agregarPersona;

// Inicial: una persona
window.addEventListener('DOMContentLoaded', () => {
  agregarPersona();
});

// -- NUEVA LÓGICA PARA CONEXIÓN CON WHATSAPP --
let whatsAppConectado = false;
let waConn = null;
let waUser = null;

// Importamos QRCode para mostrar el QR del login (desde CDN por importmap)
import('https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js');

// Adjuntos: audios y videos
let audioFiles = [];
let videoFiles = [];

const audioInput = document.getElementById('audioInput');
const videoInput = document.getElementById('videoInput');
const audioPreview = document.getElementById('audioPreview');
const videoPreview = document.getElementById('videoPreview');

function renderAdjuntoPreview(files, previewDiv, type) {
  previewDiv.innerHTML = '';
  Array.from(files).forEach((file,i) => {
    const item = document.createElement('div');
    item.className = type === 'audio' ? 'audio-file-preview' : 'video-file-preview';
    // SVG icon
    item.innerHTML = type==='audio'
      ? `<svg viewBox="0 0 24 24"><path fill="#075e54" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>`
      : `<svg viewBox="0 0 24 24"><path fill="#075e54" d="M8 5v14l11-7z"/></svg>`;
    // file name and size
    item.innerHTML += `<span>${file.name} <small>(${(file.size/1024).toFixed(1)} KB)</small></span>`;
    previewDiv.appendChild(item);
  });
}

audioInput.addEventListener('change', (e) => {
  audioFiles = Array.from(e.target.files);
  renderAdjuntoPreview(audioFiles, audioPreview, 'audio');
});
videoInput.addEventListener('change', (e) => {
  videoFiles = Array.from(e.target.files);
  renderAdjuntoPreview(videoFiles, videoPreview, 'video');
});

document.getElementById('conectarWhatsApp').addEventListener('click', async function() {
  // En un frontend puro, NO es posible automatizar WhatsApp, pero mostraremos un flujo simulado
  const qr = document.getElementById('qrContainer');
  qr.style.display = 'block';
  qr.innerHTML = '<b>Escanea este QR con WhatsApp</b><br><span id="qrCodeSVG"></span><div style="margin-top:.4em;color:#777;font-size:.95em">*Simulado para demo, necesitas un backend*</div>';
  document.getElementById('estadoConexion').textContent = 'Esperando conexión...';
  document.getElementById('estadoConexion').classList.remove('conectado');
  document.getElementById('estadoConexion').classList.add('desconectado');

  // QR simulado (no conecta)
  const qrStr = 'https://web.whatsapp.com/';
  if (window.QRCode) {
    QRCode.toString(qrStr, { type:'svg', width: 180 }, function (err, code) {
      document.getElementById('qrCodeSVG').innerHTML = code;
    });
  } else {
    // fallback: texto QR
    document.getElementById('qrCodeSVG').innerHTML = "[QR SIMULADO]";
  }

  setTimeout(()=>{
    // simulamos conexión luego de escanear
    document.getElementById('estadoConexion').textContent = 'Conectado (demo)';
    document.getElementById('estadoConexion').classList.add('conectado');
    document.getElementById('estadoConexion').classList.remove('desconectado');
    whatsAppConectado = true;
    waUser = { numero: "TuNumero" }; // demo
    qr.innerHTML = '<span style="color:#388e3c">WhatsApp conectado (simulado).<br>¡Ya puedes enviar mensajes y adjuntos!</span>';
  }, 2200);
});

// Cuando el usuario envía el formulario:
document.getElementById('mensajeForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const personasCont = document.getElementById('personas');
  const inputs = Array.from(personasCont.children).map(div => {
    const nombre = div.querySelector('input[type="text"]').value.trim();
    const telefono = div.querySelector('input[type="tel"]').value.trim();
    return { nombre, telefono };
  }).filter(p => p.nombre && p.telefono);

  const mensaje = document.getElementById('mensajeGeneral').value.trim();

  if (personasCont.children.length === 0 || inputs.length === 0) {
    alert('Agrega al menos una persona y completa los datos.');
    return;
  }
  if (!mensaje && audioFiles.length === 0 && videoFiles.length === 0) {
    alert('Escribe un mensaje y/o adjunta un audio o video para enviar.');
    return;
  }

  const enlacesDiv = document.getElementById('enlacesGenerados');
  enlacesDiv.innerHTML = '';

  if (whatsAppConectado) {
    // DEMO: Simular el envío automático con adjuntos
    for (const persona of inputs) {
      let mensajeFinal = mensaje.replace(/\{nombre\}/gi, persona.nombre);

      let status = document.createElement('div');
      status.className = 'msg-status exito';
      status.innerHTML = `✅ Mensaje enviado a <b>${persona.nombre}</b> (${persona.telefono})<br/>`;

      if (mensajeFinal) {
        status.innerHTML += `<span style="color:#888">${mensajeFinal}</span><br>`;
      }

      // Audios
      if (audioFiles.length > 0) {
        status.innerHTML += `<b>Audios enviados:</b><br>`;
        audioFiles.forEach(file => {
          status.innerHTML += `<span class='audio-file-preview'>
            <svg viewBox="0 0 24 24"><path fill="#075e54" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
            ${file.name} <small>(${(file.size/1024).toFixed(1)} KB)</small>
          </span><br>`;
        });
      }
      // Videos
      if (videoFiles.length > 0) {
        status.innerHTML += `<b>Videos enviados:</b><br>`;
        videoFiles.forEach(file => {
          status.innerHTML += `<span class='video-file-preview'>
          <svg viewBox="0 0 24 24"><path fill="#075e54" d="M8 5v14l11-7z"/></svg>
          ${file.name} <small>(${(file.size/1024).toFixed(1)} KB)</small>
          </span><br>`;
        });
      }

      enlacesDiv.appendChild(status);

      await new Promise(r=>setTimeout(r, 350)); // simula retardo
    }
  } else {
    // Modo manual: pedir conectar para medios, solo enlace para texto
    if (audioFiles.length > 0 || videoFiles.length > 0) {
      let aviso = document.createElement('div');
      aviso.className = 'msg-status error';
      aviso.innerHTML = 'Para enviar audios y videos debes conectar WhatsApp.<br>En modo manual solo se puede enviar texto.';
      enlacesDiv.appendChild(aviso);
    }
    if (mensaje) {
      for (const persona of inputs) {
        let mensajeFinal = mensaje.replace(/\{nombre\}/gi, persona.nombre);
        const url = `https://wa.me/${persona.telefono}?text=${encodeURIComponent(mensajeFinal)}`;
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.target = '_blank';
        enlace.rel = 'noopener';
        enlace.className = 'wa-link';
        enlace.textContent = `Enviar a ${persona.nombre} (${persona.telefono})`;
        enlacesDiv.appendChild(enlace);
      }
    }
  }
});

// INFO IMPORTANTE:
// Esta funcionalidad SÓLO puede automatizarse con un backend propio (NodeJS + whatsapp-web.js o venom-bot)
// Desde el navegador NO es posible enviar mensajes automáticamente por WhatsApp Web por limitaciones de seguridad y políticas de WhatsApp.