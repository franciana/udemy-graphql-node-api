import { DbConnection } from "./DbConnectionInterface";
import { AuthUser } from "./AuthUerInterface";
import { DataLoaders } from "./DataLoadersInterface";
import { RequestedFields } from "../graphql/ast/RequestedFields";

export interface ResolverContext {

    db?: DbConnection;
    authorization?: string;
    authUser?: AuthUser;
    dataloaders?: DataLoaders;
    requestedFields?: RequestedFields;
}