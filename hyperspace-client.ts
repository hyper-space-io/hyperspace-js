import { HyperspaceApi } from './api'
import { Configuration } from './configuration'

export class HyperspaceClient extends HyperspaceApi {
    constructor(host: string, username: string, password: string) {
        let config = new Configuration();
        config.basePath = host
        config.username = username
        config.password = password
        super(config)
        this.axios.interceptors.response.use(function (response) {
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
    }
}