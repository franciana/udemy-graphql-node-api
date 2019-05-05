import * as graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { PostInstance } from "../../../models/PostModel";
import { Transaction } from "sequelize";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUerInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';


export const postResolvers = {

    Post: {

        //Resolvers não triviais
        author: (post, args,  {db, dataloaders:{userLoader}}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
            return userLoader
                .load( { key: post.get('author'), info} )
                .catch(handleError);
            /*
            return db.User
                .findById(post.get('author'))
                .catch(handleError);
            */
        },

        /* ### Rever implementação do CommentLoader
        comments: (post, {first= 10, offset= 0}, {dataloaders: {postLoader}}: {dataloaders: DataLoaders} , info: GraphQLResolveInfo) => {
            console.log(info);
            return postLoader
                .load({ key: post.get('id'), info})
                .catch(handleError);
        }
        */

        
        comments: (post, {first= 10, offset= 0}, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.Comment
            .findAll({
                where: {post: post.get('id')},
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info)
            }).catch(handleError);
        }
        
    
    },

    Query: {
        
        posts: (parent, {first= 10, offset= 0}, context: ResolverContext, info: GraphQLResolveInfo) => {
            console.log(Object.keys(graphqlFields(info)));
            console.log(context.db.Post);
            return context.db.Post
            .findAll({
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments']})
                //attributes: ['title','createdAt','author']
            }).catch(handleError);
        },
    
        post: (parent, {id}, context: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return context.db.Post
                .findById(id, {
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments']})
                })
                .then((post: PostInstance) => {
                    throwError(!post, `Post with id ${id} not found!`);
                    return post;
                }).catch(handleError);
        }
    },
    Mutation: {

        createPost: compose(...authResolvers) ((parent, { input },  {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            input.author = authUser.id;
            return db.sequelize.transaction((t: Transaction) =>{
                return db.Post
                    .create(input, {transaction: t});
            }).catch(handleError);
        }),

        updatePost: compose(...authResolvers) ((parent, { id, input },  {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) =>{
                return db.Post
                    .findById(id)
                    .then((post: PostInstance) =>{
                        throwError(!post, `Post with id ${id} not found!`);
                        throwError(post.get('author') != authUser.id, `Unauthorized!`);
                        input.auth = authUser.id;
                        return post.update(input,{transaction:t});
                    }); 
            }).catch(handleError); 
        }),
 

        deletePost: compose(...authResolvers) ((parent, {id},  {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) =>{
                return db.Post
                    .findById(id) 
                    .then((post: PostInstance) =>{
                        throwError(!post, `Post with id ${id} not found!`);
                        throwError(post.get('author') != authUser.id, `Unauthorized!` );
                        return post.destroy({transaction:t})
                            //.then(post=>!!post);
                            .then(post=>true)
                            .catch(post=>false);
                    }); 
            }).catch(handleError); 
        })

    }

    
}