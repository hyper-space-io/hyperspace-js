import { HyperspaceApi } from './api'
import { Configuration } from './configuration'
import { decode, encode } from '@msgpack/msgpack'

export class HyperspaceClient extends HyperspaceApi {
    constructor(host: string, username: string, password: string) {
        let config = new Configuration();
        config.basePath = host
        config.username = username
        config.password = password
        super(config)
        this.axios.interceptors.response.use(function (response) {
                // Decode from msgpack
                if (response.config.responseType === 'arraybuffer') {
                    response.data = decode(response.data);
                }
                return response;
            }, async (error) => {
                if (error.response.status == 401) {
                    const originalRequest = error.config;
                    let { data } = await this.login({
                        username: this.configuration.username,
                        password: this.configuration.password
                    });

                    this.configuration.accessToken = data.token;
                    this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.configuration.accessToken;
                    return this.axios(originalRequest);
                }

                return Promise.reject(error);
            }
        )

        this.axios.interceptors.request.use(function (config) {
                if (config.url.includes('/document/get')) {
                    config.responseType = 'arraybuffer';
                }

                // Encode to msgpack
                if (config.headers['Content-Type'] === 'application/msgpack') {
                    if (config.data.constructor === Array) {
                        let docs = [];
                        for (let doc of config.data) {
                            docs.push(encode(doc))
                        }
                        config.data = encode(docs);
                    } else {
                        if (config.data.constructor != ArrayBuffer) {
                            config.data = encode(config.data);
                        }
                    }
                }
                return config;
            }, async (error) => {
                return Promise.reject(error);
            }
        )
    }
}