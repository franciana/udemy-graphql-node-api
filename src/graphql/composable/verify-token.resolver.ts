import * as jws from 'jsonwebtoken';
import { ComposableResolver } from "./composable.resolver";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";
import { GraphQLFieldResolver } from "graphql";
import { JWT_SECRET } from '../../utils/utils';
import { any } from 'bluebird';

export const verifyTokenResolver: ComposableResolver<any, ResolverContext> = 
(resolver: GraphQLFieldResolver<any, ResolverContext>): GraphQLFieldResolver<any, ResolverContext> => {

    return (parent, args, context: ResolverContext, info) => {

        /** Se em auth.resolvers o authResolver não for passado a linha abaixo com o id ternário dever ser descomentado e a linha seguinte comentada */
        //const token: string = context.authorization ? context.authorization.split(' ')[1] : undefined;
        const token: string = context.authorization.split(' ')[1] ;

        return jws.verify(token, JWT_SECRET, (err, decoded: any)=> {

            if(!err){

                return resolver(parent, args, context, info);
            }

            throw new Error(`${err.name}: ${err.message}`);
        })

        
    }
}