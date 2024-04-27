const username = localStorage.getItem('name');
if (!username) {
  window.location.replace('/');
  throw new Error('Username is required');
}

let currentRoomId = null;

//Html references
const lblStatusOnline = document.querySelector('#status-online');
const lblStatusOffline = document.querySelector('#status-offline');
const userUlElements = document.querySelector('#users_online');
const form = document.querySelector('form');
const input = document.querySelector('input');
const chatElement = document.querySelector('#chat');

input.addEventListener('keypress', (event) => {
  const bubble = document.querySelector('#bubble');
  //console.log(event);
  bubble.style.display = 'block';
});

input.addEventListener('keyup', (event) => {
  const bubble = document.querySelector('#bubble');
  //console.log(event);
  if (input.value.length == 0) {
    hideTimeout = setTimeout(() => {
      bubble.style.display = 'none';
    }, 3000);
  }
});

async function listarSalas() {
  console.log('Entra a listar salas');
  try {
    const response = await fetch('http://localhost:3000/api/rooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Puedes incluir otros headers si es necesario, como tokens de autorización
      },
    });
    const data = await response.json();
    //addEventToRooms(data);
    //console.log("rooms es: ",rooms);
    console.log('data es: ', data);
    mostrarResultado(data);
  } catch (error) {
    console.error('Error al listar salas:', error);
  }
}

function mostrarResultado(salas) {
  const resultadoDiv = document.getElementById('divRooms');
  resultadoDiv.innerHTML = '<h2>Salas Disponibles</h2>';
  const listaUl = document.createElement('ul');
  listaUl.classList.add('list-group');
  salas.forEach((sala) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.textContent = sala.name;
    listaUl.appendChild(li);
    addEventToRoom(li, sala);
  });
  resultadoDiv.appendChild(listaUl);
}

const addEventToRoom = (li, sala) => {
  li.addEventListener('click', () => {
    console.log('CurrentRoom: ', currentRoomId);
    console.log('sala es: ', sala);
    const roomId = sala.name;
    if (roomId !== currentRoomId) {
      if (currentRoomId) {
        console.log(`Saliendo de la sala ${currentRoomId}`);
        socket.emit('leave-room', {
          nickname: username,
          roomId: currentRoomId,
        }); // Salir de la sala actual antes de unirse a una nueva
      }
      console.log(`Ingresando a la sala ${roomId}`);
      joinRoom(roomId, username);
      currentRoomId = roomId;
    }
  });
};

const joinRoom = (roomId, username) => {
  console.log('Entra a joinRoom');
  lblStatusOnline.classList.remove('hidden');
  lblStatusOffline.classList.add('hidden');
  console.log(`Conectado a la sala ${roomId}`);
  socket.emit('join-room', { roomId, nickname: username });
};

const renderUsers = (user) => {
  if (user.event == 'joined') {
    const liElement = document.createElement('li');
    liElement.innerText = user.user;
    liElement.id = 'user_' + user.user;
    userUlElements.appendChild(liElement);
  } else {
    const liRemove = document.getElementById('user_' + user.user);
    if (liRemove) {
      liRemove.remove();
    }
  }
};

const getTimeMessage = (date) => {
  const fecha = new Date(date);
  const hora = fecha.getHours().toString().padStart(2, '0'); // Obtener hora y formatear a dos dígitos
  const minutos = fecha.getMinutes().toString().padStart(2, '0'); // Obtener minutos y formatear a dos dígitos
  return `${hora}:${minutos}`;
};

const getDateMessage = (date) => {
  const fecha = new Date(date);
  const dia = fecha.getDate();
  const mesIndex = fecha.getMonth(); // Ten en cuenta que los meses se indexan desde 0
  const año = fecha.getFullYear();

  // Convertir el índice del mes a nombre de mes
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const mes = meses[mesIndex];

  // Mostrar la fecha formateada
  const fechaFormateada = `${dia} de ${mes} de ${año}`;
  console.log(fechaFormateada);
  return fechaFormateada
};

const renderMessage = (payload) => {
  console.log('Entra a renderMessage');
  //const { userId, message, roomId, name } = payload;
  const { text, created, owner, room } = payload;

  const time = getTimeMessage(created);

  console.log({ text, owner, room });
  if (currentRoomId === room) {
    console.log('LLegando mensaje para listar en la caja');

    const divElement = document.createElement('div');
    divElement.classList.add('message');
    if (username == owner.nickname) {
      divElement.classList.add('own-message');
    }

    divElement.innerHTML = `
    <small style="color:#4CAF50"><b>${owner.nickname}</b></small>
        <p>${text}</p>
        <p>${time}</p>
    `;
    chatElement.appendChild(divElement);

    chatElement.scrollTop = chatElement.scrollHeight;
  }
};

const getMessages = (messages) => {
  console.log('Entra a getMessages');
  chatElement.innerHTML = '';

  //console.log(`messages es: ${JSON.stringify(messages)}`);
  messages.forEach(({ text, created, owner, room }) => {
    const divElement = document.createElement('div');
    console.log(divElement.innerHTML);
    //divElement.classList.add('speech-wrapper');
    divElement.classList.add('message');
    if (username == owner.nickname) {
      divElement.classList.add('own-message');
    }
    const time = getTimeMessage(created);
    divElement.innerHTML = `
        <small style="color:#4CAF50"><b>${owner.nickname}</b></small>
        <p>${text}</p>
        <span class="timestamp">${time}</span>
    `;

    chatElement.appendChild(divElement);

    chatElement.scrollTop = chatElement.scrollHeight;
  });
  const bubbleDiv = document.createElement('div');
  bubbleDiv.id = 'bubble';
  bubbleDiv.classList.add('message');
  bubbleDiv.style.display = 'none';
  bubbleDiv.innerHTML = `
  <div class="typing typing-1"></div>
  <div class="typing typing-2"></div>
  <div class="typing typing-3"></div>
  `;
  chatElement.appendChild(bubbleDiv);
  console.log(bubbleDiv);
  console.log('Termina getMessages');
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value;
  const roomId = currentRoomId;
  input.value = '';
  console.log('Enviando mensaje');
  //socket.emit('send-message', message);
  if (currentRoomId) {
    socket.emit('send-message', { room: roomId, text: message });
  }
});

const socket = io({
  auth: {
    token: 'ABC-123',
    name: username,
  },
});

socket.on('connect', () => {
  console.log('Conectado al socket');
});
socket.on('message-received', renderMessage);
socket.on('room-messages', getMessages);

socket.on('users-changed', (data) => {
  console.log('Data users-changed client');
  console.log(data);
  renderUsers(data);
  const user = data.user;
  if (data['event'] === 'left') {
    console.log('User left: ' + user);
  } else {
    console.log('User joined: ' + user);
  }
});

socket.on('disconnect', () => {
  lblStatusOffline.classList.remove('hidden');
  lblStatusOnline.classList.add('hidden');
  console.log('Desconectado');
});
