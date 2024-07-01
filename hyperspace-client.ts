import { HyperspaceApi, Document, LoginDto, UpdateByQuery, Script as UpdateByQueryScript } from './api'
import { Configuration } from './configuration'
import { decode, encode } from '@msgpack/msgpack'
import { BASE_PATH } from "./base";
import globalAxios from 'axios';

export interface IndexRequest {
    id: string;
    index: string;
    body: any;
}

export interface DeleteByQueryRequest {
    index: string;
    body: {
        query: any;
    };
}

export type ScriptLanguage = 'expression' | 'js';
export interface InlineScript {
    lang?: ScriptLanguage;
    params?: Record<string, any>
    source: string;
}

export type Script = InlineScript | string;
export interface UpdateByQueryRequest {
    index: string;
    body: {
        query: any;
        script: Script;
    }
}

export interface UpdateRequest {
    id: string;
    index: string;
    lang?: string;
    body: {
        doc?: any;
        doc_as_upsert?: boolean;
        script?: Script;
    }
}

export interface SearchRequest {
    index: string;
    size: number,
    body?: any;
}

export interface GetRequest {
    id: string;
    index: string;
}

export interface IndicesCreateRequest {
    index: string;
    body: {
        mappings: {
            properties: Record<string, any>
        };
    }
}

export interface GetResponse {
    _index: string;
    found: boolean;
    _id: string;
    _source?: any;
}

export class Indices {
    constructor(private api: HyperspaceApi) {}

    /**
     *
     * @summary Create a new collection
     * @param {any} params
     * @memberof Indices
     */
    create(params: IndicesCreateRequest) {
        let schema = {
            "configuration": params.body.mappings.properties
        };
        return this.api.createCollection(params.index, schema);
    }
}

export class HyperspaceClient {
    private readonly api: HyperspaceApi;
    indices: Indices;
    constructor(host: string, username: string, password: string) {
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
            }, async (error) => {
                if (error.response.status == 401) {
                    const originalRequest = error.config;
                    let { data } = await this.api.login({
                        username: config.username,
                        password: config.password
                    });

                    config.accessToken = data.token;
                    axios.defaults.headers.common['Authorization'] = 'Bearer ' + config.accessToken;
                    return axios(originalRequest);
                }

                return Promise.reject(error);
            }
        )

        axios.interceptors.request.use(function (config) {
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
                        let encoded = encode(docs);
                        config.data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
                    } else {
                        if (config.data.constructor != Buffer) {
                            let encoded = encode(config.data);
                            config.data = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
                        }
                    }
                    config.headers['content-length'] = config.data.length;
                }
                return config;
            }, async (error) => {
                return Promise.reject(error);
            }
        )
    }

    /**
     *
     * @summary Add a new batch to the collection
     * @param {string} collectionName
     * @param {Array<Document>} document
     * @memberof HyperspaceClient
     */
    addBatch(collectionName: string, document: Array<Document>) {
        return this.api.addBatch(collectionName, document);
    }

    /**
     *
     * @summary Clear all collection vectors
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    clearCollection(collectionName: string) {
        return this.api.clearCollection(collectionName);
    }

    /**
     *
     * @summary Commit
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    commit(collectionName: string) {
        return this.api.commit(collectionName);
    }

    /**
     *
     * @summary Delete a collection
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    deleteCollection(collectionName: string) {
        return this.api.deleteCollection(collectionName);
    }

    /**
     *
     * @summary Delete document by Id
     * @param {string} collectionName
     * @param {string} documentId
     * @memberof HyperspaceClient
     */
    deleteDocument(collectionName: string, documentId: string) {
        return this.api.deleteDocument(collectionName, documentId);
    }

    /**
     *
     * @summary Deletes documents matching the provided query.
     * @param {string} params
     * @memberof HyperspaceClient
     */
    deleteByQuery(params: DeleteByQueryRequest) {
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
    deleteFunction(collectionName: string, functionName: string) {
        return this.api.deleteFunction(collectionName, functionName);
    }

    /**
     *
     * @summary Get Function
     * @param {string} collectionName
     * @param {string} functionName
     * @memberof HyperspaceClient
     */
    getFunction(collectionName: string, functionName: string) {
        return this.api.getFunction(collectionName, functionName);
    }

    /**
     *
     * @summary Get schema of collection
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    getSchema(collectionName: string) {
        return this.api.getSchema(collectionName);
    }

    /**
     *
     * @summary Login
     * @param {LoginDto} loginDto
     * @memberof HyperspaceClient
     */
    login(loginDto: LoginDto) {
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
    setFunction(collectionName: string, functionName: string, body: any) {
        return this.api.setFunction(collectionName, functionName, body)
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
    index(params: IndexRequest) {
        params.body._id = params.id;
        return this.api.addDocument(params.index, params.body);
    }

    /**
     *
     * @summary Updates a document with a script or partial document.
     * @memberof HyperspaceClient
     * @param params
     */
    update(params: UpdateRequest) {
        let document;
        if (params.body.script) {
            if (typeof params.body.script === 'string') {
                document = {
                    id: params.id,
                    script: {
                        source: params.body.script,
                        lang: params.lang || 'js',
                    }
                }
            } else {
                document = {
                    id: params.id,
                    script: {
                        source: params.body.script.source,
                        params: params.body.script.params,
                        lang: params.body.script.lang || 'js',
                    }
                }
            }
        } else {
            document = params.body.doc;
            document['_id'] = params.id;
        }

        let partialUpdate = !params.body.doc_as_upsert || true;
        return this.api.updateDocument(params.index, document, partialUpdate, params.body.doc_as_upsert || false)
    }

    /**
     *
     * @summary Updates documents that match the specified query.
     * @memberof HyperspaceClient
     * @param params
     */
    updateByQuery(params: UpdateByQueryRequest) {
        let script: UpdateByQueryScript;
        if (typeof params.body.script === 'string') {
            script = {
                source: params.body.script,
            };
        } else {
            script = {
                source: params.body.script.source,
                params: params.body.script.params,
                lang: params.body.script.lang ?? 'js'
            };
        }
        let body: UpdateByQuery = {
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
     * @param {boolean} [debug]
     * @memberof HyperspaceClient
     */
    pythonSearch(collectionName: string, size: number, document: Document, functionName?: string, debug?: boolean) {
        return this.api.search(collectionName, size, document, functionName, debug)
    }

    /**
     *
     * @summary Returns results matching a query.
     * @memberof HyperspaceClient
     * @param params
     */
    search(params: SearchRequest) {
        return this.api.dslSearch(params.index, params.size, params.body);
    }

    /**
     *
     * @summary Returns a document.
     * @memberof HyperspaceClient
     * @param params
     */
    async get(params: GetRequest): Promise<GetResponse> {
        try {
            let data = await this.api.getDocument(params.index, params.id);
            let id = data.data._id;
            delete data.data._id;
            return {
                _index: params.index,
                found: true,
                _id: id,
                _source: data.data,
            }
        } catch (error) {
            return {
                _index: params.index,
                found: false,
                _id: params.id,
            }
        }
    }
}