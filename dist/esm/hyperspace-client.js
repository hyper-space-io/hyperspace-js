var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HyperspaceApi } from './api';
import { Configuration } from './configuration';
import { decode, encode } from '@msgpack/msgpack';
import { BASE_PATH } from "./base";
import globalAxios from 'axios';
export class Indices {
    constructor(api) {
        this.api = api;
    }
    /**
     *
     * @summary Create a new collection
     * @param {IndicesCreateRequest} params
     * @memberof Indices
     */
    create(params) {
        let schema = {
            "configuration": params.body.mappings.properties
        };
        return this.api.createCollection(params.index, schema);
    }
    /**
     *
     * @summary Delete a collection
     * @param {IndicesDeleteRequest} params
     * @memberof Indices
     */
    delete(params) {
        return this.api.deleteCollection(params.index);
    }
}
export class HyperspaceClient {
    constructor(host, username, password) {
        let config = new Configuration();
        config.basePath = host;
        config.username = username;
        config.password = password;
        let axios = globalAxios;
        this.api = new HyperspaceApi(config, BASE_PATH, axios);
        this.indices = new Indices(this.api);
        axios.interceptors.response.use(function (response) {
            // Decode from msgpack
            if (response.headers['content-type'] === 'application/msgpack') {
                response.data = decode(response.data);
            }
            return response;
        }, (error) => __awaiter(this, void 0, void 0, function* () {
            if (error.response.status == 401) {
                const originalRequest = error.config;
                let { data } = yield this.api.login({
                    username: config.username,
                    password: config.password
                });
                config.accessToken = data.token;
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + config.accessToken;
                return axios(originalRequest);
            }
            return Promise.reject(error);
        }));
        axios.interceptors.request.use(function (config) {
            if (config.url.includes('/document/get')) {
                config.responseType = 'arraybuffer';
            }
            // Encode to msgpack
            if (config.headers['Content-Type'] === 'application/msgpack') {
                if (config.data.constructor === Array) {
                    let docs = [];
                    for (let doc of config.data) {
                        docs.push(encode(doc));
                    }
                    let encoded = encode(docs);
                    config.data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
                }
                else {
                    if (config.data.constructor != Buffer) {
                        let encoded = encode(config.data);
                        config.data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
                    }
                }
                config.headers['content-length'] = config.data.length;
            }
            return config;
        }, (error) => __awaiter(this, void 0, void 0, function* () {
            return Promise.reject(error);
        }));
    }
    /**
     *
     * @summary Add a new batch to the collection
     * @param {string} collectionName
     * @param {Array<Document>} document
     * @memberof HyperspaceClient
     */
    addBatch(collectionName, document) {
        return this.api.addBatch(collectionName, document);
    }
    /**
     *
     * @summary Clear all collection vectors
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    clearCollection(collectionName) {
        return this.api.clearCollection(collectionName);
    }
    /**
     *
     * @summary Commit
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    commit(collectionName) {
        return this.api.commit(collectionName);
    }
    /**
     *
     * @summary Delete document by Id
     * @param {string} collectionName
     * @param {string} documentId
     * @memberof HyperspaceClient
     */
    deleteDocument(collectionName, documentId) {
        return this.api.deleteDocument(collectionName, documentId);
    }
    /**
     *
     * @summary Deletes documents matching the provided query.
     * @param {string} params
     * @memberof HyperspaceClient
     */
    deleteByQuery(params) {
        return this.api.deleteByQuery(params.index, {
            query: params.body.query
        });
    }
    /**
     *
     * @summary Delete function by name
     * @param {string} collectionName
     * @param {string} functionName
     * @memberof HyperspaceClient
     */
    deleteFunction(collectionName, functionName) {
        return this.api.deleteFunction(collectionName, functionName);
    }
    /**
     *
     * @summary Get Function
     * @param {string} collectionName
     * @param {string} functionName
     * @memberof HyperspaceClient
     */
    getFunction(collectionName, functionName) {
        return this.api.getFunction(collectionName, functionName);
    }
    /**
     *
     * @summary Get schema of collection
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    getSchema(collectionName) {
        return this.api.getSchema(collectionName);
    }
    /**
     *
     * @summary Login
     * @param {LoginDto} loginDto
     * @memberof HyperspaceClient
     */
    login(loginDto) {
        return this.api.login(loginDto);
    }
    /**
     *
     * @summary Reset password
     * @memberof HyperspaceClient
     */
    resetPassword() {
        return this.api.resetPassword();
    }
    /**
     *
     * @summary Set Function
     * @param {string} collectionName
     * @param {string} functionName
     * @param {any} body
     * @memberof HyperspaceClient
     */
    setFunction(collectionName, functionName, body) {
        return this.api.setFunction(collectionName, functionName, body);
    }
    /**
     *
     * @summary Get the information of all the collections.
     * @memberof HyperspaceClient
     */
    info() {
        return this.api.collectionsInfo();
    }
    /**
     *
     * @summary Creates a document in an index.
     * @memberof HyperspaceClient
     * @param params
     */
    index(params) {
        params.body._id = params.id;
        return this.api.addDocument(params.index, params.body);
    }
    /**
     *
     * @summary Updates a document with a script or partial document.
     * @memberof HyperspaceClient
     * @param params
     */
    update(params) {
        let document;
        if (params.body.script) {
            if (typeof params.body.script === 'string') {
                document = {
                    id: params.id,
                    script: {
                        source: params.body.script,
                        lang: params.lang || 'painless',
                    }
                };
            }
            else {
                document = {
                    id: params.id,
                    script: {
                        source: params.body.script.source,
                        params: params.body.script.params,
                        lang: params.body.script.lang || 'painless',
                    }
                };
            }
        }
        else {
            document = params.body.doc;
            document['_id'] = params.id;
        }
        let partialUpdate = !params.body.doc_as_upsert || true;
        return this.api.updateDocument(params.index, document, partialUpdate, params.body.doc_as_upsert || false);
    }
    /**
     *
     * @summary Updates documents that match the specified query.
     * @memberof HyperspaceClient
     * @param params
     */
    updateByQuery(params) {
        var _a;
        let script;
        if (typeof params.body.script === 'string') {
            script = {
                source: params.body.script,
            };
        }
        else {
            script = {
                source: params.body.script.source,
                params: params.body.script.params,
                lang: (_a = params.body.script.lang) !== null && _a !== void 0 ? _a : 'painless'
            };
        }
        let body = {
            query: params.body.query,
            script
        };
        return this.api.updateByQuery(params.index, body);
    }
    /**
     *
     * @summary Find top X similar documents in the dataset according to the selected search option.
     * @param {string} collectionName
     * @param {number} size
     * @param {Document} document
     * @param {string} [functionName]
     * @param {boolean} [source]
     * @memberof HyperspaceClient
     */
    pythonSearch(collectionName, size, document, functionName, source) {
        return this.api.search(collectionName, size, document, functionName, "", source !== undefined ? source : true);
    }
    /**
     *
     * @summary Returns results matching a query.
     * @memberof HyperspaceClient
     * @param params
     */
    search(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.api.dslSearch(params.index, params.body.size || 10, params.body, "", params._source !== undefined ? params._source : true);
            let responseWithBody = Object.assign(Object.assign({}, response), { body: response.data });
            delete responseWithBody['data'];
            return responseWithBody;
        });
    }
    /**
     *
     * @summary Returns a document.
     * @memberof HyperspaceClient
     * @param params
     */
    get(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield this.api.getDocument(params.index, params.id);
                let responseWithBody = Object.assign(Object.assign({}, response), { body: {
                        _index: params.index,
                        found: true,
                        _id: params.id,
                        _source: response.data,
                    } });
                delete responseWithBody['data'];
                return responseWithBody;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
