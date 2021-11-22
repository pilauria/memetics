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

  // CHANGE THE PATHS ACCORIDNG TO API DOCUEMNTATION
  getAll = () => axios.get(`${this.baseURL}`);
  getOne = id => axios.get(`${this.baseURL}/${id}`);
  // , null para que no pase los parametros por el body, sino por la url
  createMeme = params => axios.post(`${this.captionURL}`, null, { params });
  deleteOne = id => this.api.delete(`/${id}`);
  updateOne = id => this.api.put(`/${id}`);
  // etc...
}

module.exports = new MemeApi();
