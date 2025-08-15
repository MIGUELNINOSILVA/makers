import axios from 'axios';

// Configura la URL base que se usará en todas las peticiones
// que no tengan un dominio explícito.
axios.defaults.baseURL = 'http://localhost:3333';

// También puedes configurar otras opciones por defecto, como los headers:
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/json';