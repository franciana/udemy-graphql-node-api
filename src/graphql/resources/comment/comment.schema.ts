const commentTypes = `

    type Comment {
        id: ID!
        comment: String!
        created: String!
        updated: String!
        user: User!
        post: Post!
    }

    input CommentInput {
        comment: String!
        post: Int!
    }

`;

const commentQueries = `
    commentByPost(postId: ID!, first: Int, offset: Int): [ Comment! ]! 
`;

const commentMutations = `
    createComment(input: CommentInput! ): Comment
    updeteComment(id: ID!, input: CommentInput! ): Comment 
    deleteComment(id: ID!): Boolean   
`;

export {
    commentTypes,
    commentQueries,
    commentMutations
}
