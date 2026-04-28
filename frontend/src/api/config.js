const API_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5001/api';

const GOOGLE_CLIENT_ID = "475792246807-vdvmuphc9ntb58e0rsjfs2uu519bfvlk.apps.googleusercontent.com";

export { API_URL, GOOGLE_CLIENT_ID };
export default API_URL;
