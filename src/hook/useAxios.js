import axios from 'axios';

const instance = axios.create({

  // baseURL: 'http://localhost:5000'
  baseURL: 'https://icc-users.vercel.app'
  
  
});

const useAxios = () => {
  return instance;
}

export default useAxios