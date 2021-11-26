const axios = require('axios');
class MemeApi {
  constructor() {
    //baseUrl could be overwritten in the route that uses the API
    this.baseURL = process.env.memeURL;
    this.captionURL = process.env.createURL;
    // this.api = axios.create({
    //   baseURL: process.env.API_URL || this.baseURL,
    // });
  }

  getAll = () => axios.get(`${this.baseURL}`);
  getOne = id => axios.get(`${this.baseURL}/${id}`);
  // , null para que no pase los parametros por el body, sino por la url
  createMeme = params => axios.post(`${this.captionURL}`, null, { params });
  
}

module.exports = new MemeApi();
