import { GraphQLResolveInfo, doTypesOverlap } from "graphql";

import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import { handleError, throwError } from "../../../utils/utils";
import { AuthUser } from "../../../interfaces/AuthUerInterface";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { RequestedFields } from "../../ast/RequestedFields";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";


 
export const userResolvers = {

    /**
     O parâmetro context pode ser definido das seguintes formas:
     
     Primeira forma

        , {db, requestedFields}: {db: DbConnection, requestedFields: RequestedFields},
        db.Post
        requestedFields.getFields(info, { keep: ['id'], exclude: ['comments']
     
      
     Seguntda forma
        , context: ResolverContext,
        return context.db.User  
        context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments']})

     */

    User: {

        posts: (user, {first = 10, offset=0}, {db, requestedFields}: {db: DbConnection, requestedFields: RequestedFields}, info: GraphQLResolveInfo) =>{
            return db.Post
            .findAll({
                where: {author: user.get('id')}, 
                limit: first,
                offset: offset,
                attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['comments']})
            }).catch(handleError);
            
        }

    },

    Query: {
        users:(parent, {first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.User
            .findAll({
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts']})
            }).catch(handleError);
        },

        user: (parent, {id}, context: ResolverContext , info: GraphQLResolveInfo ) => {
            id = parseInt(id);
            return context.db.User
            .findById(id, {
                attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['posts']})
            })
            .then((user: UserInstance) => {
                throwError(!user,`Error User with id ${id} not found!`);
                return user;
            }).catch(handleError);
        },

        currentUser: compose(...authResolvers)((parent, args, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo ) => {
            return db.User
                .findById(authUser.id)
                .then((user: UserInstance) =>{
                    throwError(!user,`Error with id ${authUser.id} not found!`);
                    return user;
                }).catch(handleError);
        })
       
         
    },

    Mutation: {
        
        createUser: (parent, {input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo ) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                .create(input, {transaction: t});
            }).catch(handleError);
        },

        updateUser: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo ) => {
            console.log(authUser);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) =>{
                        throwError(!user,`Error with id ${authUser.id} not found!`);
                        return user.update(input,{transaction: t});
                    });
            }).catch(handleError); 

        }),
        updateUserPassword: compose(...authResolvers) ((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo ) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) =>{
                        throwError(!user,`Error with id ${authUser.id} not found!`);
                        return user.update(input,{transaction: t})
                            .then((user: UserInstance) => !!user);
                    });
            }).catch(handleError); 

        }),

        /*
        deleteUser: compose(...authResolvers) ((parent, args, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo ) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `Error with id ${authUser.id} not found!`);
                        return user.destroy({transaction: t})
                            .then(user => true)
                            .catch(user => user);
                    });
            }).catch(handleError); 
        })*/

        deleteUser: compose(...authResolvers)((parent, args, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found!`);
                        return user.destroy({transaction: t})
                            .then(user=>true);
                    });
            }).catch(handleError);
        })

    }

}