import { GraphQLResolveInfo, doTypesOverlap } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { CommentInstance } from "../../../models/CommentModel";

import { Transaction } from "sequelize";
import { handleError } from "../../../utils/utils";

export const commentResolvers = {

    Comment: {

        //Resolvers não triviais
        user: (comment, args, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=>{
            return db.User
                .findById(comment.get('user'))
                .catch(handleError);
        },

        post: (comment, args, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=>{
            return db.User
                .findById(comment.get('post'))
                .catch(handleError);
        }

    },

    Query: {
        commentByPost: (parent, {postId, first = 10, offset = 0 }, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=>{
            postId = parseInt(postId);
            return db.Comment
                .findAll({
                    where: {post: postId},
                    limit: first,
                    offset: offset
                }).catch(handleError);
        }
    },

    Mutation: {

            createComment: (parent, { input }, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=>{
                return db.sequelize.transaction((t: Transaction)=>{
                    return db.Comment
                        .create(input, {transaction: t});
                }).catch(handleError);
            },

            updateComment: (parent, { id, input }, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=>{
                return db.sequelize.transaction((t: Transaction)=>{
                    return db.Comment
                        .findById(id)
                        .then((comment: CommentInstance) => {
                            if(!comment) throw new Error (`Comment with id ${id} not found`);
                            return comment.update(input, { transaction: t});
                        })
                }).catch(handleError)
            },

            deleteComment: (parent, { id, input }, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=>{
                return db.sequelize.transaction((t: Transaction)=>{
                    return db.Comment
                        .findById(id)
                        .then((comment: CommentInstance) => {
                            if(!comment) throw new Error (`Comment with id ${id} not found`);
                            return comment.destroy({ transaction: t})
                                //.then(comment=>!!comment);
                                .then(comment=>true)
                                .catch(comment=>false);
                        })
                }).catch(handleError);
            }
    }
}