import { HyperspaceApi, Document, LoginDto } from './api';
import { AxiosResponse } from 'axios';
interface AxiosResponseWithBody<T = any> extends AxiosResponse<T> {
    body: T;
}
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
export type ScriptLanguage = 'painless';
export interface InlineScript {
    lang?: ScriptLanguage;
    params?: Record<string, any>;
    source: string;
}
export type Script = InlineScript | string;
export interface UpdateByQueryRequest {
    index: string;
    body: {
        query: any;
        script: Script;
    };
}
export interface UpdateRequest {
    id: string;
    index: string;
    lang?: string;
    body: {
        doc?: any;
        doc_as_upsert?: boolean;
        script?: Script;
    };
}
export interface SearchRequest {
    index: string;
    body: {
        size?: number;
        query?: any;
    };
    _source?: boolean;
}
export interface GetRequest {
    id: string;
    index: string;
}
export interface IndicesCreateRequest {
    index: string;
    body: {
        mappings: {
            properties: Record<string, any>;
        };
    };
}
export interface IndicesDeleteRequest {
    index: string;
}
export interface GetResponse {
    _index: string;
    found: boolean;
    _id: string;
    _source?: any;
}
export declare class Indices {
    private api;
    constructor(api: HyperspaceApi);
    /**
     *
     * @summary Create a new collection
     * @param {IndicesCreateRequest} params
     * @memberof Indices
     */
    create(params: IndicesCreateRequest): Promise<AxiosResponse<any, any>>;
    /**
     *
     * @summary Delete a collection
     * @param {IndicesDeleteRequest} params
     * @memberof Indices
     */
    delete(params: IndicesDeleteRequest): Promise<AxiosResponse<import("./api").StatusDto, any>>;
}
export declare class HyperspaceClient {
    private readonly api;
    indices: Indices;
    constructor(host: string, username: string, password: string);
    /**
     *
     * @summary Add a new batch to the collection
     * @param {string} collectionName
     * @param {Array<Document>} document
     * @memberof HyperspaceClient
     */
    addBatch(collectionName: string, document: Array<Document>): Promise<AxiosResponse<any, any>>;
    /**
     *
     * @summary Clear all collection vectors
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    clearCollection(collectionName: string): Promise<AxiosResponse<import("./api").StatusDto, any>>;
    /**
     *
     * @summary Commit
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    commit(collectionName: string): Promise<AxiosResponse<import("./api").StatusDto, any>>;
    /**
     *
     * @summary Delete document by Id
     * @param {string} collectionName
     * @param {string} documentId
     * @memberof HyperspaceClient
     */
    deleteDocument(collectionName: string, documentId: string): Promise<AxiosResponse<import("./api").StatusDto, any>>;
    /**
     *
     * @summary Deletes documents matching the provided query.
     * @param {string} params
     * @memberof HyperspaceClient
     */
    deleteByQuery(params: DeleteByQueryRequest): Promise<AxiosResponse<import("./api").DeleteByQueryResponse, any>>;
    /**
     *
     * @summary Delete function by name
     * @param {string} collectionName
     * @param {string} functionName
     * @memberof HyperspaceClient
     */
    deleteFunction(collectionName: string, functionName: string): Promise<AxiosResponse<import("./api").StatusDto, any>>;
    /**
     *
     * @summary Get Function
     * @param {string} collectionName
     * @param {string} functionName
     * @memberof HyperspaceClient
     */
    getFunction(collectionName: string, functionName: string): Promise<AxiosResponse<any, any>>;
    /**
     *
     * @summary Get schema of collection
     * @param {string} collectionName
     * @memberof HyperspaceClient
     */
    getSchema(collectionName: string): Promise<AxiosResponse<any, any>>;
    /**
     *
     * @summary Login
     * @param {LoginDto} loginDto
     * @memberof HyperspaceClient
     */
    login(loginDto: LoginDto): Promise<AxiosResponse<import("./api").AuthDto, any>>;
    /**
     *
     * @summary Reset password
     * @memberof HyperspaceClient
     */
    resetPassword(): Promise<AxiosResponse<string, any>>;
    /**
     *
     * @summary Set Function
     * @param {string} collectionName
     * @param {string} functionName
     * @param {any} body
     * @memberof HyperspaceClient
     */
    setFunction(collectionName: string, functionName: string, body: any): Promise<AxiosResponse<import("./api").StatusDto, any>>;
    /**
     *
     * @summary Get the information of all the collections.
     * @memberof HyperspaceClient
     */
    info(): Promise<AxiosResponse<any, any>>;
    /**
     *
     * @summary Creates a document in an index.
     * @memberof HyperspaceClient
     * @param params
     */
    index(params: IndexRequest): Promise<AxiosResponse<any, any>>;
    /**
     *
     * @summary Updates a document with a script or partial document.
     * @memberof HyperspaceClient
     * @param params
     */
    update(params: UpdateRequest): Promise<AxiosResponse<any, any>>;
    /**
     *
     * @summary Updates documents that match the specified query.
     * @memberof HyperspaceClient
     * @param params
     */
    updateByQuery(params: UpdateByQueryRequest): Promise<AxiosResponse<string, any>>;
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
    pythonSearch(collectionName: string, size: number, document: Document, functionName?: string, source?: boolean): Promise<AxiosResponse<any, any>>;
    /**
     *
     * @summary Returns results matching a query.
     * @memberof HyperspaceClient
     * @param params
     */
    search(params: SearchRequest): Promise<AxiosResponseWithBody<any>>;
    /**
     *
     * @summary Returns a document.
     * @memberof HyperspaceClient
     * @param params
     */
    get(params: GetRequest): Promise<AxiosResponseWithBody<any>>;
}
export {};
